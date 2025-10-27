# Complete Minikube Development Environment Setup

## Overview

This guide will walk you through setting up your entire Profiller HR application in Minikube from scratch. By the end, you'll have:
- ✅ Local Kubernetes cluster running
- ✅ PostgreSQL with persistent storage
- ✅ Backend API service
- ✅ Frontend Next.js application
- ✅ MCP server for AI analytics
- ✅ All services communicating
- ✅ Access to the application in your browser

**Time needed:** 30-45 minutes (first time)

---

## Prerequisites

### Required Software

1. **Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version`
   - Should show: Docker version 20.x or higher

2. **Minikube**
   - Download: https://minikube.sigs.k8s.io/docs/start/
   - Windows: `choco install minikube` (if using Chocolatey)
   - Verify: `minikube version`

3. **kubectl**
   - Usually installed with Minikube
   - Verify: `kubectl version --client`

4. **PowerShell** (Windows) or **Bash** (Linux/Mac)
   - Windows: Built-in
   - Verify: `$PSVersionTable.PSVersion`

### System Requirements

- **CPU:** 4 cores or more (recommended)
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 20GB free space
- **OS:** Windows 10/11, macOS, or Linux

---

## Part 1: Environment Setup (5 minutes)

### Step 1.1: Verify Prerequisites

Open PowerShell as Administrator and run:

```powershell
# Check Docker
docker --version
docker ps

# Check Minikube
minikube version

# Check kubectl
kubectl version --client

# Check if Minikube is already running
minikube status
```

**Expected output:**
```
Docker version 24.0.x
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS
minikube version: v1.32.0
Client Version: v1.29.0
minikube: N/A
```

### Step 1.2: Start Minikube

```powershell
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=7939 --driver=docker

# This will take 2-5 minutes
# You'll see output like:
# 😄  minikube v1.32.0 on Windows 11
# ✨  Using the docker driver based on existing profile
# 👍  Starting control plane node minikube in cluster minikube
# 🏄  Done! kubectl is now configured to use "minikube" cluster
```

**If you get an error:**
```powershell
# Delete existing cluster and start fresh
minikube delete
minikube start --cpus=4 --memory=7939 --driver=docker
```

### Step 1.3: Verify Minikube is Running

```powershell
# Check status
minikube status

# Should show:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured

# Check cluster info
kubectl cluster-info

# Should show:
# Kubernetes control plane is running at https://127.0.0.1:xxxxx
```

### Step 1.4: Enable Required Addons

```powershell
# Enable metrics server (for monitoring)
minikube addons enable metrics-server

# Enable storage provisioner (for PersistentVolumes)
minikube addons enable default-storageclass
minikube addons enable storage-provisioner

# Verify addons
minikube addons list | Select-String "enabled"
```

### Step 1.5: Configure Docker to Use Minikube

**IMPORTANT:** This step makes Docker build images directly in Minikube's environment.

```powershell
# Windows PowerShell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Verify you're using Minikube's Docker
docker ps

# You should see Kubernetes system containers
```

**For every new PowerShell session, run this command again!**

💡 **Tip:** Add this to your PowerShell profile to run automatically:
```powershell
notepad $PROFILE
# Add this line:
# & minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

---

## Part 2: Build Docker Images (10 minutes)

### Step 2.1: Verify You're in Project Root

```powershell
# Navigate to project
cd C:\Users\SorinVieriu\Desktop\Projects\profiller-hr

# Verify files exist
ls Dockerfile*

# Should show:
# Dockerfile.express
# Dockerfile.express.production
# Dockerfile.next
# Dockerfile.next.production
# Dockerfile.mcp
# Dockerfile.mcp.production
```

### Step 2.2: Build Backend Image

```powershell
Write-Host "Building Backend Image..." -ForegroundColor Cyan

docker build -f Dockerfile.express.production -t profiller-backend:latest .

# This takes 3-5 minutes
# You'll see output like:
# [+] Building 120.5s (15/15) FINISHED
```

**If build fails:**
```powershell
# Check you have backend/package.json
ls backend/package.json

# Check Docker is using Minikube
docker ps

# Retry build
docker build -f Dockerfile.express.production -t profiller-backend:latest .
```

### Step 2.3: Build Frontend Image

```powershell
Write-Host "Building Frontend Image..." -ForegroundColor Cyan

docker build -f Dockerfile.next.production -t profiller-frontend:latest .

# This takes 5-10 minutes (Next.js builds are slow)
```

### Step 2.4: Build MCP Server Image

```powershell
Write-Host "Building MCP Server Image..." -ForegroundColor Cyan

docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .

# This takes 2-3 minutes
```

