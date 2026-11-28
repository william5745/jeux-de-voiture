# Règles de l'agent — Turbo Circuit (jeu de voiture 3D)

## Structure du projet
- `index.html` : le jeu principal (monde 3D, karts, course) — servi par `server.js` sur http://localhost:8080, mais **jouable en statique** (fichiers commités + `?circuit=<i>`)
- `jeu.html` : version autonome/empaquetée du même jeu, jouable en `file://` (générée par `build-standalone.js`, ne pas modifier à la main)
- `editeur.html` : l'éditeur de carte (placement d'objets, sauvegarde par circuit)
- `bibliotheque.html` : la bibliothèque d'objets 3D (visualiseur + catalogue `library`)
- `circuit.html` : page de test minimale du circuit 3D
- `circuits.js` : les tracés des circuits (source unique, partagée jeu/éditeur/tests)
- `objets.js` : le catalogue d'objets 3D `library` (source unique, partagée)
- `monde-data.js` : validation / normalisation / format des données de monde (module pur, Node + navigateur)
- `monde-procedural.js` : génération procédurale déterministe du monde d'un circuit (module pur, Node + navigateur)
- `monde-<i>.json` : **données du circuit i — source unique de vérité** (voir règles 7-8)
- `monde-<i>.js` : miroir auto-généré de `monde-<i>.json` pour le file:// (ne pas modifier à la main)
- `carte-editeur.js` : sauvegarde des tracés de l'éditeur (généré auto, ne pas modifier)
- `tools/generer-mondes.js` : régénère les `monde-<i>.json` + miroirs (`npm run mondes`)
- `tests/` : tests unitaires Node (`node --test`, voir règle 12)
- `three.module.js` : moteur Three.js (ne pas modifier)
- `server.js` : serveur statique local (port 8080) + endpoints de sauvegarde — lancer avec `node server.js`
- `package.json` : scripts (`npm start`, `npm test`, `npm run couverture`, `npm run build`, `npm run mondes`)
- `music/` : musiques et effets sonores

## Règles

1. **Règle bibliothèque (obligatoire)** : à chaque fois qu'un nouvel objet est ajouté dans le monde du jeu (`index.html` / `jeu.html`), il doit aussi être ajouté dans la bibliothèque (`bibliotheque.html`) — c'est-à-dire une entrée dans le catalogue `library` (clé, `icon`, `name`, `params`, fonction `build`) **et** une entrée `<div class="obj-item" data-id="...">` correspondante dans la barre latérale. Un objet présent dans le jeu mais absent de la bibliothèque est un bug à corriger.

2. **Cohérence jeu / bibliothèque** : les deux fichiers doivent rester synchronisés. `jeu.html` est une version autonome de `index.html` : toute modification du monde dans `index.html` doit être répercutée dans `jeu.html` via `npm run build` (`build-standalone.js` embarque automatiquement `circuits.js`, `objets.js`, `monde-data.js` et `monde-procedural.js`).

3. **Ne jamais modifier `three.module.js`** (dépendance externe).

4. **Serveur local obligatoire** : les pages utilisent des modules ES (`importmap` vers `./three.module.js`) et ne fonctionnent pas en `file://`. Toujours tester via `node server.js` puis http://localhost:8080.

5. **Style du code** : garder le code en français (noms de fonctions, commentaires, textes UI) et le style existant (fonctions `buildXxx` / `addXxx` pour créer les objets du monde, objets littéraux `{ icon, name, params, build }` dans la bibliothèque).

6. **Avant toute modification**, lire le fichier concerné en entier pour comprendre son fonctionnement actuel ; préserver le comportement existant sauf si la tâche demande explicitement un changement.

7. **Un fichier de données JSON par circuit, commité (obligatoire)** : chaque circuit a UN fichier `monde-<i>.json` à la racine du projet — source unique de vérité de son décor, **commité dans git** (il doit être servi tel quel par un hébergement statique) et **jamais vide** : il contient au minimum la génération procédurale initiale (règle 10), y compris les objets de gameplay (portique `arch`, pads `boost`, caisses `itembox`). Le miroir `monde-<i>.js` est commité lui aussi.

