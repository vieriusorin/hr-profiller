# Scripts Directory

This directory contains all the automation scripts for managing the Profiller HR application in different environments.

## 📋 Available Scripts

### 🚀 **Development Scripts**

#### `start-dev.sh`

Starts the development environment with all required services.

```bash
bash scripts/start-dev.sh
```

**What it does:**

- Copies `.env.dev` to `.env` (if available)
- Starts development containers using `docker-compose.dev.yml`
- Shows status and URLs when complete

**Requirements:**

- Docker Desktop running
- `.env.dev` file (optional, will use existing `.env` if not found)

---

### 🏭 **Production Scripts**

#### `start-prod.sh`

Comprehensive production startup script with validation and health checks.

```bash
bash scripts/start-prod.sh
```

**What it does:**

- Validates Docker is running
- Checks/creates `.env.production` from template
- Validates critical environment variables
- Builds production images if needed
- Starts production services
- Waits for services to be healthy
- Tests endpoints
- Shows production information

#### `stop-prod.sh`

Safely stops production environment with cleanup options.

```bash
bash scripts/stop-prod.sh
```

**What it does:**

- Stops production containers
- Offers cleanup options (keep/remove volumes)
- System cleanup options
- Shows final status

#### `prod-manager.sh`

Comprehensive production management tool with multiple commands.

```bash
bash scripts/prod-manager.sh <command>
```

**Available Commands:**

- `start` - Start production environment
- `stop` - Stop production environment
- `restart` - Restart production environment
- `status` - Show detailed status of all services
- `logs [service]` - Show logs (optionally for specific service)
- `health` - Check health of all services
- `build` - Build production images
- `deploy` - Full deployment (build + start)
- `backup` - Backup database and volumes
- `shell <service>` - Open shell in service container
- `clean` - Clean up unused Docker resources
- `update` - Update images and restart

**Examples:**

```bash
# Start production
bash scripts/prod-manager.sh start

# View frontend logs
bash scripts/prod-manager.sh logs frontend

# Check health
bash scripts/prod-manager.sh health

# Open shell in backend
bash scripts/prod-manager.sh shell backend

# Full deployment
bash scripts/prod-manager.sh deploy
```

#### `deploy-production.sh`

Advanced deployment script with security scanning and registry support.

```bash
bash scripts/deploy-production.sh [command]
```

**Available Commands:**

- `build` - Build production images only
- `scan` - Run security scans (requires Trivy)
- `push` - Push images to registry
- `deploy` - Deploy using Docker Compose
- `all` - Complete pipeline (default)

---

## 🔧 **Setup Requirements**

### For Development:

1. **Docker Desktop** running
2. **Environment file** (optional):
   ```bash
   cp .env.example .env.dev
   # Edit .env.dev with development values
   ```

### For Production:

1. **Docker Desktop** running
2. **Production environment file** (required):
   ```bash
   cp env.production.example .env.production
   # Edit .env.production with production values
   ```

**Required Production Variables:**

```bash
POSTGRES_PASSWORD=secure-password
JWT_SECRET=your-super-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
```

---

## 🎯 **Quick Start Guide**

### Development Environment:

```bash
# 1. Start Docker Desktop
# 2. Run development environment
bash scripts/start-dev.sh

# Access applications:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:4040
# - PgAdmin: http://localhost:8080
```

### Production Environment:

```bash
# 1. Start Docker Desktop
# 2. Configure environment
cp env.production.example .env.production
# Edit .env.production with your values

# 3. Start production
bash scripts/start-prod.sh
# OR use the manager
bash scripts/prod-manager.sh deploy

# Access applications:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:4040
```

---

## 🛠️ **Script Features**

### ✅ **All Scripts Include:**

- **Docker validation** - Checks if Docker is running
- **Error handling** - Exits on errors with helpful messages
- **Colored output** - Easy to read status messages
- **Prerequisites checking** - Validates required files and tools

### 🏭 **Production Scripts Include:**

- **Environment validation** - Checks required variables
- **Health monitoring** - Waits for services to be healthy
- **Endpoint testing** - Validates application responses
- **Build metadata** - Adds version and build information
- **Backup capabilities** - Database and volume backups
- **Cleanup options** - Safe resource management

### 🔍 **Debugging Features:**

