# Kubernetes & Infrastructure as Code - Complete Guide

Welcome to the complete Kubernetes and Infrastructure as Code (IaC) documentation for Profiller HR!

---

## 🚀 Quick Start

**Complete beginners - Start here:**
```powershell
# 1. Check if you have everything
.\scripts\check-prerequisites.ps1

# 2. Run guided setup
.\scripts\dev-setup.ps1

# 3. Access application
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
```

**Already know Kubernetes - Quick deploy:**
```powershell
minikube start --cpus=4 --memory=7939
& minikube docker-env --shell powershell | Invoke-Expression
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages
```

---

## 📚 Documentation Index

### Getting Started

| Document | Description | When to Read |
|----------|-------------|--------------|
| **`QUICK_START_MINIKUBE.md`** | Fastest way to get running | Read this first! |
| **`MINIKUBE_DEVELOPMENT_GUIDE.md`** | Complete 50-page guide | Deep dive learning |
| **`K8S_PARAMETERIZATION_GUIDE.md`** | ConfigMap management | Understanding IaC |

### Storage & Data

| Document | Description | When to Read |
|----------|-------------|--------------|
| **`QUICK_START_PERSISTENCE.md`** | Quick reference for PVCs | Quick lookup |
| **`PERSISTENT_STORAGE_GUIDE.md`** | Complete storage guide | Production planning |

### This Document
**`KUBERNETES_README.md`** - You are here! Overview and navigation guide.

---

## 🎯 Learning Path

### Week 1: Basics (You Are Here!)
- [ ] Read `QUICK_START_MINIKUBE.md`
- [ ] Run `.\scripts\dev-setup.ps1`
- [ ] Deploy to Minikube successfully
- [ ] Access application in browser
- [ ] Run persistence test
- [ ] Make a code change and redeploy

**Goal:** Comfortable with local Kubernetes development

### Week 2: Understanding IaC
- [ ] Read `K8S_PARAMETERIZATION_GUIDE.md`
- [ ] Understand base vs overlays
- [ ] Deploy to multiple environments (dev/staging)
- [ ] Read `PERSISTENT_STORAGE_GUIDE.md`
- [ ] Understand PV, PVC, StorageClass

**Goal:** Understand Infrastructure as Code principles

### Week 3: Advanced
- [ ] Read full `MINIKUBE_DEVELOPMENT_GUIDE.md`
- [ ] Set up ingress controller
- [ ] Implement resource limits/requests
- [ ] Add monitoring (metrics-server)
- [ ] Create custom Kustomize overlay

**Goal:** Production-ready knowledge

### Week 4: Production Planning
- [ ] Choose cloud provider (AWS/GCP/Azure)
- [ ] Plan infrastructure (managed K8s)
- [ ] Design CI/CD pipeline
- [ ] Implement secrets management
- [ ] Plan disaster recovery

**Goal:** Ready to deploy to production

---

## 🛠️ What We Built

### Infrastructure Components

