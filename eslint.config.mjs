import { FlatCompat } from '@eslint/eslintrc'
import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import tailwind from "eslint-plugin-tailwindcss";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

export default ts.config([
    js.configs.recommended,
    ts.configs.strict,
    ts.configs.stylistic,
    compat.extends('next/core-web-vitals', 'next/typescript'),
    tailwind.configs['flat/recommended'],
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
]);
