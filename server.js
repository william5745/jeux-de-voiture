// Serveur statique local (port 8080) + endpoints de sauvegarde de l'éditeur.
// Module ES importable en Node (tests) : le listen n'a lieu que si lancé directement.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DOSSIER = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json; charset=utf-8'
};

// Écrit les deux fichiers de données d'un circuit :
// monde-<c>.json (source de vérité) + monde-<c>.js (miroir file://).
// Le format du miroir est délégué à texteMiroirJs() (monde-data.js) pour rester identique partout.
export function ecrireMondeCircuit(dossier, circuit, data) {
  const c = Math.max(0, Math.min(999, parseInt(circuit) || 0));
  const base = 'monde-' + c;
  fs.writeFileSync(path.join(dossier, base + '.json'), JSON.stringify(data, null, 2) + '\n');
  fs.writeFileSync(
    path.join(dossier, base + '.js'),
    '// Généré automatiquement — données du circuit ' + c + ' (miroir de ' + base + '.json pour file://)\n' +
    'window.__MONDE__ = ' + JSON.stringify(data) + ';\n'
  );
  return c;
}

export function creerServeur({ dossier = DOSSIER } = {}) {
  return http.createServer((req, res) => {
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
            path.join(dossier, 'carte-editeur.js'),
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
    // UN FICHIER PAR CIRCUIT — monde-<circuit>.json (source de vérité)
    // + monde-<circuit>.js (miroir lisible en file:// via <script>)
    if (req.method === 'POST' && url === '/__save-monde') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const c = ecrireMondeCircuit(dossier, data.circuit, data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true,"circuit":' + c + '}');
        } catch (e) {
          res.writeHead(400); res.end('JSON invalide');
        }
      });
      return;
    }

    const f = path.join(dossier, url === '/' ? 'index.html' : url);
    if (!f.startsWith(dossier)) { res.writeHead(403); res.end('403'); return; }
    fs.readFile(f, (e, d) => {
      if (e) { res.writeHead(404); res.end('404'); }
      else { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); }
    });
  });
}

const lanceDirectement = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (lanceDirectement) {
  creerServeur().listen(8080, () => console.log('SERVEUR OK sur http://localhost:8080'));
}
