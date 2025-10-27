# PowerShell script to test PostgreSQL data persistence
# Usage: .\scripts\test-persistence.ps1 -Namespace profiller-dev

param(
    [Parameter(Mandatory=$false)]
    [string]$Namespace = "profiller-dev"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing PostgreSQL Data Persistence" -ForegroundColor Cyan
Write-Host "Namespace: $Namespace" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PVC exists and is bound
Write-Host "[1/7] Checking PVC status..." -ForegroundColor Yellow
$pvc = kubectl get pvc postgres-pvc -n $Namespace -o json 2>$null | ConvertFrom-Json

if (-not $pvc) {
    Write-Host "  ERROR: PVC 'postgres-pvc' not found in namespace '$Namespace'" -ForegroundColor Red
    Write-Host "  Run deployment first: .\scripts\deploy-k8s.ps1 -Environment dev" -ForegroundColor Yellow
    exit 1
}

$pvcStatus = $pvc.status.phase
if ($pvcStatus -ne "Bound") {
    Write-Host "  ERROR: PVC is not bound. Status: $pvcStatus" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ PVC is bound" -ForegroundColor Green
Write-Host "    Capacity: $($pvc.status.capacity.storage)" -ForegroundColor Gray
Write-Host "    Volume: $($pvc.spec.volumeName)" -ForegroundColor Gray

# Step 2: Get PostgreSQL pod
Write-Host ""
Write-Host "[2/7] Finding PostgreSQL pod..." -ForegroundColor Yellow
$postgresPods = kubectl get pods -n $Namespace -l app=postgres -o json | ConvertFrom-Json
if ($postgresPods.items.Count -eq 0) {
    Write-Host "  ERROR: No PostgreSQL pod found" -ForegroundColor Red
    exit 1
}

$postgresPod = $postgresPods.items[0].metadata.name
Write-Host "  ✓ Found pod: $postgresPod" -ForegroundColor Green

# Step 3: Check if pod is ready
$podStatus = kubectl get pod $postgresPod -n $Namespace -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
if ($podStatus -ne "True") {
    Write-Host "  WARNING: Pod is not ready yet. Waiting..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod $postgresPod -n $Namespace --timeout=60s
}

Write-Host "  ✓ Pod is ready" -ForegroundColor Green

# Step 4: Create test data
Write-Host ""
Write-Host "[3/7] Creating test data..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$testQuery = @"
CREATE TABLE IF NOT EXISTS persistence_test (
    id SERIAL PRIMARY KEY,
    test_data TEXT,
    created_at TIMESTAMP
);
INSERT INTO persistence_test (test_data, created_at)
VALUES ('Test created at $timestamp', '$timestamp');
"@

kubectl exec $postgresPod -n $Namespace -- psql -U postgres -d profiller_dev -c "$testQuery" | Out-Null
Write-Host "  ✓ Test data created at: $timestamp" -ForegroundColor Green

# Step 5: Verify data exists
Write-Host ""
Write-Host "[4/7] Verifying test data exists..." -ForegroundColor Yellow
$countBefore = kubectl exec $postgresPod -n $Namespace -- `
    psql -U postgres -d profiller_dev -t -c "SELECT COUNT(*) FROM persistence_test;" 2>$null
$countBefore = $countBefore.Trim()
Write-Host "  ✓ Records in table: $countBefore" -ForegroundColor Green

# Step 6: Delete the pod
Write-Host ""
Write-Host "[5/7] Deleting PostgreSQL pod to test persistence..." -ForegroundColor Yellow
Write-Host "  This simulates a pod restart/failure" -ForegroundColor Gray
kubectl delete pod $postgresPod -n $Namespace | Out-Null
Write-Host "  ✓ Pod deleted" -ForegroundColor Green

# Wait for new pod to be ready
Write-Host ""
Write-Host "[6/7] Waiting for new pod to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$attempt = 0
$maxAttempts = 30
while ($attempt -lt $maxAttempts) {
    $newPostgresPods = kubectl get pods -n $Namespace -l app=postgres -o json | ConvertFrom-Json
    if ($newPostgresPods.items.Count -gt 0) {
        $newPostgresPod = $newPostgresPods.items[0].metadata.name
        $podReady = kubectl get pod $newPostgresPod -n $Namespace -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>$null

        if ($podReady -eq "True") {
            Write-Host "  ✓ New pod is ready: $newPostgresPod" -ForegroundColor Green
            break
        }
    }

    $attempt++
    Write-Host "    Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($attempt -eq $maxAttempts) {
    Write-Host "  ERROR: Pod did not become ready in time" -ForegroundColor Red
    exit 1
}

# Step 7: Verify data still exists
Write-Host ""
Write-Host "[7/7] Verifying data persisted after pod restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 3  # Give PostgreSQL a moment to fully start

$countAfter = kubectl exec $newPostgresPod -n $Namespace -- `
    psql -U postgres -d profiller_dev -t -c "SELECT COUNT(*) FROM persistence_test;" 2>$null
$countAfter = $countAfter.Trim()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Records before restart: $countBefore" -ForegroundColor White
Write-Host "  Records after restart:  $countAfter" -ForegroundColor White
Write-Host ""

if ($countBefore -eq $countAfter) {
    Write-Host "  ✅ SUCCESS! Data persisted across pod restart!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your PostgreSQL data is now stored on a PersistentVolume" -ForegroundColor Green
    Write-Host "and will survive pod restarts, node failures, and deployments." -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILURE! Data was lost!" -ForegroundColor Red
    Write-Host ""
    Write-Host "This indicates the PVC is not correctly configured." -ForegroundColor Red
    Write-Host "Check that the deployment uses persistentVolumeClaim, not emptyDir." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "View test data:" -ForegroundColor Cyan
Write-Host "  kubectl exec $newPostgresPod -n $Namespace -- psql -U postgres -d profiller_dev -c 'SELECT * FROM persistence_test;'" -ForegroundColor White
Write-Host ""
Write-Host "Clean up test table:" -ForegroundColor Cyan
Write-Host "  kubectl exec $newPostgresPod -n $Namespace -- psql -U postgres -d profiller_dev -c 'DROP TABLE persistence_test;'" -ForegroundColor White
Write-Host ""
