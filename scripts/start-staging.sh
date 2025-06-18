dev:
    cp .env.staging .env
    docker compose -f docker-compose.staging.yml up -d