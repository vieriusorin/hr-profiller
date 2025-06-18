#!/bin/bash

# Development startup script for Profiller HR
set -e

echo "🚀 Starting development environment..."

# Copy development environment file
if [ -f "env.development.example" ]; then
    if [ ! -f ".env" ]; then
        cp env.development.example .env
        echo "✅ Copied env.development.example to .env"
    else
        echo "ℹ️  Using existing .env file"
    fi
else
    echo "⚠️  env.development.example not found, using existing .env or defaults"
fi

# Copy backend environment file
if [ -f "backend/env.example" ]; then
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        echo "✅ Copied backend/env.example to backend/.env"
    else
        echo "ℹ️  Using existing backend/.env file"
    fi
fi

# Start development containers
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if containers are running
echo "📊 Checking container status..."
docker compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:4040"
echo "🗄️ PgAdmin: http://localhost:8080"
echo ""
echo "🔧 To run database migrations:"
echo "   cd backend"
echo "   npm run db:migrate"
echo ""
echo "🏥 Health checks:"
echo "   Frontend: http://localhost:3000/api/health"
echo "   Backend: http://localhost:4040/health"