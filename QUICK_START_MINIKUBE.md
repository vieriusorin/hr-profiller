# Quick Start: Minikube Development Environment

## The Fastest Way to Get Started

```powershell
# 1. Check prerequisites
.\scripts\check-prerequisites.ps1

# 2. Run complete setup (guided)
.\scripts\dev-setup.ps1

# 3. Access application
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
# Then open: http://localhost:3000
```

That's it! The setup script handles everything automatically. ✅

---

## What Gets Created

```
Minikube Cluster
├── Namespace: profiller-dev
├── PostgreSQL Database
│   └── PersistentVolume (5Gi) - data persists!
├── Backend API (Express.js)
│   └── Port 3001
├── Frontend (Next.js)
│   └── Port 3000
└── MCP Server (AI Analytics)
    └── Port 3002
```

---

## Prerequisites

Before starting, you need:
- ✅ Docker Desktop (running)
- ✅ Minikube installed
- ✅ kubectl installed
- ✅ 8GB RAM, 4 CPU cores
- ✅ 20GB free disk space

**Check everything:**
```powershell
.\scripts\check-prerequisites.ps1
```

---

## Three Ways to Deploy

### Method 1: Automated Setup Script (EASIEST) ⭐

**Best for:** First-time setup, learning

```powershell
# Complete guided setup
.\scripts\dev-setup.ps1

# The script will:
# - Start Minikube
# - Build all Docker images
# - Deploy everything to Kubernetes
# - Initialize database
# - Test persistence
# - Show you how to access the app
```

**Time:** 30-45 minutes (mostly waiting for builds)

### Method 2: Quick Deploy Script

**Best for:** You've already built images

```powershell
# 1. Start Minikube
minikube start --cpus=4 --memory=7939

# 2. Configure Docker
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 3. Deploy (builds images automatically)
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages

# 4. Initialize database
$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:migrate
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:seed
```

**Time:** 15-20 minutes

### Method 3: Manual Commands

**Best for:** Understanding each step

See `MINIKUBE_DEVELOPMENT_GUIDE.md` for detailed manual instructions.

---

## Access Your Application

### Option 1: Port Forward (Recommended)

**Terminal 1 - Frontend:**
```powershell
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
```

**Terminal 2 - Backend:**
```powershell
kubectl port-forward -n profiller-dev service/backend-service 3001:3001
```

**Terminal 3 - MCP Server:**
```powershell
kubectl port-forward -n profiller-dev service/mcp-server-service 3002:3002
```

**Open browser:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- API Docs: http://localhost:3001/api-docs
- MCP Server: http://localhost:3002/health

### Option 2: Minikube Service (Automatic)

```powershell
# Opens frontend in browser automatically
minikube service frontend-service -n profiller-dev
```

