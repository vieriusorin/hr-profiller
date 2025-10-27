# PostgreSQL Persistent Storage Guide

## The Problem

**Before**: PostgreSQL was using `emptyDir` for storage
```yaml
volumes:
- name: postgres-storage
  emptyDir: {}  # ❌ Data lost on pod restart!
```

**Consequences:**
- ❌ Pod restart = data loss
- ❌ Node failure = data loss
- ❌ Deployment update = data loss
- ❌ Cannot scale or migrate
- ❌ No backups possible

---

## The Solution

**After**: PostgreSQL uses PersistentVolumeClaim (PVC)
```yaml
volumes:
- name: postgres-storage
  persistentVolumeClaim:
    claimName: postgres-pvc  # ✅ Data persists!
```

**Benefits:**
- ✅ Data survives pod restarts
- ✅ Data survives node failures
- ✅ Can scale and migrate
- ✅ Backups and snapshots possible
- ✅ Production-ready

---

## Understanding Kubernetes Storage

### Storage Hierarchy

```
┌─────────────────────────────────────────────────┐
│ Pod                                              │
│  └─ Container                                    │
│      └─ volumeMount: /var/lib/postgresql/data   │ ← Your app sees this
└──────────────────┬──────────────────────────────┘
                   │ references
┌──────────────────▼──────────────────────────────┐
│ PersistentVolumeClaim (PVC)                      │ ← Request for storage
│  - Size: 10Gi                                    │    (what you want)
│  - AccessMode: ReadWriteOnce                     │
└──────────────────┬──────────────────────────────┘
                   │ binds to
┌──────────────────▼──────────────────────────────┐
│ PersistentVolume (PV)                            │ ← Actual storage
│  - Provisioned automatically or manually         │    (what you get)
└──────────────────┬──────────────────────────────┘
                   │ backed by
┌──────────────────▼──────────────────────────────┐
│ Physical Storage                                 │
│  - Minikube: hostPath (local disk)               │
│  - AWS: EBS                                      │
│  - GCP: Persistent Disk                          │
│  - Azure: Azure Disk                             │
└─────────────────────────────────────────────────┘
```

### Key Concepts

#### 1. PersistentVolume (PV)
- Actual storage resource in the cluster
- Provisioned by admin or automatically (dynamic provisioning)
- Independent of pod lifecycle
- Can be reused

#### 2. PersistentVolumeClaim (PVC)
- Request for storage by a user/pod
- Specifies size, access mode, storage class
- Kubernetes binds PVC to available PV

#### 3. StorageClass
- Defines "classes" of storage (fast SSD, slow HDD, etc.)
- Enables dynamic provisioning
- Each cloud provider has different storage classes

#### 4. Access Modes
- **ReadWriteOnce (RWO)**: One node can mount read-write ← PostgreSQL uses this
- **ReadOnlyMany (ROX)**: Many nodes can mount read-only
- **ReadWriteMany (RWX)**: Many nodes can mount read-write

---

## What We Built

### Environment-Specific PVCs

| Environment | Namespace | Size | StorageClass |
|-------------|-----------|------|--------------|
| **Dev** | profiller-dev | 5Gi | standard (minikube) |
| **Staging** | profiller-staging | 20Gi | standard (adjustable) |
| **Production** | profiller | 100Gi | premium (recommended) |

### Files Created

```
k8s/postgres/
├── deployment.yaml     # ✅ Updated to use PVC
├── service.yaml        # Unchanged
├── pvc.yaml           # Generic PVC (10Gi)
├── pvc-dev.yaml       # Dev PVC (5Gi)
├── pvc-staging.yaml   # Staging PVC (20Gi)
└── pvc-prod.yaml      # Production PVC (100Gi)
```

---

## Implementation Details

### 1. PersistentVolumeClaim (pvc-dev.yaml)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: profiller-dev
spec:
  accessModes:
    - ReadWriteOnce          # Only one pod can mount
  resources:
    requests:
      storage: 5Gi           # Request 5GB
  # storageClassName: standard  # Optional: specify class
