// Local development server with zero dependencies.
//   npm run dev            → http://localhost:3000
// Serves the static site and runs the /api/* handlers the same way Vercel does.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

// Load .env if present (KEY=value lines).
if (existsSync(join(root, '.env'))) {
  for (const line of readFileSync(join(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};
const BLOCKED = /^\/(\.env|\.git|node_modules|tests|scripts)(\/|$)/;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path = decodeURIComponent(url.pathname);

  if (path.startsWith('/api/')) {
    const name = path.slice(5).replace(/[^a-z0-9_-]/gi, '');
    const file = join(root, 'api', `${name}.js`);
    if (!name || !existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
    try {
      const mod = await import(pathToFileURL(file).href);
      return await mod.default(req, res);
    } catch (e) {
      console.error(e);
      res.statusCode = 500; return res.end('Server error');
    }
  }

  if (BLOCKED.test(path)) { res.statusCode = 404; return res.end('Not found'); }
  if (path.endsWith('/')) path += 'index.html';
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end('Forbidden'); }
  try {
    let s = await stat(file).catch(() => null);
    if (!s && !extname(file)) { file += '.html'; s = await stat(file).catch(() => null); }
    if (!s || !s.isFile()) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('content-type', TYPES[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    res.statusCode = 500; res.end('Server error');
  }
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Ilaaj Saathi running at http://localhost:${port}`);
  console.log(process.env.ANTHROPIC_API_KEY ? '  AI answers: on' : '  AI answers: off (offline answers). Add ANTHROPIC_API_KEY to .env to turn on.');
  console.log(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? '  Impact counters: on' : '  Impact counters: off. Add Upstash keys to .env to turn on.');
});
