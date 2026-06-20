/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig as testConfig } from 'vitest/config'
import { defineConfig } from 'vite'

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

export default {
    ...config,
    ...tstConfig
}
