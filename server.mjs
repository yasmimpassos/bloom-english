import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (
        !file.startsWith(root + '/') ||
        pathname.split('/').some((p) => p.startsWith('.')) ||
        !['.html', '.js', '.css', '.svg'].includes(path.extname(file))
      ) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const data = await readFile(file);
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)],
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(Number(process.env.PORT || 5173), '0.0.0.0', () =>
    console.log('Bloom em http://localhost:' + (process.env.PORT || 5173)),
  );
