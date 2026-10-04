const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5501;
const BASE_DIR = path.resolve(__dirname);

// Strict whitelist of public MIME types for dental clinic assets
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

// Strict list of protected files that must NEVER be served to any client
const BLOCKED_FILES = new Set([
  'server.js',
  'package.json',
  'package-lock.json',
  'optimize-images.js',
  'test_btn_align.js',
  'test_btn_glow.js',
  '.gitignore',
  'robots.txt.bak'
]);

// Blocked file extensions (source code, secrets, logs, binaries)
const BLOCKED_EXTENSIONS = new Set([
  '.env', '.log', '.jsonl', '.md', '.bak', '.zip', '.tmp', 
  '.sh', '.bat', '.cmd', '.ps1', '.py', '.php', '.sql', '.exe'
]);

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

// Only GET, HEAD, OPTIONS are permitted for this static clinic website
const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
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
  return client.count > MAX_REQUESTS_PER_WINDOW;
}

// Periodic rate-limit memory cleanup
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

process.on('uncaughtException', (err) => {
  console.error('[Security Notice] Safely caught uncaught exception:', err.message);
});

function createServer() {
  const server = http.createServer((req, res) => {
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

    // 1. Method verification (Strict HTTP Method Enforcement)
    if (!ALLOWED_METHODS.has(req.method)) {
      res.writeHead(405, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Allow': 'GET, HEAD, OPTIONS',
        ...SECURITY_HEADERS
      });
      return res.end('405 Method Not Allowed');
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Allow': 'GET, HEAD, OPTIONS',
        ...SECURITY_HEADERS
      });
      return res.end();
    }

    // 2. URI Length Validation (DoS/buffer overflow mitigation)
    if (req.url.length > 1024) {
      res.writeHead(414, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('414 URI Too Long');
    }

    // 3. URI Decoding & Sanitization
    let decodedUrl = '';
    try {
      decodedUrl = decodeURIComponent(req.url.split('?')[0]);
    } catch {
      res.writeHead(400, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('400 Bad Request: Malformed URI');
    }

    // 3b. Intercept any lingering "interior website" links/caches & clear them
    const lowerUrl = decodedUrl.toLowerCase();
    if (lowerUrl.includes('interior')) {
      // Clear legacy browser cache and redirect directly to dental home page
      res.writeHead(301, {
        'Location': '/',
        'Clear-Site-Data': '"cache", "storage"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...SECURITY_HEADERS
      });
      return res.end();
    }

    // Dedicated cache-wipe route for instant local reset
    if (lowerUrl === '/clear-cache' || lowerUrl === '/purge-cache') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Clear-Site-Data': '"cache", "storage"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...SECURITY_HEADERS
      });
      return res.end('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="1;url=/"></head><body><h3>Browser cache cleared! Redirecting to Barde Dental Clinic...</h3><script>if(window.caches)caches.keys().then(k=>k.forEach(n=>caches.delete(n)));if(navigator.serviceWorker)navigator.serviceWorker.getRegistrations().then(r=>r.forEach(w=>w.unregister()));setTimeout(()=>location.href="/",600);</script></body></html>');
    }

    // Strip null bytes and illegal characters
    const sanitizedUrl = decodedUrl.replace(/\0/g, '');
    
    // Strip all leading drive letters, slashes, backslashes, and path traversal tokens
    let cleanedRelPath = sanitizedUrl
      .replace(/^([a-zA-Z]:|[\\/])+/, '')
      .replace(/(\.\.[\/\\])+/g, '')
      .replace(/\.\./g, '');

    if (!cleanedRelPath || cleanedRelPath === '.' || cleanedRelPath === '/' || cleanedRelPath === '\\') {
      cleanedRelPath = 'index.html';
    }

    // 4. Strict Windows Sandbox Verification
    const resolvedPath = path.resolve(BASE_DIR, cleanedRelPath);
    const normalizedBase = path.normalize(BASE_DIR).toLowerCase();
    const normalizedTarget = path.normalize(resolvedPath).toLowerCase();

    // Verify resolved target is strictly inside BASE_DIR
    const isInsideBase = normalizedTarget === normalizedBase || normalizedTarget.startsWith(normalizedBase + path.sep);
    if (!isInsideBase) {
      res.writeHead(403, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('403 Forbidden: Directory traversal blocked');
    }

    // 5. Block sensitive files, hidden directories, and source files
    const baseName = path.basename(resolvedPath).toLowerCase();
    const extName = path.extname(resolvedPath).toLowerCase();

    if (
      baseName.startsWith('.') ||
      BLOCKED_FILES.has(baseName) ||
      BLOCKED_EXTENSIONS.has(extName) ||
      normalizedTarget.includes(path.sep + 'node_modules' + path.sep) ||
      normalizedTarget.includes(path.sep + '.git' + path.sep)
    ) {
      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...SECURITY_HEADERS
      });
      return res.end('404 Not Found');
    }

    // 6. Canonical Filesystem Verification (Resolve any Windows symlinks/8.3 paths)
    fs.realpath(resolvedPath, (rpErr, canonicalPath) => {
      const targetPath = (rpErr || !canonicalPath) ? resolvedPath : canonicalPath;
      const normalizedCanonical = path.normalize(targetPath).toLowerCase();

      if (!normalizedCanonical.startsWith(normalizedBase)) {
        res.writeHead(403, {
          'Content-Type': 'text/plain; charset=utf-8',
          ...SECURITY_HEADERS
        });
        return res.end('403 Forbidden');
      }

      fs.stat(targetPath, (statErr, stats) => {
        if (statErr) {
          res.writeHead(404, {
            'Content-Type': 'text/plain; charset=utf-8',
            ...SECURITY_HEADERS
          });
          return res.end('404 Not Found');
        }

        let finalFile = targetPath;
        if (stats.isDirectory()) {
          finalFile = path.join(targetPath, 'index.html');
        }

        const finalExt = path.extname(finalFile).toLowerCase();
        
        // Strict MIME Whitelist enforcement: only serve recognized web assets
        if (!MIME_TYPES[finalExt]) {
          res.writeHead(404, {
            'Content-Type': 'text/plain; charset=utf-8',
            ...SECURITY_HEADERS
          });
          return res.end('404 Not Found');
        }

        const contentType = MIME_TYPES[finalExt];

        // Generate ETag from file size and mtime
        const etag = `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;
        const ifNoneMatch = req.headers['if-none-match'];

        // Strict No-Cache for development to prevent stale assets
        const cacheControl = 'no-cache, no-store, must-revalidate';

        // Check client cache validation (304 Not Modified)
        if (ifNoneMatch && ifNoneMatch === etag) {
          res.writeHead(304, {
            'ETag': etag,
            'Cache-Control': cacheControl,
            ...SECURITY_HEADERS
          });
          return res.end();
        }

        fs.readFile(finalFile, (readErr, content) => {
          if (readErr) {
            res.writeHead(404, {
              'Content-Type': 'text/plain; charset=utf-8',
              ...SECURITY_HEADERS
            });
            return res.end('404 Not Found');
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
          const shouldCompress = COMPRESSIBLE_EXTS.has(finalExt) && content.length > 256;

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
  });

  // Strict Request Timeouts to prevent Slowloris / connection exhaustion
  server.requestTimeout = 10000;
  server.headersTimeout = 12000;
  server.keepAliveTimeout = 5000;

  return server;
}

function startServer(port, maxAttempts = 5) {
  const server = createServer();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Security Alert] Port ${port} is occupied. Attempting port ${port + 1}...`);
      if (maxAttempts > 1) {
        startServer(port + 1, maxAttempts - 1);
      } else {
        console.error('[Fatal Error] Unable to bind to an available port.');
      }
    } else {
      console.error('[Server Error]', err);
    }
  });

  // Bind to 0.0.0.0 with protected sandbox headers
  server.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`🛡️ Barde Dental Clinic Ultra-Secure Server Active!`);
    console.log(`➜ Local URL:   http://localhost:${port}/`);
    console.log(`🔒 Protection: Strict Sandbox, Path Traversal Shield, Source File Protection`);
    console.log(`🚫 Isolation:  Foreign/Interior Website Blocking & Auto-Purge Active`);
    console.log(`⚡ Speed:      Gzip/Deflate Compression, ETag Validation, Zero Stale Cache`);
    console.log(`========================================\n`);
  });
}

startServer(DEFAULT_PORT);