- **Detailed status** - Shows container, network, and volume info
- **Health checks** - Tests all service endpoints
- **Log viewing** - Easy access to service logs
- **Shell access** - Debug containers interactively

---

## 🚨 **Troubleshooting**

If scripts fail, check:

1. **Docker Desktop is running**

   ```bash
   docker info
   ```

2. **Environment files exist**

   ```bash
   ls -la .env*
   ```

3. **Required ports are free**

   ```bash
   netstat -an | grep :3000
   netstat -an | grep :4040
   ```

4. **View detailed logs**
   ```bash
   bash scripts/prod-manager.sh logs
   ```

For more troubleshooting help, see: [`docs/TROUBLESHOOTING.md`](../docs/TROUBLESHOOTING.md)

---

## 📚 **Related Documentation**

- [`docs/DOCKER_CLOUD_PATTERNS.md`](../docs/DOCKER_CLOUD_PATTERNS.md) - Docker patterns for cloud deployment
- [`docs/TROUBLESHOOTING.md`](../docs/TROUBLESHOOTING.md) - Comprehensive troubleshooting guide
- [`docker-compose.dev.yml`](../docker-compose.dev.yml) - Development configuration
- [`docker-compose.production.yml`](../docker-compose.production.yml) - Production configuration

---

## 🔄 **Script Maintenance**

To make scripts executable (Linux/Mac):

```bash
chmod +x scripts/*.sh
```

To update all scripts:

```bash
git pull origin main
chmod +x scripts/*.sh  # If needed
```

# Type Generation Scripts

This directory contains scripts for generating frontend types from the backend, ensuring a **single source of truth** for all type definitions.

## 🎯 Single Command for All Types

```bash
# Generate all frontend types (recommended)
npm run generate:types
```

This command will:

1. ✅ Generate OpenAPI types from the backend API
2. ✅ Generate enum types from the backend database enums
3. ✅ Ensure frontend types stay in sync with backend

## 📂 Available Scripts

### `generate-all-types.js` (Primary)

- **Purpose**: Unified script that generates all frontend types
- **Usage**: `npm run generate:types` (from frontend or backend)
- **What it does**:
  - Builds backend and generates OpenAPI schema
  - Generates frontend TypeScript types from OpenAPI
  - Generates enum types from database enums
  - Provides comprehensive logging and error handling

### `generate-frontend-types.js` (Internal)

- **Purpose**: Generates enum types from backend database enums
- **Usage**: Called internally by `generate-all-types.js`
- **What it does**:
  - Reads backend database enum files (`backend/db/enums/*.enum.ts`)
  - Extracts enum values from `pgEnum` declarations
  - Generates TypeScript types, constants, and type guards
  - Outputs to `frontend/lib/backend-types/enums.ts`

## 🔄 Type Generation Workflow

### When to Run Type Generation

- After modifying backend database enums
- After adding/changing backend API endpoints
- After updating backend request/response schemas
- Before frontend development to ensure types are current

### Automatic vs Manual

- **Manual**: Run `npm run generate:types` when needed
- **Future**: Could be automated via git hooks or CI/CD pipeline

## 📋 Generated Files

### Frontend OpenAPI Types

- **Location**: `frontend/types/api.ts`
- **Source**: Backend OpenAPI schema (`backend/generated/openapi.json`)
- **Contains**: API endpoint types, request/response schemas

### Frontend Enum Types

- **Location**: `frontend/lib/backend-types/enums.ts`
- **Source**: Backend database enums (`backend/db/enums/*.enum.ts`)
- **Contains**: TypeScript enum types, constants, and type guards

## 🛠️ Troubleshooting

### Common Issues

1. **"No enum files found"**: Ensure backend enum files exist in `backend/db/enums/`
2. **"Backend build failed"**: Fix TypeScript errors in backend before running
3. **"OpenAPI generation failed"**: Check backend API endpoints and schemas

### Debug Mode

```bash
# Run individual steps for debugging
cd backend && npm run openapi:generate  # Step 1
cd frontend && npm run types:generate   # Step 2
node scripts/generate-frontend-types.js # Step 3
```

## 🎯 Best Practices

1. **Single Source of Truth**: Always define enums in backend database files
2. **Never Edit Generated Files**: They will be overwritten on next generation
3. **Run Before Commits**: Ensure types are current before committing
4. **Version Control**: Commit generated files to keep team in sync