8. **Jouable en statique — CONTRAINTE PRINCIPALE** : le jeu (`index.html` / `jeu.html`) doit tourner **sans serveur local**, y compris sur un hébergement statique (GitHub Pages — `.nojekyll` — ou tout serveur de fichiers) et en `file://` pour `jeu.html`. Lecture des données UNIQUEMENT depuis les fichiers commités : `monde-<i>.json` (fetch relatif) ou son miroir `monde-<i>.js` (`<script>` injecté dans le `<head>`) ; un éventuel tracé modifié est lu dans `carte-editeur.js` (commité). La sélection du circuit se fait via le **paramètre d'URL `?circuit=<i>`**. **Aucun `localStorage` dans `index.html`, `jeu.html` ou `editeur.html`** pour les données (monde, pistes, circuit choisi) — imposé par un test (`tests/statique.test.js`).

9. **Édition = serveur local obligatoire** : la seule façon de modifier un fichier de données est le serveur local (`node server.js`) : `POST /__save-monde` / `POST /__save-carte` réécrivent `monde-<i>.json` + `monde-<i>.js` / `carte-editeur.js` (validés par `monde-data.js`, 400 si invalide). `editeur.html` charge les données UNIQUEMENT par `fetch('monde-<i>.json')` : sans serveur, il affiche une erreur et ne sauvegarde rien. C'est OK : jouer ne demande rien, éditer demande `node server.js`.

10. **Mode procédural = génération initiale des fichiers uniquement** : `monde-procedural.js` (`genererMonde(i, points)`, déterministe, seed fixe) ne sert qu'à produire les `monde-<i>.json` via `npm run mondes` (`tools/generer-mondes.js`, qui fusionne les objets existants non conflictuels). **Interdit d'appeler `genererMonde` à l'exécution dans les pages** : le jeu ne génère jamais de monde au chargement, il lit le fichier commité (ou plante proprement s'il manque).

11. **Validation systématique des données** : avant usage, toute donnée de monde est validée par `validerMonde(data, circuitIndex)` (`monde-data.js`) : structure, `circuit` cohérent avec le fichier, objets non vide (fichier jamais vide), coordonnées finies, ids connus de la bibliothèque. Le serveur valide aussi les `POST /__save-monde` et refuse les données invalides (400).

12. **Fichiers générés, jamais édités à la main** : `monde-<i>.js` et `carte-editeur.js` sont écrits automatiquement (serveur, éditeur, `tools/generer-mondes.js`) via `texteMiroirJs()` (`monde-data.js`) pour garantir un format unique. Toute modification de `monde-<i>.json` doit être accompagnée de la régénération de son miroir.

13. **Tests obligatoires** : `npm test` lance les tests unitaires Node (`node --test`, dossier `tests/`). La couverture doit rester **≥ 80 %** (lignes, fonctions ET branches) sur les modules JS racine (`circuits.js`, `monde-data.js`, `monde-procedural.js`, `server.js`, `build-standalone.js`) : `npm run couverture` impose les seuils via `--test-coverage-lines/functions/branches=80` et échoue sinon. Ne jamais laisser la couverture descendre sous 80 %. `tests/statique.test.js` vérifie en plus les règles 8-10 au niveau des sources des pages.

14. **Modules testables en Node** : `circuits.js`, `monde-data.js`, `monde-procedural.js`, `server.js` et `build-standalone.js` doivent rester importables en Node (ES modules, `package.json` avec `"type": "module"`) : pas de `require`, pas de DOM ni de `window` au niveau module (les accès navigateur restent dans les pages HTML). `server.js` et `build-standalone.js` n'exécutent leur effet de bord (listen / écriture) que s'ils sont lancés directement.
