// Tests de monde-data.js : validation, normalisation, chargement JSON, miroir, fusion, ids bibliothèque.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VERSION_MONDE, normaliserObjet, validerMonde, chargerMondeDepuisJson,
  texteMiroirJs, fusionnerMondes, idsBibliothequeDepuisSource
} from '../monde-data.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const mondeValide = { version: 1, circuit: 2, objets: [{ id: 'tree', x: 10, z: -5, rotation: 90, params: { scale: 2 } }] };

test('normaliserObjet : objet valide normalisé (défauts rotation/params)', () => {
  assert.deepEqual(normaliserObjet({ id: 'bush', x: '3', z: 4 }), {
    id: 'bush', x: 3, z: 4, rotation: 0, params: {}
  });
  assert.deepEqual(normaliserObjet({ id: 'tree', x: 1, z: 2, rotation: '45', params: { color: '#fff' } }),
    { id: 'tree', x: 1, z: 2, rotation: 45, params: { color: '#fff' } });
});

test('normaliserObjet : rejette null, tableau, objet sans id, params non objet', () => {
  assert.equal(normaliserObjet(null), null);
  assert.equal(normaliserObjet([1, 2]), null);
  assert.equal(normaliserObjet({ x: 1, z: 2 }), null);
  assert.equal(normaliserObjet({ id: 42, x: 1, z: 2 }), null);
  assert.deepEqual(normaliserObjet({ id: 'tree', x: 1, z: 2, params: [1] }).params, {});
});

test('validerMonde : monde valide accepté et normalisé', () => {
  const v = validerMonde(mondeValide, 2);
  assert.equal(v.ok, true);
  assert.deepEqual(v.erreurs, []);
  assert.equal(v.monde.version, VERSION_MONDE);
  assert.equal(v.monde.circuit, 2);
  assert.equal(v.monde.objets.length, 1);
});

test('validerMonde : rejette ce qui n\'est pas un objet / pas de tableau objets', () => {
  assert.equal(validerMonde(null, 0).ok, false);
  assert.equal(validerMonde([1], 0).ok, false);
  assert.equal(validerMonde({ version: 1, circuit: 0 }, 0).ok, false);
});

test('validerMonde : version et circuit incohérents signalés', () => {
  const v = validerMonde({ version: 99, circuit: 1, objets: [] }, 0, { autoriserVide: true });
  assert.equal(v.ok, false);
  assert.ok(v.erreurs.some(e => e.includes('version')));
  assert.ok(v.erreurs.some(e => e.includes('circuit')));
});

test('validerMonde : un fichier circuit vide est interdit par défaut', () => {
  const v = validerMonde({ version: 1, circuit: 0, objets: [] }, 0);
  assert.equal(v.ok, false);
  assert.ok(v.erreurs.some(e => e.includes('vide')));
  // ... mais autorisé explicitement (ex. lecture d'un ancien fichier avant fusion)
  assert.equal(validerMonde({ version: 1, circuit: 0, objets: [] }, 0, { autoriserVide: true }).ok, true);
});

test('validerMonde : objets invalides signalés (coordonnées non finies, id inconnu)', () => {
  const v = validerMonde({
    version: 1, circuit: 0,
    objets: [
      { id: 'tree', x: NaN, z: 0 },
      { id: 'tree', x: 1, z: Infinity },
      { id: 'tree', x: 1, z: 2, rotation: NaN },
      { id: 'inconnu', x: 0, z: 0 },
      'pas un objet',
      { id: 'tree', x: 5, z: 6 }
    ]
  }, 0, { autoriserVide: true, idsValides: ['tree'] });
  assert.equal(v.ok, false);
  assert.equal(v.erreurs.length, 5);
  assert.equal(v.monde.objets.length, 1, 'seul l\'objet valide est conservé');
});

test('validerMonde : circuit absent accepté (rétrocompat) mais normalisé sur l\'index reçu', () => {
  const v = validerMonde({ version: 1, objets: [{ id: 'tree', x: 0, z: 0 }] }, 3);
  assert.equal(v.ok, true);
  assert.equal(v.monde.circuit, 3);
});

test('chargerMondeDepuisJson : JSON valide → monde normalisé', () => {
  const m = chargerMondeDepuisJson(JSON.stringify(mondeValide), 2);
  assert.equal(m.circuit, 2);
  assert.equal(m.objets[0].id, 'tree');
});

test('chargerMondeDepuisJson : JSON invalide ou monde invalide → erreur levée', () => {
  assert.throws(() => chargerMondeDepuisJson('{oops', 0), /JSON invalide/);
  assert.throws(() => chargerMondeDepuisJson('{"version":1,"circuit":0,"objets":[]}', 0), /vide/);
  assert.throws(() => chargerMondeDepuisJson(JSON.stringify({ version: 1, circuit: 1, objets: mondeValide.objets }), 0), /circuit/);
});

test('texteMiroirJs : format exact + aller-retour (éval du miroir = données)', () => {
  const txt = texteMiroirJs(mondeValide, 2);
  assert.ok(txt.startsWith('// Généré automatiquement — données du circuit 2 (miroir de monde-2.json pour file://)\n'));
  assert.ok(txt.includes('window.__MONDE__ = ' + JSON.stringify(mondeValide) + ';'));
  const bac = { window: {} };
  new Function('window', txt)(bac.window);
  assert.deepEqual(bac.window.__MONDE__, mondeValide);
});

test('fusionnerMondes : conserve les objets existants non conflictuels', () => {
  const gen = { version: 1, circuit: 0, objets: [{ id: 'tree', x: 0, z: 0, rotation: 0, params: {} }] };
  const ancien = { version: 1, circuit: 0, objets: [
    { id: 'tree', x: 0.5, z: 0.5, rotation: 0, params: {} },   // conflit (trop proche) → ignoré
    { id: 'pit', x: -16, z: -127, rotation: 8, params: { length: 30 } }, // conservé
    { id: 'cassé', x: 'abc', z: 0 }                              // invalide → ignoré
  ] };
  const f = fusionnerMondes(gen, ancien);
  assert.equal(f.circuit, 0);
  assert.equal(f.objets.length, 2);
  assert.ok(f.objets.some(o => o.id === 'pit'));
  // sans existant
  assert.equal(fusionnerMondes(gen, null).objets.length, 1);
  // distance personnalisée
  assert.equal(fusionnerMondes(gen, ancien, { distance: 0.1 }).objets.length, 3);
});

test('idsBibliothequeDepuisSource : retrouve les clés du catalogue d\'objets.js', () => {
  const src = fs.readFileSync(path.join(DOSSIER, 'objets.js'), 'utf8');
  const ids = idsBibliothequeDepuisSource(src);
  for (const attendu of ['kart', 'tree', 'bush', 'flower', 'barrier', 'itembox', 'boost', 'arch', 'aco', 'stand', 'pit']) {
    assert.ok(ids.includes(attendu), `id "${attendu}" attendu dans la bibliothèque`);
  }
  assert.ok(ids.length >= 15, 'au moins 15 objets dans la bibliothèque');
});
