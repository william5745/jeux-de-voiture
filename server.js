// Serveur statique local (port 8080) + endpoints de sauvegarde de l'éditeur.
// Module ES importable en Node (tests) : le listen n'a lieu que si lancé directement.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validerMonde, texteMiroirJs, idsBibliothequeDepuisSource } from './monde-data.js';

const DOSSIER = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json; charset=utf-8'
};

// ids valides du catalogue (lus une fois depuis objets.js)
let idsValides = null;
function idsLibrary(dossier) {
  if (!idsValides) {
    idsValides = idsBibliothequeDepuisSource(fs.readFileSync(path.join(dossier, 'objets.js'), 'utf8'));
  }
  return idsValides;
}

// Écrit les deux fichiers de données d'un circuit :
// monde-<c>.json (source de vérité) + monde-<c>.js (miroir file://, format texteMiroirJs).
export function ecrireMondeCircuit(dossier, circuit, monde) {
  const c = Math.max(0, Math.min(999, parseInt(circuit) || 0));
  const base = 'monde-' + c;
  fs.writeFileSync(path.join(dossier, base + '.json'), JSON.stringify(monde, null, 2) + '\n');
  fs.writeFileSync(path.join(dossier, base + '.js'), texteMiroirJs(monde, c));
  return c;
}

// Traite le corps d'un POST /__save-monde : parse JSON, valide (structure + ids de la
// bibliothèque + circuit), puis écrit monde-<c>.json + le miroir monde-<c>.js.
// Retourne { status, corps } — testable sans HTTP.
export function traiterSauvegardeMonde(dossier, body) {
  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    return { status: 400, corps: 'JSON invalide' };
  }
  const c = Math.max(0, Math.min(999, parseInt(data && data.circuit) || 0));
  // le circuit est clampé AVANT validation : data.circuit est normalisé sur la valeur clampée
  if (data && typeof data === 'object' && !Array.isArray(data)) data.circuit = c;
  const v = validerMonde(data, c, { autoriserVide: true, idsValides: idsLibrary(dossier) });
  if (!v.ok) return { status: 400, corps: 'Monde invalide : ' + v.erreurs.join(' ; ') };
  ecrireMondeCircuit(dossier, c, v.monde);
  return { status: 200, corps: JSON.stringify({ ok: true, circuit: c }) };
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
    // UN FICHIER PAR CIRCUIT — monde-<circuit>.json (source de vérité, validé)
    // + monde-<circuit>.js (miroir lisible en file:// via <script>)
    if (req.method === 'POST' && url === '/__save-monde') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); });
      req.on('end', () => {
        const r = traiterSauvegardeMonde(dossier, body);
        res.writeHead(r.status, { 'Content-Type': 'application/json' });
        res.end(r.corps);
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
/* v8 ignore next 3 */
if (lanceDirectement) {
  creerServeur().listen(8080, () => console.log('SERVEUR OK sur http://localhost:8080'));
}
