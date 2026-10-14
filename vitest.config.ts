import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// The build's plugins (Preact, Tailwind, icons) for the tests too; only src, the Playwright
// tests in tests/ run with npm run test:e2e
export default mergeConfig(viteConfig, defineConfig({ test: { include: ['src/**/*.test.ts'] } }));
