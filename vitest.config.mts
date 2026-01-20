import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [tsconfigPaths(), react(), nodePolyfills()],
    test: {
        environment: 'jsdom',
        setupFiles: ['vitest.setup.ts'],
    },
})
