// Génère jeu.html : version autonome (un seul fichier) qui marche en file://
// Module ES importable en Node (tests) : l'écriture du fichier n'a lieu que si lancé directement.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DOSSIER = path.dirname(fileURLToPath(import.meta.url));

// Construit le HTML autonome à partir de index.html + three.module.js + objets.js + circuits.js
// (+ monde-data.js et monde-procedural.js si présents). Retourne la chaîne sans écrire.
export function genererJeuHtml(dossier = DOSSIER) {
  let three = fs.readFileSync(path.join(dossier, 'three.module.js'), 'utf8');
  const m = three.match(/export\s*\{([\s\S]*?)\};?\s*$/);
  if (!m) { throw new Error('export introuvable dans three.module.js'); }
  // /!\ utiliser une fonction de remplacement : la source contient des '$'
  // qui seraient interprétés comme des motifs spéciaux sinon
  three = three.replace(/export\s*\{([\s\S]*?)\};?\s*$/, () => 'const THREE = {' + m[1] + '};');

  // Bibliothèque d'objets (objets.js) à embarquer elle aussi dans la version autonome
  let objets = fs.readFileSync(path.join(dossier, 'objets.js'), 'utf8');
  objets = objets
    .replace(/import \* as THREE from 'three';/, '')   // THREE est déjà défini plus haut dans jeu.html
    .replace(/export const library/, 'const library');

  // Tracés des circuits (circuits.js) à embarquer eux aussi
  let circuits = fs.readFileSync(path.join(dossier, 'circuits.js'), 'utf8');
  circuits = circuits.replace(/export const CIRCUITS/, 'const CIRCUITS');

  // Modules de données embarqués eux aussi (monde-data.js puis monde-procedural.js)
  let mondeData = '';
  let mondeProcedural = '';
  const fMondeData = path.join(dossier, 'monde-data.js');
  const fMondeProcedural = path.join(dossier, 'monde-procedural.js');
  if (fs.existsSync(fMondeData)) {
    mondeData = fs.readFileSync(fMondeData, 'utf8')
      .replace(/export\s*\{[\s\S]*?\};?\s*$/, ''); // exports retirés : tout est local dans jeu.html
  }
  if (fs.existsSync(fMondeProcedural)) {
    mondeProcedural = fs.readFileSync(fMondeProcedural, 'utf8')
      .replace(/import \* as THREE from '\.\/three\.module\.js';/, '') // THREE déjà défini plus haut
      .replace(/export\s*\{[\s\S]*?\};?\s*$/, '');
  }

  let html = fs.readFileSync(path.join(dossier, 'index.html'), 'utf8');
  html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
  html = html.replace(
    /<script type="module">\s*import \* as THREE from 'three';/,
    () => '<script type="module">' + three
  );

  // Remplacer les imports par les sources (fonction de remplacement : la source contient des '$')
  html = html.replace(/import \{ library \} from '\.\/objets\.js';/, () => objets);
  html = html.replace(/import \{ CIRCUITS \} from '\.\/circuits\.js';/, () => circuits);
  html = html.replace(/import \{[\s\S]*?\} from '\.\/monde-data\.js';/, () => mondeData);
  html = html.replace(/import \{[\s\S]*?\} from '\.\/monde-procedural\.js';/, () => mondeProcedural);
  if (html.includes("from 'three'")) { throw new Error('import non remplacé'); }
  if (html.includes("from './objets.js'")) { throw new Error('import objets non remplacé'); }
  if (html.includes("from './circuits.js'")) { throw new Error('import circuits non remplacé'); }
  if (html.includes("from './monde-data.js'")) { throw new Error('import monde-data non remplacé'); }
  if (html.includes("from './monde-procedural.js'")) { throw new Error('import monde-procedural non remplacé'); }
  return html;
}

const lanceDirectement = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (lanceDirectement) {
  const html = genererJeuHtml();
  fs.writeFileSync(path.join(DOSSIER, 'jeu.html'), html);
  console.log('jeu.html créé :', html.length, 'caractères');
}