```
profiller-hr/
├── k8s/                              # Kubernetes manifests
│   ├── base/                         # Base configuration (Kustomize)
│   │   ├── configmap.yaml            # Common config values
│   │   ├── kustomization.yaml        # Base resource list
│   │   └── postgres-pvc.yaml         # PersistentVolume claim
│   │
│   ├── overlays/                     # Environment-specific configs
│   │   ├── dev/                      # Development (Minikube)
│   │   │   └── kustomization.yaml    #   5Gi storage, 1 replica, debug logs
│   │   ├── staging/                  # Staging
│   │   │   └── kustomization.yaml    #   20Gi storage, 2 replicas
│   │   └── prod/                     # Production
│   │       └── kustomization.yaml    #   100Gi storage, 3 replicas, PV
│   │
│   ├── postgres/                     # PostgreSQL resources
│   │   ├── deployment.yaml           # StatefulSet with PVC
│   │   ├── service.yaml              # ClusterIP service
│   │   ├── pvc.yaml                  # Generic PVC (10Gi)
│   │   ├── pvc-dev.yaml              # Dev PVC (5Gi)
│   │   ├── pvc-staging.yaml          # Staging PVC (20Gi)
│   │   └── pvc-prod.yaml             # Production PVC (100Gi)
│   │
│   ├── backend/                      # Express.js API
│   │   ├── deployment.yaml           # Backend deployment
│   │   └── service.yaml              # Backend service
│   │
│   ├── frontend/                     # Next.js application
│   │   ├── deployment.yaml           # Frontend deployment
│   │   └── service.yaml              # Frontend service
│   │
│   ├── mcp-server/                   # AI analytics service
│   │   ├── deployment.yaml           # MCP deployment
│   │   └── service.yaml              # MCP service
│   │
│   ├── namespace.yaml                # Namespace definition
│   ├── secrets.yaml                  # Secrets (JWT, DB passwords)
│   ├── configmap.yaml                # Original configmap
│   ├── configmap-dev.yaml            # Dev-specific config
│   ├── configmap-staging.yaml        # Staging-specific config
│   └── configmap-prod.yaml           # Prod-specific config
│
├── scripts/                          # Automation scripts
│   ├── check-prerequisites.ps1       # Verify system requirements
│   ├── dev-setup.ps1                 # Complete guided setup
│   ├── deploy-k8s.ps1                # Deploy to any environment
│   ├── deploy-k8s.sh                 # Linux/Mac version
│   ├── test-persistence.ps1          # Test data persistence
│   └── test-persistence.sh           # Linux/Mac version
│
├── Dockerfile.express.production     # Backend production image
├── Dockerfile.next.production        # Frontend production image
├── Dockerfile.mcp.production         # MCP server production image
│
└── [Documentation files...]          # All the MD files
```

### What Gets Deployed

| Component | Image | Port | Replicas | Storage |
|-----------|-------|------|----------|---------|
| PostgreSQL | postgres:15-alpine | 5432 | 1 | 5Gi PVC (dev) |
| Backend API | profiller-backend | 3001 | 1 (dev), 2 (staging), 3 (prod) | - |
| Frontend | profiller-frontend | 3000 | 1 (dev), 2 (staging), 3 (prod) | - |
| MCP Server | profiller-mcp-server | 3002 | 1 (dev), 1 (staging), 2 (prod) | - |

---

## 🔧 Scripts Overview

### `check-prerequisites.ps1`

**Purpose:** Verify system meets requirements

**Usage:**
```powershell
.\scripts\check-prerequisites.ps1
```

**Checks:**
- ✅ Docker installed and running
- ✅ Minikube installed and running
- ✅ kubectl installed
- ✅ System resources (CPU, RAM, disk)
- ✅ Project files present
- ✅ Docker images built
- ✅ Docker configured for Minikube

**Output:** Pass/fail report with remediation steps

---

### `dev-setup.ps1`

**Purpose:** Complete guided setup from zero to running app

**Usage:**
```powershell
# Full interactive setup
.\scripts\dev-setup.ps1

# Skip checks (if already verified)
.\scripts\dev-setup.ps1 -SkipChecks

# Skip build (if images already built)
.\scripts\dev-setup.ps1 -SkipBuild

# Clean up first
.\scripts\dev-setup.ps1 -CleanFirst
```

**What It Does:**
1. Runs pre-flight checks
2. Starts/verifies Minikube
3. Enables addons
4. Configures Docker for Minikube
5. Builds all Docker images
6. Deploys to Kubernetes
7. Verifies deployment
8. Initializes database
9. Tests persistence (optional)
10. Shows access instructions

**Time:** 30-45 minutes first time

---

### `deploy-k8s.ps1` / `deploy-k8s.sh`

**Purpose:** Deploy to any environment (dev/staging/prod)

**Usage:**
```powershell
# Deploy to dev
.\scripts\deploy-k8s.ps1 -Environment dev

# Build images and deploy
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages

# Dry run (preview only)
.\scripts\deploy-k8s.ps1 -Environment staging -DryRun
```

**What It Does:**
1. Validates dependencies
2. Builds Docker images (if requested)
3. Applies secrets
4. Applies Kustomize configuration
5. Waits for pods to be ready
6. Displays access instructions

**Time:** 3-5 minutes (without build), 15-20 minutes (with build)

---

### `test-persistence.ps1` / `test-persistence.sh`

**Purpose:** Verify data survives pod restarts

**Usage:**
```powershell
# Test dev environment
.\scripts\test-persistence.ps1 -Namespace profiller-dev

# Test staging
.\scripts\test-persistence.ps1 -Namespace profiller-staging
```

