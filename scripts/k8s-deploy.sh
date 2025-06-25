#!/bin/bash

# Exit on error
set -e

# Start minikube if not running
if ! minikube status > /dev/null 2>&1; then
    echo "Starting minikube..."
    minikube start
fi

# Point shell to minikube's docker-daemon
eval $(minikube docker-env)

# Build images using our production build script
echo "Building Docker images..."
./scripts/build-prod.sh

# Create namespace and apply configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Apply PostgreSQL
echo "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres/

# Apply Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend/

# Apply MCP Server
echo "Deploying MCP Server..."
kubectl apply -f k8s/mcp-server/

# Apply Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend/

# Wait for all pods to be ready
echo "Waiting for all pods to be ready..."
kubectl wait --namespace profiller --for=condition=ready pod --all --timeout=300s

# Get service URLs
echo "Getting service URLs..."
FRONTEND_URL=$(minikube service frontend-service --namespace profiller --url)
echo "Frontend is available at: $FRONTEND_URL"

echo "Deployment complete!" 