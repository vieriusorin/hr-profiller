# Profiller HR - Setup Scripts

This directory contains PowerShell scripts to help you set up and manage your Profiller HR development environment on Minikube.

## Quick Start

For most users, just run:

```powershell
.\scripts\quick-setup.ps1
```

This fully automated script will:
- ✓ Check prerequisites
- ✓ Handle corrupted Minikube states automatically
- ✓ Build all Docker images
- ✓ Deploy to Kubernetes
- ✓ Initialize and seed the database
- ✓ Wait for everything to be ready

**Total time:** 15-20 minutes (first time)

## Available Scripts

### 1. `check-prerequisites.ps1`

Checks if all required tools are installed and provides installation instructions.

```powershell
.\scripts\check-prerequisites.ps1
```

**Checks for:**
- Docker Desktop
- Minikube
- kubectl
- Node.js & npm
- Git
- PowerShell version
- Available ports (3000, 3001, 3002, 5433)
- System resources (CPU, RAM, disk space)

**Exit codes:**
- `0` - All prerequisites met
- `1` - Some prerequisites missing (check output for details)

### 2. `quick-setup.ps1` ⭐ Recommended for beginners

Fully automated setup with minimal user interaction. Handles common issues automatically.

```powershell
# Basic usage
.\scripts\quick-setup.ps1

# Force delete and recreate cluster
.\scripts\quick-setup.ps1 -Force

# Skip database seeding
.\scripts\quick-setup.ps1 -SkipSeed
```

**What it does:**
- Automatically detects and fixes corrupted Minikube states
- Builds all Docker images silently
- Deploys to Kubernetes
- Waits for pods to be ready
- Initializes database
- Shows access instructions

**Use this when:**
- First-time setup
- You want a clean environment
- Previous setup got corrupted
- You want minimal interaction

### 3. `dev-setup.ps1`

Interactive setup with step-by-step guidance and user choices.

```powershell
# Basic usage
.\scripts\dev-setup.ps1

# Skip prerequisite checks (use at your own risk)
.\scripts\dev-setup.ps1 -SkipChecks

# Clean up first, then setup
.\scripts\dev-setup.ps1 -CleanFirst

# Skip Docker image building (if already built)
.\scripts\dev-setup.ps1 -SkipBuild
```

**What it does:**
- Shows detailed progress for each step
- Asks for confirmation at key points
- Provides educational information about what's happening
- Gives you control over database seeding and testing
- Handles corrupted Minikube states with user choice

**Use this when:**
- Learning about Kubernetes deployment
- You want to see what's happening at each step
- You need fine-grained control
- Debugging setup issues

### 4. `deploy-k8s.ps1`

Deploys or updates the application to Kubernetes (without building images).

```powershell
# Deploy to development environment
.\scripts\deploy-k8s.ps1 -Environment dev

# Deploy to staging
.\scripts\deploy-k8s.ps1 -Environment staging

# Deploy to production
.\scripts\deploy-k8s.ps1 -Environment prod
```

**Use this when:**
- Images are already built
- You just want to deploy/redeploy
- Updating configuration without rebuilding

### 5. `test-persistence.ps1`

Tests data persistence by creating data, restarting PostgreSQL pod, and verifying data survived.

```powershell
.\scripts\test-persistence.ps1 -Namespace profiller-dev
```

**Use this when:**
- Verifying PersistentVolume setup
- Testing database backup/recovery
- Validating storage configuration

## Common Scenarios

### First Time Setup

```powershell
# Option 1: Quick and easy
.\scripts\quick-setup.ps1

# Option 2: Step-by-step learning
.\scripts\dev-setup.ps1
```

### Minikube is in a Corrupted State

**Error:** `unknown state "minikube"` or `state: unknown`

**Solution:**

```powershell
# Automated fix
.\scripts\quick-setup.ps1 -Force

# Or manual fix
minikube delete
.\scripts\dev-setup.ps1
```

### Rebuild After Code Changes

```powershell
# Stop current deployment
kubectl delete namespace profiller-dev

# Rebuild and redeploy
.\scripts\quick-setup.ps1 -Force
```

### Just Redeploy (without rebuilding)

```powershell
# Delete old deployment
kubectl delete namespace profiller-dev

# Deploy with existing images
.\scripts\deploy-k8s.ps1 -Environment dev
```

### Check if Everything is Working

```powershell
# Check pod status
kubectl get pods -n profiller-dev

# Check services
kubectl get services -n profiller-dev

# Check logs
kubectl logs -n profiller-dev -l app=backend -f

# Test persistence
.\scripts\test-persistence.ps1 -Namespace profiller-dev
```

### Clean Up Everything

