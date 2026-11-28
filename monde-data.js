// Données du monde PAR CIRCUIT — module partagé Node.js et navigateur (aucun DOM, aucun THREE).
// Source unique de vérité pour :
//  - la validation/normalisation des données (validerMonde, normaliserObjet, chargerMondeDepuisJson)
//  - le format du miroir file:// monde-<i>.js (texteMiroirJs, utilisé par server.js et tools/)
//  - la fusion génération procédurale + objets existants (fusionnerMondes)
//  - la lecture des ids valides du catalogue (idsBibliothequeDepuisSource)

const VERSION_MONDE = 1;

// Normalise un objet placé : { id, x, z, rotation, params }.
// Retourne null si l'objet est inutilisable (pas un objet, pas d'id string).
function normaliserObjet(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  if (typeof o.id !== 'string' || !o.id) return null;
  const params = (o.params && typeof o.params === 'object' && !Array.isArray(o.params)) ? o.params : {};
  return {
    id: o.id,
    x: +o.x,
    z: +o.z,
    rotation: +o.rotation || 0,
    params
  };
}

// Valide un monde complet pour un circuit donné.
// opts.autoriserVide : autorise objets: [] (défaut false — un fichier circuit ne peut pas être vide)
// opts.idsValides   : tableau d'ids autorisés (ex. clés de library) ; null = non vérifié
// Retourne { ok, erreurs: [...], monde } où monde est la version normalisée (quand possible).
function validerMonde(data, circuitIndex, opts = {}) {
  const autoriserVide = !!opts.autoriserVide;
  const idsValides = Array.isArray(opts.idsValides) ? opts.idsValides : null;
  const erreurs = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, erreurs: ['monde : objet requis'], monde: null };
  }
  if (data.version !== VERSION_MONDE) {
    erreurs.push('version : attendu ' + VERSION_MONDE + ', reçu ' + JSON.stringify(data.version));
  }
  if (data.circuit !== undefined && data.circuit !== circuitIndex) {
    erreurs.push('circuit : attendu ' + circuitIndex + ', reçu ' + JSON.stringify(data.circuit));
  }
  if (!Array.isArray(data.objets)) {
    return { ok: false, erreurs: erreurs.concat('objets : tableau requis'), monde: null };
  }
  if (!autoriserVide && data.objets.length === 0) {
    erreurs.push('objets : un fichier de circuit ne peut pas être vide');
  }
  const objets = [];
  data.objets.forEach((o, i) => {
    const n = normaliserObjet(o);
    if (!n) { erreurs.push('objets[' + i + '] : objet invalide'); return; }
    if (!Number.isFinite(n.x) || !Number.isFinite(n.z)) {
      erreurs.push('objets[' + i + '] (' + n.id + ') : x/z non finis');
      return;
    }
    if (!Number.isFinite(n.rotation)) {
      erreurs.push('objets[' + i + '] (' + n.id + ') : rotation non finie');
      return;
    }
    if (idsValides && !idsValides.includes(n.id)) {
      erreurs.push('objets[' + i + '] : id inconnu "' + n.id + '"');
      return;
    }
    objets.push(n);
  });
  const monde = {
    version: data.version === undefined ? VERSION_MONDE : data.version,
    circuit: circuitIndex,
    objets
  };
  return { ok: erreurs.length === 0, erreurs, monde };
}

// Parse + valide le contenu texte d'un fichier monde-<i>.json.
// Lève une Error si le JSON est invalide ou si la validation échoue. Retourne le monde normalisé.
function chargerMondeDepuisJson(texte, circuitIndex, opts = {}) {
  let data;
  try {
    data = JSON.parse(texte);
  } catch (e) {
    throw new Error('JSON invalide pour le circuit ' + circuitIndex + ' : ' + e.message);
  }
  const v = validerMonde(data, circuitIndex, opts);
  if (!v.ok) {
    throw new Error('Monde du circuit ' + circuitIndex + ' invalide : ' + v.erreurs.join(' ; '));
  }
  return v.monde;
}

// Format unique du miroir monde-<i>.js (lu en file:// par jeu.html via <script>).
function texteMiroirJs(monde, circuitIndex) {
  return '// Généré automatiquement — données du circuit ' + circuitIndex +
    ' (miroir de monde-' + circuitIndex + '.json pour file://)\n' +
    'window.__MONDE__ = ' + JSON.stringify(monde) + ';\n';
}

// Fusionne la génération procédurale initiale avec un monde existant (édité) :
// les objets existants sont conservés sauf s'ils sont en conflit (même id à moins
// de `distance` unités d'un objet généré). Le résultat a toujours le circuit de `genere`.
function fusionnerMondes(genere, existant, opts = {}) {
  const distance = opts.distance !== undefined ? opts.distance : 1.5;
  const objets = genere.objets.map(o => ({ id: o.id, x: o.x, z: o.z, rotation: o.rotation, params: { ...o.params } }));
  const anciens = (existant && Array.isArray(existant.objets)) ? existant.objets : [];
  for (const o of anciens) {
    const n = normaliserObjet(o);
    if (!n || !Number.isFinite(n.x) || !Number.isFinite(n.z)) continue;
    const conflit = objets.some(g => g.id === n.id && Math.hypot(g.x - n.x, g.z - n.z) <= distance);
    if (!conflit) objets.push(n);
  }
  return { version: VERSION_MONDE, circuit: genere.circuit, objets };
}

// Extrait les clés du catalogue `library` depuis le source d'objets.js
// (évite d'importer objets.js en Node, qui a besoin de THREE via l'importmap).
function idsBibliothequeDepuisSource(src) {
  const ids = [];
  const re = /^ {2}([A-Za-z0-9_-]+): \{/gm;
  let m;
  while ((m = re.exec(src)) !== null) ids.push(m[1]);
  return ids;
}

export { VERSION_MONDE, normaliserObjet, validerMonde, chargerMondeDepuisJson, texteMiroirJs, fusionnerMondes, idsBibliothequeDepuisSource };
