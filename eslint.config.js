import js from '@eslint/js'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import tailwind from 'eslint-plugin-tailwindcss'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    ...nextCoreWebVitals,
    ...nextTypescript,
    ...tailwind.configs['flat/recommended'],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // Show stoppers
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',

            // Keep track of
            'object-shorthand': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
            'react-hooks/set-state-in-effect': 'warn', // Should go back to (default) error when current set are dealt with
            'tailwindcss/no-custom-classname': 'off',

            // React Compiler rules (for testing)
            'react-hooks/refs': 'warn',
            'react-hooks/immutability': 'warn',
        },
    },
    {
        files: ['**/*.{js,mjs}'],
        extends: [tseslint.configs.disableTypeChecked],
    },
    eslintConfigPrettier,
])
