# Kubernetes ConfigMap Parameterization Guide

## Overview

This guide explains how we've solved the hardcoded values problem in our Kubernetes ConfigMaps. We now have a flexible, maintainable system that works across multiple environments (dev, staging, production).

---

## What We Built

### New Directory Structure

```
k8s/
├── base/                          # Base configuration (shared across all environments)
│   ├── kustomization.yaml         # Base Kustomize config
│   ├── configmap.yaml             # Common config values
│   └── postgres-pvc.yaml          # Persistent volume claim
│
├── overlays/                      # Environment-specific overrides
│   ├── dev/
│   │   └── kustomization.yaml     # Development environment
│   ├── staging/
│   │   └── kustomization.yaml     # Staging environment
│   └── prod/
│       └── kustomization.yaml     # Production environment
│
├── configmap-dev.yaml             # Alternative: standalone dev config
├── configmap-staging.yaml         # Alternative: standalone staging config
├── configmap-prod.yaml            # Alternative: standalone prod config
│
└── [existing files...]            # Your original deployment files
```

---

## Approach 1: Simple Environment-Specific Files (Beginner)

### How It Works

We created three separate ConfigMap files, one for each environment:
- `configmap-dev.yaml` - Development settings
- `configmap-staging.yaml` - Staging settings
- `configmap-prod.yaml` - Production settings

### Usage

```bash
# Deploy to development
kubectl apply -f k8s/configmap-dev.yaml
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
# ... etc

# Deploy to staging
kubectl apply -f k8s/configmap-staging.yaml
# ... rest of resources

# Deploy to production
kubectl apply -f k8s/configmap-prod.yaml
# ... rest of resources
```

### Pros & Cons

✅ **Pros:**
- Simple to understand
- No additional tools needed
- Easy to see all values for each environment

❌ **Cons:**
- Lots of duplication
- Easy to forget updating all files
- Hard to maintain consistency
- No automated validation

### When to Use

- Learning Kubernetes
- Very small projects (1-2 environments)
- Quick prototypes

---

## Approach 2: Kustomize Overlays (RECOMMENDED)

### How It Works

**Base Layer** (`k8s/base/`):
- Contains common configuration shared across ALL environments
- Has values that never change (ports, service names, etc.)

**Overlay Layer** (`k8s/overlays/{env}/`):
- Contains environment-specific values
- **Merges** with base configuration
- Can **patch** deployments (change replicas, resources, etc.)

### File Breakdown

#### `k8s/base/configmap.yaml`
Contains values that are the same everywhere:
```yaml
data:
  PORT_FRONTEND: "3000"           # Always 3000
  PORT_BACKEND: "3001"            # Always 3001
  HOSTNAME: "0.0.0.0"             # Always listen on all interfaces
  API_URL: "http://backend-service:3001"  # K8s internal DNS
```

#### `k8s/overlays/dev/kustomization.yaml`
Adds/overrides for development:
```yaml
configMapGenerator:
  - name: app-config
    behavior: merge              # Merge with base
    literals:
      - NODE_ENV=development     # Override: dev environment
      - LOG_LEVEL=debug          # Override: verbose logging
      - POSTGRES_DB=profiller_dev  # Override: separate dev DB
      - CORS_ORIGIN=http://localhost:3000  # Override: local CORS
```

### Usage with Kustomize

```bash
# Preview what will be deployed (dry run)
kubectl kustomize k8s/overlays/dev

# Deploy to development
kubectl apply -k k8s/overlays/dev

# Deploy to staging
kubectl apply -k k8s/overlays/staging

# Deploy to production
kubectl apply -k k8s/overlays/prod
```

### Or Use Our Deployment Scripts

**Windows (PowerShell):**
```powershell
# Deploy with images already built
.\scripts\deploy-k8s.ps1 -Environment dev

# Build images and deploy
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages

# Preview without deploying
.\scripts\deploy-k8s.ps1 -Environment staging -DryRun
```

**Linux/Mac (Bash):**
```bash
# Make script executable first
chmod +x scripts/deploy-k8s.sh

# Deploy
./scripts/deploy-k8s.sh dev

# Build images and deploy
./scripts/deploy-k8s.sh staging --build-images

# Preview without deploying
./scripts/deploy-k8s.sh prod --dry-run
```

