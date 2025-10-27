# Quick Start: PostgreSQL Persistent Storage

## The Fix (TL;DR)

**Before:**
```yaml
volumes:
- name: postgres-storage
  emptyDir: {}  # ❌ Data lost on restart
```

**After:**
```yaml
volumes:
- name: postgres-storage
  persistentVolumeClaim:
    claimName: postgres-pvc  # ✅ Data persists
```

---

## What Changed

### Files Modified

1. **`k8s/postgres/deployment.yaml`**
   - Changed volume from `emptyDir` to `persistentVolumeClaim`
   - Added `PGDATA` environment variable
   - Added resource limits

2. **Files Created**
   - `k8s/postgres/pvc.yaml` - Generic PVC (10Gi)
   - `k8s/postgres/pvc-dev.yaml` - Dev PVC (5Gi)
   - `k8s/postgres/pvc-staging.yaml` - Staging PVC (20Gi)
   - `k8s/postgres/pvc-prod.yaml` - Production PVC (100Gi)

3. **Kustomize Overlays Updated**
   - `k8s/overlays/dev/kustomization.yaml` - References `pvc-dev.yaml`
   - `k8s/overlays/staging/kustomization.yaml` - References `pvc-staging.yaml`
   - `k8s/overlays/prod/kustomization.yaml` - References `pvc-prod.yaml`

---

## Deploy with Persistent Storage

### Option 1: Using Deployment Scripts (Easiest)

```bash
# Windows PowerShell
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages

# Linux/Mac
./scripts/deploy-k8s.sh dev --build-images
```

The PVC is automatically created! ✅

### Option 2: Using Kustomize

```bash
# Deploy everything (includes PVC)
kubectl apply -k k8s/overlays/dev

# Verify PVC was created and bound
kubectl get pvc -n profiller-dev
```

### Option 3: Manual Deployment

```bash
# 1. Create PVC first
kubectl apply -f k8s/postgres/pvc-dev.yaml

# 2. Wait for it to be bound
kubectl get pvc -n profiller-dev -w

# 3. Deploy PostgreSQL
kubectl apply -f k8s/postgres/deployment.yaml
kubectl apply -f k8s/postgres/service.yaml
```

---

## Test Data Persistence

### Automated Test (Recommended)

```bash
# Windows PowerShell
.\scripts\test-persistence.ps1 -Namespace profiller-dev

# Linux/Mac
chmod +x scripts/test-persistence.sh
./scripts/test-persistence.sh profiller-dev
```

This script:
1. ✅ Checks PVC is bound
2. ✅ Creates test data
3. ✅ Deletes the pod (simulates failure)
4. ✅ Waits for new pod
5. ✅ Verifies data still exists

### Manual Test

```bash
# 1. Get pod name
kubectl get pods -n profiller-dev -l app=postgres

# 2. Create test data
kubectl exec -n profiller-dev <postgres-pod> -- \
  psql -U postgres -d profiller_dev -c \
  "CREATE TABLE test (id INT); INSERT INTO test VALUES (1);"

# 3. Delete pod
kubectl delete pod <postgres-pod> -n profiller-dev

# 4. Wait for new pod
kubectl get pods -n profiller-dev -w

# 5. Check data exists
kubectl exec -n profiller-dev <new-postgres-pod> -- \
  psql -U postgres -d profiller_dev -c "SELECT * FROM test;"

# Should return: id = 1 ✅
```

---

## Verify Setup

### Check PVC Status

```bash
# List PVCs
kubectl get pvc -n profiller-dev

# Expected output:
# NAME           STATUS   VOLUME          CAPACITY   ACCESS MODES
# postgres-pvc   Bound    pvc-xxx-xxx     5Gi        RWO

# Detailed info
kubectl describe pvc postgres-pvc -n profiller-dev
```

**PVC Status Meanings:**
- `Bound` ✅ - Successfully attached, ready to use
- `Pending` ⚠️ - Waiting for storage to be provisioned
- `Lost` ❌ - Underlying volume was deleted

### Check Pod is Using PVC

```bash
# Get pod details
kubectl get pod -n profiller-dev -l app=postgres -o yaml | grep -A5 volumes

# Should show:
# volumes:
# - name: postgres-storage
#   persistentVolumeClaim:
#     claimName: postgres-pvc
```

### Check Storage Usage

