# Troubleshooting Guide

## 🐳 Docker Issues

### "Cannot find file specified" or "Docker not running"

**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.46/containers/json": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solutions:**

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start (green status)
   - Check system tray for Docker icon

2. **Restart Docker Service (Windows)**
   ```powershell
   # Run as Administrator
   Restart-Service -Name "com.docker.service"
   ```

3. **Check Docker Status**
   ```bash
   docker --version
   docker info
   ```

4. **Alternative: Use Docker without Desktop**
   - Install Docker Engine directly
   - Use WSL2 with Docker installed

### "Version is obsolete" Warning

**Warning:**
```
the attribute `version` is obsolete, it will be ignored
```

**Solution:** ✅ **Fixed** - Removed version field from docker-compose files

## 🔧 Script Issues

### "./scripts/start-dev.sh: command not found"

**Error:**
```
./scripts/start-dev.sh: line 1: dev:: command not found
```

**Solution:** ✅ **Fixed** - Corrected shell script syntax

**To run the script:**
```bash
# Linux/Mac
./scripts/start-dev.sh

# Windows (Git Bash/WSL)
bash scripts/start-dev.sh

# Windows (PowerShell) - if needed
powershell -ExecutionPolicy Bypass -File scripts/start-dev.ps1
```

## 🏥 Health Check Issues

### Health Check Endpoints Not Found

**Error:**
```
Health check failed: 404 Not Found
```

**Solution:** ✅ **Fixed** - Created health check endpoints

**Endpoints:**
- Frontend: `http://localhost:3000/api/health`
- Backend: `http://localhost:4040/health` (needs implementation)

## 🌐 Network Issues

### Services Can't Communicate

**Error:**
```
Connection refused between containers
```

**Solutions:**

1. **Use Service Names**
   ```yaml
   # ✅ Correct
   API_URL: http://express:4040
   
   # ❌ Wrong
   API_URL: http://localhost:4040
   ```

2. **Check Network Configuration**
   ```bash
   docker network ls
   docker network inspect dd-network
   ```

3. **Verify Service Health**
   ```bash
   docker-compose ps
   docker-compose logs express
   docker-compose logs next
   ```

## 📁 File Permission Issues

### Permission Denied (Linux/Mac)

**Error:**
```
Permission denied: ./scripts/start-dev.sh
```

**Solution:**
```bash
chmod +x scripts/start-dev.sh
chmod +x scripts/deploy-production.sh
```

## 🔐 Environment Variables

### Missing Environment Variables

**Error:**
```
Environment variable not set
```

**Solutions:**

1. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Check Required Variables**
   ```bash
   # Development
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_NAME=profiller
   DB_HOST=postgres
   DB_PORT=5432
   PGADMIN_DEFAULT_EMAIL=admin@admin.com
   PGADMIN_DEFAULT_PASSWORD=admin
   ```

## 🚀 Development Startup

### Complete Startup Process

1. **Start Docker Desktop**
2. **Create Environment File**
   ```bash
   cp .env.example .env.dev
   # Edit .env.dev with development values
   ```

3. **Run Development Script**
   ```bash
   bash scripts/start-dev.sh
   ```

4. **Verify Services**
   ```bash
   # Check container status
   docker-compose -f docker-compose.dev.yml ps
   
   # Check logs
   docker-compose -f docker-compose.dev.yml logs -f
   ```

5. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4040
   - PgAdmin: http://localhost:8080
   - Health Checks:
     - http://localhost:3000/api/health
     - http://localhost:4040/health

## 🏭 Production Environment

### Production Startup Process

1. **Start Docker Desktop**
2. **Create Production Environment File**
   ```bash
   cp env.production.example .env.production
   # Edit .env.production with production values
   ```

3. **Run Production Scripts**
   ```bash
   # Simple start
   bash scripts/start-prod.sh
   
   # Or use the comprehensive manager
   bash scripts/prod-manager.sh start
   
   # Full deployment (build + start)
   bash scripts/prod-manager.sh deploy
   ```

### Production Management Commands

```bash
# Start production environment
bash scripts/prod-manager.sh start

# Stop production environment
bash scripts/prod-manager.sh stop

# Check status
bash scripts/prod-manager.sh status

# View logs
bash scripts/prod-manager.sh logs
bash scripts/prod-manager.sh logs frontend

# Check health
bash scripts/prod-manager.sh health

# Build images
bash scripts/prod-manager.sh build

# Full deployment
bash scripts/prod-manager.sh deploy

# Open shell in container
bash scripts/prod-manager.sh shell frontend

# Backup data
bash scripts/prod-manager.sh backup

# Clean up
bash scripts/prod-manager.sh clean
```

### Production Environment Variables

**Required variables in `.env.production`:**
```bash
# Database
POSTGRES_PASSWORD=secure-password
DATABASE_URL=postgresql://postgres:secure-password@postgres:5432/profiller

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret

# Build metadata (auto-generated)
BUILD_DATE=
VCS_REF=
VERSION=
```

## 🔍 Debugging Commands

### Useful Docker Commands

```bash
# Check running containers
docker ps

# View logs
docker-compose logs [service-name]
docker logs [container-name]

# Execute commands in container
docker exec -it dd-next sh
docker exec -it dd-express sh

# Restart services
docker-compose restart [service-name]

# Clean up
docker-compose down
docker system prune -f

# Rebuild containers
docker-compose build --no-cache
```

### Health Check Testing

```bash
# Test health endpoints
curl http://localhost:3000/api/health
curl http://localhost:4040/health

# Check container health
docker inspect --format='{{.State.Health.Status}}' dd-next
docker inspect --format='{{.State.Health.Status}}' dd-express
```

### Production Debugging

```bash
# Check production status
bash scripts/prod-manager.sh status

# View production logs
bash scripts/prod-manager.sh logs

# Check production health
bash scripts/prod-manager.sh health

# Open shell in production container
bash scripts/prod-manager.sh shell frontend

# Check production images
docker images | grep profiller
```

## 📞 Getting Help

If you continue to have issues:

1. **Check Docker Desktop Status**
2. **Review Container Logs**
3. **Verify Environment Variables**
4. **Test Health Endpoints**
5. **Check Network Connectivity**

**Common Solutions:**
- Restart Docker Desktop
- Clear Docker cache: `docker system prune -a`
- Rebuild containers: `docker-compose build --no-cache`
- Check firewall/antivirus settings

**Production-Specific:**
- Verify `.env.production` is properly configured
- Check production image builds: `bash scripts/prod-manager.sh build`
- Monitor production health: `bash scripts/prod-manager.sh health`
- Review production logs: `bash scripts/prod-manager.sh logs` 