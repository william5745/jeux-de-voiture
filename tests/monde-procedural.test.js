// Tests de monde-procedural.js : génération procédurale déterministe des données de monde.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CIRCUITS } from '../circuits.js';
import { SAMPLES, ROAD_HALF, creerRng, echantillonnerCourbe, isFarFromTrack, genererMonde } from '../monde-procedural.js';
import { validerMonde, idsBibliothequeDepuisSource } from '../monde-data.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDS = idsBibliothequeDepuisSource(fs.readFileSync(path.join(DOSSIER, 'objets.js'), 'utf8'));

const compteParId = monde => {
  const c = {};
  monde.objets.forEach(o => { c[o.id] = (c[o.id] || 0) + 1; });
  return c;
};

test('creerRng : déterministe et dans [0, 1)', () => {
  const r1 = creerRng(42), r2 = creerRng(42);
  const s1 = Array.from({ length: 100 }, () => r1());
  const s2 = Array.from({ length: 100 }, () => r2());
  assert.deepEqual(s1, s2);
  assert.ok(s1.every(v => v >= 0 && v < 1));
  assert.notDeepEqual(Array.from({ length: 10 }, () => creerRng(1)()), Array.from({ length: 10 }, () => creerRng(2)()));
});

test('echantillonnerCourbe : SAMPLES points finis sur une boucle fermée', () => {
  const { curve, samples } = echantillonnerCourbe(CIRCUITS[0].points);
  assert.equal(samples.length, SAMPLES);
  for (const p of samples) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.z));
  // boucle fermée : le point à t=1 retombe sur le point à t=0
  const fin = curve.getPointAt(1);
  assert.ok(Math.hypot(fin.x - samples[0].x, fin.z - samples[0].z) < 1e-6);
  // échantillonner moins de points fonctionne aussi
  assert.equal(echantillonnerCourbe(CIRCUITS[0].points, 50).samples.length, 50);
});

test('isFarFromTrack : détecte piste vs loin de la piste', () => {
  const { samples } = echantillonnerCourbe(CIRCUITS[0].points);
  assert.equal(isFarFromTrack(samples, samples[10].x, samples[10].z, ROAD_HALF + 5), false);
  assert.equal(isFarFromTrack(samples, samples[10].x + 500, samples[10].z + 500, ROAD_HALF + 5), true);
});

test('genererMonde : déterministe (même seed = même monde) et valide pour chaque circuit', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const m1 = genererMonde(i, CIRCUITS[i].points);
    const m2 = genererMonde(i, CIRCUITS[i].points);
    assert.deepEqual(m1, m2, `circuit ${i} : génération non reproductible`);
    const v = validerMonde(m1, i, { idsValides: IDS });
    assert.ok(v.ok, `circuit ${i} : monde invalide (${v.erreurs.join(';')})`);
    assert.equal(m1.version, 1);
    assert.equal(m1.circuit, i);
    assert.ok(m1.objets.length > 50, `circuit ${i} : monde trop pauvre (${m1.objets.length} objets)`);
  }
});

test('genererMonde : objets de gameplay initiaux présents (arch, 3 boosts, 9 caisses)', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const c = compteParId(genererMonde(i, CIRCUITS[i].points));
    assert.equal(c.arch, 1, `circuit ${i} : portique de départ`);
    assert.equal(c.boost, 3, `circuit ${i} : 3 pads de boost`);
    assert.equal(c.itembox, 9, `circuit ${i} : 9 caisses bonus`);
    assert.ok((c.tree || 0) > 5, `circuit ${i} : des arbres`);
    assert.ok((c.bush || 0) > 5, `circuit ${i} : des buissons`);
  }
});

test('genererMonde : aco et barrières uniquement sur Le Mans (circuit 0)', () => {
  assert.ok(compteParId(genererMonde(0, CIRCUITS[0].points)).aco === 1);
  assert.ok((compteParId(genererMonde(0, CIRCUITS[0].points)).barrier || 0) > 0);
  for (let i = 1; i < CIRCUITS.length; i++) {
    const c = compteParId(genererMonde(i, CIRCUITS[i].points));
    assert.equal(c.aco, undefined, `circuit ${i} : pas de tour ACO`);
    assert.equal(c.barrier, undefined, `circuit ${i} : pas de barrières procédurales`);
  }
});

test('genererMonde : boosts/caisses SUR la piste, arbres/buissons HORS de la piste', () => {
  for (let i = 0; i < CIRCUITS.length; i++) {
    const { samples } = echantillonnerCourbe(CIRCUITS[i].points);
    const distPiste = (x, z) => Math.min(...samples.map(s => Math.hypot(s.x - x, s.z - z)));
    const m = genererMonde(i, CIRCUITS[i].points);
    for (const o of m.objets) {
      const d = distPiste(o.x, o.z);
      if (o.id === 'boost' || o.id === 'itembox' || o.id === 'arch') {
        assert.ok(d <= ROAD_HALF + 1, `circuit ${i} ${o.id} à ${d.toFixed(1)} de la piste (sur la route attendue)`);
      }
      if (o.id === 'tree' || o.id === 'bush') {
        assert.ok(d >= ROAD_HALF + 3, `circuit ${i} ${o.id} à ${d.toFixed(1)} de la piste (hors route attendue)`);
      }
      assert.ok(Number.isFinite(o.x) && Number.isFinite(o.z) && Number.isFinite(o.rotation));
      assert.equal(typeof o.params, 'object');
    }
  }
});

test('genererMonde : seed personnalisée change le monde, samples personnalisés suivis', () => {
  const m1 = genererMonde(0, CIRCUITS[0].points);
  const m2 = genererMonde(0, CIRCUITS[0].points, { seed: 12345 });
  assert.notDeepEqual(m1, m2);
  assert.equal(genererMonde(0, CIRCUITS[0].points, { samples: 60 }).objets.length > 0, true);
  // mondes de circuits différents
  assert.notDeepEqual(genererMonde(0, CIRCUITS[0].points), genererMonde(1, CIRCUITS[1].points));
});
