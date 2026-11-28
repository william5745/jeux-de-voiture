// Régénère les fichiers de données de TOUS les circuits :
//   monde-<i>.json (source de vérité, JAMAIS vide) + monde-<i>.js (miroir file://)
// à partir de la génération procédurale initiale (monde-procedural.js), en conservant
// les objets existants du fichier (ex. placés dans l'éditeur) non conflictuels.
// Lancer avec : npm run mondes   (ou : node tools/generer-mondes.js)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CIRCUITS } from '../circuits.js';
import { genererMonde } from '../monde-procedural.js';
import { validerMonde, chargerMondeDepuisJson, fusionnerMondes, texteMiroirJs, idsBibliothequeDepuisSource } from '../monde-data.js';
import { ecrireMondeCircuit } from '../server.js';

const DOSSIER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function genererFichiersMondes(dossier = DOSSIER) {
  const ids = idsBibliothequeDepuisSource(fs.readFileSync(path.join(dossier, 'objets.js'), 'utf8'));
  const resumes = [];
  for (let i = 0; i < CIRCUITS.length; i++) {
    const gen = genererMonde(i, CIRCUITS[i].points);
    let monde = gen;
    const f = path.join(dossier, 'monde-' + i + '.json');
    if (fs.existsSync(f)) {
      try {
        const ancien = chargerMondeDepuisJson(fs.readFileSync(f, 'utf8'), i, { autoriserVide: true });
        monde = fusionnerMondes(gen, ancien); // conserve les objets édités non conflictuels
      } catch (e) {
        console.warn('monde-' + i + '.json illisible (' + e.message + ') — regénéré depuis le procédural.');
      }
    }
    // Un fichier circuit ne peut JAMAIS être vide : on refuse une génération vide.
    const v = validerMonde(monde, i, { idsValides: ids });
    if (!v.ok) throw new Error('monde-' + i + '.json invalide : ' + v.erreurs.join(' ; '));
    if (!monde.objets.length) throw new Error('monde-' + i + '.json vide interdit (règle 7 d\'agent.md)');
    ecrireMondeCircuit(dossier, i, monde);
    resumes.push('monde-' + i + '.json : ' + monde.objets.length + ' objets (circuit ' + i + ', ' + CIRCUITS[i].name + ')');
  }
  return resumes;
}

const lanceDirectement = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanceDirectement) {
  for (const r of genererFichiersMondes()) console.log(r);
  console.log('OK — fichiers monde-<i>.json + miroirs .js régénérés.');
}