**What It Does:**
1. Checks PVC is bound
2. Creates test table with timestamp
3. Deletes PostgreSQL pod
4. Waits for new pod to start
5. Verifies test data still exists
6. Reports success or failure

**Time:** 2-3 minutes

---

## 📖 Key Concepts Explained

### Infrastructure as Code (IaC)

**What:** Managing infrastructure through declarative configuration files

**Benefits:**
- ✅ Version controlled (in Git)
- ✅ Reproducible (same config = same infrastructure)
- ✅ Automated (no manual clicks)
- ✅ Documented (code is documentation)

**In This Project:**
```yaml
# Instead of manually:
# 1. SSH to server
# 2. Install PostgreSQL
# 3. Configure users
# 4. Set passwords
# 5. Create database

# We declare:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  # ... everything defined in code
```

---

### Kustomize (Template-Free Configuration)

**What:** Built-in Kubernetes tool for managing configurations

**How It Works:**

```
Base (Common Config)
├── configmap.yaml (ports, service names)
├── deployments (PostgreSQL, backend, frontend)
└── services

Overlays (Environment Specific)
├── dev/kustomization.yaml
│   └── Adds: debug logs, 1 replica, 5Gi storage
├── staging/kustomization.yaml
│   └── Adds: info logs, 2 replicas, 20Gi storage
└── prod/kustomization.yaml
    └── Adds: warn logs, 3 replicas, 100Gi storage
```

**Benefits:**
- No duplication (base defined once)
- Clear differences per environment
- Can patch any resource
- Built into kubectl

**Usage:**
```bash
kubectl apply -k k8s/overlays/dev      # Deploy dev
kubectl apply -k k8s/overlays/staging  # Deploy staging
kubectl apply -k k8s/overlays/prod     # Deploy production
```

---

### PersistentVolumes (Data That Survives)

**The Problem:**
```yaml
volumes:
- name: postgres-storage
  emptyDir: {}  # ❌ Data deleted when pod restarts
```

**The Solution:**
```yaml
volumes:
- name: postgres-storage
  persistentVolumeClaim:
    claimName: postgres-pvc  # ✅ Data persists forever
```

**How It Works:**

```
Your App (Pod)
    ↓ mounts
PersistentVolumeClaim (Request: "I need 10Gi")
    ↓ binds to
PersistentVolume (Actual storage: "Here's 10Gi")
    ↓ backed by
Physical Storage (Minikube: hostPath, Cloud: EBS/PD/Disk)
```

**Benefits:**
- ✅ Data survives pod restarts
- ✅ Data survives node failures
- ✅ Can snapshot/backup
- ✅ Production-ready

---

## 🌍 Environment Comparison

| Aspect | Dev (Minikube) | Staging | Production |
|--------|----------------|---------|------------|
| **Namespace** | profiller-dev | profiller-staging | profiller |
| **Replicas** | 1 | 2 | 3 |
| **Storage** | 5Gi (hostPath) | 20Gi (standard) | 100Gi (premium SSD) |
| **Memory (backend)** | 512Mi | 1Gi | 2Gi |
| **CPU (backend)** | 500m | 1000m | 2000m |
| **Log Level** | debug | info | warn |
| **Database** | profiller_dev | profiller_staging | profiller_prod |
| **CORS** | localhost | staging.profiller.com | profiller.com |

---

## 🎓 From Beginner to Expert

### Beginner (Week 1)

**You can:**
- ✅ Deploy to Minikube
- ✅ Access application
- ✅ View logs
- ✅ Make code changes

**Commands you know:**
```bash
kubectl get pods
kubectl logs <pod>
kubectl port-forward
minikube service
```

---

### Intermediate (Week 2-3)

**You can:**
- ✅ Deploy to multiple environments
- ✅ Understand Kustomize
- ✅ Manage ConfigMaps and Secrets
- ✅ Configure persistent storage
- ✅ Debug pod issues

**Commands you know:**
```bash
kubectl apply -k k8s/overlays/dev
kubectl describe pod <pod>
kubectl exec -it <pod> -- /bin/sh
kubectl rollout restart deployment
kubectl scale deployment --replicas=3
```

---

### Advanced (Week 4+)

