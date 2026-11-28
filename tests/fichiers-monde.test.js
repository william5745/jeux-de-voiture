// Tests de cohérence des FICHIERS de données livrés : monde-<i>.json (source de vérité)
// + monde-<i>.js (miroir file://) pour chaque circuit de circuits.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CIRCUITS } from '../circuits.js';
import { chargerMondeDepuisJson, texteMiroirJs, idsBibliothequeDepuisSource } from '../monde-data.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDS = idsBibliothequeDepuisSource(fs.readFileSync(path.join(DOSSIER, 'objets.js'), 'utf8'));

test('chaque circuit a son fichier monde-<i>.json, non vide et valide (règle 7)', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const f = path.join(DOSSIER, `monde-${i}.json`);
    assert.ok(fs.existsSync(f), `monde-${i}.json manquant`);
    // strict : autoriserVide=false → un fichier vide lève une erreur
    const m = chargerMondeDepuisJson(fs.readFileSync(f, 'utf8'), i, { idsValides: IDS });
    assert.ok(m.objets.length > 0, `monde-${i}.json est vide`);
    assert.equal(m.circuit, i, `monde-${i}.json : champ circuit incohérent`);
  }
});

test('chaque monde-<i>.json contient les objets de gameplay initiaux (jamais un décor vide)', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const m = chargerMondeDepuisJson(fs.readFileSync(path.join(DOSSIER, `monde-${i}.json`), 'utf8'), i, { idsValides: IDS });
    const ids = new Set(m.objets.map(o => o.id));
    for (const obligatoire of ['arch', 'boost', 'itembox', 'tree', 'bush']) {
      assert.ok(ids.has(obligatoire), `monde-${i}.json : objet initial "${obligatoire}" absent`);
    }
  }
});

test('le miroir monde-<i>.js existe et contient EXACTEMENT les mêmes données que le JSON', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const fJson = path.join(DOSSIER, `monde-${i}.json`);
    const fJs = path.join(DOSSIER, `monde-${i}.js`);
    assert.ok(fs.existsSync(fJs), `monde-${i}.js manquant`);
    const m = chargerMondeDepuisJson(fs.readFileSync(fJson, 'utf8'), i, { idsValides: IDS });
    // le miroir doit être régénérable à l'identique depuis le JSON (format texteMiroirJs)
    assert.equal(fs.readFileSync(fJs, 'utf8'), texteMiroirJs(m, i), `monde-${i}.js : format/miroir incohérent`);
    // et se relire correctement (éval dans un bac à sable)
    const bac = { window: {} };
    new Function('window', fs.readFileSync(fJs, 'utf8'))(bac.window);
    assert.deepEqual(bac.window.__MONDE__, m, `monde-${i}.js : données différentes du JSON`);
  }
});

test('tous les ids des fichiers monde sont connus de la bibliothèque (objets.js)', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const m = JSON.parse(fs.readFileSync(path.join(DOSSIER, `monde-${i}.json`), 'utf8'));
    for (const o of m.objets) assert.ok(IDS.includes(o.id), `monde-${i}.json : id inconnu "${o.id}"`);
  }
});
