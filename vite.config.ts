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
            console.log('Loading API route for:', req.url);
            
            // Convert URL to filesystem path
            const urlPath = req.url.endsWith('/') ? req.url.slice(0, -1) : req.url;
            const routePath = urlPath.replace(/^\/api/, '');
            
            // Try both .ts and .js extensions
            const possiblePaths = [
              path.join(process.cwd(), 'src/pages/api', routePath + '.ts'),
              path.join(process.cwd(), 'src/pages/api', routePath + '.js'),
              path.join(process.cwd(), 'src/pages/api', routePath, 'index.ts'),
              path.join(process.cwd(), 'src/pages/api', routePath, 'index.js')
            ];

            let module;
            for (const modulePath of possiblePaths) {
              try {
                console.log('Trying to load:', modulePath);
                module = await server.ssrLoadModule(modulePath);
                console.log('Successfully loaded:', modulePath);
                break;
              } catch (e) {
                console.log('Failed to load:', modulePath);
                continue;
              }
            }

            if (!module?.default) {
              console.error('No API route found for:', req.url);
              res.statusCode = 404;
              res.end(JSON.stringify({ 
                error: 'API route not found',
                details: `No handler found for ${req.url}`
              }));
              return;
            }

            console.log('Executing API handler for:', req.url);
            const handler = module.default;
            await handler(req, res);
          } catch (error) {
            console.error('API route error:', {
              url: req.url,
              error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
              } : String(error)
            });
            
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
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
