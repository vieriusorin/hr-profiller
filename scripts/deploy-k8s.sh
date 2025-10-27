#!/bin/bash
# Bash script to deploy Profiller HR to Kubernetes
# Usage: ./scripts/deploy-k8s.sh dev|staging|prod [--build-images] [--dry-run]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Parse arguments
ENVIRONMENT=$1
BUILD_IMAGES=false
DRY_RUN=false

if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}Error: Environment not specified${NC}"
    echo "Usage: $0 dev|staging|prod [--build-images] [--dry-run]"
    exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo -e "${RED}Error: Invalid environment. Must be dev, staging, or prod${NC}"
    exit 1
fi

shift
while [ "$#" -gt 0 ]; do
    case "$1" in
        --build-images)
            BUILD_IMAGES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}========================================"
echo "Deploying Profiller HR - $ENVIRONMENT"
echo -e "========================================${NC}"
echo ""

# Check dependencies
echo -e "${YELLOW}[1/6] Checking dependencies...${NC}"
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl not found. Please install kubectl.${NC}"
    exit 1
fi
echo -e "${GREEN}  kubectl found${NC}"

# Build Docker images if requested
if [ "$BUILD_IMAGES" = true ]; then
    echo ""
    echo -e "${YELLOW}[2/6] Building Docker images...${NC}"

    # Check if using Minikube
    USE_MINIKUBE=false
    if command -v minikube &> /dev/null; then
        if minikube status --format='{{.Host}}' 2>/dev/null | grep -q "Running"; then
            USE_MINIKUBE=true
            echo -e "${GREEN}  Detected Minikube - using Minikube Docker daemon${NC}"
            eval $(minikube docker-env)
        fi
    fi

    if [ "$USE_MINIKUBE" = false ]; then
        echo -e "${GREEN}  Using local Docker daemon${NC}"
    fi

    echo -e "${CYAN}  Building backend...${NC}"
    docker build -f Dockerfile.express.production -t profiller-backend:latest .

    echo -e "${CYAN}  Building frontend...${NC}"
    docker build -f Dockerfile.next.production -t profiller-frontend:latest .

    echo -e "${CYAN}  Building MCP server...${NC}"
    docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .

    echo -e "${GREEN}  Images built successfully!${NC}"
else
    echo ""
    echo -e "${YELLOW}[2/6] Skipping image build (use --build-images to build)${NC}"
fi

echo ""
echo -e "${YELLOW}[3/6] Validating Kustomize configuration...${NC}"

KUSTOMIZE_PATH="k8s/overlays/$ENVIRONMENT"

if [ ! -d "$KUSTOMIZE_PATH" ]; then
    echo -e "${RED}  Error: Kustomize overlay not found at $KUSTOMIZE_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}  Overlay path: $KUSTOMIZE_PATH${NC}"

# Dry run
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${MAGENTA}[DRY RUN] Resources that would be applied:${NC}"
    kubectl kustomize "$KUSTOMIZE_PATH"
    echo ""
    echo -e "${MAGENTA}Dry run complete. Use without --dry-run to actually deploy.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[4/6] Creating namespace and secrets...${NC}"

echo -e "${CYAN}  Applying secrets...${NC}"
kubectl apply -f k8s/secrets.yaml

echo ""
echo -e "${YELLOW}[5/6] Applying Kustomize configuration...${NC}"

kubectl apply -k "$KUSTOMIZE_PATH"

echo ""
echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"

# Determine namespace
case "$ENVIRONMENT" in
    dev)
        NAMESPACE="profiller-dev"
        ;;
    staging)
        NAMESPACE="profiller-staging"
        ;;
    prod)
        NAMESPACE="profiller"
        ;;
esac

echo -e "${CYAN}  Waiting for pods to be ready in namespace: $NAMESPACE${NC}"

echo -e "    ${YELLOW}Waiting for postgres...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=120s

echo -e "    ${YELLOW}Waiting for backend...${NC}"
kubectl wait --for=condition=ready pod -l app=backend -n "$NAMESPACE" --timeout=180s

echo -e "    ${YELLOW}Waiting for frontend...${NC}"
kubectl wait --for=condition=ready pod -l app=frontend -n "$NAMESPACE" --timeout=180s

echo -e "    ${YELLOW}Waiting for mcp-server...${NC}"
kubectl wait --for=condition=ready pod -l app=mcp-server -n "$NAMESPACE" --timeout=120s

echo ""
echo -e "${GREEN}========================================"
echo "Deployment Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "${CYAN}View resources:${NC}"
echo "  kubectl get all -n $NAMESPACE"
echo ""
echo -e "${CYAN}View logs:${NC}"
echo "  kubectl logs -n $NAMESPACE -l app=backend -f"
echo ""
echo -e "${CYAN}Port forward to access locally:${NC}"
echo "  kubectl port-forward -n $NAMESPACE service/frontend-service 3000:3000"
echo "  kubectl port-forward -n $NAMESPACE service/backend-service 3001:3001"
echo ""

if [ "$USE_MINIKUBE" = true ]; then
    echo -e "${CYAN}Or use Minikube service:${NC}"
    echo "  minikube service frontend-service -n $NAMESPACE"
    echo ""
fi
