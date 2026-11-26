import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// O build gera UM arquivo (dist/index.html) com JS, CSS e escudos embutidos,
// que abre com duplo clique — sem servidor. A pasta public/images é copiada para dist/images.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 4000 },
  test: { environment: 'node' }
});
