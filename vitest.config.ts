import { defineConfig } from 'vitest/config'
//import react from '@vitejs/plugin-react'

export default defineConfig({
  //plugins: [react()],
  test: {
    pool: 'threads',
    coverage: {
      provider: "v8",                  // or "istanbul"
      reporter: ["text", "html", "lcov"], // CLI + HTML + lcov
      reportsDirectory: "./coverage",
      enabled: false,                  // enable via CLI by default
    },
    projects: [
      {
        // will inherit options from this config like plugins and pool
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          exclude: [
            'src/**/*.integration.test.ts',
            "node_modules/**",
          ],
        },
      },
      {
        // won't inherit any options from this config
        // this is the default behaviour
        //extends: false,
        test: {
          name: 'integration',
          include: ['src/**/*.integration.test.ts'],
          exclude: ["node_modules/**"],
        },
      },
    ],
  },
})

// pnpm vitest --project unit
// pnpm vitest --project integration