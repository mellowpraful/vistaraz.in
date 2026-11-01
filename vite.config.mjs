import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }
        try {
          const url = new URL(req.url, 'http://localhost');
          const pathname = url.pathname;

          let handlerFile = null;
          if (pathname === '/api/health') handlerFile = './api/health.js';
          else if (pathname === '/api/auth/register') handlerFile = './api/auth/register.js';
          else if (pathname === '/api/auth/login') handlerFile = './api/auth/login.js';
          else if (pathname === '/api/auth/me') handlerFile = './api/auth/me.js';
          else if (pathname === '/api/auth/logout') handlerFile = './api/auth/logout.js';
          else if (pathname === '/api/assessments') handlerFile = './api/assessments.js';
          else if (pathname === '/api/community') handlerFile = './api/community.js';
          else if (pathname === '/api/appointments') handlerFile = './api/appointments.js';
          else if (pathname === '/api/contact') handlerFile = './api/contact.js';
          else if (pathname === '/api/mood') handlerFile = './api/mood.js';

          if (handlerFile) {
            const resolved = path.resolve(__dirname, handlerFile);
            delete require.cache[require.resolve(resolved)];
            const handler = require(resolved);
            await handler(req, res);
            return;
          }
          next();
        } catch (err) {
          console.error('API Dev error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
