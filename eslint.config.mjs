import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import {flatConfig as pluginNext}  from '@next/eslint-plugin-next';

export default defineConfig([
  globalIgnores([".config/*", "./src/components/wp-includes/**/*", "./src/components/wp-content/**/*"]),
  pluginNext.coreWebVitals,
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
]);
