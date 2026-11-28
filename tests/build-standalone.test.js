// Tests de build-standalone.js : jeu.html autonome embarque tous les modules partagés.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { genererJeuHtml } from '../build-standalone.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

test('genererJeuHtml : embarque three, objets, circuits, monde-data et monde-procedural', () => {
  const html = genererJeuHtml(DOSSIER);
  assert.ok(html.length > 1e6, 'jeu.html doit embarquer three.module.js (~1,2 Mo)');
  assert.match(html, /const THREE = \{/);
  assert.match(html, /const library = \{/);
  assert.match(html, /const CIRCUITS = \[/);
  assert.match(html, /function validerMonde/);   // monde-data.js embarqué
  assert.match(html, /function genererMonde/);   // monde-procedural.js embarqué
  assert.match(html, /function creerRng/);
});

test('genererJeuHtml : aucun import de module externe ne reste dans le module embarqué', () => {
  const html = genererJeuHtml(DOSSIER);
  const module = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  for (const interdit of ["from 'three'", "from './objets.js'", "from './circuits.js'",
    "from './monde-data.js'", "from './monde-procedural.js'", "from './three.module.js'"]) {
    assert.ok(!module.includes(interdit), `import restant dans jeu.html : ${interdit}`);
  }
  assert.ok(!/export\s*\{[\s\S]*?\};?\s*$/.test(module.trim()), 'exports non retirés du module embarqué');
  assert.ok(!html.includes('<script type="importmap">'), 'importmap retiré de jeu.html');
});

test('genererJeuHtml : le module embarqué a une syntaxe valide (node --check) et sans doublons', () => {
  const html = genererJeuHtml(DOSSIER);
  const module = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  // pas de double déclaration de fonctions partagées (ex. isFarFromTrack)
  const noms = ['isFarFromTrack', 'genererMonde', 'validerMonde', 'creerRng'];
  for (const n of noms) {
    const count = (module.match(new RegExp(`function ${n}\\b`, 'g')) || []).length;
    assert.ok(count >= 1, `${n} absent du module embarqué`);
    assert.equal(count, 1, `${n} déclaré ${count} fois dans jeu.html`);
  }
  // vraie vérification syntaxique : on écrit le module dans un fichier temporaire
  const tmp = path.join(os.tmpdir(), `jeu-module-${process.pid}.mjs`);
  fs.writeFileSync(tmp, module);
  try {
    const r = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
    assert.equal(r.status, 0, `syntaxe du module embarqué invalide :\n${r.stderr}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
});

test('genererJeuHtml : fonctionne depuis un dossier copié (modules embarqués présents)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'turbo-build-'));
  try {
    for (const f of ['three.module.js', 'objets.js', 'circuits.js', 'monde-data.js', 'monde-procedural.js', 'index.html']) {
      fs.copyFileSync(path.join(DOSSIER, f), path.join(tmp, f));
    }
    const html = genererJeuHtml(tmp);
    assert.match(html, /function genererMonde/);
    assert.match(html, /function validerMonde/);
    assert.match(html, /const CIRCUITS = \[/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('genererJeuHtml : lève une erreur si l\'export de three.module.js est introuvable', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'turbo-build-'));
  try {
    fs.writeFileSync(path.join(tmp, 'three.module.js'), 'const x = 1;\n'); // pas d'export
    assert.throws(() => genererJeuHtml(tmp), /export introuvable/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
