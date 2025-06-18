# Database Setup Guide

## 🗄️ Database Configuration

The application uses PostgreSQL with Drizzle ORM for database management.

### 📋 **Environment Configuration**

#### **Root `.env` file** (for Docker Compose):
```bash
# Database Configuration (for Docker containers)
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=profiller_dev
DB_HOST=postgres
DB_PORT=5432

# Database URL for backend/migrations (connects from host to container)
DATABASE_URL=postgresql://postgres:admin@localhost:5433/profiller_dev

# PgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```

#### **Backend `.env` file** (for migrations and backend):
```bash
# Database URL for migrations (from host machine)
DATABASE_URL=postgresql://postgres:admin@localhost:5433/profiller_dev

# Database connection details
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=profiller_dev
```

### 🔧 **Setup Process**

#### **1. Start Development Environment**
```bash
# This will create the environment files and start containers
bash scripts/start-dev.sh
```

#### **2. Verify Database is Running**
```bash
# Check container status
docker compose -f docker-compose.dev.yml ps

# Check database logs
docker compose -f docker-compose.dev.yml logs postgres
```

#### **3. Run Database Migrations**
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run migrations
npm run db:migrate

# Or generate new migrations
npm run db:generate
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Database "dd-tia" does not exist**

**Error:**
```
error: database "dd-tia" does not exist
```

**Solution:**
1. **Check environment configuration** - Make sure you're using the correct database name
2. **Update DATABASE_URL** to match your Docker configuration:
   ```bash
   # ❌ Wrong (old configuration)
   DATABASE_URL=postgres://admin:admin@localhost:5433/dd-tia
   
   # ✅ Correct (new configuration)  
   DATABASE_URL=postgresql://postgres:admin@localhost:5433/profiller_dev
   ```

### **Issue 2: Connection refused**

**Error:**
```
connect ECONNREFUSED 127.0.0.1:5433
```

**Solutions:**
1. **Make sure Docker containers are running:**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Check if PostgreSQL container is healthy:**
   ```bash
   docker compose -f docker-compose.dev.yml logs postgres
   ```

3. **Restart containers if needed:**
   ```bash
   docker compose -f docker-compose.dev.yml restart postgres
   ```

### **Issue 3: Wrong database name in container**

**Error:**
```
database "profiller_dev" does not exist
```

**Solution:**
1. **Recreate the database container:**
   ```bash
   # Stop containers
   docker compose -f docker-compose.dev.yml down
   
   # Remove volumes (⚠️ This will delete data)
   docker compose -f docker-compose.dev.yml down -v
   
   # Start fresh
   bash scripts/start-dev.sh
   ```

### **Issue 4: Frontend has DATABASE_URL**

**Problem:** Frontend (Next.js) should not have direct database access.

**Solution:**
1. **Remove DATABASE_URL from frontend environment**
2. **Frontend should only have:**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4040
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=dev-nextauth-secret
   ```

## 🔍 **Database Connection Details**

### **Port Mapping:**
- **Container internal port:** 5432 (PostgreSQL default)
- **Host mapped port:** 5433 (to avoid conflicts with local PostgreSQL)

### **Connection URLs:**

#### **From Host Machine (for migrations):**
```bash
DATABASE_URL=postgresql://postgres:admin@localhost:5433/profiller_dev
```

#### **From Docker Containers (backend service):**
```bash
DATABASE_URL=postgresql://postgres:admin@postgres:5432/profiller_dev
```

### **Connection Details:**
- **Host:** `localhost` (from host) or `postgres` (from containers)
- **Port:** `5433` (from host) or `5432` (from containers)
- **Username:** `postgres`
- **Password:** `admin`
- **Database:** `profiller_dev`

## 🛠️ **Database Management Commands**

### **Drizzle Commands (in backend directory):**
```bash
# Generate new migration
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema directly (development only)
npm run db:push

# Open Drizzle Studio (database browser)
npm run db:studio
```

### **Docker Commands:**
```bash
# View database logs
docker compose -f docker-compose.dev.yml logs postgres

# Connect to database directly
docker exec -it dd-postgresql psql -U postgres -d profiller_dev

# Backup database
docker exec dd-postgresql pg_dump -U postgres profiller_dev > backup.sql

# Restore database
docker exec -i dd-postgresql psql -U postgres profiller_dev < backup.sql
```

### **PgAdmin Access:**
- **URL:** http://localhost:8080
- **Email:** admin@admin.com
- **Password:** admin

**To connect to database in PgAdmin:**
1. Add new server
2. **Host:** `postgres` (container name)
3. **Port:** `5432`
4. **Username:** `postgres`
5. **Password:** `admin`
6. **Database:** `profiller_dev`

## 📝 **Migration Workflow**

### **1. Create Schema Changes:**
```bash
# Edit schema files in backend/db/schema.ts
# Then generate migration
cd backend
npm run db:generate
```

### **2. Review Migration:**
```bash
# Check generated migration in backend/migrations/
# Review SQL statements before applying
```

### **3. Apply Migration:**
```bash
# Run migration
npm run db:migrate
```

### **4. Verify Changes:**
```bash
# Open Drizzle Studio to verify
npm run db:studio

# Or connect via PgAdmin
# http://localhost:8080
```

## 🔄 **Reset Database (Development)**

If you need to completely reset the database:

```bash
# Stop containers and remove volumes
docker compose -f docker-compose.dev.yml down -v

# Start fresh
bash scripts/start-dev.sh

# Run migrations
cd backend
npm run db:migrate
```

## 🚀 **Production Database**

For production, update the connection details in `.env.production`:

```bash
# Production database URL
DATABASE_URL=postgresql://username:password@production-host:5432/profiller_prod

# Or use cloud database URLs
DATABASE_URL=postgresql://user:pass@aws-rds-endpoint:5432/profiller
```

## 📞 **Getting Help**

If you continue having database issues:

1. **Check container logs:** `docker compose logs postgres`
2. **Verify environment files:** Ensure `.env` and `backend/.env` exist
3. **Check port conflicts:** Make sure port 5433 is available
4. **Reset everything:** Use the reset procedure above
5. **Check troubleshooting guide:** See `docs/TROUBLESHOOTING.md` 