```

### 2. Updated Deployment

**Key Changes:**

1. **Volume changed from emptyDir to PVC:**
```yaml
volumes:
- name: postgres-storage
  persistentVolumeClaim:
    claimName: postgres-pvc  # References the PVC
```

2. **Added PGDATA environment variable:**
```yaml
- name: PGDATA
  value: /var/lib/postgresql/data/pgdata  # Subdirectory for PostgreSQL
```

**Why PGDATA?** PostgreSQL creates a `lost+found` directory in mounted volumes, which conflicts with database initialization. Setting PGDATA to a subdirectory solves this.

3. **Added resource limits:**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### 3. Updated Kustomize Overlays

Each environment now includes its PVC:

**dev/kustomization.yaml:**
```yaml
resources:
  - ../../postgres/pvc-dev.yaml
```

**staging/kustomization.yaml:**
```yaml
resources:
  - ../../postgres/pvc-staging.yaml
```

**prod/kustomization.yaml:**
```yaml
resources:
  - ../../postgres/pvc-prod.yaml
```

---

## Deployment Guide

### Fresh Deployment (No Existing Data)

#### Option 1: Using Deployment Scripts

```bash
# Windows PowerShell
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages

# Linux/Mac
./scripts/deploy-k8s.sh dev --build-images
```

The PVC is automatically created and bound!

#### Option 2: Manual Deployment

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets
kubectl apply -f k8s/secrets.yaml

# 3. Create PVC (MUST do this before deployment)
kubectl apply -f k8s/postgres/pvc-dev.yaml

# 4. Wait for PVC to be bound
kubectl get pvc -n profiller-dev -w

# 5. Deploy PostgreSQL
kubectl apply -f k8s/postgres/deployment.yaml
kubectl apply -f k8s/postgres/service.yaml

# 6. Deploy rest of stack
kubectl apply -f k8s/configmap-dev.yaml
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/mcp-server/
```

#### Option 3: Using Kustomize

```bash
# Deploy everything at once
kubectl apply -k k8s/overlays/dev

# Verify PVC is bound
kubectl get pvc -n profiller-dev
```

### Verify PVC Status

```bash
# Check PVC
kubectl get pvc -n profiller-dev

# Should show:
# NAME           STATUS   VOLUME          CAPACITY   ACCESS MODES
# postgres-pvc   Bound    pvc-xxxx-xxxx   5Gi        RWO
```

**PVC States:**
- **Pending**: Waiting for PV to be created/available
- **Bound**: Successfully attached to a PV ✅
- **Lost**: PV deleted but PVC still references it

### Initialize Database

```bash
# Get backend pod name
kubectl get pods -n profiller-dev -l app=backend

# Run migrations
kubectl exec -n profiller-dev <backend-pod-name> -- npm run db:migrate

# Seed data
kubectl exec -n profiller-dev <backend-pod-name> -- npm run db:seed
```

---

## Migration from emptyDir (Existing Data)

If you already have data in an emptyDir deployment:

### Method 1: Backup & Restore (Recommended)

```bash
# 1. Backup existing data
kubectl exec -n profiller-dev <old-postgres-pod> -- \
  pg_dump -U postgres profiller_dev > backup.sql

# 2. Delete old deployment
kubectl delete deployment postgres -n profiller-dev

# 3. Create PVC
kubectl apply -f k8s/postgres/pvc-dev.yaml

# 4. Deploy new PostgreSQL with PVC
kubectl apply -f k8s/postgres/deployment.yaml

# 5. Wait for pod to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n profiller-dev --timeout=120s

# 6. Restore data
kubectl exec -n profiller-dev <new-postgres-pod> -i -- \
  psql -U postgres profiller_dev < backup.sql

# 7. Verify data
kubectl exec -n profiller-dev <new-postgres-pod> -- \
  psql -U postgres profiller_dev -c "\dt"
```