### Step 2.5: Verify Images

```powershell
# List built images
docker images | Select-String "profiller"

# Should show:
# profiller-backend       latest    abc123    5 minutes ago    500MB
# profiller-frontend      latest    def456    3 minutes ago    800MB
# profiller-mcp-server    latest    ghi789    1 minute ago     400MB
```

---

## Part 3: Prepare Configuration (5 minutes)

### Step 3.1: Update Secrets

Your secrets file has placeholder values. Let's update them:

```powershell
# Read current secrets
Get-Content k8s/secrets.yaml

# You'll see Base64 encoded placeholder values
```

**Option A: Use Placeholders (for testing only)**
The existing placeholder secrets will work for local testing. Skip to Step 3.2.

**Option B: Use Real Secrets (recommended)**

```powershell
# Encode your real secrets to Base64
function ConvertTo-Base64 {
    param([string]$text)
    [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($text))
}

# Generate secrets
$JWT_SECRET = ConvertTo-Base64 "your-super-secret-jwt-key-change-me"
$NEXTAUTH_SECRET = ConvertTo-Base64 "your-nextauth-secret-change-me"
$POSTGRES_PASSWORD = ConvertTo-Base64 "postgres123"
$OPENAI_API_KEY = ConvertTo-Base64 "your-openai-api-key"

# Display encoded values
Write-Host "JWT_SECRET: $JWT_SECRET"
Write-Host "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
Write-Host "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
Write-Host "OPENAI_API_KEY: $OPENAI_API_KEY"

# Edit secrets file
notepad k8s/secrets.yaml
# Replace the Base64 values with the ones printed above
```

### Step 3.2: Verify ConfigMap

```powershell
# Check dev ConfigMap
Get-Content k8s/configmap-dev.yaml

# Or check Kustomize base
Get-Content k8s/base/configmap.yaml
```

Everything should be ready to go with sensible defaults.

---

## Part 4: Deploy to Minikube (10 minutes)

You have **3 options** for deployment. Pick one:

### Option 1: Automated Script (EASIEST) ⭐

```powershell
# Deploy everything automatically
.\scripts\deploy-k8s.ps1 -Environment dev

# This will:
# 1. ✅ Validate dependencies
# 2. ✅ Apply secrets
# 3. ✅ Apply Kustomize configuration
# 4. ✅ Create namespace, PVC, and all services
# 5. ✅ Wait for pods to be ready
# 6. ✅ Display access instructions

# Wait 3-5 minutes for all pods to start
```

**Skip to Part 5 if using this option!**

### Option 2: Using Kustomize (RECOMMENDED)

```powershell
# 1. Apply secrets first
kubectl apply -f k8s/secrets.yaml

# 2. Deploy everything with Kustomize
kubectl apply -k k8s/overlays/dev

# 3. Wait for pods
kubectl get pods -n profiller-dev -w

# Press Ctrl+C when all pods show READY 1/1
```

### Option 3: Manual Step-by-Step

```powershell
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets and configmap
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap-dev.yaml

# 3. Create PVC
kubectl apply -f k8s/postgres/pvc-dev.yaml

# Wait for PVC to be bound
kubectl get pvc -n profiller-dev -w
# Press Ctrl+C when STATUS = Bound

# 4. Deploy PostgreSQL
kubectl apply -f k8s/postgres/deployment.yaml
kubectl apply -f k8s/postgres/service.yaml

# Wait for postgres to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n profiller-dev --timeout=120s

# 5. Deploy Backend
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# Wait for backend
kubectl wait --for=condition=ready pod -l app=backend -n profiller-dev --timeout=180s

# 6. Deploy Frontend
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# 7. Deploy MCP Server
kubectl apply -f k8s/mcp-server/deployment.yaml
kubectl apply -f k8s/mcp-server/service.yaml

# Wait for all pods
kubectl wait --for=condition=ready pod --all -n profiller-dev --timeout=180s
```

---

## Part 5: Verify Deployment (5 minutes)

### Step 5.1: Check All Pods are Running

```powershell
kubectl get pods -n profiller-dev

# Expected output:
# NAME                          READY   STATUS    RESTARTS   AGE
# backend-xxx                   1/1     Running   0          2m
# frontend-xxx                  1/1     Running   0          2m
# mcp-server-xxx                1/1     Running   0          2m
# postgres-xxx                  1/1     Running   0          3m
```

**All pods should show:**
- `READY: 1/1` ✅
- `STATUS: Running` ✅
- `RESTARTS: 0` (or low number) ✅

