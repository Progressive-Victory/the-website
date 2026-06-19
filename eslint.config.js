import eslintConfigPrettier from 'eslint-config-prettier/flat'
import tailwind from 'eslint-plugin-tailwindcss'
import { defineConfig } from 'eslint/config'
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import globals from 'globals'
import tseslint from 'typescript-eslint'
import js from '@eslint/js'

export default defineConfig([{
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
}, {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
}, 
tseslint.configs.recommendedTypeChecked,
 tseslint.configs.stylisticTypeChecked,
...nextCoreWebVitals,
...nextTypescript,
...tailwind.configs['flat/recommended'], {
    languageOptions: {
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
}, {
    rules: {
        'object-shorthand': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        'tailwindcss/no-custom-classname': 'off',
        'react-hooks/set-state-in-effect': 'warn', //temp
        'react-hooks/preserve-manual-memoization': 'warn', //temp
        'react-hooks/refs': 'warn', //temp
        'react-hooks/immutability': 'warn', //temp
    },
}, {
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
}, eslintConfigPrettier])