Minikube creates a tunnel and assigns a random port (e.g., http://127.0.0.1:54321)

---

## Verify Everything Works

### Quick Health Check

```powershell
# Check all pods are running
kubectl get pods -n profiller-dev

# Should show all pods with READY 1/1 and STATUS Running:
# backend-xxx       1/1  Running
# frontend-xxx      1/1  Running
# mcp-server-xxx    1/1  Running
# postgres-xxx      1/1  Running
```

### Test Endpoints

```powershell
# Backend health
Invoke-WebRequest http://localhost:3001/health

# Frontend health
Invoke-WebRequest http://localhost:3000/api/health

# MCP health
Invoke-WebRequest http://localhost:3002/health

# All should return: StatusCode: 200
```

### Test Database Connection

```powershell
# Get backend pod
$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'

# Check database connection
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:migrate

# Should show: Migration complete!
```

### Test Data Persistence

```powershell
# Run automated test
.\scripts\test-persistence.ps1 -Namespace profiller-dev

# This will:
# 1. Create test data
# 2. Delete PostgreSQL pod
# 3. Wait for new pod
# 4. Verify data still exists
# 5. Report: ✅ SUCCESS! Data persisted
```

---

## Common Commands

```powershell
# View logs (live)
kubectl logs -n profiller-dev -l app=backend -f
kubectl logs -n profiller-dev -l app=frontend -f

# Check status
kubectl get all -n profiller-dev

# Open Minikube dashboard (GUI)
minikube dashboard

# Get shell in pod
kubectl exec -n profiller-dev -it <pod-name> -- /bin/sh

# Restart a deployment
kubectl rollout restart deployment backend -n profiller-dev

# Scale replicas
kubectl scale deployment backend -n profiller-dev --replicas=3

# Delete everything (keeps Minikube running)
kubectl delete namespace profiller-dev

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

---

## Development Workflow

### Make Code Changes

```powershell
# 1. Edit code
code backend/src/some-file.ts

# 2. Configure Docker for Minikube
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 3. Rebuild image
docker build -f Dockerfile.express.production -t profiller-backend:latest .

# 4. Restart deployment
kubectl rollout restart deployment backend -n profiller-dev

# 5. Check logs
kubectl logs -n profiller-dev -l app=backend -f

# 6. Test changes
Invoke-WebRequest http://localhost:3001/health
```

### Add Database Migration

```powershell
# 1. Create migration in backend/db/migrations/

# 2. Get backend pod
$BACKEND_POD = kubectl get pods -n profiller-dev -l app=backend -o jsonpath='{.items[0].metadata.name}'

# 3. Run migration
kubectl exec -n profiller-dev $BACKEND_POD -- npm run db:migrate

# 4. Verify
kubectl exec -n profiller-dev <postgres-pod> -- `
  psql -U postgres -d profiller_dev -c "\dt"
```

---

## Troubleshooting

### Pod stuck in "CrashLoopBackOff"

```powershell
# Check logs
kubectl logs -n profiller-dev <pod-name>
kubectl logs -n profiller-dev <pod-name> --previous

# Check events
kubectl describe pod -n profiller-dev <pod-name>

# Common fixes:
# - Database not ready: Wait for postgres pod
# - Missing env vars: Check secrets
# - Port conflict: Check other services
```

### Pod stuck in "ImagePullBackOff"

```powershell
# Verify Docker is using Minikube
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Check images exist
docker images | Select-String "profiller"

# Rebuild if missing
docker build -f Dockerfile.express.production -t profiller-backend:latest .

# Delete and recreate pod
kubectl delete pod <pod-name> -n profiller-dev
```

### Can't connect to application

```powershell
# Check pods are running
kubectl get pods -n profiller-dev

# Check port-forward is running
# (Look for "Forwarding from 127.0.0.1:3000" message)

# Check service exists
kubectl get services -n profiller-dev

# Try Minikube service instead
minikube service frontend-service -n profiller-dev
```

### Minikube won't start

```powershell
# Check Docker is running
docker ps

# Delete and recreate
minikube delete
minikube start --cpus=4 --memory=7939 --driver=docker

# Check logs if it fails
minikube logs
```

### Data not persisting

```powershell
# Check PVC is bound
kubectl get pvc -n profiller-dev

# Should show: STATUS = Bound

# Verify deployment uses PVC
kubectl get deployment postgres -n profiller-dev -o yaml | Select-String "persistentVolumeClaim"

# Should see: persistentVolumeClaim (NOT emptyDir)

# Run persistence test
.\scripts\test-persistence.ps1 -Namespace profiller-dev
```

---

## What's Next?

### Immediate (Try These Now)
1. ✅ Access the application in browser
2. ✅ Check the Swagger API docs: http://localhost:3001/api-docs
3. ✅ Run persistence test: `.\scripts\test-persistence.ps1`
4. ✅ View logs: `kubectl logs -n profiller-dev -l app=backend -f`
5. ✅ Open Minikube dashboard: `minikube dashboard`

### Learning (Explore Further)
1. Make a code change and redeploy
2. Scale a deployment to multiple replicas
3. Delete a pod and watch it recreate automatically
4. Explore the Minikube dashboard (GUI)
5. Try accessing via `minikube service` instead of port-forward

### Advanced (Production Prep)
1. Deploy to staging environment: `.\scripts\deploy-k8s.ps1 -Environment staging`
2. Set up ingress controller for external access
3. Implement monitoring with Prometheus/Grafana
4. Create CI/CD pipeline with GitHub Actions
5. Plan cloud deployment (AWS EKS, GCP GKE, Azure AKS)

---

## Documentation

- **`MINIKUBE_DEVELOPMENT_GUIDE.md`** - Complete 50+ page guide
- **`PERSISTENT_STORAGE_GUIDE.md`** - Deep dive on PersistentVolumes
- **`K8S_PARAMETERIZATION_GUIDE.md`** - ConfigMap management
- **`QUICK_START_PERSISTENCE.md`** - Quick reference for storage

---

## Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `check-prerequisites.ps1` | Verify system requirements | Before first setup |
| `dev-setup.ps1` | Complete guided setup | First-time deployment |
| `deploy-k8s.ps1` | Deploy to any environment | Quick deployments |
| `test-persistence.ps1` | Test data persistence | After deployment |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Your Computer                      │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │  Docker Desktop                     │    │
│  │                                     │    │
│  │  ┌──────────────────────────────┐  │    │
│  │  │  Minikube Cluster             │  │    │
│  │  │                               │  │    │
│  │  │  ┌────────────────────────┐  │  │    │
│  │  │  │ Namespace: profiller-dev│  │  │    │
│  │  │  │                         │  │  │    │
│  │  │  │  Frontend (Next.js)     │←─┼──┼────┤ http://localhost:3000
│  │  │  │  ↓                      │  │  │    │
│  │  │  │  Backend (Express)      │←─┼──┼────┤ http://localhost:3001
│  │  │  │  ↓                      │  │  │    │
│  │  │  │  PostgreSQL + PVC       │  │  │    │
│  │  │  │  ↓                      │  │  │    │
│  │  │  │  MCP Server (AI)        │←─┼──┼────┤ http://localhost:3002
│  │  │  └────────────────────────┘  │  │    │
│  │  └──────────────────────────────┘  │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## FAQ

**Q: How long does setup take?**
A: 30-45 minutes first time (mostly waiting for image builds). 5 minutes after that.

**Q: Do I need to rebuild images every time?**
A: No, only when you change code. Deployments reuse existing images.

**Q: Will my data persist if I stop Minikube?**
A: Yes! PersistentVolumes survive Minikube stop/start.

**Q: Can I run multiple environments?**
A: Yes! Deploy dev, staging, and prod in separate namespaces.

**Q: How do I access from another computer?**
A: Set up ingress controller or use `minikube tunnel` (requires admin).

**Q: Is this production-ready?**
A: The architecture is! But Minikube is for development only. Use managed Kubernetes (EKS/GKE/AKS) for production.

---

## Summary

✅ **What You Get:**
- Complete local Kubernetes environment
- All services running and connected
- Persistent database storage
- Hot-reload development workflow
- Production-like architecture

✅ **One Command Setup:**
```powershell
.\scripts\dev-setup.ps1
```

✅ **Access Application:**
```powershell
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
```

✅ **Test Persistence:**
```powershell
.\scripts\test-persistence.ps1
```

**You're ready to build! 🚀**

For detailed step-by-step instructions, see: `MINIKUBE_DEVELOPMENT_GUIDE.md`
