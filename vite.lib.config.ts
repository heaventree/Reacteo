import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/seo/index.ts'),
      name: 'Reacteo',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    outDir: 'dist/lib',
    rollupOptions: {
      external: ['react', 'react-dom', 'react-helmet-async', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-helmet-async': 'ReactHelmetAsync',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});
