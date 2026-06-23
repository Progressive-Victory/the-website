/// <reference types="vitest" />
/// <reference types="vite/client" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig as testConfig } from 'vitest/config'

// vite config
const config = defineConfig({
    plugins: [tsconfigPaths(), react(), nodePolyfills()],
})

const tstConfig = testConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['vitest.setup.ts'],
    },
})

const mergedConfig = {
    ...config,
    ...tstConfig,
}

export default mergedConfig
