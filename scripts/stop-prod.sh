#!/bin/bash

# Production stop script for Profiller HR
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping production environment for Profiller HR...${NC}"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running${NC}"
        exit 1
    fi
}

# Function to stop production services
stop_services() {
    echo -e "${YELLOW}🔄 Stopping production containers...${NC}"
    
    if [ -f "docker-compose.production.yml" ]; then
        # Stop and remove containers
        docker-compose -f docker-compose.production.yml down
        
        echo -e "${GREEN}✅ Production containers stopped${NC}"
    else
        echo -e "${RED}❌ docker-compose.production.yml not found${NC}"
        exit 1
    fi
}

# Function to show cleanup options
show_cleanup_options() {
    echo ""
    echo -e "${BLUE}🧹 Cleanup Options:${NC}"
    echo -e "${YELLOW}1. Keep data volumes (recommended)${NC}"
    echo -e "${YELLOW}2. Remove data volumes (⚠️  DESTRUCTIVE - will delete database data)${NC}"
    echo -e "${YELLOW}3. Remove images as well${NC}"
    echo ""
    
    read -p "Choose cleanup option (1-3, or Enter for option 1): " cleanup_choice
    
    case ${cleanup_choice:-1} in
        1)
            echo -e "${GREEN}✅ Keeping data volumes${NC}"
            ;;
        2)
            echo -e "${YELLOW}⚠️  Removing data volumes...${NC}"
            docker-compose -f docker-compose.production.yml down -v
            echo -e "${GREEN}✅ Data volumes removed${NC}"
            ;;
        3)
            echo -e "${YELLOW}⚠️  Removing volumes and images...${NC}"
            docker-compose -f docker-compose.production.yml down -v --rmi all
            echo -e "${GREEN}✅ Volumes and images removed${NC}"
            ;;
        *)
            echo -e "${GREEN}✅ Keeping data volumes (default)${NC}"
            ;;
    esac
}

# Function to show system cleanup
show_system_cleanup() {
    echo ""
    echo -e "${BLUE}🧹 System Cleanup:${NC}"
    echo ""
    
    read -p "Remove unused Docker resources? (y/N): " cleanup_system
    
    if [[ $cleanup_system =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"
        docker system prune -f
        echo -e "${GREEN}✅ System cleanup completed${NC}"
    else
        echo -e "${BLUE}ℹ️  Skipping system cleanup${NC}"
    fi
}

# Function to show final status
show_final_status() {
    echo ""
    echo -e "${GREEN}🎉 Production Environment Stopped Successfully!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📊 Remaining Containers:${NC}"
    if docker ps -q | grep -q .; then
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo -e "${GREEN}   No containers running${NC}"
    fi
    echo ""
    echo -e "${BLUE}🔄 To restart production:${NC}"
    echo -e "   ${YELLOW}bash scripts/start-prod.sh${NC}"
    echo ""
    echo -e "${BLUE}🔍 To check logs (if containers still exist):${NC}"
    echo -e "   ${YELLOW}docker-compose -f docker-compose.production.yml logs${NC}"
    echo ""
}

# Main execution flow
main() {
    check_docker
    stop_services
    show_cleanup_options
    show_system_cleanup
    show_final_status
    
    echo -e "${GREEN}✅ Production stop completed!${NC}"
}

# Run main function
main "$@" 