**If a pod shows `CrashLoopBackOff` or `Error`:**
```powershell
# Check logs
kubectl logs -n profiller-dev <pod-name>

# Check detailed status
kubectl describe pod -n profiller-dev <pod-name>

# Common issues:
# - Image not found: Re-run docker build
# - Config error: Check secrets and configmap
# - Database connection: Check postgres is ready first
```

### Step 5.2: Check Services

```powershell
kubectl get services -n profiller-dev

# Expected output:
# NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# backend-service    ClusterIP   10.96.xxx.xxx   <none>        3001/TCP
# frontend-service   ClusterIP   10.96.xxx.xxx   <none>        3000/TCP
# mcp-server-service ClusterIP   10.96.xxx.xxx   <none>        3002/TCP
# postgres-service   ClusterIP   10.96.xxx.xxx   <none>        5432/TCP
```

### Step 5.3: Check PVC is Bound

```powershell
kubectl get pvc -n profiller-dev

# Expected output:
# NAME           STATUS   VOLUME                                     CAPACITY
# postgres-pvc   Bound    pvc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx   5Gi
```

**If STATUS = Pending:**
```powershell
# Check storage class exists
kubectl get storageclass

# Should show 'standard' (provided by Minikube)

# Check events
kubectl describe pvc postgres-pvc -n profiller-dev
```

### Step 5.4: Check Pod Health

```powershell
# Check all pods in detail
kubectl get pods -n profiller-dev -o wide

# Check health endpoints
# Backend health
kubectl exec -n profiller-dev <backend-pod> -- curl -s http://localhost:3001/health

# Frontend health
kubectl exec -n profiller-dev <frontend-pod> -- curl -s http://localhost:3000/api/health

# MCP health
kubectl exec -n profiller-dev <mcp-server-pod> -- curl -s http://localhost:3002/health

# All should return success (200 OK)
```

---

## Part 6: Initialize Database (2 minutes)

### Step 6.1: Run Migrations

```powershell
# Get backend pod name
$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'

Write-Host "Backend pod: $BACKEND_POD" -ForegroundColor Green

# Run database migrations
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:migrate

# Expected output:
# Migrating...
# Migration complete!
```

### Step 6.2: Seed Database (Optional)

```powershell
# Seed with test data
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:seed

# Expected output:
# Seeding database...
# Created 5 employees
# Created 3 clients
# Created 10 opportunities
# Seed complete!
```

### Step 6.3: Verify Database

```powershell
# Get postgres pod name
$POSTGRES_POD = kubectl get pods -n profiller-dev -l app=postgres -o jsonpath='{.items[0].metadata.name}'

# List tables
kubectl exec -n profiller-dev $POSTGRES_POD -- `
  psql -U postgres -d profiller_dev -c "\dt"

# Should show your tables: employees, clients, opportunities, etc.

# Count records
kubectl exec -n profiller-dev $POSTGRES_POD -- `
  psql -U postgres -d profiller_dev -c "SELECT COUNT(*) FROM employees;"
```

---

## Part 7: Access the Application (5 minutes)

You have **3 options** to access your application:

### Option 1: Port Forwarding (Easiest)

**Open 3 separate PowerShell windows:**

**Window 1 - Frontend:**
```powershell
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
```

**Window 2 - Backend:**
```powershell
kubectl port-forward -n profiller-dev service/backend-service 3001:3001
```

**Window 3 - MCP Server:**
```powershell
kubectl port-forward -n profiller-dev service/mcp-server-service 3002:3002
```

**Now access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- MCP Server: http://localhost:3002/health
- API Docs: http://localhost:3001/api-docs

### Option 2: Minikube Service (Automatic)

```powershell
# Open frontend in browser automatically
minikube service frontend-service -n profiller-dev

# Minikube will:
# 1. Create a tunnel
# 2. Assign a random port
# 3. Open browser automatically

# For backend
minikube service backend-service -n profiller-dev

# For MCP server
minikube service mcp-server-service -n profiller-dev
```

### Option 3: Minikube Tunnel (Advanced)

```powershell
# Open PowerShell as Administrator
minikube tunnel

# Leave this running
# Access services at their ClusterIP addresses
```

---

## Part 8: Test Everything Works (5 minutes)

### Test 1: Frontend Loads

```powershell
# Open browser
Start-Process "http://localhost:3000"

# You should see:
# ✅ Profiller HR login page
# ✅ No console errors
# ✅ Page loads within 3 seconds
```

### Test 2: Backend API Works

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing

# Should return:
# StatusCode: 200
# Content: {"status":"ok"}

# Test API documentation
Start-Process "http://localhost:3001/api-docs"
# Should show Swagger UI
```

### Test 3: Database Connection

```powershell
# Test backend can connect to database
Invoke-WebRequest -Uri "http://localhost:3001/api/employees" -UseBasicParsing

