# PowerShell script to check prerequisites for Minikube deployment
# Usage: .\scripts\check-prerequisites.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Profiller HR - Prerequisites Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Docker
Write-Host "[1/8] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "  ✓ Docker installed: $dockerVersion" -ForegroundColor Green

        $dockerPs = docker ps 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Docker daemon is running" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Docker daemon is not running" -ForegroundColor Red
            Write-Host "    Start Docker Desktop and try again" -ForegroundColor Yellow
            $allGood = $false
        }
    } else {
        Write-Host "  ✗ Docker not found" -ForegroundColor Red
        Write-Host "    Install: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        $allGood = $false
    }
}
catch {
    Write-Host "  ✗ Docker not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 2: Minikube
Write-Host "[2/8] Checking Minikube..." -ForegroundColor Yellow
try {
    $minikubeVersion = minikube version 2>$null
    if ($minikubeVersion) {
        Write-Host "  ✓ Minikube installed: $($minikubeVersion | Select-String 'version')" -ForegroundColor Green
        $minikubeStatus = minikube status 2>$null
        if ($minikubeStatus -match "Running") {
            Write-Host "  ✓ Minikube is running" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Minikube is not running" -ForegroundColor Yellow
            Write-Host "    Start with: minikube start --cpus=4 --memory=7939" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Minikube not found" -ForegroundColor Red
        Write-Host "    Install: https://minikube.sigs.k8s.io/docs/start/" -ForegroundColor Yellow
        Write-Host "    Or: choco install minikube" -ForegroundColor Yellow
        $allGood = $false
    }
}
catch {
    Write-Host "  ✗ Minikube not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 3: kubectl
Write-Host "[3/8] Checking kubectl..." -ForegroundColor Yellow
try {
    $kubectlVersion = kubectl version --client -o json 2>$null | ConvertFrom-Json
    if ($kubectlVersion) {
        Write-Host "  ✓ kubectl installed: $($kubectlVersion.clientVersion.gitVersion)" -ForegroundColor Green
        $clusterInfo = kubectl cluster-info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ kubectl can connect to cluster" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ kubectl cannot connect to cluster" -ForegroundColor Yellow
            Write-Host "    Make sure Minikube is running" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ kubectl not found" -ForegroundColor Red
        Write-Host "    Usually installed with Minikube" -ForegroundColor Yellow
        $allGood = $false
    }
}
catch {
    Write-Host "  ✗ kubectl not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 4: System Resources
Write-Host "[4/8] Checking System Resources..." -ForegroundColor Yellow

$cpuCores = (Get-CimInstance -ClassName Win32_Processor).NumberOfLogicalProcessors
if ($cpuCores -ge 4) {
    Write-Host "  ✓ CPU Cores: $cpuCores (minimum: 4)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ CPU Cores: $cpuCores (recommended: 4 or more)" -ForegroundColor Yellow
}

$totalRAM = [math]::Round((Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
if ($totalRAM -ge 8) {
    Write-Host "  ✓ RAM: $totalRAM GB (minimum: 8GB)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ RAM: $totalRAM GB (recommended: 8GB or more)" -ForegroundColor Yellow
}

$disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
$freeSpace = [math]::Round($disk.FreeSpace / 1GB, 2)
if ($freeSpace -ge 20) {
    Write-Host "  ✓ Free Disk Space: $freeSpace GB (minimum: 20GB)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Free Disk Space: $freeSpace GB (recommended: 20GB or more)" -ForegroundColor Yellow
}

Write-Host ""

# Check 5: Node.js
Write-Host "[5/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Host "  ✓ npm installed: $npmVersion" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✗ Node.js not found" -ForegroundColor Red
        Write-Host "    Install: https://nodejs.org/ (LTS version recommended)" -ForegroundColor Yellow
        Write-Host "    Or: choco install nodejs-lts" -ForegroundColor Yellow
        $allGood = $false
    }
}
catch {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    Write-Host "    Install: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check 6: Git
Write-Host "[6/8] Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "  ✓ Git installed: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Git not found" -ForegroundColor Yellow
        Write-Host "    Install: https://git-scm.com/downloads" -ForegroundColor Gray
        Write-Host "    Or: choco install git" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  ⚠ Git not found (optional but recommended)" -ForegroundColor Yellow
}

Write-Host ""

# Check 7: PowerShell Version
Write-Host "[7/8] Checking PowerShell..." -ForegroundColor Yellow
$psVersion = $PSVersionTable.PSVersion
if ($psVersion.Major -ge 5) {
    Write-Host "  ✓ PowerShell version: $($psVersion.Major).$($psVersion.Minor)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ PowerShell version: $($psVersion.Major).$($psVersion.Minor) (recommended: 5.0 or higher)" -ForegroundColor Yellow
}

Write-Host ""

# Check 8: Available Ports
Write-Host "[8/8] Checking Required Ports..." -ForegroundColor Yellow
$requiredPorts = @(3000, 3001, 3002, 5433)
$portsInUse = @()

foreach ($port in $requiredPorts) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
        Write-Host "  ⚠ Port $port is in use" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Port $port is available" -ForegroundColor Green
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "    Note: Ports $($portsInUse -join ', ') are in use but can be worked around" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Summary
if ($allGood) {
    Write-Host "✓ All required prerequisites are installed!" -ForegroundColor Green
    Write-Host ""

    # Check if Minikube is running
    $minikubeStatus = minikube status 2>$null
    if (-not ($minikubeStatus -match "Running")) {
        Write-Host "Next step: Start Minikube with:" -ForegroundColor Yellow
        Write-Host "  minikube start --cpus=4 --memory=7939 --driver=docker" -ForegroundColor White
        Write-Host ""
    }

    Write-Host "Ready to run: .\scripts\dev-setup.ps1" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "✗ Some prerequisites are missing!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation Help:" -ForegroundColor Yellow
    Write-Host "  • Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "  • Minikube: https://minikube.sigs.k8s.io/docs/start/" -ForegroundColor White
    Write-Host "  • Node.js (LTS): https://nodejs.org/" -ForegroundColor White
    Write-Host "  • Git: https://git-scm.com/downloads" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use Chocolatey (package manager for Windows):" -ForegroundColor Yellow
    Write-Host "  choco install docker-desktop minikube nodejs-lts git" -ForegroundColor White
    Write-Host ""
    exit 1
}
