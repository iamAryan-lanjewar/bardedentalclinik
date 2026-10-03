const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5501;
const BASE_DIR = path.resolve(__dirname);

// Strict MIME type mapping with explicit character sets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Production-grade security headers applied across all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://wa.me https://api.whatsapp.com;"
};

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'OPTIONS']);
const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.json', '.txt', '.xml']);

// Sliding window Rate Limiter (Protection against DoS, Scraping & Flood)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 200; // 200 reqs/min per IP

function isRateLimited(ip) {
  const now = Date.now();
  let client = rateLimitMap.get(ip);
  if (!client || now - client.startTime > RATE_LIMIT_WINDOW) {
    client = { count: 1, startTime: now };
    rateLimitMap.set(ip, client);
    return false;
  }
  client.count++;
  if (client.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  return false;
}

// Periodic memory cleanup
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

process.on('uncaughtException', (err) => {
  console.error('[Server Notice] Handled uncaught exception safely:', err.message);
});

function createServer() {
  return http.createServer((req, res) => {
    const clientIp = req.socket.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';

    // 0. Anti-DDoS Rate Limiting
    if (isRateLimited(clientIp)) {
      res.writeHead(429, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': '60',
        ...SECURITY_HEADERS
      });
      return res.end('429 Too Many Requests: Rate limit exceeded. Please try again in 1 minute.');
    }

    // 1. Method verification
    if (!ALLOWED_METHODS.has(req.method)) {
      res.writeHead(405, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Allow': 'GET, HEAD, POST, OPTIONS',
        ...SECURITY_HEADERS
      });
      return res.end('405 Method Not Allowed');
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Allow': 'GET, HEAD, POST, OPTIONS',
        ...SECURITY_HEADERS
      });
      return res.end();
    }

    // 2. URI Length Validation (DoS/buffer overflow mitigation)
    if (req.url.length > 2048) {
      res.writeHead(414, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('414 URI Too Long');
    }

    // 3. URI Decoding & Sanitization
    let decodedUrl = '';
    try {
      decodedUrl = decodeURI(req.url.split('?')[0]);
    } catch {
      res.writeHead(400, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('400 Bad Request: Malformed URI');
    }

    // Strip null bytes and normalize
    const sanitizedUrl = decodedUrl.replace(/\0/g, '');
    let relativePath = path.normalize(sanitizedUrl).replace(/^(\.\.[\/\\])+/, '');
    if (relativePath === '/' || relativePath === '\\' || relativePath === '.') {
      relativePath = 'index.html';
    }

    // 4. Path Traversal & Sandbox Verification
    const resolvedPath = path.resolve(path.join(BASE_DIR, relativePath));
    if (!resolvedPath.startsWith(BASE_DIR)) {
      res.writeHead(403, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('403 Forbidden: Access Denied');
    }

    // Block hidden files or system/source-control files
    const baseName = path.basename(resolvedPath);
    if (baseName.startsWith('.') || baseName.endsWith('.log') || baseName.endsWith('.jsonl')) {
      res.writeHead(403, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('403 Forbidden');
    }

    // 5. File Resolution, Caching & Fast Delivery
    fs.stat(resolvedPath, (err, stats) => {
      if (err) {
        res.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
          ...SECURITY_HEADERS
        });
        return res.end('404 Not Found');
      }

      let targetFile = resolvedPath;
      if (stats.isDirectory()) {
        targetFile = path.join(resolvedPath, 'index.html');
      }

      const ext = path.extname(targetFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Generate ETag from file size and mtime
      const etag = `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;
      const ifNoneMatch = req.headers['if-none-match'];

      // Cache-Control strategy
      let cacheControl = 'no-cache';
      if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.ttf', '.woff', '.woff2'].includes(ext)) {
        cacheControl = 'public, max-age=31536000, immutable';
      } else if (['.css', '.js'].includes(ext)) {
        cacheControl = 'public, max-age=86400, stale-while-revalidate=604800';
      } else if (['.html', '.xml', '.txt'].includes(ext)) {
        cacheControl = 'public, max-age=0, must-revalidate';
      }

      // Check client cache validation (304 Not Modified)
      if (ifNoneMatch && ifNoneMatch === etag) {
        res.writeHead(304, {
          'ETag': etag,
          'Cache-Control': cacheControl,
          ...SECURITY_HEADERS
        });
        return res.end();
      }

      fs.readFile(targetFile, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8',
            ...SECURITY_HEADERS
          });
          return res.end('500 Server Error');
        }

        if (req.method === 'HEAD') {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': content.length,
            'ETag': etag,
            'Cache-Control': cacheControl,
            ...SECURITY_HEADERS
          });
          return res.end();
        }

        // Gzip / Deflate compression for compressible text assets
        const acceptEncoding = req.headers['accept-encoding'] || '';
        const shouldCompress = COMPRESSIBLE_EXTS.has(ext) && content.length > 256;

        if (shouldCompress && /\bgzip\b/.test(acceptEncoding)) {
          zlib.gzip(content, { level: 6 }, (gzErr, compressed) => {
            if (gzErr) {
              res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': content.length,
                'ETag': etag,
                'Cache-Control': cacheControl,
                ...SECURITY_HEADERS
              });
              return res.end(content);
            }
            res.writeHead(200, {
              'Content-Type': contentType,
              'Content-Encoding': 'gzip',
              'Content-Length': compressed.length,
              'Vary': 'Accept-Encoding',
              'ETag': etag,
              'Cache-Control': cacheControl,
              ...SECURITY_HEADERS
            });
            res.end(compressed);
          });
        } else if (shouldCompress && /\bdeflate\b/.test(acceptEncoding)) {
          zlib.deflate(content, (defErr, compressed) => {
            if (defErr) {
              res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': content.length,
                'ETag': etag,
                'Cache-Control': cacheControl,
                ...SECURITY_HEADERS
              });
              return res.end(content);
            }
            res.writeHead(200, {
              'Content-Type': contentType,
              'Content-Encoding': 'deflate',
              'Content-Length': compressed.length,
              'Vary': 'Accept-Encoding',
              'ETag': etag,
              'Cache-Control': cacheControl,
              ...SECURITY_HEADERS
            });
            res.end(compressed);
          });
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': content.length,
            'ETag': etag,
            'Cache-Control': cacheControl,
            ...SECURITY_HEADERS
          });
          res.end(content);
        }
      });
    });
  });
}

function startServer(port, maxAttempts = 10) {
  const server = createServer();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Notice] Port ${port} occupied.`);
      if (maxAttempts > 1) {
        startServer(port + 1, maxAttempts - 1);
      } else {
        console.error('[Error] No open port found.');
      }
    } else {
      console.error('[Server Error]', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`🛡️ Barde Dental Clinic Protected High-Speed Server Active!`);
    console.log(`➜ Local:   http://localhost:${port}/`);
    console.log(`🛡️ Protection: Rate Limiting, CSP Frame Shield, Anti-Traversal`);
    console.log(`⚡ Speed:      Gzip/Deflate Compression, ETag Validation`);
    console.log(`========================================\n`);
  });
}

startServer(DEFAULT_PORT);
