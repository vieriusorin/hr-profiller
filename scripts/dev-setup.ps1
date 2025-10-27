# Complete development environment setup script
# This script guides you through setting up Profiller HR on Minikube
# Usage: .\scripts\dev-setup.ps1

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipChecks,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,

    [Parameter(Mandatory=$false)]
    [switch]$CleanFirst
)

$ErrorActionPreference = "Stop"

# Utility functions
function Write-Step {
    param([string]$Message, [int]$Current, [int]$Total)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[$Current/$Total] $Message" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠ $Message" -ForegroundColor Yellow
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Gray
}

function Pause-For-User {
    param([string]$Message = "Press Enter to continue...")
    Write-Host ""
    Write-Host $Message -ForegroundColor Yellow
    $null = Read-Host
}

# Header
Clear-Host
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Profiller HR Development Setup        ║" -ForegroundColor Cyan
Write-Host "║  Complete Minikube Environment         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will set up your complete development environment." -ForegroundColor White
Write-Host "Estimated time: 30-45 minutes (first time)" -ForegroundColor Gray
Write-Host ""

if (-not $SkipChecks) {
    Pause-For-User "Ready to begin? Press Enter to start..."
}

$totalSteps = 10
$currentStep = 0

# Step 1: Pre-flight checks
if (-not $SkipChecks) {
    $currentStep++
    Write-Step "Running Pre-flight Checks" $currentStep $totalSteps

    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    & ".\scripts\check-prerequisites.ps1"

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Error-Message "Prerequisites check failed!"
        Write-Host "Please install missing dependencies and try again." -ForegroundColor Yellow
        exit 1
    }

    Pause-For-User "Pre-flight checks passed! Press Enter to continue..."
} else {
    Write-Warning "Skipping pre-flight checks (use at your own risk)"
}

# Step 2: Clean up (optional)
if ($CleanFirst) {
    $currentStep++
    Write-Step "Cleaning Up Existing Resources" $currentStep $totalSteps

    Write-Host "Deleting existing namespace..." -ForegroundColor Yellow
    kubectl delete namespace profiller-dev --ignore-not-found=true

    Write-Host "Waiting for cleanup to complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    Write-Success "Cleanup complete"
}

# Step 3: Start/Verify Minikube
$currentStep++
Write-Step "Starting Minikube" $currentStep $totalSteps

# Check Minikube status with error handling
$minikubeStatusOutput = minikube status 2>&1
$minikubeRunning = $false

if ($minikubeStatusOutput -match "Running") {
    Write-Success "Minikube is already running"
    $minikubeRunning = $true
} elseif ($minikubeStatusOutput -match "Stopped") {
    Write-Info "Minikube is stopped, starting it..."
    minikube start --cpus=4 --memory=7939 --driver=docker

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Minikube started successfully"
        $minikubeRunning = $true
    } else {
        Write-Error-Message "Failed to start Minikube"
        exit 1
    }
} elseif ($minikubeStatusOutput -match "unknown state" -or $minikubeStatusOutput -match "does not exist") {
    # Corrupted or non-existent cluster
    Write-Warning "Minikube cluster is in an unknown or corrupted state"
    Write-Host ""
    Write-Host "This usually happens when:" -ForegroundColor Yellow
    Write-Host "  • Docker was restarted while Minikube was running" -ForegroundColor Gray
    Write-Host "  • The Minikube VM was manually deleted" -ForegroundColor Gray
    Write-Host "  • A previous installation wasn't cleaned up properly" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Do you want to delete and recreate the cluster?" -ForegroundColor Yellow
    Write-Host "  [Y] Yes - Delete and start fresh (recommended)" -ForegroundColor White
    Write-Host "  [N] No  - Try to repair (may not work)" -ForegroundColor White
    Write-Host ""

    $choice = Read-Host "Your choice (Y/N)"

    if ($choice -eq "Y" -or $choice -eq "y" -or $choice -eq "") {
        Write-Host ""
        Write-Host "Deleting corrupted cluster..." -ForegroundColor Yellow
        minikube delete

        Write-Host "Creating fresh Minikube cluster..." -ForegroundColor Yellow
        Write-Info "This may take 2-5 minutes..."
        minikube start --cpus=4 --memory=7939 --driver=docker

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Minikube started successfully"
            $minikubeRunning = $true
        } else {
            Write-Error-Message "Failed to start Minikube"
            Write-Host ""
            Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
            Write-Host "  1. Make sure Docker Desktop is running" -ForegroundColor White
            Write-Host "  2. Try: docker ps (should work without errors)" -ForegroundColor White
            Write-Host "  3. Restart Docker Desktop and try again" -ForegroundColor White
            Write-Host "  4. Check Docker settings: Resources > WSL Integration" -ForegroundColor White
            exit 1
        }
    } else {
        Write-Host "Attempting to start without deleting..." -ForegroundColor Yellow
        minikube start --cpus=4 --memory=7939 --driver=docker

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Minikube started successfully"
            $minikubeRunning = $true
        } else {
            Write-Error-Message "Failed to start Minikube"
            Write-Host ""
            Write-Host "Please run the script again and choose to delete the cluster." -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    # Unknown status, try to start
    Write-Warning "Unable to determine Minikube status, attempting to start..."
    minikube start --cpus=4 --memory=7939 --driver=docker

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Minikube started successfully"
        $minikubeRunning = $true
    } else {
        Write-Error-Message "Failed to start Minikube"
        Write-Host ""
        Write-Host "Try running: minikube delete" -ForegroundColor Yellow
        Write-Host "Then run this script again" -ForegroundColor Yellow
        exit 1
    }
}

