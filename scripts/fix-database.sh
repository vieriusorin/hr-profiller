#!/bin/bash

# Database fix script for Profiller HR
set -e

echo "🔧 Fixing database configuration..."

# 1. Copy environment files if they don't exist
echo "📋 Setting up environment files..."

if [ ! -f ".env" ]; then
    if [ -f "env.development.example" ]; then
        cp env.development.example .env
        echo "✅ Created .env from env.development.example"
    else
        echo "❌ env.development.example not found!"
        exit 1
    fi
else
    echo "ℹ️  .env already exists"
fi

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo "✅ Created backend/.env from backend/env.example"
    else
        echo "❌ backend/env.example not found!"
        exit 1
    fi
else
    echo "ℹ️  backend/.env already exists"
fi

# 2. Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.dev.yml down 2>/dev/null || true

# 3. Remove old volumes to ensure clean database
echo "🗑️  Removing old database volumes..."
docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true

# 4. Start fresh containers
echo "🐳 Starting fresh containers..."
docker compose -f docker-compose.dev.yml up -d

# 5. Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# 6. Check if PostgreSQL is ready
echo "🔍 Checking database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec dd-postgresql pg_isready -U postgres -d profiller_dev >/dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    else
        echo "⏳ Attempt $attempt/$max_attempts - waiting for database..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Database failed to start after $max_attempts attempts"
    echo "📋 Container logs:"
    docker compose -f docker-compose.dev.yml logs postgres
    exit 1
fi

# 7. Run migrations
echo "🔄 Running database migrations..."
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Run migrations
echo "🔄 Applying database migrations..."
npm run db:migrate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🔍 Connection details:"
echo "   Database: profiller_dev"
echo "   Host: localhost"
echo "   Port: 5433"
echo "   Username: postgres"
echo "   Password: admin"
echo ""
echo "🌐 Access points:"
echo "   PgAdmin: http://localhost:8080"
echo "   Backend: http://localhost:4040"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🛠️  Next steps:"
echo "   1. Open PgAdmin at http://localhost:8080"
echo "   2. Login with admin@admin.com / admin"
echo "   3. Add server with host 'postgres', port 5432"
echo "   4. Check that tables were created successfully"
echo ""
echo "🔧 To run more migrations:"
echo "   cd backend"
echo "   npm run db:generate  # Generate new migration"
echo "   npm run db:migrate   # Apply migrations"
echo "   npm run db:studio    # Open Drizzle Studio" 