# Docker Patterns for Azure & AWS Deployment

## 🏗️ **1. Multi-Stage Builds**

### Benefits:
- **Smaller Images**: Only production artifacts in final image
- **Security**: Build tools not present in runtime
- **Performance**: Faster deployments, less bandwidth

```dockerfile
# Example: React/Next.js Production Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 **2. Security Patterns**

### Distroless Images
```dockerfile
# Ultra-minimal runtime
FROM gcr.io/distroless/nodejs18-debian11
COPY --from=builder /app/dist /app
WORKDIR /app
USER 1001
CMD ["index.js"]
```

### Security Scanning
```dockerfile
# Add labels for vulnerability scanning
LABEL maintainer="your-team@company.com"
LABEL version="1.0.0"
LABEL description="Production Next.js app"

# Use specific versions (not latest)
FROM node:18.17.0-alpine3.18
```

## 📊 **3. Observability & Monitoring**

### Health Checks
```dockerfile
# Kubernetes-style health checks
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Custom health check script
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh
HEALTHCHECK CMD /usr/local/bin/healthcheck.sh
```

### Logging & Metrics
```dockerfile
# Structured logging
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json

# OpenTelemetry for observability
ENV OTEL_EXPORTER_OTLP_ENDPOINT=https://your-endpoint
ENV OTEL_SERVICE_NAME=frontend-service
```

## ☁️ **4. Cloud-Specific Patterns**

### Azure Container Instances (ACI)
```dockerfile
# Azure-specific optimizations
FROM mcr.microsoft.com/dotnet/aspnet:7.0

# Azure App Service requirements
ENV PORT=80
EXPOSE 80

# Azure managed identity support
ENV AZURE_CLIENT_ID=""
ENV AZURE_TENANT_ID=""
```

### AWS ECS/Fargate
```dockerfile
# AWS X-Ray tracing
ENV _X_AMZN_TRACE_ID=""
ENV AWS_XRAY_TRACING_NAME=frontend-service

# ECS task metadata
ENV ECS_CONTAINER_METADATA_URI_V4=""

# CloudWatch logs
ENV AWS_LOGS_GROUP=/aws/ecs/frontend
ENV AWS_LOGS_REGION=us-east-1
```

## 🚀 **5. Performance Optimization**

### Layer Caching
```dockerfile
# Copy package files first for better caching
COPY package*.json yarn.lock ./
RUN npm ci --only=production

# Copy source code last (changes most frequently)
COPY src ./src
COPY public ./public
```

### Compression & Assets
```dockerfile
# Enable gzip compression
RUN apk add --no-cache gzip
RUN find /app -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) \
    -exec gzip -9 -k {} \;

# Optimize images at build time
RUN npm install -g @squoosh/cli
RUN find /app/public -name "*.png" -exec squoosh-cli --webp {} \;
```

## 🔧 **6. Configuration Management**

### Environment Variables
```dockerfile
# Default values with override capability
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=""
ENV REDIS_URL=""

# Azure Key Vault integration
ENV AZURE_KEY_VAULT_URL=""

# AWS Secrets Manager
ENV AWS_SECRETS_MANAGER_REGION=us-east-1
```

### Config Files
```dockerfile
# Template-based configuration
COPY config.template.json /app/config.template.json
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Use entrypoint to substitute environment variables
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
```

## 📦 **7. Registry & Deployment Patterns**

### Azure Container Registry (ACR)
```bash
# Build and push to ACR
docker build -t myapp.azurecr.io/frontend:latest .
az acr login --name myapp
docker push myapp.azurecr.io/frontend:latest
```

### AWS ECR
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker build -t my-app .
docker tag my-app:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
```

## 🏷️ **8. Tagging Strategy**

```dockerfile
# Build-time labels
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.revision=$VCS_REF
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.source="https://github.com/yourorg/yourapp"
```

## 🔄 **9. CI/CD Integration**

### GitHub Actions Example
```dockerfile
# Multi-platform builds
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder
ARG TARGETPLATFORM
ARG BUILDPLATFORM

# Build for multiple architectures
RUN echo "Building on $BUILDPLATFORM, targeting $TARGETPLATFORM"
```

### Azure DevOps
```dockerfile
# Azure DevOps variables
ARG BUILD_BUILDNUMBER
ARG BUILD_SOURCEVERSION
ENV BUILD_NUMBER=$BUILD_BUILDNUMBER
ENV GIT_COMMIT=$BUILD_SOURCEVERSION
```

## 🛡️ **10. Security Scanning & Compliance**

### Vulnerability Scanning
```dockerfile
# Use minimal base images
FROM node:18-alpine

# Keep packages updated
RUN apk update && apk upgrade

# Remove package managers in production
RUN apk del npm yarn

# Use specific versions
COPY package-lock.json ./
RUN npm ci --only=production && npm cache clean --force
```

## 📋 **11. Resource Management**

### Memory & CPU Limits
```dockerfile
# Set Node.js memory limits
ENV NODE_OPTIONS="--max-old-space-size=512"

# Process management
ENV PM2_PUBLIC_KEY=""
ENV PM2_SECRET_KEY=""
```

## 🔍 **12. Debugging & Development**

### Development Overrides
```dockerfile
# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install --include=dev
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
ENV NODE_ENV=production
CMD ["npm", "start"]
```

## 📚 **Best Practices Summary**

### ✅ **DO:**
- Use multi-stage builds for production
- Implement proper health checks
- Use non-root users
- Pin base image versions
- Minimize layer count
- Use .dockerignore files
- Implement proper logging
- Add metadata labels

### ❌ **DON'T:**
- Use `latest` tags in production
- Run as root user
- Include secrets in images
- Install unnecessary packages
- Ignore security updates
- Skip health checks
- Hardcode environment-specific values

## 🚀 **Cloud-Specific Recommendations**

### **Azure:**
- Use Azure Container Registry (ACR)
- Integrate with Azure Key Vault
- Use Azure Monitor for observability
- Consider Azure Container Apps for serverless

### **AWS:**
- Use Amazon ECR for registry
- Integrate with AWS Secrets Manager
- Use CloudWatch for logging
- Consider AWS Fargate for serverless containers

This comprehensive approach ensures your Docker images are production-ready, secure, and optimized for cloud deployment! 🎯 