### Method 2: Copy Data Directly

```bash
# 1. Scale down backend (stop writes)
kubectl scale deployment backend -n profiller-dev --replicas=0

# 2. Copy data from old pod
kubectl exec <old-postgres-pod> -n profiller-dev -- tar czf /tmp/pgdata.tar.gz -C /var/lib/postgresql/data .
kubectl cp profiller-dev/<old-postgres-pod>:/tmp/pgdata.tar.gz ./pgdata.tar.gz

# 3. Create PVC and new deployment
kubectl apply -f k8s/postgres/pvc-dev.yaml
kubectl apply -f k8s/postgres/deployment.yaml

# 4. Wait for new pod
kubectl wait --for=condition=ready pod -l app=postgres -n profiller-dev --timeout=120s

# 5. Copy data to new pod
kubectl cp ./pgdata.tar.gz profiller-dev/<new-postgres-pod>:/tmp/pgdata.tar.gz
kubectl exec <new-postgres-pod> -n profiller-dev -- tar xzf /tmp/pgdata.tar.gz -C /var/lib/postgresql/data/pgdata

# 6. Restart postgres
kubectl rollout restart deployment postgres -n profiller-dev

# 7. Scale backend back up
kubectl scale deployment backend -n profiller-dev --replicas=1
```

---

## Testing Data Persistence

### Test 1: Survive Pod Deletion

```bash
# 1. Create some test data
kubectl exec -n profiller-dev <backend-pod> -- npm run db:seed

# 2. Verify data exists
kubectl exec -n profiller-dev <postgres-pod> -- \
  psql -U postgres profiller_dev -c "SELECT COUNT(*) FROM employees;"

# 3. Delete the pod
kubectl delete pod <postgres-pod> -n profiller-dev

# 4. Wait for new pod to start
kubectl get pods -n profiller-dev -w

# 5. Check data still exists
kubectl exec -n profiller-dev <new-postgres-pod> -- \
  psql -U postgres profiller_dev -c "SELECT COUNT(*) FROM employees;"

# ✅ Data should be intact!
```

### Test 2: Survive Deployment Update

```bash
# 1. Check current data
kubectl exec -n profiller-dev <postgres-pod> -- \
  psql -U postgres profiller_dev -c "\dt"

# 2. Update deployment (change replica count or image)
kubectl scale deployment postgres -n profiller-dev --replicas=0
kubectl scale deployment postgres -n profiller-dev --replicas=1

# 3. Verify data persists
kubectl exec -n profiller-dev <new-postgres-pod> -- \
  psql -U postgres profiller_dev -c "\dt"

# ✅ Data should be intact!
```

### Test 3: Check PVC Storage

```bash
# See PVC details
kubectl describe pvc postgres-pvc -n profiller-dev

# Check actual disk usage inside pod
kubectl exec -n profiller-dev <postgres-pod> -- df -h /var/lib/postgresql/data

# Check PostgreSQL data directory
kubectl exec -n profiller-dev <postgres-pod> -- du -sh /var/lib/postgresql/data/pgdata
```

---

## Storage Classes by Platform

### Minikube (Local Development)

```bash
# List available storage classes
kubectl get storageclass

# Minikube provides:
# - standard (default) - Uses hostPath
```

No configuration needed! PVC automatically uses `standard`.

### AWS (Amazon EKS)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3  # or gp2, io1, io2
  resources:
    requests:
      storage: 100Gi
