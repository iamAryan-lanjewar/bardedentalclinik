const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT, 10) || 5501;
const ROOT = path.resolve(__dirname);

// MIME types for web assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Types that benefit from gzip / deflate compression
const COMPRESSIBLE = new Set([
  'text/html; charset=utf-8',
  'text/css; charset=utf-8',
  'text/javascript; charset=utf-8',
  'image/svg+xml',
  'application/json; charset=utf-8',
  'application/xml; charset=utf-8',
  'text/plain; charset=utf-8',
  'font/ttf'
]);

// Sensitive files / folders that should never be served
const BLOCKED_NAMES = new Set([
  'server.js',
  'package.json',
  'package-lock.json',
  'optimize-images.js',
  '.gitignore'
]);

const server = http.createServer((req, res) => {
  // Prevent unhandled stream crashes
  req.on('error', () => {});
  res.on('error', () => {});

  // Only allow safe read operations
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  // Safe URI decoding
  let decoded = '/';
  try {
    decoded = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  // Prevent null-byte injection
  if (decoded.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  // Resolve target file path
  let filePath = path.normalize(path.join(ROOT, decoded));

  // Security: Prevent path traversal outside root
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  // Security: Block sensitive files, dotfiles, node_modules
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const baseName = path.basename(filePath).toLowerCase();

  if (
    baseName.startsWith('.') ||
    relPath.startsWith('node_modules') ||
    relPath.startsWith('.git') ||
    BLOCKED_NAMES.has(baseName)
  ) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }

    // If directory, serve its index.html
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      return fs.stat(filePath, (subErr, subStats) => {
        if (subErr || !subStats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Not Found');
        }
        serveFile(req, res, filePath, subStats);
      });
    }

    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }

    serveFile(req, res, filePath, stats);
  });
});

function serveFile(req, res, filePath, stats) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isHtml = ext === '.html';

  // Fast caching: Long-term cache for immutable assets, revalidate for HTML
  const cacheControl = isHtml
    ? 'no-cache, must-revalidate'
    : 'public, max-age=604800, stale-while-revalidate=86400';

  // ETag based on mtime and size for instant 304 cache validation
  const etag = `"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, {
      'ETag': etag,
      'Cache-Control': cacheControl
    });
    return res.end();
  }

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'ETag': etag,
    'Last-Modified': stats.mtime.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };

  if (req.method === 'HEAD') {
    res.writeHead(200, headers);
    return res.end();
  }

  const fileStream = fs.createReadStream(filePath);
  fileStream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end();
  });

  // Fast gzip/deflate compression for text, CSS, JS, SVG, and TTF
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const canCompress = COMPRESSIBLE.has(contentType);

  if (canCompress && /\bgzip\b/.test(acceptEncoding)) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers);
    fileStream.pipe(zlib.createGzip({ level: 6 })).pipe(res);
  } else if (canCompress && /\bdeflate\b/.test(acceptEncoding)) {
    headers['Content-Encoding'] = 'deflate';
    headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers);
    fileStream.pipe(zlib.createDeflate()).pipe(res);
  } else {
    headers['Content-Length'] = stats.size;
    res.writeHead(200, headers);
    fileStream.pipe(res);
  }
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
