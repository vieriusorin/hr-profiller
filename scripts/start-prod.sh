#!/bin/bash

# Production startup script for Profiller HR
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting production environment for Profiller HR...${NC}"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to check if production environment file exists
check_env_file() {
    if [ ! -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  .env.production not found${NC}"
        
        if [ -f "env.production.example" ]; then
            echo -e "${BLUE}📋 Copying env.production.example to .env.production${NC}"
            cp env.production.example .env.production
            echo -e "${YELLOW}⚠️  Please edit .env.production with your production values before continuing${NC}"
            echo -e "${YELLOW}   Required variables: DATABASE_URL, JWT_SECRET, POSTGRES_PASSWORD, etc.${NC}"
            read -p "Press Enter after configuring .env.production..."
        else
            echo -e "${RED}❌ No environment template found. Please create .env.production manually.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Found .env.production${NC}"
    fi
}

# Function to validate critical environment variables
validate_env() {
    echo -e "${YELLOW}🔍 Validating environment variables...${NC}"
    
    # Source the env file to check variables
    set -a
    source .env.production
    set +a
    
    local missing_vars=()
    
    # Check critical variables
    [ -z "$POSTGRES_PASSWORD" ] && missing_vars+=("POSTGRES_PASSWORD")
    [ -z "$JWT_SECRET" ] && missing_vars+=("JWT_SECRET")
    [ -z "$NEXTAUTH_SECRET" ] && missing_vars+=("NEXTAUTH_SECRET")
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo -e "${YELLOW}Please set these variables in .env.production${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Environment variables validated${NC}"
}

# Function to build production images if needed
build_if_needed() {
    echo -e "${YELLOW}🏗️  Checking if images need to be built...${NC}"
    
    # Check if production images exist
    if ! docker images | grep -q "profiller.*production"; then
        echo -e "${BLUE}📦 Production images not found. Building...${NC}"
        
        # Set build variables
        export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
        export VCS_REF=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
        export VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
        
        echo -e "${BLUE}Building with:${NC}"
        echo -e "  Version: ${VERSION}"
        echo -e "  Build Date: ${BUILD_DATE}"
        echo -e "  VCS Ref: ${VCS_REF}"
        
        # Build production images
        docker-compose -f docker-compose.production.yml build
        
        echo -e "${GREEN}✅ Production images built successfully${NC}"
    else
        echo -e "${GREEN}✅ Production images already exist${NC}"
    fi
}

# Function to start production services
start_services() {
    echo -e "${YELLOW}🐳 Starting production containers...${NC}"
    
    # Export build variables for docker-compose
    export BUILD_DATE=${BUILD_DATE:-$(date -u +'%Y-%m-%dT%H:%M:%SZ')}
    export VCS_REF=${VCS_REF:-$(git rev-parse HEAD 2>/dev/null || echo "unknown")}
    export VERSION=${VERSION:-$(git rev-parse --short HEAD 2>/dev/null || echo "latest")}
    
    # Start services with production compose file
    docker-compose -f docker-compose.production.yml --env-file .env.production up -d
    
    echo -e "${GREEN}✅ Production containers started${NC}"
}

# Function to wait for services to be healthy
wait_for_health() {
    echo -e "${YELLOW}🏥 Waiting for services to be healthy...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local healthy_count=0
        local total_services=0
        
        # Check each service health
        for service in frontend backend postgres; do
            total_services=$((total_services + 1))
            if docker-compose -f docker-compose.production.yml ps | grep -q "${service}.*healthy"; then
                healthy_count=$((healthy_count + 1))
            fi
        done
        
        echo -e "${BLUE}Health check attempt ${attempt}/${max_attempts}: ${healthy_count}/${total_services} services healthy${NC}"
        
        if [ $healthy_count -eq $total_services ]; then
            echo -e "${GREEN}✅ All services are healthy!${NC}"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo -e "${YELLOW}⚠️  Some services may not be fully healthy yet. Check logs if needed.${NC}"
}

# Function to test endpoints
test_endpoints() {
    echo -e "${YELLOW}🧪 Testing application endpoints...${NC}"
    
    # Test frontend health
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✅ Frontend health check passed${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
    fi
    
    # Test backend health
    if curl -f -s http://localhost:4040/health > /dev/null; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend health check failed (endpoint may need implementation)${NC}"
    fi
}

# Function to show production info
show_production_info() {
    echo ""
    echo -e "${GREEN}🎉 Production Environment Started Successfully!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📱 Application URLs:${NC}"
    echo -e "   Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo -e "   Backend:   ${GREEN}http://localhost:4040${NC}"
    echo -e "   PgAdmin:   ${GREEN}http://localhost:8080${NC} (if enabled)"
    echo ""
    echo -e "${BLUE}🏥 Health Check URLs:${NC}"
    echo -e "   Frontend:  ${GREEN}http://localhost:3000/api/health${NC}"
    echo -e "   Backend:   ${GREEN}http://localhost:4040/health${NC}"
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo -e "   View logs:     ${YELLOW}docker-compose -f docker-compose.production.yml logs -f${NC}"
    echo -e "   Stop services: ${YELLOW}docker-compose -f docker-compose.production.yml down${NC}"
    echo -e "   Restart:       ${YELLOW}bash scripts/start-prod.sh${NC}"
    echo ""
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    echo -e "${GREEN}🚀 Production environment is ready!${NC}"
}

# Main execution flow
main() {
    echo -e "${BLUE}Starting production deployment pipeline...${NC}"
    
    check_docker
    check_env_file
    validate_env
    build_if_needed
    start_services
    wait_for_health
    test_endpoints
    show_production_info
    
    echo -e "${GREEN}✅ Production startup completed successfully!${NC}"
}

# Run main function
main "$@"