**You can:**
- ✅ Design cloud infrastructure
- ✅ Implement CI/CD pipelines
- ✅ Set up monitoring/alerting
- ✅ Configure ingress controllers
- ✅ Implement auto-scaling
- ✅ Plan disaster recovery

**Tools you use:**
- Helm (package manager)
- ArgoCD (GitOps)
- Prometheus (monitoring)
- Terraform (cloud provisioning)
- GitHub Actions (CI/CD)

---

## 🚦 Common Workflows

### Daily Development

```powershell
# 1. Start Minikube (if stopped)
minikube start

# 2. Configure Docker
& minikube docker-env --shell powershell | Invoke-Expression

# 3. Make code changes
code backend/src/

# 4. Rebuild image
docker build -f Dockerfile.express.production -t profiller-backend:latest .

# 5. Restart deployment
kubectl rollout restart deployment backend -n profiller-dev

# 6. Watch logs
kubectl logs -n profiller-dev -l app=backend -f

# 7. Test
Invoke-WebRequest http://localhost:3001/health
```

### Deploy New Feature

```powershell
# 1. Deploy to dev
.\scripts\deploy-k8s.ps1 -Environment dev

# 2. Test in dev
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000

# 3. Deploy to staging
.\scripts\deploy-k8s.ps1 -Environment staging

# 4. Test in staging
kubectl port-forward -n profiller-staging service/frontend-service 3000:3000

# 5. Deploy to production (after approval)
.\scripts\deploy-k8s.ps1 -Environment prod
```

### Debug Production Issue

```powershell
# 1. Check pod status
kubectl get pods -n profiller

# 2. View logs
kubectl logs -n profiller -l app=backend --tail=100

# 3. Get shell in pod
kubectl exec -n profiller -it <pod> -- /bin/sh

# 4. Check database
kubectl exec -n profiller <postgres-pod> -- \
  psql -U postgres profiller_prod -c "SELECT COUNT(*) FROM employees;"

# 5. Check resources
kubectl top pods -n profiller

# 6. Check events
kubectl get events -n profiller --sort-by='.lastTimestamp'
```

---

## 📊 Monitoring & Observability

### Built-In Tools

**Kubernetes Dashboard:**
```bash
minikube dashboard
```
- View all resources
- See logs graphically
- Monitor resource usage
- Debug visually

**Metrics Server:**
```bash
kubectl top nodes
kubectl top pods -n profiller-dev
```
- CPU/memory usage per pod
- Resource consumption trends

### What to Monitor

| Metric | Command | Alert When |
|--------|---------|------------|
| Pod status | `kubectl get pods -n profiller` | Not Running |
| Pod restarts | `kubectl get pods -n profiller` | > 5 restarts |
| CPU usage | `kubectl top pods -n profiller` | > 80% |
| Memory usage | `kubectl top pods -n profiller` | > 80% |
| Disk usage | `kubectl exec <postgres-pod> -- df -h` | > 80% |
| Response time | `curl -w "@curl-format.txt" URL` | > 500ms |

---

## 🔒 Security Best Practices

### Implemented ✅

- ✅ Secrets stored separately from code
- ✅ ConfigMaps for non-sensitive data only
- ✅ Resource limits prevent DoS
- ✅ RBAC-ready namespace isolation
- ✅ Health checks (liveness/readiness probes)
- ✅ PostgreSQL not exposed externally

### TODO for Production 🔧

- [ ] Use external secret management (Sealed Secrets, External Secrets Operator)
- [ ] Implement network policies
- [ ] Enable pod security standards
- [ ] Set up RBAC roles properly
- [ ] Enable audit logging
- [ ] Scan images for vulnerabilities
- [ ] Implement mTLS (service mesh)

---

## 🌐 Cloud Deployment (Future)

### AWS (EKS)

```bash
# Create EKS cluster
eksctl create cluster --name profiller-hr --region us-east-1

# Configure kubectl
aws eks update-kubeconfig --name profiller-hr

# Deploy
kubectl apply -k k8s/overlays/prod

# Use EBS for storage
storageClassName: gp3
```

### GCP (GKE)

```bash
# Create GKE cluster
gcloud container clusters create profiller-hr --region us-central1

# Configure kubectl
gcloud container clusters get-credentials profiller-hr

# Deploy
kubectl apply -k k8s/overlays/prod

# Use Persistent Disk
storageClassName: pd-ssd
```

