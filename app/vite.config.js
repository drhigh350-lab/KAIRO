import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app imports KairoEngine straight from ../src (the real engine package)
// rather than a published dependency — fs.allow widens Vite's dev-server
// file access to the repo root so that import resolves.
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] }
  }
});
