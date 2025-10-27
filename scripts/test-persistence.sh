#!/bin/bash
# Bash script to test PostgreSQL data persistence
# Usage: ./scripts/test-persistence.sh [namespace]

set -e

NAMESPACE=${1:-profiller-dev}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo "Testing PostgreSQL Data Persistence"
echo "Namespace: $NAMESPACE"
echo -e "========================================${NC}"
echo ""

# Step 1: Check PVC exists and is bound
echo -e "${YELLOW}[1/7] Checking PVC status...${NC}"
if ! kubectl get pvc postgres-pvc -n "$NAMESPACE" &>/dev/null; then
    echo -e "${RED}  ERROR: PVC 'postgres-pvc' not found in namespace '$NAMESPACE'${NC}"
    echo -e "${YELLOW}  Run deployment first: ./scripts/deploy-k8s.sh dev${NC}"
    exit 1
fi

PVC_STATUS=$(kubectl get pvc postgres-pvc -n "$NAMESPACE" -o jsonpath='{.status.phase}')
if [ "$PVC_STATUS" != "Bound" ]; then
    echo -e "${RED}  ERROR: PVC is not bound. Status: $PVC_STATUS${NC}"
    exit 1
fi

PVC_CAPACITY=$(kubectl get pvc postgres-pvc -n "$NAMESPACE" -o jsonpath='{.status.capacity.storage}')
PVC_VOLUME=$(kubectl get pvc postgres-pvc -n "$NAMESPACE" -o jsonpath='{.spec.volumeName}')

echo -e "${GREEN}  ✓ PVC is bound${NC}"
echo -e "${GRAY}    Capacity: $PVC_CAPACITY${NC}"
echo -e "${GRAY}    Volume: $PVC_VOLUME${NC}"

# Step 2: Get PostgreSQL pod
echo ""
echo -e "${YELLOW}[2/7] Finding PostgreSQL pod...${NC}"
POSTGRES_POD=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}')
if [ -z "$POSTGRES_POD" ]; then
    echo -e "${RED}  ERROR: No PostgreSQL pod found${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ Found pod: $POSTGRES_POD${NC}"

# Step 3: Check if pod is ready
POD_STATUS=$(kubectl get pod "$POSTGRES_POD" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
if [ "$POD_STATUS" != "True" ]; then
    echo -e "${YELLOW}  WARNING: Pod is not ready yet. Waiting...${NC}"
    kubectl wait --for=condition=ready pod "$POSTGRES_POD" -n "$NAMESPACE" --timeout=60s
fi

echo -e "${GREEN}  ✓ Pod is ready${NC}"

# Step 4: Create test data
echo ""
echo -e "${YELLOW}[3/7] Creating test data...${NC}"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
TEST_QUERY="CREATE TABLE IF NOT EXISTS persistence_test (
    id SERIAL PRIMARY KEY,
    test_data TEXT,
    created_at TIMESTAMP
);
INSERT INTO persistence_test (test_data, created_at)
VALUES ('Test created at $TIMESTAMP', '$TIMESTAMP');"

kubectl exec "$POSTGRES_POD" -n "$NAMESPACE" -- psql -U postgres -d profiller_dev -c "$TEST_QUERY" >/dev/null
echo -e "${GREEN}  ✓ Test data created at: $TIMESTAMP${NC}"

# Step 5: Verify data exists
echo ""
echo -e "${YELLOW}[4/7] Verifying test data exists...${NC}"
COUNT_BEFORE=$(kubectl exec "$POSTGRES_POD" -n "$NAMESPACE" -- \
    psql -U postgres -d profiller_dev -t -c "SELECT COUNT(*) FROM persistence_test;" 2>/dev/null | tr -d '[:space:]')
echo -e "${GREEN}  ✓ Records in table: $COUNT_BEFORE${NC}"

# Step 6: Delete the pod
echo ""
echo -e "${YELLOW}[5/7] Deleting PostgreSQL pod to test persistence...${NC}"
echo -e "${GRAY}  This simulates a pod restart/failure${NC}"
kubectl delete pod "$POSTGRES_POD" -n "$NAMESPACE" >/dev/null
echo -e "${GREEN}  ✓ Pod deleted${NC}"

# Wait for new pod to be ready
echo ""
echo -e "${YELLOW}[6/7] Waiting for new pod to start...${NC}"
sleep 5

ATTEMPT=0
MAX_ATTEMPTS=30
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    NEW_POSTGRES_POD=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

    if [ -n "$NEW_POSTGRES_POD" ]; then
        POD_READY=$(kubectl get pod "$NEW_POSTGRES_POD" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "False")

        if [ "$POD_READY" = "True" ]; then
            echo -e "${GREEN}  ✓ New pod is ready: $NEW_POSTGRES_POD${NC}"
            break
        fi
    fi

    ATTEMPT=$((ATTEMPT + 1))
    echo -e "${GRAY}    Waiting... ($ATTEMPT/$MAX_ATTEMPTS)${NC}"
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}  ERROR: Pod did not become ready in time${NC}"
    exit 1
fi

# Step 7: Verify data still exists
echo ""
echo -e "${YELLOW}[7/7] Verifying data persisted after pod restart...${NC}"
sleep 3  # Give PostgreSQL a moment to fully start

COUNT_AFTER=$(kubectl exec "$NEW_POSTGRES_POD" -n "$NAMESPACE" -- \
    psql -U postgres -d profiller_dev -t -c "SELECT COUNT(*) FROM persistence_test;" 2>/dev/null | tr -d '[:space:]')

echo ""
echo -e "${CYAN}========================================"
echo "Test Results"
echo -e "========================================${NC}"
echo "  Records before restart: $COUNT_BEFORE"
echo "  Records after restart:  $COUNT_AFTER"
echo ""

if [ "$COUNT_BEFORE" = "$COUNT_AFTER" ]; then
    echo -e "${GREEN}  ✅ SUCCESS! Data persisted across pod restart!${NC}"
    echo ""
    echo -e "${GREEN}Your PostgreSQL data is now stored on a PersistentVolume${NC}"
    echo -e "${GREEN}and will survive pod restarts, node failures, and deployments.${NC}"
else
    echo -e "${RED}  ❌ FAILURE! Data was lost!${NC}"
    echo ""
    echo -e "${RED}This indicates the PVC is not correctly configured.${NC}"
    echo -e "${YELLOW}Check that the deployment uses persistentVolumeClaim, not emptyDir.${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}View test data:${NC}"
echo "  kubectl exec $NEW_POSTGRES_POD -n $NAMESPACE -- psql -U postgres -d profiller_dev -c 'SELECT * FROM persistence_test;'"
echo ""
echo -e "${CYAN}Clean up test table:${NC}"
echo "  kubectl exec $NEW_POSTGRES_POD -n $NAMESPACE -- psql -U postgres -d profiller_dev -c 'DROP TABLE persistence_test;'"
echo ""
