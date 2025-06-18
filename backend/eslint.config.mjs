import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts, tsx}"],
    rules: {
      "no-console": "warn",
      '@typescript-eslint/no-explicit-any': 'off', // Turn off the any type restriction
      '@typescript-eslint/no-require-imports': 'off', // Allow require() style imports
    },
    ignores: ['node_modules', 'dist', 'migrations', 'db/**/*'],
  },
]);