```bash
# Get pod name
POSTGRES_POD=$(kubectl get pods -n profiller-dev -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Check disk usage
kubectl exec -n profiller-dev $POSTGRES_POD -- df -h /var/lib/postgresql/data

# Check PostgreSQL data size
kubectl exec -n profiller-dev $POSTGRES_POD -- du -sh /var/lib/postgresql/data/pgdata
```

---

## Storage by Environment

| Environment | Namespace | PVC Size | File |
|-------------|-----------|----------|------|
| **Dev** | profiller-dev | 5Gi | `k8s/postgres/pvc-dev.yaml` |
| **Staging** | profiller-staging | 20Gi | `k8s/postgres/pvc-staging.yaml` |
| **Production** | profiller | 100Gi | `k8s/postgres/pvc-prod.yaml` |

---

## Common Issues

### PVC Stuck in "Pending"

```bash
# Check storage classes available
kubectl get storageclass

# For Minikube, ensure it's started
minikube status

# Check events
kubectl describe pvc postgres-pvc -n profiller-dev
```

### Pod Won't Start

```bash
# Check pod events
kubectl describe pod <postgres-pod> -n profiller-dev

# Check logs
kubectl logs <postgres-pod> -n profiller-dev

# Common issue: PGDATA not set
# Solution: Already fixed in deployment.yaml
```

### Data Not Persisting

```bash
# Verify deployment uses PVC (not emptyDir)
kubectl get deployment postgres -n profiller-dev -o yaml | grep -A5 volumes

# Should see persistentVolumeClaim, NOT emptyDir
```

---

## Backup & Restore

### Create Backup

```bash
# Get pod name
POSTGRES_POD=$(kubectl get pods -n profiller-dev -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Create backup
kubectl exec $POSTGRES_POD -n profiller-dev -- \
  pg_dump -U postgres profiller_dev > backup.sql

# Or with timestamp
kubectl exec $POSTGRES_POD -n profiller-dev -- \
  pg_dump -U postgres profiller_dev > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Backup

```bash
# Get pod name
POSTGRES_POD=$(kubectl get pods -n profiller-dev -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Restore
kubectl exec -i $POSTGRES_POD -n profiller-dev -- \
  psql -U postgres profiller_dev < backup.sql
```

---

## Clean Up

### Delete Everything (including data)

```bash
# Delete all resources
kubectl delete -k k8s/overlays/dev

# Or manually
kubectl delete deployment postgres -n profiller-dev
kubectl delete service postgres-service -n profiller-dev
kubectl delete pvc postgres-pvc -n profiller-dev  # ⚠️ This deletes data!
```

### Keep Data, Delete Pod

```bash
# Only delete deployment (keeps PVC and data)
kubectl delete deployment postgres -n profiller-dev

# Redeploy later - data will still be there
kubectl apply -f k8s/postgres/deployment.yaml
```

---

## Next Steps

1. ✅ Deploy with persistent storage
2. ✅ Run test script to verify
3. ✅ Set up automated backups (see `PERSISTENT_STORAGE_GUIDE.md`)
4. ✅ Monitor storage usage
5. ✅ Plan for production storage class

---

## Quick Commands

```bash
# Deploy
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages

# Test persistence
.\scripts\test-persistence.ps1

# Check PVC
kubectl get pvc -n profiller-dev

# Check storage usage
kubectl exec -n profiller-dev <pod> -- df -h /var/lib/postgresql/data

# Backup
kubectl exec <pod> -n profiller-dev -- pg_dump -U postgres profiller_dev > backup.sql

# Restore
kubectl exec -i <pod> -n profiller-dev -- psql -U postgres profiller_dev < backup.sql
```

---

## Documentation

For detailed information, see:
- **`PERSISTENT_STORAGE_GUIDE.md`** - Complete guide with troubleshooting
- **`K8S_PARAMETERIZATION_GUIDE.md`** - ConfigMap parameterization
- **`scripts/test-persistence.ps1`** - Automated test script

---

## Summary

✅ **Fixed**: PostgreSQL now uses PersistentVolume
✅ **Result**: Data survives pod restarts, deployments, and failures
✅ **Ready**: Production-ready storage configuration
✅ **Tested**: Automated test script included

Deploy now:
```bash
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages
.\scripts\test-persistence.ps1
```

Your data is safe! 🎉
