# PowerShell script to deploy Profiller HR to Kubernetes
# Usage: .\scripts\deploy-k8s.ps1 -Environment dev|staging|prod

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev','staging','prod')]
    [string]$Environment,

    [Parameter(Mandatory=$false)]
    [switch]$BuildImages,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Profiller HR - $Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
} catch {
    Write-Host "Error: kubectl not found. Please install kubectl." -ForegroundColor Red
    exit 1
}

# Check if kustomize is available (kubectl has built-in kustomize)
Write-Host "[1/6] Checking dependencies..." -ForegroundColor Yellow
$kubectlVersion = kubectl version --client -o json | ConvertFrom-Json
Write-Host "  kubectl version: $($kubectlVersion.clientVersion.gitVersion)" -ForegroundColor Green

# Build Docker images if requested
if ($BuildImages) {
    Write-Host ""
    Write-Host "[2/6] Building Docker images..." -ForegroundColor Yellow

    # Check if using Minikube
    $useMinikube = $false
    try {
        $minikubeStatus = minikube status --format='{{.Host}}' 2>$null
        if ($minikubeStatus -eq "Running") {
            $useMinikube = $true
            Write-Host "  Detected Minikube - using Minikube Docker daemon" -ForegroundColor Green
            & minikube -p minikube docker-env --shell powershell | Invoke-Expression
        }
    } catch {
        Write-Host "  Using local Docker daemon" -ForegroundColor Green
    }

    Write-Host "  Building backend..." -ForegroundColor Cyan
    docker build -f Dockerfile.express.production -t profiller-backend:latest .

    Write-Host "  Building frontend..." -ForegroundColor Cyan
    docker build -f Dockerfile.next.production -t profiller-frontend:latest .

    Write-Host "  Building MCP server..." -ForegroundColor Cyan
    docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .

    Write-Host "  Images built successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[2/6] Skipping image build (use -BuildImages to build)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/6] Validating Kustomize configuration..." -ForegroundColor Yellow

$kustomizePath = "k8s/overlays/$Environment"

if (-not (Test-Path $kustomizePath)) {
    Write-Host "  Error: Kustomize overlay not found at $kustomizePath" -ForegroundColor Red
    exit 1
}

Write-Host "  Overlay path: $kustomizePath" -ForegroundColor Green

# Dry run - show what would be applied
if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Resources that would be applied:" -ForegroundColor Magenta
    kubectl kustomize $kustomizePath
    Write-Host ""
    Write-Host "Dry run complete. Use without -DryRun to actually deploy." -ForegroundColor Magenta
    exit 0
}

Write-Host ""
Write-Host "[4/6] Creating namespace and secrets..." -ForegroundColor Yellow

# Apply secrets first
Write-Host "  Applying secrets..." -ForegroundColor Cyan
kubectl apply -f k8s/secrets.yaml

Write-Host ""
Write-Host "[5/6] Applying Kustomize configuration..." -ForegroundColor Yellow

# Apply the kustomized configuration
kubectl apply -k $kustomizePath

Write-Host ""
Write-Host "[6/6] Verifying deployment..." -ForegroundColor Yellow

# Determine namespace based on environment
$namespace = switch ($Environment) {
    'dev'     { 'profiller-dev' }
    'staging' { 'profiller-staging' }
    'prod'    { 'profiller' }
}

Write-Host "  Waiting for pods to be ready in namespace: $namespace" -ForegroundColor Cyan

# Wait for postgres
Write-Host "    Waiting for postgres..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=postgres -n $namespace --timeout=120s

# Wait for backend
Write-Host "    Waiting for backend..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=backend -n $namespace --timeout=180s

# Wait for frontend
Write-Host "    Waiting for frontend..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=frontend -n $namespace --timeout=180s

# Wait for mcp-server
Write-Host "    Waiting for mcp-server..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=mcp-server -n $namespace --timeout=120s

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "View resources:" -ForegroundColor Cyan
Write-Host "  kubectl get all -n $namespace" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Cyan
Write-Host "  kubectl logs -n $namespace -l app=backend -f" -ForegroundColor White
Write-Host ""
Write-Host "Port forward to access locally:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward -n $namespace service/frontend-service 3000:3000" -ForegroundColor White
Write-Host "  kubectl port-forward -n $namespace service/backend-service 3001:3001" -ForegroundColor White
Write-Host ""

if ($useMinikube) {
    Write-Host "Or use Minikube service:" -ForegroundColor Cyan
    Write-Host "  minikube service frontend-service -n $namespace" -ForegroundColor White
    Write-Host ""
}
