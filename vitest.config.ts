import { defineConfig } from 'vitest/config'
//import react from '@vitejs/plugin-react'

export default defineConfig({
  //plugins: [react()],
  test: {
    pool: 'threads',
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