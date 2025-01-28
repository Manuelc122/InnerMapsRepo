import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// Plugin to handle API routes during development
function apiRoutes() {
  return {
    name: 'api-routes',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url?.startsWith('/api/')) {
          try {
            const urlPath = req.url.endsWith('/') ? req.url.slice(0, -1) : req.url;
            const routePath = urlPath.replace(/^\/api/, '');
            
            const possiblePaths = [
              path.join(process.cwd(), 'src/pages/api', routePath + '.ts'),
              path.join(process.cwd(), 'src/pages/api', routePath + '.js'),
              path.join(process.cwd(), 'src/pages/api', routePath, 'index.ts'),
              path.join(process.cwd(), 'src/pages/api', routePath, 'index.js')
            ];

            let module;
            for (const modulePath of possiblePaths) {
              try {
                module = await server.ssrLoadModule(modulePath);
                break;
              } catch (e) {
                continue;
              }
            }

            if (!module?.default) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'API route not found' }));
              return;
            }

            await module.default(req, res);
          } catch (error) {
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
              }));
            }
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiRoutes()],
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@heroicons/react', 'framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
