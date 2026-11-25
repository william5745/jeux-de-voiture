const http = require('http');

const fs = require('fs');

const path = require('path');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  // L'éditeur de carte (editeur.html) pousse ses sauvegardes ici :
  // elles sont écrites dans carte-editeur.js, lu par jeu.html (file://) et index.html.
  if (req.method === 'POST' && url === '/__save-carte') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(
          path.join(__dirname, 'carte-editeur.js'),
          '// Généré automatiquement par l\'éditeur (editeur.html) — ne pas modifier à la main\n' +
          'window.__CARTE_EDITEUR__ = ' + JSON.stringify(data) + ';\n'
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400); res.end('JSON invalide');
      }
    });
    return;
  }

  // Le jeu / l'éditeur exportent le monde en données ici :
  // monde.json (source de vérité) + monde.js (miroir lisible en file:// via <script>)
  if (req.method === 'POST' && url === '/__save-monde') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(path.join(__dirname, 'monde.json'), JSON.stringify(data, null, 2) + '\n');
        fs.writeFileSync(
          path.join(__dirname, 'monde.js'),
          '// Généré automatiquement — miroir de monde.json pour jeu.html en file://\n' +
          'window.__MONDE__ = ' + JSON.stringify(data) + ';\n'
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400); res.end('JSON invalide');
      }
    });
    return;
  }

  const f = path.join(__dirname, url === '/' ? 'index.html' : url);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('404'); }
    else { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); }
  });
}).listen(8080, () => console.log('SERVEUR OK sur http://localhost:8080'));
