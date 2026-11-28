// Génération procédurale initiale du monde d'un circuit — module partagé Node.js et navigateur.
// C'est LA source unique de la génération procédurale (règle 9 d'agent.md) :
//  - déterministe (seed dérivé de l'index du circuit) → régénérer donne toujours le même monde ;
//  - produit des DONNÉES (objets { id, x, z, rotation, params }), pas des meshes :
//    elles sont ensuite écrites dans monde-<i>.json puis relues telles quelles par le jeu et l'éditeur.
// Constantes de piste identiques à celles du jeu (index.html les importe depuis ce module).
import * as THREE from './three.module.js';

const SAMPLES = 600;      // échantillons de la courbe de la piste
const ROAD_HALF = 13;     // demi-largeur de la route
const TENSION = 0.6;      // tension de la Catmull-Rom (identique au jeu et à l'éditeur)

// RNG déterministe mulberry32 — même seed = même suite de nombres
function creerRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Échantillonne la courbe fermée du tracé (Catmull-Rom, paramétrée par longueur d'arc,
// exactement comme THREE.CatmullRomCurve3.getPointAt utilisé par le jeu).
function echantillonnerCourbe(points, nb = SAMPLES, tension = TENSION) {
  const v = points.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(v, true, 'catmullrom', tension);
  const samples = [];
  for (let i = 0; i < nb; i++) samples.push(curve.getPointAt(i / nb));
  return { curve, samples };
}

// Vrai si (x, z) est à au moins minDist de TOUS les échantillons de la piste
function isFarFromTrack(samples, x, z, minDist) {
  const minD2 = minDist * minDist;
  for (let i = 0; i < samples.length; i += 3) { // étape de 3 pour alléger le calcul
    const dx = samples[i].x - x, dz = samples[i].z - z;
    if (dx * dx + dz * dz < minD2) return false;
  }
  return true;
}

const arr = v => Math.round(v * 100) / 100; // arrondi 2 décimales pour des fichiers JSON propres

// Génère le monde procédural initial du circuit `circuitIndex` à partir de ses points [x, z].
// opts.seed    : seed du RNG (défaut : dérivé de circuitIndex → reproductible)
// opts.samples : nombre d'échantillons de piste (défaut SAMPLES)
// Retourne { version: 1, circuit, objets: [...] } — données pures, sans aucun mesh.
function genererMonde(circuitIndex, points, opts = {}) {
  const nb = opts.samples || SAMPLES;
  const { curve, samples } = echantillonnerCourbe(points, nb);
  const rng = creerRng(opts.seed !== undefined ? opts.seed : 1000 + circuitIndex * 77);
  const objets = [];
  const poser = (id, x, z, rotationDeg, params) => {
    objets.push({ id, x: arr(x), z: arr(z), rotation: arr(rotationDeg || 0), params: params || {} });
  };
  const tangent = i => curve.getTangentAt(i / nb);
  const cote = t => new THREE.Vector3(-t.z, 0, t.x).normalize();

  // Portique de départ (objet data : 'arch')
  {
    const p0 = samples[0], t0 = tangent(0);
    poser('arch', p0.x, p0.z, Math.atan2(-t0.x, -t0.z) * 180 / Math.PI,
      { color: '#d8342c', width: (ROAD_HALF + 1.2) * 2 });
  }

  // Tour ACO juste après la ligne de départ (uniquement sur Le Mans) — objet data : 'aco'
  if (circuitIndex === 0) {
    const i = Math.floor(0.05 * nb);
    const p = samples[i], t = tangent(i), side = cote(t);
    poser('aco', p.x + side.x * (ROAD_HALF + 25), p.z + side.z * (ROAD_HALF + 25),
      Math.atan2(-t.z, t.x) * 180 / Math.PI, {});
  }

  // Barrières sur les extérieurs des virages serrés (fractions spécifiques au Mans)
  if (circuitIndex === 0) {
    const barrierSpots = [
      [0.03, 0.16],  // virage est
      [0.28, 0.42],  // virage nord-est
      [0.55, 0.68],  // virage ouest
      [0.80, 0.93]   // virage sud-ouest
    ];
    for (const [a, b] of barrierSpots) {
      for (let k = 0; k < 4; k++) {
        const frac = a + (b - a) * (k / 3);
        const i = Math.floor(frac * nb);
        const p = samples[i], t = tangent(i), side = cote(t);
        const rot = Math.atan2(t.x, t.z) * 180 / Math.PI;
        poser('barrier', p.x + side.x * (ROAD_HALF + 1.8), p.z + side.z * (ROAD_HALF + 1.8), rot, {});
        poser('barrier', p.x - side.x * (ROAD_HALF + 1.8), p.z - side.z * (ROAD_HALF + 1.8), rot, {});
      }
    }
  }

  // Pads de boost sur la piste
  [0.25, 0.55, 0.8].forEach(frac => {
    const i = Math.floor(frac * nb);
    const p = samples[i], t = tangent(i);
    const rot = Math.atan2(-t.x, -t.z) * 180 / Math.PI;
    poser('boost', p.x, p.z, rot, { width: ROAD_HALF * 2, length: 5 });
  });

  // Caisses bonus "?" sur la piste (3 par zone, style Mario Kart)
  [0.18, 0.45, 0.72].forEach(frac => {
    const i = Math.floor(frac * nb);
    const p = samples[i], side = cote(tangent(i));
    [-ROAD_HALF * 0.5, 0, ROAD_HALF * 0.5].forEach(off => {
      poser('itembox', p.x + side.x * off, p.z + side.z * off, 0, {});
    });
  });

  // Arbres de chaque côté de la piste
  for (let i = 0; i < nb; i += 20) {
    const p = samples[i], side = cote(tangent(i));
    const r1 = 22 + (i % 3) * 5, r2 = 22 + ((i + 7) % 3) * 5;
    const x1 = p.x + side.x * r1, z1 = p.z + side.z * r1;
    const x2 = p.x - side.x * r2, z2 = p.z - side.z * r2;
    if (isFarFromTrack(samples, x1, z1, ROAD_HALF + 6)) poser('tree', x1, z1, rng() * 360, {});
    if (isFarFromTrack(samples, x2, z2, ROAD_HALF + 6)) poser('tree', x2, z2, rng() * 360, {});
  }
  // Quelques arbres au centre (uniquement sur Le Mans, coordonnées fixes)
  if (circuitIndex === 0) {
    [[0, 20], [40, 60], [-60, 40], [30, -30], [-30, -20]].forEach(([x, z]) => poser('tree', x, z, 0, {}));
  }

  // Buissons et fleurs colorées le long de la piste
  const flowerColors = ['#ff6f91', '#ffd54f', '#ba68c8', '#ffffff'];
  for (let i = 0; i < nb; i += 7) {
    const p = samples[i], side = cote(tangent(i));
    const r = ROAD_HALF + 8 + (i % 5);
    const s = i % 2 ? 1 : -1;
    const bx = p.x + side.x * r * s, bz = p.z + side.z * r * s;
    if (isFarFromTrack(samples, bx, bz, ROAD_HALF + 5)) {
      poser('bush', bx, bz, rng() * 360, { color: '#388e3c', scale: 1 + (i % 3) * 0.4 });
      if (i % 14 === 0) {
        const fx = p.x - side.x * (r + 1.5) * s, fz = p.z - side.z * (r + 1.5) * s;
        if (isFarFromTrack(samples, fx, fz, ROAD_HALF + 2)) {
          poser('flower', fx, fz, 0, { color: flowerColors[i % 4], scale: 1 });
        }
      }
    }
  }

  return { version: 1, circuit: circuitIndex, objets };
}

export { SAMPLES, ROAD_HALF, TENSION, creerRng, echantillonnerCourbe, isFarFromTrack, genererMonde };