```powershell
# Delete the namespace (removes all resources)
kubectl delete namespace profiller-dev

# Stop Minikube
minikube stop

# Delete Minikube cluster (complete cleanup)
minikube delete
```

## Troubleshooting

### Docker Daemon Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Start Docker Desktop
2. Wait for it to be fully running (green icon in system tray)
3. Run `docker ps` to verify
4. Try the setup script again

### Minikube Won't Start

**Error:** `Failed to start minikube`

**Solution:**
1. Make sure Docker Desktop is running
2. Delete corrupted cluster: `minikube delete`
3. Check WSL 2 (if on Windows): `wsl --list --verbose`
4. Restart Docker Desktop
5. Try: `minikube start --cpus=4 --memory=7939 --driver=docker`

### Pods Not Starting

**Error:** Pods stuck in `Pending`, `CrashLoopBackOff`, or `ImagePullBackOff`

**Solution:**

```powershell
# Check pod details
kubectl describe pod <pod-name> -n profiller-dev

# Check events
kubectl get events -n profiller-dev --sort-by='.lastTimestamp'

# Common fixes:
# 1. Images not built in Minikube's Docker
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
# Then rebuild images

# 2. Resource constraints
minikube start --cpus=4 --memory=7939

# 3. Complete reset
kubectl delete namespace profiller-dev
.\scripts\quick-setup.ps1 -Force
```

### Port Already in Use

**Error:** Ports 3000, 3001, 3002, or 5433 in use

**Solution:**

```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 3000

# Option 1: Kill the process using the port
# Option 2: Use different ports in port-forward command
kubectl port-forward -n profiller-dev service/frontend-service 8080:3000

# Option 3: Use minikube service (uses random ports)
minikube service frontend-service -n profiller-dev
```

### Out of Disk Space

**Error:** `no space left on device`

**Solution:**

```powershell
# Clean up Docker
docker system prune -a --volumes

# Clean up Minikube
minikube delete
minikube start --cpus=4 --memory=7939
```

## Script Options Reference

### `quick-setup.ps1` Options

| Option | Description |
|--------|-------------|
| `-Force` | Delete and recreate Minikube cluster (clean slate) |
| `-SkipSeed` | Don't seed database with test data |

### `dev-setup.ps1` Options

| Option | Description |
|--------|-------------|
| `-SkipChecks` | Skip prerequisite checks (not recommended) |
| `-SkipBuild` | Skip Docker image building |
| `-CleanFirst` | Delete namespace before deploying |

### `deploy-k8s.ps1` Options

| Option | Description |
|--------|-------------|
| `-Environment <env>` | Target environment: `dev`, `staging`, or `prod` |

### `test-persistence.ps1` Options

| Option | Description |
|--------|-------------|
| `-Namespace <name>` | Kubernetes namespace to test (default: `profiller-dev`) |

## Requirements

### Minimum System Requirements
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disk:** 20 GB free space
- **OS:** Windows 10/11 with WSL 2

### Required Software
- Docker Desktop (latest)
- Minikube v1.30+
- kubectl v1.26+
- Node.js v18+ (LTS recommended)
- PowerShell 5.0+
- Git (optional but recommended)

### Installation via Chocolatey

```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install all dependencies
choco install docker-desktop minikube nodejs-lts git -y
```

## Additional Resources

- [Minikube Development Guide](../MINIKUBE_DEVELOPMENT_GUIDE.md)
- [Kubernetes Parameterization Guide](../K8S_PARAMETERIZATION_GUIDE.md)
- [Persistent Storage Guide](../PERSISTENT_STORAGE_GUIDE.md)
- [Quick Start Guide](../QUICK_START_MINIKUBE.md)

## Getting Help

If you encounter issues not covered here:

1. Check the output carefully - error messages usually indicate the problem
2. Run `.\scripts\check-prerequisites.ps1` to verify your setup
3. Try the "clean slate" approach: `.\scripts\quick-setup.ps1 -Force`
4. Check the main project documentation in the root directory
5. Review Minikube logs: `minikube logs`
6. Check Kubernetes events: `kubectl get events -n profiller-dev`

## Script Development Notes

All scripts follow these conventions:
- **Exit code 0:** Success
- **Exit code 1:** Failure (check output for details)
- **Color coding:**
  - 🟢 Green (✓): Success
  - 🟡 Yellow (⚠): Warning or info
  - 🔴 Red (✗): Error
  - 🔵 Cyan (▶): Step/section header

Scripts are designed to be:
- **Idempotent:** Safe to run multiple times
- **Resilient:** Handle common errors gracefully
- **Informative:** Provide clear feedback and next steps
- **Flexible:** Support various use cases via parameters
