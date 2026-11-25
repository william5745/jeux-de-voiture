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
├── carte-editeur.js    ← SAUVEGARDE de l'éditeur (généré auto, ne pas modifier)
├── three.module.js     ← moteur Three.js (ne jamais toucher)
├── server.js           ← serveur statique local (port 8080) + endpoint de sauvegarde
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

- choisir un circuit, **déplacer les points du tracé** (poignées sur la courbe) → sauvegarde dans `localStorage('turbo-circuit-pistes')` ;
- **placer des objets** de la bibliothèque en cliquant sur la carte (position x/z + rotation + paramètres éditables dans un panneau) ;
- supprimer/pivoter les objets placés.

### Le pont éditeur → jeu

La sauvegarde passe par **deux canaux** :

```
éditeur.html ── localStorage 'turbo-circuit-carte' ──→ index.html (même origine, localhost:8080)
     │
     └─ POST /__save-carte ──→ server.js ──→ écrit carte-editeur.js ──→ lu par jeu.html (file://)
```

1. `sauvegarder()` écrit la carte dans le `localStorage` (fonctionne quand le jeu est servi par le même serveur).
2. `pousserVersJeu()` envoie en plus un **POST au serveur** (`server.js`, route `/__save-carte`) qui **réécrit le fichier `carte-editeur.js`** avec `window.__CARTE_EDITEUR__ = {...}`. Ainsi, `jeu.html` ouvert directement en `file://` (qui n'a pas accès au localStorage de localhost) lit ce fichier via une balise `<script>` classique.

Au chargement, **`index.html`** fait l'inverse : il lit `window.__CARTE_EDITEUR__.carte` (ou le localStorage), et pour chaque objet placé, retrouve `library[id]`, appelle `build(params)`, positionne le mesh à `(x, z)` avec sa rotation. Idem pour les tracés modifiés (`pistes`) qui remplacent les points par défaut du circuit choisi.

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
objets.js (library) ──────┼─→ index.html / jeu.html  (monde 3D + course)
                          ├─→ editeur.html            (édition)
                          └─→ bibliotheque.html       (visualisation)

editeur.html ── localStorage ──→ index.html
    └─ POST /__save-carte → server.js → carte-editeur.js → jeu.html (file://)
```

En résumé : **les données (circuits, objets) vivent dans des fichiers JS partagés**, le code du jeu est dans `index.html`, et l'éditeur communique avec le jeu via `localStorage` + le fichier `carte-editeur.js` réécrit par le serveur.
