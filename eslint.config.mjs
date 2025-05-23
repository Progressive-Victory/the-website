import { FlatCompat } from '@eslint/eslintrc'
import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import { defineConfig } from "eslint/config";
import tailwind from "eslint-plugin-tailwindcss";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

export default defineConfig([
    js.configs.recommended,
    ts.configs.recommended,
    compat.extends('next/core-web-vitals', 'next/typescript'),
    tailwind.configs['flat/recommended'],
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
]);
