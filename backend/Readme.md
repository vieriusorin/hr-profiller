backend/
src/
config/ # Configuration files
domain/ # Domain layer
applicant/
entities/
repositories/ (interfaces)
services/
value-objects/
application/ # Application layer
applicant/
commands/
queries/
dtos/
infrastructure/
database/
schema/ # Drizzle schema definitions
index.ts
applicants.ts
migrations/ # Generated Drizzle migrations
repositories/
drizzle-applicant.repository.ts # Drizzle implementation
index.ts # Database connection setup
http/ # HTTP-related code
interfaces/ # Interface adapters
shared/
utils/
drizzle-migrator.ts # Migration utility
index.ts # Application entry
