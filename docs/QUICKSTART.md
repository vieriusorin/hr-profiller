# Quick Start Guide

This guide provides quick instructions for getting started with development and deployment.

## Local Development

### First Time Setup

1. Install prerequisites:
   ```powershell
   # Windows (using Chocolatey)
   choco install docker-desktop kubernetes-cli minikube

   # macOS (using Homebrew)
   brew install --cask docker
   brew install kubernetes-cli minikube
   ```

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd profiller-hr
   ```

3. Create `.env` files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp mcp-server/.env.example mcp-server/.env
   ```

### Development with Docker

1. Build development images:
   ```bash
   ./scripts/build-dev.sh
   ```

2. Start development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Access services:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - MCP Server: http://localhost:3002

### Development without Docker

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   
   # MCP Server
   cd mcp-server
   npm install
   ```

2. Start services:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd frontend
   npm run dev
   
   # MCP Server
   cd mcp-server
   npm run dev
   ```

## Production Deployment

### Docker Compose Deployment

1. Build production images:
   ```bash
   ./scripts/build-prod.sh 1.0.0
   ```

2. Start production environment:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

### Kubernetes Deployment

1. Start Minikube:
   ```bash
   minikube start
   ```

2. Deploy to Kubernetes:
   ```bash
   ./scripts/k8s-deploy.sh
   ```

3. Access the application:
   ```bash
   # Get frontend URL
   minikube service frontend-service --namespace profiller --url
   ```

## Common Commands

### Docker Commands
```bash
# View running containers
docker ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build frontend

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend
```

### Kubernetes Commands
```bash
# View all pods
kubectl get pods -n profiller

# View pod logs
kubectl logs -n profiller <pod-name>

# Describe pod
kubectl describe pod -n profiller <pod-name>

# Port forward to local machine
kubectl port-forward -n profiller service/frontend-service 3000:3000
```

### Cleanup Commands
```bash
# Stop and remove development containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove production containers
docker-compose -f docker-compose.production.yml down

# Remove all resources from Kubernetes
kubectl delete namespace profiller

# Stop Minikube
minikube stop
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   netstat -ano | findstr :<PORT>
   
   # Kill process
   taskkill /PID <PID> /F
   ```

2. **Docker Build Fails**
   - Clear Docker cache:
     ```bash
     docker builder prune
     ```
   - Rebuild without cache:
     ```bash
     docker-compose build --no-cache
     ```

3. **Kubernetes Pods Not Starting**
   - Check pod status:
     ```bash
     kubectl get pods -n profiller
     ```
   - Check pod logs:
     ```bash
     kubectl logs -n profiller <pod-name>
     ```

For more detailed information, refer to [DOCKER_KUBERNETES_SETUP.md](DOCKER_KUBERNETES_SETUP.md). 