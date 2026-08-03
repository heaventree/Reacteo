import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Two entries: the default one is browser-safe, `server` carries the
      // Node-only sitemap generator.
      entry: {
        index: resolve(__dirname, 'src/lib/seo/index.ts'),
        server: resolve(__dirname, 'src/lib/seo/server.ts'),
      },
      name: 'Reacteo',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    outDir: 'dist/lib',
    rollupOptions: {
      // Peers and runtime dependencies stay external so consumers resolve a
      // single copy — bundling react-helmet-async in particular would give the
      // library its own HelmetProvider context and silently drop head tags.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-helmet-async',
        'sitemap',
        '@supabase/supabase-js',
        'lucide-react',
      ],
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
