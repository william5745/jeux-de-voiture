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

let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
html = html.replace(
  /<script type="module">\s*import \* as THREE from 'three';/,
  () => '<script type="module">' + three
);
if (html.includes("from 'three'")) { console.error('import non remplacé'); process.exit(1); }
fs.writeFileSync(path.join(dir, 'jeu.html'), html);
console.log('jeu.html créé :', html.length, 'caractères');