```

**AWS Storage Classes:**
- `gp2`: General Purpose SSD (older)
- `gp3`: General Purpose SSD (newer, recommended) ← Use this
- `io1`: Provisioned IOPS SSD (high performance)
- `io2`: Provisioned IOPS SSD (higher performance)

### GCP (Google Kubernetes Engine)

```yaml
storageClassName: pd-ssd  # or pd-standard
```

**GCP Storage Classes:**
- `pd-standard`: Standard persistent disk (HDD)
- `pd-ssd`: SSD persistent disk ← Use for production
- `pd-balanced`: Balanced persistent disk

### Azure (Azure Kubernetes Service)

```yaml
storageClassName: managed-premium  # or default, managed-csi
```

**Azure Storage Classes:**
- `default`: Standard HDD
- `managed-premium`: Premium SSD ← Use for production
- `managed-csi`: Managed CSI driver

---

## Backup Strategies

### Manual Backup

```bash
# Create backup
kubectl exec -n profiller-dev <postgres-pod> -- \
  pg_dump -U postgres profiller_dev > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
kubectl exec -n profiller-dev <postgres-pod> -i -- \
  psql -U postgres profiller_dev < backup-20250101-120000.sql
```

### Automated Backup with CronJob

Create `k8s/postgres/backup-cronjob.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: profiller-dev
spec:
  schedule: "0 2 * * *"  # 2 AM every day
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgres-service -U postgres profiller_dev | \
              gzip > /backups/backup-$(date +\%Y\%m\%d-\%H\%M\%S).sql.gz
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_PASSWORD
            volumeMounts:
            - name: backup-storage
              mountPath: /backups
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc  # Separate PVC for backups
          restartPolicy: OnFailure
```

### Volume Snapshots (Cloud)

Most cloud providers support volume snapshots:

```bash
# AWS: Create EBS snapshot
aws ec2 create-snapshot --volume-id <volume-id>

# GCP: Create persistent disk snapshot
gcloud compute disks snapshot <disk-name>

# Azure: Create managed disk snapshot
az snapshot create --resource-group <rg> --name <snapshot-name> --source <disk-id>
```

Or use Kubernetes VolumeSnapshot (requires CSI driver):

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: postgres-snapshot
spec:
  volumeSnapshotClassName: csi-snapclass
  source:
    persistentVolumeClaimName: postgres-pvc
```

---

## Troubleshooting

### PVC Stuck in "Pending"

**Symptoms:**
```bash
kubectl get pvc -n profiller-dev
# NAME           STATUS    VOLUME   CAPACITY
# postgres-pvc   Pending
```

**Causes & Solutions:**

1. **No StorageClass available**
   ```bash
   # Check storage classes
   kubectl get storageclass

   # If none, create one (Minikube)
   # Already provided by Minikube automatically
   ```

2. **Insufficient storage**
   ```bash
   # Reduce requested size in PVC
   storage: 1Gi  # Instead of 100Gi
   ```

3. **Access mode not supported**
   ```bash
   # Some storage classes don't support ReadWriteOnce
   # Check storage class capabilities
   kubectl describe storageclass standard
   ```

### Pod Stuck in "ContainerCreating"

**Symptoms:**
```bash
kubectl get pods -n profiller-dev
# NAME                READY   STATUS              RESTARTS
# postgres-xxx        0/1     ContainerCreating
```

**Check events:**
```bash
kubectl describe pod <postgres-pod> -n profiller-dev

# Common errors:
# - "Volume not attached": PVC not bound
# - "Mount failed": Permission issues
```

**Solution:**
```bash
# 1. Check PVC is bound
kubectl get pvc -n profiller-dev

# 2. Check PV exists
kubectl get pv

# 3. Delete and recreate pod
kubectl delete pod <postgres-pod> -n profiller-dev
```

### PostgreSQL Won't Start

**Check logs:**
```bash
kubectl logs -n profiller-dev <postgres-pod>

# Common errors:
# - "initdb: directory exists but is not empty"
#   → PGDATA not set correctly
# - "permission denied"
#   → Volume mount permissions issue
```

**Solution for PGDATA issue:**
```yaml
# Ensure PGDATA is set to subdirectory
env:
- name: PGDATA
  value: /var/lib/postgresql/data/pgdata
```

### Data Not Persisting