### What Gets Deployed Where

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| **Namespace** | profiller-dev | profiller-staging | profiller |
| **Backend replicas** | 1 | 2 | 3 |
| **Frontend replicas** | 1 | 2 | 3 |
| **MCP replicas** | 1 | 1 | 2 |
| **Memory (backend)** | 512Mi | 1Gi | 2Gi |
| **CPU (backend)** | 500m | 1000m | 2000m |
| **Log level** | debug | info | warn |
| **Database name** | profiller_dev | profiller_staging | profiller_prod |
| **Storage** | emptyDir | emptyDir | PersistentVolume |

### Pros & Cons

✅ **Pros:**
- No duplication - base values defined once
- Easy to see what's different per environment
- Built into kubectl (no extra tools)
- Industry standard
- Validation before deploy
- Can patch any resource (not just ConfigMaps)

❌ **Cons:**
- Slightly more complex than approach 1
- Need to learn Kustomize concepts

### When to Use

- **Any serious project** (this is the standard)
- Multiple environments
- Team collaboration
- Production deployments

---

## Step-by-Step: Deploying with Kustomize

### For Minikube (Local Testing)

**1. Start Minikube:**
```bash
minikube start --cpus=4 --memory=7939
```

**2. Configure Docker to use Minikube:**
```powershell
# Windows PowerShell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

**3. Build images:**
```bash
docker build -f Dockerfile.express.production -t profiller-backend:latest .
docker build -f Dockerfile.next.production -t profiller-frontend:latest .
docker build -f Dockerfile.mcp.production -t profiller-mcp-server:latest .
```

**4. Deploy using script:**
```powershell
# Windows
.\scripts\deploy-k8s.ps1 -Environment dev

# Or manually
kubectl apply -k k8s/overlays/dev
```

**5. Wait for pods:**
```bash
kubectl get pods -n profiller-dev -w
```

**6. Access application:**
```bash
# Option 1: Port forward
kubectl port-forward -n profiller-dev service/frontend-service 3000:3000

# Option 2: Minikube tunnel
minikube service frontend-service -n profiller-dev
```

**7. Run migrations:**
```bash
# Get backend pod name
kubectl get pods -n profiller-dev -l app=backend

# Run migration
kubectl exec -n profiller-dev <backend-pod-name> -- npm run db:migrate

# Or seed database
kubectl exec -n profiller-dev <backend-pod-name> -- npm run db:seed
```

---

## Understanding Kustomize Concepts

### 1. Base

The **base** is your foundation. It has:
- All common Kubernetes resources
- Values that never change between environments
- The "default" configuration

Think: "What's true for ALL environments?"

### 2. Overlays

**Overlays** customize the base. They can:
- Add new values (ConfigMap literals)
- Override base values (merge)
- Patch resources (change replicas, add volumes, etc.)
- Add new resources (ingress, HPA, etc.)

Think: "What's special about THIS environment?"

### 3. Patches

Patches modify existing resources. Types:
- **Strategic Merge**: Merge new values (default)
- **JSON Patch**: Precise surgical changes
- **Replace**: Complete replacement

Example patch:
```yaml
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: backend
      spec:
        replicas: 3          # Override replicas to 3
```

### 4. ConfigMapGenerator

Special Kustomize feature:
```yaml
configMapGenerator:
  - name: app-config
    behavior: merge        # merge = combine with base
    literals:
      - KEY=value          # Add or override
```

Kustomize auto-generates a unique name (e.g., `app-config-abc123def`) and updates all references. This triggers pod restarts when config changes.

---

## Customizing for Your Needs

### Add a New Environment Variable

**Option 1: Same value everywhere**
Add to `k8s/base/configmap.yaml`:
```yaml
data:
  NEW_FEATURE_FLAG: "true"
```

**Option 2: Different per environment**
Add to each overlay's `kustomization.yaml`:
```yaml
configMapGenerator:
  - name: app-config
    behavior: merge
    literals:
      - NEW_FEATURE_FLAG=true  # dev
      - NEW_FEATURE_FLAG=false # staging
      - NEW_FEATURE_FLAG=true  # prod
```

### Change Resource Allocations

Edit overlay's patches:
```yaml
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: backend
      spec:
        template:
          spec:
            containers:
            - name: backend
              resources:
                requests:
                  memory: "1Gi"    # Change this
                  cpu: "1000m"     # And this
