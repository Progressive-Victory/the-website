// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([globalIgnores([".config/*", "./src/components/wp-*"])]);