# Architecture — Turbo Circuit

Jeu de course 3D (style Mario Kart) en navigateur, basé sur **Three.js**. Deux joueurs affrontent des bots sur des circuits, avec un éditeur de carte et une bibliothèque d'objets 3D. Tout est en fichiers statiques servis par un petit serveur Node.

Pour lancer : `node server.js` puis http://localhost:8080 (obligatoire, car les pages utilisent des modules ES).

## Arborescence des fichiers

```
jeux de voiture/
├── index.html          ← le JEU principal (monde 3D, karts, IA, HUD, musique)
├── jeu.html            ← version autonome/empaquetée du même jeu (fonctionne en file://)
├── editeur.html        ← l'ÉDITEUR de carte (vue 2D/3D, placement d'objets, tracé)
├── bibliotheque.html   ← visualiseur du catalogue d'objets 3D
├── circuit.html        ← page de test minimale du circuit
├── circuits.js         ← les 4 tracés de circuits (source unique, partagé)
├── objets.js           ← le catalogue d'objets 3D (source unique, partagé)
├── carte-editeur.js    ← SAUVEGARDE des tracés de l'éditeur (généré auto, ne pas modifier)
├── monde-<i>.json      ← données du monde PAR CIRCUIT (générés auto, ne pas modifier)
├── monde-<i>.js        ← miroirs de monde-<i>.json pour jeu.html en file:// (générés auto)
├── three.module.js     ← moteur Three.js (ne jamais toucher)
├── server.js           ← serveur statique local (port 8080) + endpoints de sauvegarde
├── build-standalone.js ← script qui génère jeu.html à partir de index.html
└── music/              ← musiques du jeu
```

## Où sont les circuits

