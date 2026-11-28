// Tests des règles "statique" (agent.md règles 8-10) au niveau des sources des pages :
//  - le jeu est jouable EN STATIQUE (fichiers commités + ?circuit=<i>, aucun localStorage)
//  - l'édition passe UNIQUEMENT par le serveur (POST /__save-monde)
//  - le mode procédural (genererMonde) n'est JAMAIS appelé à l'exécution dans le jeu
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CIRCUITS } from '../circuits.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lire = f => fs.readFileSync(path.join(DOSSIER, f), 'utf8');
const moduleDe = html => html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
// usage RÉEL de localStorage (getItem/setItem/... — pas la mention dans un commentaire)
const UTILISE_LOCALSTORAGE = /localStorage\s*\.\s*(getItem|setItem|removeItem|clear)\b/;

test('index.html / jeu.html / editeur.html : aucun usage de localStorage', () => {
  for (const f of ['index.html', 'jeu.html', 'editeur.html']) {
    assert.ok(!UTILISE_LOCALSTORAGE.test(lire(f)), `localStorage utilisé dans ${f} (interdit, règle 8)`);
  }
});

test('index.html + jeu.html : circuit choisi via ?circuit=<i> (URLSearchParams), miroir monde-<i>.js injecté dans le <head>', () => {
  for (const f of ['index.html', 'jeu.html']) {
    const src = lire(f);
    assert.match(src, /URLSearchParams\(location\.search\)\.get\('circuit'\)/, `${f} : ?circuit= lu`);
    assert.match(src, /searchParams\.set\('circuit',/, `${f} : ?circuit= écrit (menu/clavier)`);
    assert.match(src, /document\.write\('<script src="\.\/monde-' \+ i \+ '\.js">/, `${f} : miroir monde-<i>.js injecté`);
  }
});

test('index.html + jeu.html : le monde est lu UNIQUEMENT depuis les fichiers commités (fetch JSON + miroir .js)', () => {
  for (const f of ['index.html', 'jeu.html']) {
    const mod = moduleDe(lire(f));
    assert.match(mod, /fetch\('\.\/monde-' \+ circuitIndex \+ '\.json'\)/, `${f} : fetch de monde-<i>.json`);
    assert.match(mod, /window\.__MONDE__/, `${f} : secours miroir monde-<i>.js`);
    assert.match(mod, /chargerMondeDepuisJson/, `${f} : validation monde-data.js`);
  }
});

test('index.html + jeu.html : aucune génération procédurale ni sauvegarde à l\'exécution (règle 10)', () => {
  // dans jeu.html le module monde-procedural.js est embarqué : sa DÉFINITION est autorisée,
  // mais aucun APPEL à genererMonde( (hors "function genererMonde(") ne doit exister
  const APPEL_GENERER = /(?<!function )genererMonde\s*\(/;
  for (const f of ['index.html', 'jeu.html']) {
    const mod = moduleDe(lire(f));
    assert.ok(!APPEL_GENERER.test(mod), `${f} : genererMonde appelé dans le jeu (interdit)`);
    assert.ok(!/sauvegarderMonde/.test(mod), `${f} : le jeu ne sauvegarde pas`);
    assert.ok(!/\/__save-monde/.test(mod), `${f} : le jeu ne POST pas`);
  }
});

test('editeur.html : chargement UNIQUEMENT par fetch(monde-<i>.json), sauvegarde UNIQUEMENT par POST /__save-monde (règle 9)', () => {
  const mod = moduleDe(lire('editeur.html'));
  assert.match(mod, /fetch\('monde-' \+ i \+ '\.json'\)/, 'fetch du fichier du circuit');
  assert.match(mod, /fetch\('\/__save-monde',\s*\{[\s\S]*?method: 'POST'/, 'POST /__save-monde');
  assert.ok(!/(?<!function )genererMonde\s*\(/.test(mod), 'pas d\'appel à genererMonde dans l\'éditeur');
});

test('les fichiers de données sont commités dans git (servis tels quels en statique)', () => {
  const r = spawnSync('git', ['ls-files', 'monde-*.json', 'monde-*.js', 'carte-editeur.js', 'circuits.js', 'objets.js', '.nojekyll'], { cwd: DOSSIER, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const suivis = r.stdout.split('\n').filter(Boolean);
  for (let i = 0; i < CIRCUITS.length; i++) {
    assert.ok(suivis.includes(`monde-${i}.json`), `monde-${i}.json non commité (injouable en statique)`);
    assert.ok(suivis.includes(`monde-${i}.js`), `monde-${i}.js non commité`);
  }
  for (const f of ['carte-editeur.js', 'circuits.js', 'objets.js', '.nojekyll']) {
    assert.ok(suivis.includes(f), `${f} non commité`);
  }
});

test('chaque monde-<i>.json commité est non vide et valide (jouable en statique sans serveur)', async () => {
  const { chargerMondeDepuisJson, idsBibliothequeDepuisSource } = await import('../monde-data.js');
  const ids = idsBibliothequeDepuisSource(lire('objets.js'));
  for (let i = 0; i < CIRCUITS.length; i++) {
    // strict : autoriserVide = false par défaut → un fichier vide est rejeté
    const m = chargerMondeDepuisJson(lire(`monde-${i}.json`), i, { idsValides: ids });
    assert.ok(m.objets.length > 0, `monde-${i}.json vide`);
  }
});