### Azure (AKS)

```bash
# Create AKS cluster
az aks create --name profiller-hr --resource-group myResourceGroup

# Configure kubectl
az aks get-credentials --name profiller-hr --resource-group myResourceGroup

# Deploy
kubectl apply -k k8s/overlays/prod

# Use Azure Disk
storageClassName: managed-premium
```

---

## 📝 Cheat Sheet

### Essential Commands

```bash
# Cluster
minikube start --cpus=4 --memory=7939
minikube stop
minikube delete
minikube status
minikube dashboard

# Deploy
kubectl apply -k k8s/overlays/dev
kubectl delete -k k8s/overlays/dev

# Inspect
kubectl get all -n profiller-dev
kubectl get pods -n profiller-dev -o wide
kubectl describe pod <pod> -n profiller-dev
kubectl logs <pod> -n profiller-dev -f
kubectl logs <pod> -n profiller-dev --previous

# Execute
kubectl exec -it <pod> -n profiller-dev -- /bin/sh
kubectl exec <pod> -n profiller-dev -- <command>

# Access
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000
minikube service frontend-service -n profiller-dev

# Manage
kubectl rollout restart deployment backend -n profiller-dev
kubectl rollout status deployment backend -n profiller-dev
kubectl scale deployment backend -n profiller-dev --replicas=3

# Debug
kubectl get events -n profiller-dev --sort-by='.lastTimestamp'
kubectl top pods -n profiller-dev
kubectl top nodes
```

---

## 🆘 Getting Help

### Check Documentation
1. `QUICK_START_MINIKUBE.md` - Quick reference
2. `MINIKUBE_DEVELOPMENT_GUIDE.md` - Full guide
3. `PERSISTENT_STORAGE_GUIDE.md` - Storage troubleshooting
4. `K8S_PARAMETERIZATION_GUIDE.md` - ConfigMap issues

### Run Diagnostics
```powershell
# Check prerequisites
.\scripts\check-prerequisites.ps1

# Check deployment
kubectl get all -n profiller-dev
kubectl get events -n profiller-dev
kubectl describe pod <pod> -n profiller-dev
kubectl logs <pod> -n profiller-dev
```

### Common Issues
- Pod not starting → Check logs: `kubectl logs <pod>`
- Can't connect → Check port-forward is running
- Data lost → Check PVC: `kubectl get pvc -n profiller-dev`
- Image not found → Rebuild: `docker build ...`

---

## 🎉 What You've Accomplished

By following this guide, you now have:

✅ **Working Knowledge:**
- Kubernetes fundamentals
- Container orchestration
- Infrastructure as Code principles
- Kustomize configuration management
- Persistent storage concepts

✅ **Practical Skills:**
- Deploy full-stack applications
- Manage multiple environments
- Debug production issues
- Scale applications
- Implement data persistence

✅ **Production-Ready Setup:**
- Parameterized configurations
- Environment-specific overlays
- Persistent data storage
- Health checks and monitoring
- Automated deployment scripts

✅ **Career Skills:**
- Modern DevOps practices
- Cloud-native architecture
- Kubernetes expertise
- GitOps mindset
- Production troubleshooting

---

## 📚 Further Learning

### Official Documentation
- [Kubernetes Docs](https://kubernetes.io/docs/home/)
- [Kustomize Tutorial](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)
- [Minikube Guide](https://minikube.sigs.k8s.io/docs/)

### Recommended Courses
- [Kubernetes for Developers (LF)](https://training.linuxfoundation.org/training/kubernetes-for-developers/)
- [Certified Kubernetes Administrator (CKA)](https://www.cncf.io/certification/cka/)

### Next Technologies
- Helm (package manager)
- ArgoCD (GitOps)
- Istio/Linkerd (service mesh)
- Prometheus/Grafana (monitoring)
- Terraform (cloud infrastructure)

---

## 🙏 Summary

You've learned:
1. ✅ How to deploy to Minikube
2. ✅ Infrastructure as Code principles
3. ✅ Kustomize for multi-environment management
4. ✅ Persistent storage for databases
5. ✅ Troubleshooting and debugging
6. ✅ Production-ready practices

**You're now ready for production Kubernetes! 🚀**

Start here: `QUICK_START_MINIKUBE.md`