Dans **`circuits.js`** : un tableau `CIRCUITS` avec 4 circuits (Le Mans, Le Serpent, L'Ovale, Le Canyon). Chaque circuit est une **liste de points `[x, z]`** :

```js
{ name: '🏁 Le Mans', points: [[0,-90], [70,-95], ...] }
```

Le jeu transforme ces points en une **courbe de Catmull-Rom fermée** (`index.html`), échantillonnée en 600 points, puis construit la route comme un **ruban triangulé** le long de cette courbe (asphalte, bordures, murs, ligne de départ...). La minimap et la détection de position des karts utilisent ces mêmes échantillons.

## Où sont les objets 3D

Dans **`objets.js`** : un catalogue `library` où chaque objet est une entrée :

```js
tree: { icon: '🌲', name: 'Arbre', params: { trunkColor, leafColor, scale },
        build: p => { ... return mesh; } }
```

Il y a ~20 objets (kart, arbre, barrière, caisse bonus, portique, bâtiment ACO, tribune, mécanicien...). Chaque entrée a une **fonction `build(params)`** qui construit le mesh Three.js. Ce fichier est la **source unique** utilisée par trois pages :

- **`bibliotheque.html`** : affiche le catalogue (barre latérale avec les `data-id`) et rend l'objet sélectionné en 3D avec ses paramètres réglables.
- **`index.html`** : importe `library` et s'en sert pour instancier les objets placés par l'éditeur (`chargerCarteEditeur()`).

## Comment fonctionne l'éditeur de carte

**`editeur.html`** permet de :

- choisir un circuit (barre de boutons), **voir le tracé** (lecture seule) ; les tracés modifiés sont écrits dans `carte-editeur.js` via `POST /__save-carte` ;
- **placer des objets** de la bibliothèque en cliquant sur la carte (position x/z + rotation + paramètres éditables dans un panneau) ;
- supprimer/pivoter les objets placés.

### Le pont éditeur → jeu

**Jouer ne demande aucun serveur** (hébergement statique GitHub Pages — `.nojekyll` — ou `file://` pour `jeu.html`) : le jeu ne lit que des **fichiers commités** et n'utilise **jamais `localStorage`**. **Éditer demande le serveur local** (`node server.js`) : la seule écriture possible est un POST au serveur.

```
éditeur.html ── POST /__save-carte ──→ server.js ──→ réécrit carte-editeur.js (commité)
     │                                                  ↑ lu par index.html / jeu.html (file://)
     └─ POST /__save-monde {circuit: i, objets: [...]} ──→ server.js
                                                          ├─→ monde-<i>.json  (source de vérité, commité)
                                                          └─→ monde-<i>.js    (miroir commité, <script>)
```

1. `sauvegarder()` envoie un **POST au serveur** (`server.js`, route `/__save-monde` ou `/__save-carte`) qui **réécrit le fichier de données** correspondant (validé par `monde-data.js`, 400 si invalide).
2. Sans serveur, l'éditeur affiche une erreur : il charge les données UNIQUEMENT par `fetch('monde-<i>.json')`.

### Un fichier de données par circuit (commité, jamais vide)

Le décor de chaque circuit vit dans **un fichier commité par circuit** — monde-<i>.json (source de vérité) + monde-<i>.js (miroir) — rempli à l'initialisation par la génération procédurale (npm run mondes) :



- index.html injecte dans son <head> la balise <script src="./monde-<i>.js"> correspondant au paramètre ?circuit=<i>, puis lit les données (fetch du .json en priorité, miroir .js en secours — tous deux commités, donc servis en statique) : **chaque circuit a ses propres objets**.
- editeur.html, quand on change de circuit dans la barre, recharge monde-<i>.json par fetch et ne sauvegarde que par POST vers le serveur.
- Au chargement, le jeu valide les données (validerMonde / chargerMondeDepuisJson, monde-data.js), puis pour chaque objet placé retrouve library[id], appelle build(params), positionne le mesh à (x, z) avec sa rotation. Idem pour les tracés modifiés (pistes dans carte-editeur.js) qui remplacent les points par défaut du circuit choisi.
- **Le mode procédural ne sert qu'à la génération initiale des fichiers** (monde-procedural.js via npm run mondes) — jamais à l'exécution dans le jeu.

## Comment le jeu fonctionne (index.html, ~1700 lignes)

Un seul gros module ES qui fait tout :

```
import three → scène, lumières, ciel, brouillard
import CIRCUITS → tracé → courbe → ruban de route + éléments (boost, caisses, stands, ACO...)
import library → objets placés par l'éditeur
karts (2 joueurs + 4 ou 15 bots) → physique (accélération, drift, mini-turbo, pneus, stands)
IA des bots (visent un point devant eux sur la piste)
boucle de jeu (requestAnimationFrame) → entrées clavier → update → caméras 2 écrans → HUD + minimaps
```

- **Deux joueurs en écran partagé** : J1 (ZQSD) et J2 (flèches), chacun avec sa caméra et sa minimap.
- **Qualification automatique** avant la course, puis 8 tours, chronos, pneus qui s'usent (−25 %/tour), arrêts aux stands avec mécaniciens.
- `jeu.html` est généré automatiquement par `build-standalone.js` à partir de `index.html` : toute modif du monde doit être répercutée dans les deux.

## Schéma récapitulatif des flux

```
circuits.js ──────────────┐
objets.js (library) ──────┼─→ index.html / jeu.html  (monde 3D + course, jouable en STATIQUE)
                          ├─→ editeur.html            (édition : serveur local obligatoire)
                          └─→ bibliotheque.html       (visualisation)

monde-<i>.json + monde-<i>.js + carte-editeur.js ── commités ──→ lus tels quels par le jeu (?circuit=<i>)
éditeur.html ── POST /__save-monde ──→ server.js ──→ monde-<i>.json + monde-<i>.js (commités ensuite)
éditeur.html ── POST /__save-carte ──→ server.js ──→ carte-editeur.js (commité ensuite)
```

En résumé : **les tracés et le catalogue d'objets vivent dans des fichiers JS partagés**, le code du jeu est dans `index.html`, les données de chaque circuit dans **un fichier JSON commité par circuit** (`monde-<i>.json` + miroir `.js`) que le jeu lit tel quel (statique, `?circuit=<i>`, aucun localStorage), et que seul le serveur local peut modifier via l'éditeur.
