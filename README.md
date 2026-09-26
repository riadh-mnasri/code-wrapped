# Code Wrapped

Mon année de code façon Spotify Wrapped : un script scanne tous mes repos git locaux et en tire 10 cartes à partager (commits, série la plus longue, jour le plus intense, profil horaire, top repos, langages, discipline de commit). Chaque carte s'exporte en PNG 1080×1350, le format portrait que LinkedIn affiche en grand.

[Read this in English](./README.en.md)

## Ce que ça mesure

- Commits de l'année, jours actifs, moyenne par jour codé
- Date du premier commit de l'année et mois record
- Plus longue série de jours consécutifs, avec une heatmap façon GitHub
- Jour le plus intense et jour de la semaine préféré
- Profil horaire (oiseau de nuit, lève-tôt, guerrier du week-end, métronome) et heure de pointe
- Repos touchés, repos créés dans l'année, top 5
- Lignes de code ajoutées et supprimées, répartition par langage (la doc et la config sont exclues)
- Part des commits au format Angular, types les plus fréquents, part des lignes de test

## Confidentialité

Le fichier `src/data/wrapped.json` ne contient que des agrégats. Les messages de commit ne sont jamais exportés. Un repo privé sur GitHub (ou sans remote GitHub) apparaît comme « Projet privé A, B, C… ». Pour afficher le nom d'un repo privé que tu acceptes de montrer : `--reveal nom1,nom2`.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4
- `html-to-image` pour l'export PNG
- Vitest pour les tests du calcul des stats
- Script de scan en TypeScript lancé avec `tsx`, `git` et `gh` en ligne de commande

## Démarrage

```bash
npm install
npm run scan          # génère src/data/wrapped.json à partir de ~/IdeaProjects
npm run dev           # http://localhost:3525
```

Options du scan :

```bash
npm run scan -- --root ~/IdeaProjects --year 2026 --author riadh --owner riadh-mnasri --reveal riachess
```

- `--root` : dossier qui contient les repos (défaut `~/IdeaProjects`)
- `--year` : année à couvrir (défaut : l'année en cours, jusqu'à aujourd'hui)
- `--author` : motif (insensible à la casse) qui filtre l'auteur des commits, ce qui écarte les bots
- `--owner` : compte GitHub utilisé pour savoir quels repos sont publics (via `gh repo list`)
- `--reveal` : repos privés dont le nom peut être affiché

Aucune variable d'environnement n'est nécessaire. Sans `gh` authentifié, tous les repos sont traités comme privés.

## Tests

```bash
npm test
```

## Déploiement

Site statique sur Vercel, déployé à chaque push sur `main`. Pour mettre à jour les chiffres : relancer `npm run scan`, committer `src/data/wrapped.json` et pousser.

## Feuille de route

- [x] Scan multi-repos, anonymisation des repos privés
- [x] 10 cartes FR/EN, export PNG 1080×1350
- [ ] Image Open Graph générée à partir de la carte récap
- [ ] Comparaison avec l'année précédente

---

© 2026 Riadh MNASRI
