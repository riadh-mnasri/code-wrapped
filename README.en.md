# Code Wrapped

My year in code, Spotify Wrapped style: a script scans all my local git repos and turns them into 10 shareable cards (commits, longest streak, busiest day, time-of-day profile, top repos, languages, commit discipline). Each card exports as a 1080×1350 PNG, the portrait format LinkedIn shows full size.

[Lire en français](./README.md)

## What it measures

- Commits this year, active days, average per coding day
- First commit of the year and best month
- Longest streak of consecutive days, with a GitHub-style heatmap
- Busiest day and favourite weekday
- Time-of-day profile (night owl, early bird, weekend warrior, metronome) and peak hour
- Repos touched, repos created this year, top 5
- Lines of code added and deleted, language breakdown (docs and config excluded)
- Share of Angular-style commits, most frequent types, share of test lines

## Privacy

`src/data/wrapped.json` only holds aggregates. Commit messages are never exported. A repo that is private on GitHub (or has no GitHub remote) shows up as "Private project A, B, C…". To show the name of a private repo you are happy to reveal: `--reveal name1,name2`.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4
- `html-to-image` for PNG export
- Vitest for the stats tests
- TypeScript scan script run with `tsx`, plus the `git` and `gh` CLIs

## Getting started

```bash
npm install
npm run scan          # writes src/data/wrapped.json from ~/IdeaProjects
npm run dev           # http://localhost:3525
```

Scan options:

```bash
npm run scan -- --root ~/IdeaProjects --year 2026 --author riadh --owner riadh-mnasri --reveal riachess
```

- `--root`: folder containing the repos (default `~/IdeaProjects`)
- `--year`: year to cover (default: current year, up to today)
- `--author`: case-insensitive pattern matched against commit authors, which filters out bots
- `--owner`: GitHub account used to find out which repos are public (via `gh repo list`)
- `--reveal`: private repos whose name may be shown

No environment variables needed. Without an authenticated `gh`, every repo is treated as private.

## Tests

```bash
npm test
```

## Deployment

Static site on Vercel, deployed on every push to `main`. To refresh the numbers: run `npm run scan` again, commit `src/data/wrapped.json` and push.

## Roadmap

- [x] Multi-repo scan, private repo anonymisation
- [x] 10 cards in FR/EN, 1080×1350 PNG export
- [ ] Open Graph image generated from the summary card
- [ ] Year-over-year comparison

---

© 2026 Riadh MNASRI