# Verify cluster is accessible
if ($minikubeRunning) {
    Write-Host ""
    Write-Host "Verifying cluster connectivity..." -ForegroundColor Yellow

    $clusterInfo = kubectl cluster-info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cluster is accessible"
        Write-Host ""
        Write-Host "Cluster information:" -ForegroundColor Cyan
        Write-Host $clusterInfo
    } else {
        Write-Warning "Cluster started but kubectl cannot connect"
        Write-Info "Waiting 10 seconds for cluster to stabilize..."
        Start-Sleep -Seconds 10

        $clusterInfo = kubectl cluster-info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Cluster is now accessible"
        } else {
            Write-Error-Message "Cannot connect to cluster"
            Write-Host "Try running: minikube delete && minikube start" -ForegroundColor Yellow
            exit 1
        }
    }

    Pause-For-User
}

# Step 4: Enable Addons
$currentStep++
Write-Step "Enabling Minikube Addons" $currentStep $totalSteps

Write-Host "Enabling metrics-server..." -ForegroundColor Yellow
minikube addons enable metrics-server 2>$null

Write-Host "Enabling storage provisioner..." -ForegroundColor Yellow
minikube addons enable default-storageclass 2>$null
minikube addons enable storage-provisioner 2>$null

Write-Success "Addons enabled"

# Step 5: Configure Docker
$currentStep++
Write-Step "Configuring Docker for Minikube" $currentStep $totalSteps

Write-Host "Configuring Docker environment..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Verify
$dockerHost = $env:DOCKER_HOST
if ($dockerHost -and $dockerHost -match "minikube") {
    Write-Success "Docker configured to use Minikube"
    Write-Info "Docker Host: $dockerHost"
} else {
    Write-Error-Message "Failed to configure Docker for Minikube"
    exit 1
}

Pause-For-User

# Step 6: Build Docker Images
if (-not $SkipBuild) {
    $currentStep++
    Write-Step "Building Docker Images" $currentStep $totalSteps

    Write-Warning "This step takes 10-15 minutes (downloads dependencies, compiles code)"
    Pause-For-User "Press Enter to start building..."

    # Backend
    Write-Host ""
    Write-Host "[1/3] Building Backend Image..." -ForegroundColor Cyan
    Write-Info "This may take 3-5 minutes..."
    docker build -f Dockerfile.express.production -t profiller-backend:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Backend build failed"
        exit 1
    }
    Write-Success "Backend image built"

    # Frontend
    Write-Host ""
    Write-Host "[2/3] Building Frontend Image..." -ForegroundColor Cyan
    Write-Info "This may take 5-10 minutes (Next.js builds are slow)..."
    docker build -f Dockerfile.next.production -t profiller-frontend:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Frontend build failed"
        exit 1
    }
    Write-Success "Frontend image built"

    # MCP Server
    Write-Host ""
    Write-Host "[3/3] Building MCP Server Image..." -ForegroundColor Cyan
    Write-Info "This may take 2-3 minutes..."
    docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "MCP Server build failed"
        exit 1
    }
    Write-Success "MCP Server image built"

    Write-Host ""
    Write-Success "All images built successfully!"
    Write-Host ""
    Write-Host "Images:" -ForegroundColor Cyan
    docker images | Select-String "profiller" | Write-Host

    Pause-For-User
} else {
    Write-Warning "Skipping image build (make sure images are already built)"
}

# Step 7: Deploy to Kubernetes
$currentStep++
Write-Step "Deploying to Kubernetes" $currentStep $totalSteps

Write-Host "Deploying all resources..." -ForegroundColor Yellow
Write-Info "This creates: namespace, secrets, configmap, PVC, and all services"

& ".\scripts\deploy-k8s.ps1" -Environment dev

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Deployment failed"
    exit 1
}

Write-Success "Deployment complete"
Pause-For-User "All pods should now be running. Press Enter to continue..."

