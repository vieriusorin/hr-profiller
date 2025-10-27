# Quick Setup Script - Fully Automated Minikube Development Environment
# This script automatically handles common issues and sets up everything with minimal user interaction
# Usage: .\scripts\quick-setup.ps1

param(
    [Parameter(Mandatory=$false)]
    [switch]$Force,  # Force delete and recreate Minikube cluster

    [Parameter(Mandatory=$false)]
    [switch]$SkipSeed  # Skip database seeding
)

$ErrorActionPreference = "Stop"

# Utility functions
function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "▶ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ $Message" -ForegroundColor Gray
}

# Header
Clear-Host
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Profiller HR - Quick Setup            ║" -ForegroundColor Cyan
Write-Host "║  Automated Minikube Environment        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Quick prerequisites check
Write-Step "Checking Prerequisites"

$missing = @()
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $missing += "Docker" }
if (-not (Get-Command minikube -ErrorAction SilentlyContinue)) { $missing += "Minikube" }
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) { $missing += "kubectl" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { $missing += "Node.js" }

if ($missing.Count -gt 0) {
    Write-Error-Message "Missing prerequisites: $($missing -join ', ')"
    Write-Host ""
    Write-Host "Please install missing tools first:" -ForegroundColor Yellow
    Write-Host "  Run: .\scripts\check-prerequisites.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Success "All prerequisites installed"

# Handle Minikube cluster state
Write-Step "Setting Up Minikube Cluster"

$minikubeStatusOutput = minikube status 2>&1

if ($Force) {
    Write-Info "Force mode: Deleting existing cluster..."
    minikube delete 2>&1 | Out-Null
    $needsStart = $true
} elseif ($minikubeStatusOutput -match "Running") {
    Write-Success "Minikube is already running"
    $needsStart = $false
} elseif ($minikubeStatusOutput -match "unknown state" -or $minikubeStatusOutput -match "does not exist") {
    Write-Info "Cleaning up corrupted cluster state..."
    minikube delete 2>&1 | Out-Null
    $needsStart = $true
} else {
    $needsStart = $true
}

if ($needsStart) {
    Write-Info "Starting Minikube (this takes 2-5 minutes)..."
    minikube start --cpus=4 --memory=7939 --driver=docker 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Failed to start Minikube"
        Write-Host ""
        Write-Host "Try these steps:" -ForegroundColor Yellow
        Write-Host "  1. Make sure Docker Desktop is running" -ForegroundColor White
        Write-Host "  2. Run: docker ps" -ForegroundColor White
        Write-Host "  3. Run: minikube delete" -ForegroundColor White
        Write-Host "  4. Try again" -ForegroundColor White
        exit 1
    }

    Write-Success "Minikube started"
}

# Enable addons
Write-Step "Configuring Minikube Addons"
minikube addons enable metrics-server 2>&1 | Out-Null
minikube addons enable default-storageclass 2>&1 | Out-Null
minikube addons enable storage-provisioner 2>&1 | Out-Null
Write-Success "Addons enabled"

# Configure Docker environment
Write-Step "Configuring Docker Environment"
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
Write-Success "Docker configured for Minikube"

# Build images
Write-Step "Building Docker Images"
Write-Info "This takes 10-15 minutes (downloads dependencies, compiles code)..."

Write-Info "[1/3] Building backend..."
docker build -f Dockerfile.express.production -t profiller-backend:latest . --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Backend build failed"
    exit 1
}
Write-Success "Backend built"

Write-Info "[2/3] Building frontend..."
docker build -f Dockerfile.next.production -t profiller-frontend:latest . --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Frontend build failed"
    exit 1
}
Write-Success "Frontend built"

Write-Info "[3/3] Building MCP server..."
docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest . --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "MCP server build failed"
    exit 1
}
Write-Success "MCP server built"

# Deploy to Kubernetes
Write-Step "Deploying to Kubernetes"
& ".\scripts\deploy-k8s.ps1" -Environment dev 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Deployment failed"
    exit 1
}
Write-Success "Deployed to Kubernetes"

# Wait for pods to be ready
Write-Step "Waiting for Pods to be Ready"
Write-Info "This may take 1-2 minutes..."

$maxWaitSeconds = 180
$elapsed = 0
$allReady = $false

while ($elapsed -lt $maxWaitSeconds -and -not $allReady) {
    Start-Sleep -Seconds 5
    $elapsed += 5

    $pods = kubectl get pods -n profiller-dev -o json 2>&1 | ConvertFrom-Json
    $totalPods = $pods.items.Count
    $readyPods = ($pods.items | Where-Object {
        $_.status.phase -eq "Running" -and
        ($_.status.containerStatuses | Where-Object { $_.ready -eq $true }).Count -gt 0
    }).Count

    Write-Progress -Activity "Waiting for pods" -Status "$readyPods/$totalPods ready" -PercentComplete (($readyPods / $totalPods) * 100)

    if ($readyPods -eq $totalPods) {
        $allReady = $true
    }
}

if (-not $allReady) {
    Write-Error-Message "Pods did not become ready in time"
    Write-Host ""
    kubectl get pods -n profiller-dev
    exit 1
}

Write-Success "All pods are ready"

# Initialize database
Write-Step "Initializing Database"

$backendPod = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'
if (-not $backendPod) {
    Write-Error-Message "Backend pod not found"
    exit 1
}

Write-Info "Running migrations..."
kubectl exec -n profiller-dev $backendPod -- npm run db:migrate 2>&1 | Out-Null
Write-Success "Migrations complete"

if (-not $SkipSeed) {
    Write-Info "Seeding database..."
    kubectl exec -n profiller-dev $backendPod -- npm run db:seed 2>&1 | Out-Null
    Write-Success "Database seeded"
}

# Success summary
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Complete! 🎉                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Your application is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  minikube service frontend-service -n profiller-dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use port-forwarding:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward -n profiller-dev service/frontend-service 3000:3000" -ForegroundColor White
Write-Host "  Then open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Cyan
Write-Host "  kubectl logs -n profiller-dev -l app=backend -f" -ForegroundColor White
Write-Host ""
Write-Host "Minikube dashboard:" -ForegroundColor Cyan
Write-Host "  minikube dashboard" -ForegroundColor White
Write-Host ""
