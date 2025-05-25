import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import tsParser from "@typescript-eslint/parser"
import tailwind from "eslint-plugin-tailwindcss";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

export default defineConfig([
    js.configs.recommended,
    {
      extends: [
        ts.configs.strictTypeChecked,
        ts.configs.stylisticTypeChecked
      ],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-enum-comparison":"off"
      }
    },
    compat.extends('next/core-web-vitals', 'next/typescript'),
    {
      extends:[tailwind.configs['flat/recommended']],
      rules:{
        "tailwindcss/no-custom-classname": "off",
      }
    }
    ,
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
    {
      files:["**/*.{js,mjs}"],
      extends:[ts.configs.disableTypeChecked]
    },
]);
