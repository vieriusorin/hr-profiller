#!/bin/bash

# Exit on error
set -e

# Check if VERSION argument is provided
VERSION=${1:-latest}
echo "🏗️  Building production Docker images with version: $VERSION"

# Build frontend image
echo "📦 Building frontend image..."
docker build -t profiller-frontend:$VERSION \
  -f Dockerfile.next.production \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=$VERSION \
  .

# Tag latest if not already latest
if [ "$VERSION" != "latest" ]; then
  docker tag profiller-frontend:$VERSION profiller-frontend:latest
fi

# Build backend image
echo "📦 Building backend image..."
docker build -t profiller-backend:$VERSION \
  -f Dockerfile.express.production \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=$VERSION \
  .

# Tag latest if not already latest
if [ "$VERSION" != "latest" ]; then
  docker tag profiller-backend:$VERSION profiller-backend:latest
fi

# Build MCP server image
echo "📦 Building MCP server image..."
docker build -t profiller-mcp-server:$VERSION \
  -f Dockerfile.mcp.production \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=$VERSION \
  .

# Tag latest if not already latest
if [ "$VERSION" != "latest" ]; then
  docker tag profiller-mcp-server:$VERSION profiller-mcp-server:latest
fi

echo "✅ Production images built successfully!"
echo ""
echo "To run with docker-compose:"
echo "docker-compose -f docker-compose.production.yml up"
echo ""
echo "To run with Kubernetes:"
echo "./scripts/k8s-deploy.sh" 