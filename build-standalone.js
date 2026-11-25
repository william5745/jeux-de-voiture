// Génère jeu.html : version autonome (un seul fichier) qui marche en file://
const fs = require('fs');
const path = require('path');
const dir = __dirname;

let three = fs.readFileSync(path.join(dir, 'three.module.js'), 'utf8');
const m = three.match(/export\s*\{([\s\S]*?)\};?\s*$/);
if (!m) { console.error('export introuvable dans three.module.js'); process.exit(1); }
// /!\ utiliser une fonction de remplacement : la source contient des '$'
// qui seraient interprétés comme des motifs spéciaux sinon
three = three.replace(/export\s*\{([\s\S]*?)\};?\s*$/, () => 'const THREE = {' + m[1] + '};');

// Bibliothèque d'objets (objets.js) à embarquer elle aussi dans la version autonome
let objets = fs.readFileSync(path.join(dir, 'objets.js'), 'utf8');
objets = objets
  .replace(/import \* as THREE from 'three';/, '')   // THREE est déjà défini plus haut dans jeu.html
  .replace(/export const library/, 'const library');

let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
html = html.replace(
  /<script type="module">\s*import \* as THREE from 'three';/,
  () => '<script type="module">' + three
);
// Tracés des circuits (circuits.js) à embarquer eux aussi
let circuits = fs.readFileSync(path.join(dir, 'circuits.js'), 'utf8');
circuits = circuits.replace(/export const CIRCUITS/, 'const CIRCUITS');

// Remplacer les imports par les sources (fonction de remplacement : la source contient des '$')
html = html.replace(/import \{ library \} from '\.\/objets\.js';/, () => objets);
html = html.replace(/import \{ CIRCUITS \} from '\.\/circuits\.js';/, () => circuits);
if (html.includes("from 'three'")) { console.error('import non remplacé'); process.exit(1); }
if (html.includes("from './objets.js'")) { console.error('import objets non remplacé'); process.exit(1); }
if (html.includes("from './circuits.js'")) { console.error('import circuits non remplacé'); process.exit(1); }
fs.writeFileSync(path.join(dir, 'jeu.html'), html);
console.log('jeu.html créé :', html.length, 'caractères');
