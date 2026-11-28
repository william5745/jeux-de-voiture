// Tests du fichier des tracés (circuits.js) — source unique partagée jeu/éditeur/tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CIRCUITS } from '../circuits.js';

test('CIRCUITS contient au moins 4 circuits', () => {
  assert.ok(Array.isArray(CIRCUITS));
  assert.ok(CIRCUITS.length >= 4, 'au moins 4 circuits attendus');
});

test('chaque circuit a un nom unique non vide', () => {
  const noms = CIRCUITS.map(c => c.name);
  assert.ok(noms.every(n => typeof n === 'string' && n.length > 0));
  assert.equal(new Set(noms).size, noms.length, 'noms de circuits en double');
});

test('chaque circuit a au moins 3 points [x, z] finis (boucle fermée)', () => {
  for (const [i, c] of CIRCUITS.entries()) {
    assert.ok(Array.isArray(c.points), `circuit ${i} : points requis`);
    assert.ok(c.points.length >= 3, `circuit ${i} : au moins 3 points`);
    for (const p of c.points) {
      assert.ok(Array.isArray(p) && p.length === 2, `circuit ${i} : point [x, z] requis`);
      assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]), `circuit ${i} : coordonnées finies`);
    }
  }
});

test('les points tiennent dans la carte 400x400 de l\'éditeur', () => {
  for (const [i, c] of CIRCUITS.entries()) {
    for (const [x, z] of c.points) {
      assert.ok(Math.abs(x) <= 200 && Math.abs(z) <= 200, `circuit ${i} : (${x}, ${z}) hors carte`);
    }
  }
});