# Should return:
# StatusCode: 200
# Content: JSON array of employees (or empty array if not seeded)
```

### Test 4: Data Persistence

```powershell
# Run automated persistence test
.\scripts\test-persistence.ps1 -Namespace profiller-dev

# This will:
# 1. Create test data
# 2. Delete postgres pod
# 3. Wait for new pod
# 4. Verify data still exists
# 5. Report success or failure
```

### Test 5: Service Communication

```powershell
# Test frontend can reach backend
$FRONTEND_POD = kubectl get pods -n profiller-dev -l app=frontend -o jsonpath='{.items[0].metadata.name}'

kubectl exec -n profiller-dev $FRONTEND_POD -- `
  wget -qO- http://backend-service:3001/health

# Should return: {"status":"ok"}

# Test backend can reach postgres
$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'

kubectl exec -n profiller-dev $BACKEND_POD -- `
  psql postgresql://postgres:postgres@postgres-service:5432/profiller_dev -c "SELECT 1;"

# Should return: 1
```

---

## Part 9: Development Workflow

### Make Code Changes

```powershell
# 1. Edit your code
code backend/src/  # Or frontend/, mcp-server/

# 2. Rebuild image
docker build -f Dockerfile.express.production -t profiller-backend:latest .

# 3. Restart deployment
kubectl rollout restart deployment backend -n profiller-dev

# 4. Wait for new pod
kubectl rollout status deployment backend -n profiller-dev

# 5. Test changes
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

### View Logs

```powershell
# Backend logs (live)
kubectl logs -n profiller-dev -l app=backend -f

# Frontend logs
kubectl logs -n profiller-dev -l app=frontend -f

# All logs from a specific pod
kubectl logs -n profiller-dev <pod-name> -f --tail=100

# Previous pod logs (if crashed)
kubectl logs -n profiller-dev <pod-name> --previous
```

### Debug Issues

```powershell
# Get shell in backend pod
kubectl exec -n profiller-dev -it <backend-pod> -- /bin/sh

# Inside pod:
# - Check files: ls -la
# - Check env: printenv
# - Test connections: wget http://postgres-service:5432
# - Check logs: cat /var/log/app.log
# - Exit: exit

# Get shell in postgres pod
kubectl exec -n profiller-dev -it <postgres-pod> -- psql -U postgres profiller_dev

# Inside psql:
# - List tables: \dt
# - Check data: SELECT * FROM employees;
# - Exit: \q
```

### Scale Services

```powershell
# Scale backend to 3 replicas
kubectl scale deployment backend -n profiller-dev --replicas=3

# Watch pods scale up
kubectl get pods -n profiller-dev -w

# Scale back down
kubectl scale deployment backend -n profiller-dev --replicas=1
```

---

## Part 10: Troubleshooting

### Issue: "connection refused" errors

**Symptoms:**
- Frontend can't reach backend
- Backend can't reach postgres

**Solution:**
```powershell
# 1. Check all pods are running
kubectl get pods -n profiller-dev

# 2. Check services exist
kubectl get services -n profiller-dev

# 3. Test service DNS
kubectl exec -n profiller-dev <backend-pod> -- nslookup postgres-service

# 4. Check environment variables
kubectl exec -n profiller-dev <backend-pod> -- printenv | Select-String "DATABASE_URL"

# Should show: postgresql://postgres:xxx@postgres-service:5432/profiller_dev
```

### Issue: Pods in "ImagePullBackOff"

**Symptoms:**
```
NAME            READY   STATUS             RESTARTS
backend-xxx     0/1     ImagePullBackOff   0
```

**Solution:**
```powershell
# 1. Verify you built images in Minikube's Docker
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 2. Verify images exist
docker images | Select-String "profiller"

# 3. Rebuild if missing
docker build -f Dockerfile.express.production -t profiller-backend:latest .

# 4. Check imagePullPolicy in deployment
kubectl get deployment backend -n profiller-dev -o yaml | Select-String "imagePullPolicy"

# Should be: imagePullPolicy: Never (for local images)
```

### Issue: Pods in "CrashLoopBackOff"

**Symptoms:**
```
NAME            READY   STATUS              RESTARTS
backend-xxx     0/1     CrashLoopBackOff    5
```

**Solution:**
```powershell
# 1. Check logs
kubectl logs -n profiller-dev <pod-name>

# 2. Check previous logs
kubectl logs -n profiller-dev <pod-name> --previous

# 3. Common causes:
# - Database not ready: Wait for postgres pod first
# - Missing env vars: Check secrets and configmap
# - Port already in use: Check conflicting services
# - Out of memory: Increase memory limits

# 4. Describe pod for events
kubectl describe pod -n profiller-dev <pod-name>
```

