const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

function getCacheHeaders(urlPath, ext) {
  // 1. Immutable content-hashed assets (assets/dist/*) -> 1 year cache
  if (urlPath.startsWith('/assets/dist/')) {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable'
    };
  }

  // 2. HTML entry points -> Must revalidate on every request (0s max-age + ETag)
  if (ext === '.html' || urlPath === '/' || !ext) {
    return {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Pragma': 'no-cache'
    };
  }

  // 3. Fallback unversioned assets -> Revalidate daily
  return {
    'Cache-Control': 'public, max-age=86400, must-revalidate'
  };
}

function serveErrorPage(res, statusCode, fallbackText) {
  const pageFile = statusCode === 404 ? '404.html' : '500.html';
  const pagePath = path.join(ROOT_DIR, pageFile);

  fs.readFile(pagePath, (err, content) => {
    if (err) {
      res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(fallbackText);
      return;
    }

    res.writeHead(statusCode, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': content.length,
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Pragma': 'no-cache'
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/') {
      pathname = '/index.html';
    }

    let filePath = path.join(ROOT_DIR, pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Check if appending .html works
        if (!path.extname(filePath)) {
          const htmlPath = filePath + '.html';
          if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
            filePath = htmlPath;
          } else {
            serveErrorPage(res, 404, '404 Not Found');
            return;
          }
        } else {
          serveErrorPage(res, 404, '404 Not Found');
          return;
        }
      }

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          serveErrorPage(res, 500, '500 Internal Server Error');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Calculate ETag
        const etag = `"${crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)}"`;
        const lastModified = stats.mtime.toUTCString();

        const cacheHeaders = getCacheHeaders(pathname, ext);

        // Check conditional request headers for HTTP 304 Not Modified
        const ifNoneMatch = req.headers['if-none-match'];
        const ifModifiedSince = req.headers['if-modified-since'];

        if (ifNoneMatch && ifNoneMatch === etag) {
          res.writeHead(304, {
            'ETag': etag,
            'Last-Modified': lastModified,
            ...cacheHeaders
          });
          res.end();
          console.log(`[304 Not Modified] ${req.method} ${pathname}`);
          return;
        }

        if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
          res.writeHead(304, {
            'ETag': etag,
            'Last-Modified': lastModified,
            ...cacheHeaders
          });
          res.end();
          console.log(`[304 Not Modified] ${req.method} ${pathname}`);
          return;
        }

        // Serve full response (200 OK)
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': content.length,
          'ETag': etag,
          'Last-Modified': lastModified,
          ...cacheHeaders
        });

        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(content);
        }

        console.log(`[200 OK] ${req.method} ${pathname} (${contentType}, Cache-Control: ${cacheHeaders['Cache-Control']})`);
      });
    });
  } catch (globalErr) {
    console.error('[Server Error]', globalErr);
    serveErrorPage(res, 500, '500 Internal Server Error');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n⚡ Vistaraz Production Server running at http://localhost:${PORT}`);
    console.log(`⚡ Serving with RFC 9111 HTTP Split Cache Policies (ETag, 304, immutable)\n`);
  });
}

module.exports = server;