**Verify volume is correctly mounted:**
```bash
# Check mount inside pod
kubectl exec -n profiller-dev <postgres-pod> -- mount | grep postgresql

# Check if using PVC (not emptyDir)
kubectl get pod <postgres-pod> -n profiller-dev -o yaml | grep -A5 volumes

# Should see:
#   persistentVolumeClaim:
#     claimName: postgres-pvc
```

### Cannot Delete PVC

**Symptoms:**
```bash
kubectl delete pvc postgres-pvc -n profiller-dev
# (hangs forever)
```

**Cause:** PVC is still in use by a pod

**Solution:**
```bash
# 1. Delete pods using the PVC first
kubectl delete deployment postgres -n profiller-dev

# 2. Then delete PVC
kubectl delete pvc postgres-pvc -n profiller-dev

# 3. Force delete if stuck (WARNING: may cause data loss)
kubectl patch pvc postgres-pvc -n profiller-dev -p '{"metadata":{"finalizers":null}}'
```

---

## Best Practices

### 1. Size PVCs Appropriately

| Environment | Recommended Size | Reasoning |
|-------------|------------------|-----------|
| Dev (local) | 5-10Gi | Small dataset, frequent resets |
| Staging | 20-50Gi | Similar to prod, but smaller |
| Production | 100Gi+ | Plan for growth, add 50% buffer |

### 2. Use Separate PVCs Per Environment

Don't share PVCs across environments:
```
✅ Good:
- profiller-dev → postgres-pvc (profiller-dev namespace)
- profiller-staging → postgres-pvc (profiller-staging namespace)
- profiller → postgres-pvc (profiller namespace)

❌ Bad:
- All environments sharing one PVC
```

### 3. Enable Backups

- Manual backups before major changes
- Automated daily backups for production
- Test restore procedures regularly

### 4. Monitor Storage Usage

```bash
# Check usage
kubectl exec -n profiller <postgres-pod> -- df -h /var/lib/postgresql/data

# Set up alerts when storage > 80% full
```

### 5. Use Storage Classes Wisely

- Dev: Cheapest option (standard)
- Staging: Mid-tier (pd-balanced, gp3)
- Production: High-performance (pd-ssd, gp3, managed-premium)

### 6. Plan for Growth

Request more storage than currently needed:
- Current data: 10GB
- Request: 25GB (2.5x)
- Maximum: 50GB (5x)

### 7. Document Recovery Procedures

Create runbooks for:
- Backup and restore
- Disaster recovery
- Data migration
- Scaling storage

---

## Quick Reference

```bash
# Check PVC status
kubectl get pvc -n <namespace>

# Describe PVC (see events, binding)
kubectl describe pvc postgres-pvc -n <namespace>

# Check PV
kubectl get pv

# Check storage classes
kubectl get storageclass

# Resize PVC (if supported by storage class)
kubectl patch pvc postgres-pvc -n <namespace> -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# Delete PVC (after deleting pods)
kubectl delete deployment postgres -n <namespace>
kubectl delete pvc postgres-pvc -n <namespace>

# Backup database
kubectl exec <postgres-pod> -n <namespace> -- \
  pg_dump -U postgres <db-name> > backup.sql

# Restore database
kubectl exec <postgres-pod> -n <namespace> -i -- \
  psql -U postgres <db-name> < backup.sql
```

---

## Summary

✅ **What We Fixed:**
- Replaced `emptyDir` with `PersistentVolumeClaim`
- Added PGDATA environment variable
- Created environment-specific PVCs (dev: 5Gi, staging: 20Gi, prod: 100Gi)
- Added resource limits to PostgreSQL
- Updated Kustomize overlays
- Integrated with deployment scripts

✅ **Benefits:**
- Data survives pod restarts
- Data survives node failures
- Production-ready storage
- Backup and disaster recovery possible
- Scalable and maintainable

✅ **Ready to Deploy:**
```bash
.\scripts\deploy-k8s.ps1 -Environment dev -BuildImages
```

Your PostgreSQL data is now safe! 🎉
