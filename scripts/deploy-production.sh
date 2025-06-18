#!/bin/bash

# Production Deployment Script for Profiller HR
# This script builds and deploys the application using production Docker patterns

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="profiller-hr"
REGISTRY_URL=${REGISTRY_URL:-"your-registry.azurecr.io"}  # Change to your registry
VERSION=${VERSION:-$(git rev-parse --short HEAD)}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse HEAD)

echo -e "${BLUE}🚀 Starting production deployment for ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Build Date: ${BUILD_DATE}${NC}"
echo -e "${BLUE}VCS Ref: ${VCS_REF}${NC}"

# Function to check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}📋 Checking dependencies...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies are installed${NC}"
}

# Function to build production images
build_images() {
    echo -e "${YELLOW}🏗️  Building production images...${NC}"
    
    # Build Next.js frontend
    echo -e "${BLUE}Building frontend image...${NC}"
    docker build \
        -f Dockerfile.next.production \
        --build-arg BUILD_DATE="${BUILD_DATE}" \
        --build-arg VCS_REF="${VCS_REF}" \
        --build-arg VERSION="${VERSION}" \
        -t "${REGISTRY_URL}/${PROJECT_NAME}-frontend:${VERSION}" \
        -t "${REGISTRY_URL}/${PROJECT_NAME}-frontend:latest" \
        .
    
    # Build Express backend
    echo -e "${BLUE}Building backend image...${NC}"
    docker build \
        -f Dockerfile.express.production \
        --build-arg BUILD_DATE="${BUILD_DATE}" \
        --build-arg VCS_REF="${VCS_REF}" \
        --build-arg VERSION="${VERSION}" \
        -t "${REGISTRY_URL}/${PROJECT_NAME}-backend:${VERSION}" \
        -t "${REGISTRY_URL}/${PROJECT_NAME}-backend:latest" \
        .
    
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Function to run security scans
security_scan() {
    echo -e "${YELLOW}🔒 Running security scans...${NC}"
    
    # Check if trivy is installed
    if command -v trivy &> /dev/null; then
        echo -e "${BLUE}Scanning frontend image...${NC}"
        trivy image "${REGISTRY_URL}/${PROJECT_NAME}-frontend:${VERSION}"
        
        echo -e "${BLUE}Scanning backend image...${NC}"
        trivy image "${REGISTRY_URL}/${PROJECT_NAME}-backend:${VERSION}"
    else
        echo -e "${YELLOW}⚠️  Trivy not installed, skipping security scan${NC}"
    fi
}

# Function to push images to registry
push_images() {
    echo -e "${YELLOW}📦 Pushing images to registry...${NC}"
    
    # Login to registry (uncomment based on your registry)
    # Azure Container Registry
    # az acr login --name your-registry
    
    # AWS ECR
    # aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY_URL
    
    # Docker Hub
    # docker login
    
    docker push "${REGISTRY_URL}/${PROJECT_NAME}-frontend:${VERSION}"
    docker push "${REGISTRY_URL}/${PROJECT_NAME}-frontend:latest"
    docker push "${REGISTRY_URL}/${PROJECT_NAME}-backend:${VERSION}"
    docker push "${REGISTRY_URL}/${PROJECT_NAME}-backend:latest"
    
    echo -e "${GREEN}✅ Images pushed successfully${NC}"
}

# Function to deploy using Docker Compose
deploy_compose() {
    echo -e "${YELLOW}🚀 Deploying with Docker Compose...${NC}"
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production file not found${NC}"
        echo -e "${YELLOW}Please copy env.production.example to .env.production and configure it${NC}"
        exit 1
    fi
    
    # Export build variables for docker-compose
    export BUILD_DATE VERSION VCS_REF
    
    # Deploy using production compose file
    docker-compose -f docker-compose.production.yml --env-file .env.production up -d
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Function to check deployment health
health_check() {
    echo -e "${YELLOW}🏥 Checking deployment health...${NC}"
    
    # Wait for services to start
    sleep 30
    
    # Check frontend health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
    fi
    
    # Check backend health
    if curl -f http://localhost:4040/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
}

# Function to show deployment info
show_info() {
    echo -e "${GREEN}🎉 Deployment Information${NC}"
    echo -e "${BLUE}Frontend URL: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend URL: http://localhost:4040${NC}"
    echo -e "${BLUE}Version: ${VERSION}${NC}"
    echo -e "${BLUE}Images:${NC}"
    echo -e "  - ${REGISTRY_URL}/${PROJECT_NAME}-frontend:${VERSION}"
    echo -e "  - ${REGISTRY_URL}/${PROJECT_NAME}-backend:${VERSION}"
}

# Main deployment flow
main() {
    case "${1:-all}" in
        "build")
            check_dependencies
            build_images
            ;;
        "scan")
            security_scan
            ;;
        "push")
            push_images
            ;;
        "deploy")
            deploy_compose
            health_check
            show_info
            ;;
        "all")
            check_dependencies
            build_images
            security_scan
            # push_images  # Uncomment when registry is configured
            deploy_compose
            health_check
            show_info
            ;;
        *)
            echo "Usage: $0 {build|scan|push|deploy|all}"
            echo "  build  - Build production images"
            echo "  scan   - Run security scans"
            echo "  push   - Push images to registry"
            echo "  deploy - Deploy using Docker Compose"
            echo "  all    - Run complete deployment pipeline"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 