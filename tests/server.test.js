// Tests de server.js : endpoints de sauvegarde (un fichier par circuit) + serveur statique.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creerServeur, traiterSauvegardeMonde, ecrireMondeCircuit } from '../server.js';
import { texteMiroirJs, validerMonde, chargerMondeDepuisJson } from '../monde-data.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let tmp;

before(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'turbo-srv-'));
  fs.copyFileSync(path.join(DOSSIER, 'objets.js'), path.join(tmp, 'objets.js'));
  fs.copyFileSync(path.join(DOSSIER, 'circuits.js'), path.join(tmp, 'circuits.js'));
  fs.writeFileSync(path.join(tmp, 'index.html'), '<title>test</title>');
});
after(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

test('traiterSauvegardeMonde : monde valide → 200 + monde-<c>.json + miroir .js écrits', () => {
  const data = { version: 1, circuit: 3, objets: [{ id: 'tree', x: 1.5, z: -2, rotation: 90, params: { scale: 1 } }] };
  const r = traiterSauvegardeMonde(tmp, JSON.stringify(data));
  assert.equal(r.status, 200);
  assert.deepEqual(JSON.parse(r.corps), { ok: true, circuit: 3 });
  const m = chargerMondeDepuisJson(fs.readFileSync(path.join(tmp, 'monde-3.json'), 'utf8'), 3);
  assert.equal(m.objets[0].id, 'tree');
  assert.equal(fs.readFileSync(path.join(tmp, 'monde-3.js'), 'utf8'), texteMiroirJs(m, 3));
});

test('traiterSauvegardeMonde : JSON invalide → 400', () => {
  const r = traiterSauvegardeMonde(tmp, '{pas du json');
  assert.equal(r.status, 400);
  assert.match(r.corps, /JSON invalide/);
});

test('traiterSauvegardeMonde : monde invalide (id inconnu) → 400, aucun fichier écrit', () => {
  const avant = fs.readdirSync(tmp).length;
  const r = traiterSauvegardeMonde(tmp, JSON.stringify({ version: 1, circuit: 5, objets: [{ id: 'nimportequoi', x: 0, z: 0 }] }));
  assert.equal(r.status, 400);
  assert.match(r.corps, /invalide/);
  assert.equal(fs.readdirSync(tmp).length, avant);
});

test('traiterSauvegardeMonde : circuit clampé dans [0, 999] et NaN → 0', () => {
  const r = traiterSauvegardeMonde(tmp, JSON.stringify({ version: 1, circuit: 12345, objets: [{ id: 'bush', x: 0, z: 0 }] }));
  assert.equal(JSON.parse(r.corps).circuit, 999);
  assert.ok(fs.existsSync(path.join(tmp, 'monde-999.json')));
  const r2 = traiterSauvegardeMonde(tmp, JSON.stringify({ version: 1, circuit: 'abc', objets: [{ id: 'bush', x: 0, z: 0 }] }));
  assert.equal(JSON.parse(r2.corps).circuit, 0);
});

test('traiterSauvegardeMonde : monde normalisé avant écriture (champs nettoyés)', () => {
  const r = traiterSauvegardeMonde(tmp, JSON.stringify({
    version: 1, circuit: 1, champExtra: 'x',
    objets: [{ id: 'tree', x: 1, z: 2, rotation: 0, params: {}, junk: true }]
  }));
  assert.equal(r.status, 200);
  const brut = JSON.parse(fs.readFileSync(path.join(tmp, 'monde-1.json'), 'utf8'));
  assert.equal(brut.champExtra, undefined);
  assert.deepEqual(Object.keys(brut.objets[0]).sort(), ['id', 'params', 'rotation', 'x', 'z']);
});

test('ecrireMondeCircuit : écrit les deux fichiers avec le format miroir standard', () => {
  const monde = { version: 1, circuit: 8, objets: [{ id: 'arch', x: 0, z: 0, rotation: 0, params: {} }] };
  const c = ecrireMondeCircuit(tmp, 8, monde);
  assert.equal(c, 8);
  assert.equal(fs.readFileSync(path.join(tmp, 'monde-8.js'), 'utf8'), texteMiroirJs(monde, 8));
});

test('creerServeur : sert les fichiers statiques, 404, POST /__save-monde et /__save-carte', async () => {
  const srv = creerServeur({ dossier: tmp });
  await new Promise(res => srv.listen(0, res));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    const r0 = await fetch(base + '/');
    assert.equal(r0.status, 200);
    assert.match(r0.headers.get('content-type'), /text\/html/);
    const r1 = await fetch(base + '/circuits.js');
    assert.equal(r1.status, 200);
    assert.match(await r1.text(), /CIRCUITS/);
    const r404 = await fetch(base + '/nexiste-pas.xyz');
    assert.equal(r404.status, 404);
    // path traversal bloqué : requête HTTP brute (fetch normaliserait le chemin avant l'envoi)
    const brut = await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: srv.address().port, path: '/%2e%2e/%2e%2e/%2e%2e/etc/passwd', method: 'GET' }, res => {
        res.resume();
        res.on('end', () => resolve(res.statusCode));
      });
      req.on('error', reject);
      req.end();
    });
    assert.equal(brut, 403);
    // POST /__save-monde valide
    const rp = await fetch(base + '/__save-monde', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: 1, circuit: 2, objets: [{ id: 'boost', x: 1, z: 1, rotation: 0, params: {} }] })
    });
    assert.equal(rp.status, 200);
    assert.ok(fs.existsSync(path.join(tmp, 'monde-2.json')));
    assert.ok(fs.existsSync(path.join(tmp, 'monde-2.js')));
    // POST /__save-monde invalide
    const rb = await fetch(base + '/__save-monde', { method: 'POST', body: 'nope' });
    assert.equal(rb.status, 400);
    // POST /__save-carte
    const rc = await fetch(base + '/__save-carte', { method: 'POST', body: JSON.stringify({ carte: { objets: [] }, pistes: {} }) });
    assert.equal(rc.status, 200);
    assert.match(fs.readFileSync(path.join(tmp, 'carte-editeur.js'), 'utf8'), /window\.__CARTE_EDITEUR__/);
    // POST /__save-carte invalide → 400
    const rcBad = await fetch(base + '/__save-carte', { method: 'POST', body: 'xxx' });
    assert.equal(rcBad.status, 400);
    // GET sur un endpoint POST → traité comme statique → 404
    const rg = await fetch(base + '/__save-monde');
    assert.equal(rg.status, 404);
  } finally {
    await new Promise(res => srv.close(res));
  }
});

test('le serveur sert les vrais monde-<i>.json du projet avec le bon type MIME', async () => {
  const srv = creerServeur({ dossier: DOSSIER });
  await new Promise(res => srv.listen(0, res));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    const r = await fetch(base + '/monde-0.json');
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /application\/json/);
    const m = await r.json();
    const v = validerMonde(m, 0);
    assert.ok(v.ok && m.objets.length > 0, 'monde-0.json servi non vide et valide');
  } finally {
    await new Promise(res => srv.close(res));
  }
});
