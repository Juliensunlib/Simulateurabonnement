import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pvgis': {
        target: 'https://re.jrc.ec.europa.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pvgis/, '/api/v5_2'),
        secure: true,
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
