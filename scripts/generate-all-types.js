#!/usr/bin/env node

/**
 * Generate All Frontend Types
 *
 * This script generates all frontend types from the backend:
 * 1. OpenAPI types from the backend API
 * 2. Enum types from the backend database enums
 *
 * This ensures a single source of truth for all types.
 */

const { execSync } = require("child_process");
const path = require("path");
const { generateFrontendTypes } = require("./generate-frontend-types.js");

console.log("🚀 Starting unified type generation...\n");

/**
 * Execute command and handle errors
 */
function executeCommand(command, description, cwd = process.cwd()) {
	console.log(`📋 ${description}...`);
	try {
		execSync(command, {
			stdio: "inherit",
			cwd,
			encoding: "utf8",
		});
		console.log(`✅ ${description} completed\n`);
	} catch (error) {
		console.error(`❌ ${description} failed:`, error.message);
		process.exit(1);
	}
}

/**
 * Main function to generate all types
 */
async function generateAllTypes() {
	const backendDir = path.join(__dirname, "../backend");
	const frontendDir = path.join(__dirname, "../frontend");

	try {
		// Step 1: Generate OpenAPI schema from backend
		console.log("🔄 Step 1: Generating OpenAPI schema from backend...");
		executeCommand(
			"npm run openapi:generate",
			"Backend OpenAPI generation",
			backendDir
		);

		// Step 2: Generate frontend OpenAPI types
		console.log("🔄 Step 2: Generating frontend OpenAPI types...");
		executeCommand(
			"npm run types:generate",
			"Frontend OpenAPI types generation",
			frontendDir
		);

		// Step 3: Generate enum types from database
		console.log("🔄 Step 3: Generating enum types from database...");
		await generateFrontendTypes();

		console.log("🎉 All type generation completed successfully!");
		console.log("\n📊 Summary:");
		console.log("  ✅ OpenAPI types generated from backend API");
		console.log("  ✅ Enum types generated from backend database");
		console.log("  ✅ Frontend types are now in sync with backend\n");
	} catch (error) {
		console.error("❌ Type generation failed:", error);
		process.exit(1);
	}
}

// Run the script
if (require.main === module) {
	generateAllTypes();
}

module.exports = { generateAllTypes };
