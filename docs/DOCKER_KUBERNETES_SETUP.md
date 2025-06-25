# Docker and Kubernetes Setup Guide

This document describes how to build, run, and deploy the Profiller HR application using Docker and Kubernetes.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker Desktop
- Node.js (v22 or later)
- kubectl
- Minikube (for local Kubernetes development)

For Windows users:
```powershell
# Install using Chocolatey
choco install docker-desktop
choco install kubernetes-cli
choco install minikube
```

## Project Structure

The application consists of three main services:
- Frontend (Next.js)
- Backend (Express.js)
- MCP Server (Node.js)

Each service has its own Dockerfile for both development and production:
```
├── Dockerfile.next            # Frontend development
├── Dockerfile.next.production # Frontend production
├── Dockerfile.express        # Backend development
├── Dockerfile.express.production # Backend production
├── Dockerfile.mcp           # MCP Server development
├── Dockerfile.mcp.production # MCP Server production
```

## Development Environment

### Building Development Images

To build all development images, run:
```bash
./scripts/build-dev.sh
```

This script builds:
- profiller-frontend:dev
- profiller-backend:dev
- profiller-mcp-server:dev

### Running Development Environment

Start the development environment using Docker Compose:
```bash
docker-compose -f docker-compose.dev.yml up
```

Development services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4040
- MCP Server: http://localhost:3002

## Production Environment

### Building Production Images

Build production images with version tagging:
```bash
# Build with specific version
./scripts/build-prod.sh 1.0.0

# Or build latest version
./scripts/build-prod.sh
```

This script builds:
- profiller-frontend:{version}
- profiller-backend:{version}
- profiller-mcp-server:{version}

And tags them as 'latest' if a specific version is provided.

### Running Production Environment with Docker Compose

Start the production environment:
```bash
docker-compose -f docker-compose.production.yml up
```

## Kubernetes Deployment

### Directory Structure
```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── postgres/
│   ├── deployment.yaml
│   └── service.yaml
├── backend/
│   ├── deployment.yaml
│   └── service.yaml
├── mcp-server/
│   ├── deployment.yaml
│   └── service.yaml
└── frontend/
    ├── deployment.yaml
    └── service.yaml
```

### Deploying to Kubernetes

Deploy the entire application to Kubernetes:
```bash
./scripts/k8s-deploy.sh
```

This script will:
1. Start Minikube if not running
2. Build production images
3. Apply all Kubernetes configurations
4. Wait for all pods to be ready
5. Display the frontend service URL

### Accessing Services

- Frontend: Access through Minikube service URL (displayed after deployment)
- Backend: Internal service at backend-service:4040
- MCP Server: Internal service at mcp-server-service:3002
- PostgreSQL: Internal service at postgres-service:5432

## Configuration

### Environment Variables

Key environment variables are managed through:
- Development: docker-compose.dev.yml
- Production: docker-compose.production.yml
- Kubernetes: k8s/configmap.yaml and k8s/secrets.yaml

### Kubernetes Secrets

The following secrets need to be configured in k8s/secrets.yaml:
```yaml
POSTGRES_PASSWORD: base64_encoded_value
JWT_SECRET: base64_encoded_value
NEXTAUTH_SECRET: base64_encoded_value
OPENAI_API_KEY: base64_encoded_value
```

To encode a secret:
```bash
echo -n "your-secret" | base64
```

## Troubleshooting

### Common Issues

1. **Images Not Found in Kubernetes**
   - Ensure you're using Minikube's Docker daemon:
     ```bash
     eval $(minikube docker-env)
     ```
   - Rebuild images using build-prod.sh

2. **Services Not Accessible**
   - Check pod status:
     ```bash
     kubectl get pods -n profiller
     ```
   - Check pod logs:
     ```bash
     kubectl logs -n profiller <pod-name>
     ```

3. **Database Connection Issues**
   - Verify PostgreSQL pod is running:
     ```bash
     kubectl get pods -n profiller | grep postgres
     ```
   - Check database logs:
     ```bash
     kubectl logs -n profiller <postgres-pod-name>
     ```

### Health Checks

All services include health check endpoints:
- Frontend: /api/health
- Backend: /health
- MCP Server: /health

Monitor health status in Kubernetes:
```bash
kubectl describe pod -n profiller <pod-name>
```

### Resource Cleanup

To remove all resources:
```bash
# Delete all Kubernetes resources
kubectl delete namespace profiller

# Stop Minikube
minikube stop

# Remove Docker containers and images
docker-compose -f docker-compose.production.yml down --rmi all
``` 