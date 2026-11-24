const http = require('http');
const fs = require('fs');
const path = require('path');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css' };
http.createServer((req, res) => {
  const f = path.join(__dirname, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('404'); }
    else { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); }
  });
}).listen(8080, () => console.log('SERVEUR OK sur http://localhost:8080'));
