import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

// One file, kachelwerk.js, as HACS installs it: the cards with their
// styles, icons and Preact, no further requests at runtime
export default defineConfig({
  define: { __VERSION__: JSON.stringify(version) },
  plugins: [
    preact(),
    tailwindcss(),
    Icons({ compiler: 'jsx', jsx: 'preact', scale: 0 }),
  ],
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'kachelwerk.js',
    },
    rolldownOptions: { output: { codeSplitting: false } },
    outDir: 'dist',
    target: 'es2022',
  },
  server: { host: '0.0.0.0', port: 4210 },
});
