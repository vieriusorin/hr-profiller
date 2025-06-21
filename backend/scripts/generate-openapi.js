#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate OpenAPI JSON specification for tRPC integration
 * This script exports the OpenAPI spec to a JSON file that can be used by:
 * - Frontend for type generation
 * - tRPC for contract validation
 * - API documentation tools
 * - Client SDK generation
 */

async function generateOpenAPISpec() {
  try {
    // Import the swagger configuration dynamically
    const { swaggerSpec } = require('../dist/src/infrastructure/swagger/swagger.config');

    const OUTPUT_DIR = path.join(process.cwd(), 'generated');
    const OUTPUT_FILE = path.join(OUTPUT_DIR, 'openapi.json');

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Generate the OpenAPI specification
    const spec = JSON.stringify(swaggerSpec, null, 2);

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, spec, 'utf8');

    console.log('✅ OpenAPI specification generated successfully!');
    console.log(`📁 Output file: ${OUTPUT_FILE}`);

    // Get counts
    const schemasCount = swaggerSpec.components?.schemas
      ? Object.keys(swaggerSpec.components.schemas).length
      : 0;
    const pathsCount = swaggerSpec.paths ? Object.keys(swaggerSpec.paths).length : 0;

    console.log(`📊 Schemas: ${schemasCount}`);
    console.log(`🛣️  Paths: ${pathsCount}`);

    // Print schema summary
    if (swaggerSpec.components?.schemas) {
      console.log('\n📋 Available Schemas:');
      Object.keys(swaggerSpec.components.schemas).forEach(schema => {
        console.log(`   - ${schema}`);
      });
    }

    console.log('\n🔗 Next steps for tRPC integration:');
    console.log('   1. Use this OpenAPI spec to generate TypeScript types');
    console.log('   2. Import types in your tRPC procedures');
    console.log('   3. Share types between backend and frontend');
    console.log('   4. Use tools like openapi-typescript for type generation');
    console.log('   5. Example: npx openapi-typescript generated/openapi.json -o types/api.ts');
  } catch (error) {
    console.error('❌ Error generating OpenAPI specification:', error);
    console.error('💡 Make sure to build the project first: npm run build');
    process.exit(1);
  }
}

// Run the generation
generateOpenAPISpec();
