#!/bin/bash

# Production Manager Script for Profiller HR
# Comprehensive production environment management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Function to show help
show_help() {
    echo -e "${BLUE}🚀 Profiller HR Production Manager${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Usage: $0 <command> [options]${NC}"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "  ${GREEN}start${NC}      Start production environment"
    echo -e "  ${GREEN}stop${NC}       Stop production environment"
    echo -e "  ${GREEN}restart${NC}    Restart production environment"
    echo -e "  ${GREEN}status${NC}     Show status of all services"
    echo -e "  ${GREEN}logs${NC}       Show logs (use with service name: logs frontend)"
    echo -e "  ${GREEN}health${NC}     Check health of all services"
    echo -e "  ${GREEN}build${NC}      Build production images"
    echo -e "  ${GREEN}deploy${NC}     Full deployment (build + start)"
    echo -e "  ${GREEN}backup${NC}     Backup database and volumes"
    echo -e "  ${GREEN}restore${NC}    Restore from backup"
    echo -e "  ${GREEN}clean${NC}      Clean up unused resources"
    echo -e "  ${GREEN}update${NC}     Update images and restart"
    echo -e "  ${GREEN}shell${NC}      Open shell in service (use with service name: shell frontend)"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  $0 start                 # Start production environment"
    echo -e "  $0 logs frontend         # Show frontend logs"
    echo -e "  $0 shell backend         # Open shell in backend container"
    echo -e "  $0 deploy                # Full deployment"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}❌ $COMPOSE_FILE not found${NC}"
        exit 1
    fi
}

# Function to start production
cmd_start() {
    echo -e "${BLUE}🚀 Starting production environment...${NC}"
    bash scripts/start-prod.sh
}

# Function to stop production
cmd_stop() {
    echo -e "${BLUE}🛑 Stopping production environment...${NC}"
    bash scripts/stop-prod.sh
}

# Function to restart production
cmd_restart() {
    echo -e "${BLUE}🔄 Restarting production environment...${NC}"
    cmd_stop
    sleep 2
    cmd_start
}

# Function to show status
cmd_status() {
    echo -e "${BLUE}📊 Production Environment Status${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services Status:${NC}"
        docker-compose -f "$COMPOSE_FILE" ps
        echo ""
        
        echo -e "${BLUE}🔗 Network Information:${NC}"
        docker network ls | grep profiller || echo "No profiller networks found"
        echo ""
        
        echo -e "${BLUE}💾 Volume Information:${NC}"
        docker volume ls | grep profiller || echo "No profiller volumes found"
        echo ""
        
        echo -e "${BLUE}🏥 Health Status:${NC}"
        for service in frontend backend postgres redis; do
            if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$service"; then
                health=$(docker inspect --format='{{.State.Health.Status}}' "$(docker-compose -f "$COMPOSE_FILE" ps -q $service 2>/dev/null)" 2>/dev/null || echo "no-healthcheck")
                if [ "$health" = "healthy" ]; then
                    echo -e "  ${service}: ${GREEN}healthy${NC}"
                elif [ "$health" = "unhealthy" ]; then
                    echo -e "  ${service}: ${RED}unhealthy${NC}"
                else
                    echo -e "  ${service}: ${YELLOW}${health}${NC}"
                fi
            fi
        done
    else
        echo -e "${YELLOW}⚠️  No production services are currently running${NC}"
    fi
}

# Function to show logs
cmd_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}📋 Showing logs for all services...${NC}"
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100
    else
        echo -e "${BLUE}📋 Showing logs for $service...${NC}"
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "$service"
    fi
}

# Function to check health
cmd_health() {
    echo -e "${BLUE}🏥 Checking service health...${NC}"
    echo ""
    
    # Test frontend
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✅ Frontend: healthy${NC}"
    else
        echo -e "${RED}❌ Frontend: unhealthy${NC}"
    fi
    
    # Test backend
    if curl -f -s http://localhost:4040/health > /dev/null; then
        echo -e "${GREEN}✅ Backend: healthy${NC}"
    else
        echo -e "${RED}❌ Backend: unhealthy${NC}"
    fi
    
    # Test database
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database: healthy${NC}"
    else
        echo -e "${RED}❌ Database: unhealthy${NC}"
    fi
    
    # Test redis
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis: healthy${NC}"
    else
        echo -e "${RED}❌ Redis: unhealthy${NC}"
    fi
}

# Function to build images
cmd_build() {
    echo -e "${BLUE}🏗️  Building production images...${NC}"
    
    export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
    export VCS_REF=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    export VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
    
    echo -e "${BLUE}Build metadata:${NC}"
    echo -e "  Version: $VERSION"
    echo -e "  Build Date: $BUILD_DATE"
    echo -e "  VCS Ref: $VCS_REF"
    echo ""
    
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Function to deploy
cmd_deploy() {
    echo -e "${BLUE}🚀 Full production deployment...${NC}"
    cmd_build
    cmd_start
}

# Function to backup
cmd_backup() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    
    echo -e "${BLUE}💾 Creating backup...${NC}"
    mkdir -p "$backup_dir"
    
    # Backup database
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q postgres; then
        echo -e "${YELLOW}Backing up database...${NC}"
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dumpall -c -U postgres > "$backup_dir/database.sql"
        echo -e "${GREEN}✅ Database backup created${NC}"
    fi
    
    # Backup volumes
    echo -e "${YELLOW}Backing up volumes...${NC}"
    docker run --rm -v profiller-postgres-data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .
    docker run --rm -v profiller-redis-data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/redis-data.tar.gz -C /data .
    
    echo -e "${GREEN}✅ Backup completed: $backup_dir${NC}"
}

# Function to open shell
cmd_shell() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${RED}❌ Please specify a service name${NC}"
        echo -e "${YELLOW}Available services: frontend, backend, postgres, redis${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🐚 Opening shell in $service...${NC}"
    docker-compose -f "$COMPOSE_FILE" exec "$service" sh
}

# Function to clean up
cmd_clean() {
    echo -e "${BLUE}🧹 Cleaning up unused resources...${NC}"
    
    echo -e "${YELLOW}Removing unused containers...${NC}"
    docker container prune -f
    
    echo -e "${YELLOW}Removing unused images...${NC}"
    docker image prune -f
    
    echo -e "${YELLOW}Removing unused networks...${NC}"
    docker network prune -f
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to update
cmd_update() {
    echo -e "${BLUE}🔄 Updating production environment...${NC}"
    
    # Pull latest code (if in git repo)
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${YELLOW}Pulling latest code...${NC}"
        git pull
    fi
    
    # Rebuild and restart
    cmd_build
    cmd_restart
}

# Main function
main() {
    local command=$1
    shift || true
    
    case "$command" in
        "start")
            check_prerequisites
            cmd_start "$@"
            ;;
        "stop")
            check_prerequisites
            cmd_stop "$@"
            ;;
        "restart")
            check_prerequisites
            cmd_restart "$@"
            ;;
        "status")
            check_prerequisites
            cmd_status "$@"
            ;;
        "logs")
            check_prerequisites
            cmd_logs "$@"
            ;;
        "health")
            check_prerequisites
            cmd_health "$@"
            ;;
        "build")
            check_prerequisites
            cmd_build "$@"
            ;;
        "deploy")
            check_prerequisites
            cmd_deploy "$@"
            ;;
        "backup")
            check_prerequisites
            cmd_backup "$@"
            ;;
        "shell")
            check_prerequisites
            cmd_shell "$@"
            ;;
        "clean")
            check_prerequisites
            cmd_clean "$@"
            ;;
        "update")
            check_prerequisites
            cmd_update "$@"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 