```

### Add a New Service

1. Create in base: `k8s/base/new-service/`
2. Reference in `k8s/base/kustomization.yaml`:
   ```yaml
   resources:
     - new-service/deployment.yaml
     - new-service/service.yaml
   ```
3. Customize per environment in overlays

---

## Troubleshooting

### Error: "no matches for kind X"

**Problem**: Resource type not available in your cluster
**Solution**: Check Kubernetes version or install CRDs

### Error: "immutable field"

**Problem**: Trying to change an immutable field
**Solution**: Delete and recreate the resource

### ConfigMap changes not reflected

**Problem**: Pods don't auto-restart on ConfigMap change
**Solution**:
```bash
kubectl rollout restart deployment/backend -n profiller-dev
```

Or use Kustomize's ConfigMapGenerator (auto-generates new name, forces restart)

### Want to see final YAML before applying

```bash
kubectl kustomize k8s/overlays/dev > preview.yaml
cat preview.yaml
```

---

## Best Practices

### 1. Keep Secrets Separate
- Never put secrets in ConfigMaps
- Use `k8s/secrets.yaml` (Base64 encoded)
- Better: Use external secret managers (Sealed Secrets, External Secrets Operator)

### 2. Use Descriptive Overlay Names
```
overlays/
├── dev-minikube/       # Local development
├── dev-cloud/          # Cloud-based dev environment
├── staging/            # Pre-production
├── prod-us-east/       # Production US East
└── prod-eu-west/       # Production EU West
```

### 3. Document Environment Differences
Create a comparison table (like the one above) so team knows what changes where

### 4. Version Control Everything
```bash
git add k8s/
git commit -m "feat: add Kustomize overlays for multi-env support"
```

### 5. Test Before Production
```bash
# Always test in dev first
kubectl apply -k k8s/overlays/dev

# Then staging
kubectl apply -k k8s/overlays/staging

# Finally production
kubectl apply -k k8s/overlays/prod
```

### 6. Use Scripts for Consistency
Always use `deploy-k8s.ps1` or `deploy-k8s.sh` instead of manual kubectl commands

---

## Next Steps

### Immediate (Learning)
1. ✅ Understand Kustomize basics
2. ✅ Deploy to Minikube with dev overlay
3. ✅ Modify a value and redeploy
4. ✅ Check it worked

### Short Term (Improvements)
1. Add resource limits to all deployments ✅ (already in overlays)
2. Implement PersistentVolume for prod ✅ (already in prod overlay)
3. Add ingress for external access
4. Set up monitoring (Prometheus)

### Medium Term (Automation)
1. Create CI/CD pipeline (GitHub Actions)
2. Automated testing before deploy
3. Automatic promotion (dev → staging → prod)
4. Slack/email notifications

### Long Term (Advanced)
1. Helm charts (even more flexible)
2. ArgoCD (GitOps)
3. Multi-cluster deployments
4. Disaster recovery procedures

---

## Learning Resources

### Official Docs
- [Kustomize Tutorial](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)
- [Kubernetes ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)

### Interactive Learning
- [Kustomize Labs](https://www.katacoda.com/courses/kubernetes)

### Videos
- "Kustomize: Deploy Your App with Template Free YAML" (YouTube)
- "Kubernetes ConfigMaps and Secrets Explained" (YouTube)

---

## Quick Reference

```bash
# Preview what will be deployed
kubectl kustomize k8s/overlays/dev

# Deploy to environment
kubectl apply -k k8s/overlays/dev

# Get all resources in namespace
kubectl get all -n profiller-dev

# View generated ConfigMap
kubectl get configmap -n profiller-dev
kubectl describe configmap app-config -n profiller-dev

# Update ConfigMap and restart pods
kubectl apply -k k8s/overlays/dev
kubectl rollout restart deployment -n profiller-dev

# Compare environments
diff <(kubectl kustomize k8s/overlays/dev) <(kubectl kustomize k8s/overlays/prod)

# Delete environment
kubectl delete -k k8s/overlays/dev
```

---

## Summary

You now have **two approaches** to parameterized ConfigMaps:

1. **Simple files** (`configmap-{env}.yaml`) - Good for learning
2. **Kustomize overlays** (`k8s/overlays/{env}/`) - Industry standard ✅

**Recommended**: Use **Kustomize** (Approach 2) for all real projects.

The deployment scripts make it easy:
```powershell
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages
```

This solves:
- ✅ No more hardcoded values
- ✅ Easy to manage multiple environments
- ✅ Consistent deployments
- ✅ Infrastructure as Code
- ✅ Production-ready

Happy deploying! 🚀
