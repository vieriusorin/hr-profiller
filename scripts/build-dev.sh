#!/bin/bash

# Exit on error
set -e

echo "🏗️  Building development Docker images..."

# Build frontend image
echo "📦 Building frontend image..."
docker build -t profiller-frontend:dev \
  -f Dockerfile.next \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=dev \
  .

# Build backend image
echo "📦 Building backend image..."
docker build -t profiller-backend:dev \
  -f Dockerfile.express \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=dev \
  .

# Build MCP server image
echo "📦 Building MCP server image..."
docker build -t profiller-mcp-server:dev \
  -f Dockerfile.mcp \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=dev \
  .

echo "✅ Development images built successfully!"
echo ""
echo "To run the development environment:"
echo "docker-compose -f docker-compose.dev.yml up" 