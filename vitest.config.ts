import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    watch: false,
    environment: 'jsdom',
    coverage: {
      thresholds: {
        '100': true,
      },
      reportsDirectory: 'tests/results',
      reporter: ['lcov', 'text', 'html'],
      include: ['src/**/*.tsx'],
      exclude: ['**/*.spec.tsx'],
    },
  },
});
