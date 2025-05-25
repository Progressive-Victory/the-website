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
    ts.configs.strictTypeChecked,
    ts.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    compat.extends('next/core-web-vitals', 'next/typescript'),
    tailwind.configs['flat/recommended'],
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
    {
      plugins: {tailwind},
      rules: {
        "tailwindcss/no-custom-classname": "off",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn"
      }
    },
    {
      files:["**/*.tsx"],
      rules: {
        "@typescript-eslint/no-misused-promises": 'off'
      }
    }
]);
