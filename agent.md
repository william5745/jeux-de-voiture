# Règles de l'agent — Turbo Circuit (jeu de voiture 3D)

## Structure du projet
- `index.html` : le jeu principal (monde 3D, karts, course) — servi par défaut par `server.js` sur http://localhost:8080
- `jeu.html` : version autonome/empaquetée du même jeu
- `bibliotheque.html` : la bibliothèque d'objets 3D (visualiseur + catalogue `library`)
- `circuit.html` : page de test minimale du circuit 3D
- `three.module.js` : moteur Three.js (ne pas modifier)
- `server.js` : serveur statique local (port 8080) — lancer avec `node server.js`
- `music/` : musiques et effets sonores

## Règles

1. **Règle bibliothèque (obligatoire)** : à chaque fois qu'un nouvel objet est ajouté dans le monde du jeu (`index.html` / `jeu.html`), il doit aussi être ajouté dans la bibliothèque (`bibliotheque.html`) — c'est-à-dire une entrée dans le catalogue `library` (clé, `icon`, `name`, `params`, fonction `build`) **et** une entrée `<div class="obj-item" data-id="...">` correspondante dans la barre latérale. Un objet présent dans le jeu mais absent de la bibliothèque est un bug à corriger.

2. **Cohérence jeu / bibliothèque** : les deux fichiers doivent rester synchronisés. `jeu.html` est une version autonome de `index.html` : toute modification du monde dans `index.html` doit être répercutée dans `jeu.html`.

3. **Ne jamais modifier `three.module.js`** (dépendance externe).

4. **Serveur local obligatoire** : les pages utilisent des modules ES (`importmap` vers `./three.module.js`) et ne fonctionnent pas en `file://`. Toujours tester via `node server.js` puis http://localhost:8080.

5. **Style du code** : garder le code en français (noms de fonctions, commentaires, textes UI) et le style existant (fonctions `buildXxx` / `addXxx` pour créer les objets du monde, objets littéraux `{ icon, name, params, build }` dans la bibliothèque).

6. **Avant toute modification**, lire le fichier concerné en entier pour comprendre son fonctionnement actuel ; préserver le comportement existant sauf si la tâche demande explicitement un changement.
