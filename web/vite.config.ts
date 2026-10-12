import { defineConfig } from 'vite';

// Relative base + hash routing => works from any GitHub Pages sub-path.
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
