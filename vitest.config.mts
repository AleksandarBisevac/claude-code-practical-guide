import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      'bun:sqlite': path.resolve(__dirname, 'test/mocks/bun-sqlite.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    mockReset: true,
  },
});