# Step 8: Verify Deployment
$currentStep++
Write-Step "Verifying Deployment" $currentStep $totalSteps

Write-Host "Checking pod status..." -ForegroundColor Yellow
kubectl get pods -n profiller-dev

Write-Host ""
Write-Host "Checking services..." -ForegroundColor Yellow
kubectl get services -n profiller-dev

Write-Host ""
Write-Host "Checking PVC..." -ForegroundColor Yellow
kubectl get pvc -n profiller-dev

Write-Host ""
$pods = kubectl get pods -n profiller-dev -o json | ConvertFrom-Json
$allRunning = $true
foreach ($pod in $pods.items) {
    $podName = $pod.metadata.name
    $podStatus = $pod.status.phase
    $podReady = ($pod.status.containerStatuses | Where-Object { $_.ready -eq $true }).Count

    if ($podStatus -eq "Running" -and $podReady -gt 0) {
        Write-Success "$podName is running"
    } else {
        Write-Warning "$podName is $podStatus"
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Warning "Some pods are not ready yet. Waiting 30 seconds..."
    Start-Sleep -Seconds 30
    Write-Host "Checking again..." -ForegroundColor Yellow
    kubectl get pods -n profiller-dev
}

Pause-For-User

# Step 9: Initialize Database
$currentStep++
Write-Step "Initializing Database" $currentStep $totalSteps

$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'
if (-not $BACKEND_POD) {
    Write-Error-Message "Backend pod not found"
    exit 1
}

Write-Info "Using backend pod: $BACKEND_POD"
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:migrate
Write-Success "Migrations complete"

Write-Host ""
Write-Host "Do you want to seed the database with test data?" -ForegroundColor Yellow
$seed = Read-Host "Seed database? (y/n)"
if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:seed
    Write-Success "Database seeded"
} else {
    Write-Info "Skipping database seed"
}

Pause-For-User

# Step 10: Test Persistence
$currentStep++
Write-Step "Testing Data Persistence" $currentStep $totalSteps

Write-Host "Do you want to test data persistence?" -ForegroundColor Yellow
$testPersistence = Read-Host "Run persistence test? (y/n)"
if ($testPersistence -eq "y" -or $testPersistence -eq "Y") {
    Write-Host ""
    Write-Host "Running persistence test..." -ForegroundColor Yellow
    & ".\scripts\test-persistence.ps1" -Namespace profiller-dev
    Pause-For-User
} else {
    Write-Info "Skipping persistence test (you can run it later with: .\scripts\test-persistence.ps1)"
}

# Final Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Complete!                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your development environment is ready!" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Access Your Application" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Port Forwarding" -ForegroundColor Yellow
Write-Host "  Run these commands in separate PowerShell windows:" -ForegroundColor White
Write-Host ""
Write-Host "  kubectl port-forward -n profiller-dev service/frontend-service 3000:3000" -ForegroundColor Gray
Write-Host "  kubectl port-forward -n profiller-dev service/backend-service 3001:3001" -ForegroundColor Gray
Write-Host "  kubectl port-forward -n profiller-dev service/mcp-server-service 3002:3002" -ForegroundColor Gray
Write-Host ""
Write-Host "  Then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "Option 2: Minikube Service (Automatic)" -ForegroundColor Yellow
Write-Host "  Run this command (opens browser automatically):" -ForegroundColor White
Write-Host ""
Write-Host "  minikube service frontend-service -n profiller-dev" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Useful Commands" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -n profiller-dev -l app=backend -f" -ForegroundColor Gray
Write-Host ""

Write-Host "Check pod status:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n profiller-dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Open Minikube dashboard:" -ForegroundColor Yellow
Write-Host "  minikube dashboard" -ForegroundColor Gray
Write-Host ""

Write-Host "Test persistence:" -ForegroundColor Yellow
Write-Host "  .\scripts\test-persistence.ps1 -Namespace profiller-dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Clean up:" -ForegroundColor Yellow
Write-Host "  kubectl delete namespace profiller-dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Stop Minikube:" -ForegroundColor Yellow
Write-Host "  minikube stop" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Access the application (see options above)" -ForegroundColor White
Write-Host "  2. Make code changes and redeploy" -ForegroundColor White
Write-Host "  3. Read MINIKUBE_DEVELOPMENT_GUIDE.md for more info" -ForegroundColor White
Write-Host ""

Write-Host "Need help? Check the guides:" -ForegroundColor Yellow
Write-Host "  - MINIKUBE_DEVELOPMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "  - PERSISTENT_STORAGE_GUIDE.md" -ForegroundColor Gray
Write-Host "  - K8S_PARAMETERIZATION_GUIDE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy coding!" -ForegroundColor Green
Write-Host ""