### Issue: "No space left on device"

**Symptoms:**
- Can't build images
- Pods fail to start

**Solution:**
```powershell
# 1. Clean up old Docker images
docker system prune -a --volumes

# 2. Restart Minikube with more disk
minikube delete
minikube start --cpus=4 --memory=7939 --disk-size=20g
```

### Issue: Minikube won't start

**Solution:**
```powershell
# 1. Check Docker is running
docker ps

# 2. Delete and recreate
minikube delete
minikube start --cpus=4 --memory=7939 --driver=docker

# 3. If still fails, check logs
minikube logs

# 4. Try different driver
minikube start --driver=virtualbox  # or hyperv
```

---

## Part 11: Clean Up

### Soft Clean (Keep Minikube Running)

```powershell
# Delete all resources but keep Minikube
kubectl delete namespace profiller-dev

# Or delete specific resources
kubectl delete -k k8s/overlays/dev
```

### Full Clean (Stop Minikube)

```powershell
# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete

# Clean up Docker images
docker system prune -a --volumes
```

### Keep Data, Delete Pods

```powershell
# Delete deployments (keeps PVC and data)
kubectl delete deployment --all -n profiller-dev

# Redeploy later - data will still be there
kubectl apply -k k8s/overlays/dev
```

---

## Quick Reference Commands

```powershell
# Start/Stop Minikube
minikube start
minikube stop
minikube status

# Configure Docker to use Minikube
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build images
docker build -f Dockerfile.express.production -t profiller-backend:latest .
docker build -f Dockerfile.next.production -t profiller-frontend:latest .
docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .

# Deploy
.\scripts\deploy-k8s.ps1 -Environment dev
# OR
kubectl apply -k k8s/overlays/dev

# Check status
kubectl get all -n profiller-dev
kubectl get pods -n profiller-dev -w
kubectl logs -n profiller-dev <pod-name> -f

# Access application
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
# OR
minikube service frontend-service -n profiller-dev

# Run migrations
kubectl exec -n profiller-dev <backend-pod> -- npm run db:migrate

# Test persistence
.\scripts\test-persistence.ps1 -Namespace profiller-dev

# Debug
kubectl exec -n profiller-dev -it <pod-name> -- /bin/sh
kubectl describe pod -n profiller-dev <pod-name>

# Clean up
kubectl delete namespace profiller-dev
minikube delete
```

---

## Complete Workflow Script

Save this as `scripts\dev-setup.ps1`:

```powershell
# Complete development setup script
Write-Host "Starting Profiller HR Development Environment..." -ForegroundColor Cyan

# 1. Start Minikube
Write-Host "[1/5] Starting Minikube..." -ForegroundColor Yellow
minikube start --cpus=4 --memory=7939

# 2. Configure Docker
Write-Host "[2/5] Configuring Docker..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 3. Build images
Write-Host "[3/5] Building Docker images..." -ForegroundColor Yellow
docker build -f Dockerfile.express.production -t profiller-backend:latest .
docker build -f Dockerfile.next.production -t profiller-frontend:latest .
docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .

# 4. Deploy
Write-Host "[4/5] Deploying to Kubernetes..." -ForegroundColor Yellow
.\scripts\deploy-k8s.ps1 -Environment dev

# 5. Initialize database
Write-Host "[5/5] Initializing database..." -ForegroundColor Yellow
$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:migrate
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:seed

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward -n profiller-dev service/frontend-service 3000:3000" -ForegroundColor White
Write-Host "  Then open: http://localhost:3000" -ForegroundColor White
```

---

## Next Steps

After you have your dev environment working:

1. ✅ Test data persistence with `.\scripts\test-persistence.ps1`
2. ✅ Try making code changes and redeploying
3. ✅ Set up staging environment (`.\scripts\deploy-k8s.ps1 -Environment staging`)
4. ✅ Learn about Kubernetes monitoring (Minikube dashboard)
5. ✅ Set up CI/CD pipeline for automated deployments

---

## Summary

You now know how to:
- ✅ Start Minikube cluster
- ✅ Build Docker images locally
- ✅ Deploy entire application stack
- ✅ Access services via port-forward or Minikube service
- ✅ Debug issues with logs and exec
- ✅ Test data persistence
- ✅ Make changes and redeploy
- ✅ Clean up resources

**Your development environment is production-ready!** 🚀

Need help? Check the troubleshooting section or ask for assistance.
