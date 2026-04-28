/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = dirname(fileURLToPath(import.meta.url))
const freighterMock = resolve(rootDir, 'src/tests/mocks/freighterApi.ts')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@stellar/freighter-api': freighterMock
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    server: {
      deps: {
        inline: [/@creit\.tech\/stellar-wallets-kit/]
      }
    }
  },
})
