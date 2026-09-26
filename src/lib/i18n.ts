// © 2026 Riadh MNASRI
import type { Persona } from "./types";

export type Locale = "fr" | "en";

const fr = {
  intro: { kicker: "Ton année de code", period: (from: string, to: string) => `du ${from} au ${to}` },
  commits: {
    label: "commits",
    days: (n: string) => `en ${n} jours actifs`,
    perDay: (n: string) => `soit ${n} commits par jour où tu as codé.`,
  },
  launch: {
    title: (day: string) => `Tout a démarré le ${day}.`,
    record: (month: string, n: string) => `Mois record : ${month}, ${n} commits.`,
    empty: "Pas encore de commit cette année.",
  },
  streak: {
    title: (n: string) => `${n} jours d'affilée.`,
    range: (from: string, to: string) => `Ta plus longue série, du ${from} au ${to}.`,
    legendLess: "moins",
    legendMore: "plus",
  },
  busiest: {
    kicker: "Ton jour le plus intense",
    commits: (n: string) => `${n} commits en une journée.`,
    favorite: (day: string) => `Ton jour préféré pour coder : le ${day}.`,
  },
  persona: {
    kicker: "Ton profil",
    names: {
      "night-owl": "Oiseau de nuit",
      "early-bird": "Lève-tôt",
      "weekend-warrior": "Guerrier du week-end",
      metronome: "Métronome",
    } satisfies Record<Persona, string>,
    lines: {
      "night-owl": (pct: string) => `${pct} de tes commits partent entre 22 h et 5 h.`,
      "early-bird": (pct: string) => `${pct} de tes commits partent avant 9 h.`,
      "weekend-warrior": (pct: string) => `${pct} de tes commits tombent le week-end.`,
      metronome: (pct: string) => `Des horaires de bureau, ou presque : seulement ${pct} la nuit.`,
    } satisfies Record<Persona, (pct: string) => string>,
    peak: (hour: string) => `Heure de pointe : ${hour}.`,
  },
  repos: {
    touched: "repos touchés",
    created: (n: string) => `dont ${n} créés cette année`,
    allCreated: "tous créés cette année",
    top: "Ton top 5",
    private: "Projet privé",
  },
  languages: {
    lines: "lignes de code ajoutées",
    deleted: (n: string) => `et ${n} supprimées, parce que le meilleur code est parfois celui qu'on enlève.`,
  },
  discipline: {
    kicker: "Discipline",
    conventional: "de commits au format Angular",
    tests: (pct: string) => `${pct} des lignes ajoutées sont des tests.`,
  },
  summary: { title: "Mon année de code", commits: "commits", days: "jours actifs", repos: "repos", streak: "jours de série", top: "Langage n°1", persona: "Profil" },
  ui: {
    next: "Suivant",
    prev: "Précédent",
    download: "Télécharger l'image",
    downloading: "Génération…",
    switchTo: "EN",
    hint: "Touche un bord ou utilise les flèches du clavier",
    generatedFrom: "Généré depuis mes repos git locaux",
  },
  weekdays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
  weekdaysShort: ["L", "M", "M", "J", "V", "S", "D"],
  monthsShort: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
};

export type Dictionary = typeof fr;

const en: Dictionary = {
  intro: { kicker: "Your year in code", period: (from, to) => `from ${from} to ${to}` },
  commits: {
    label: "commits",
    days: (n) => `over ${n} active days`,
    perDay: (n) => `That's ${n} commits for every day you coded.`,
  },
  launch: {
    title: (day) => `It all started on ${day}.`,
    record: (month, n) => `Best month: ${month}, ${n} commits.`,
    empty: "No commits yet this year.",
  },
  streak: {
    title: (n) => `${n} days in a row.`,
    range: (from, to) => `Your longest streak, from ${from} to ${to}.`,
    legendLess: "less",
    legendMore: "more",
  },
  busiest: {
    kicker: "Your busiest day",
    commits: (n) => `${n} commits in a single day.`,
    favorite: (day) => `Your favourite day to code: ${day}.`,
  },
  persona: {
    kicker: "Your profile",
    names: {
      "night-owl": "Night owl",
      "early-bird": "Early bird",
      "weekend-warrior": "Weekend warrior",
      metronome: "Metronome",
    },
    lines: {
      "night-owl": (pct) => `${pct} of your commits land between 10 pm and 5 am.`,
      "early-bird": (pct) => `${pct} of your commits land before 9 am.`,
      "weekend-warrior": (pct) => `${pct} of your commits land on weekends.`,
      metronome: (pct) => `Office hours, almost: only ${pct} at night.`,
    },
    peak: (hour) => `Peak hour: ${hour}.`,
  },
  repos: {
    touched: "repos touched",
    created: (n) => `${n} of them created this year`,
    allCreated: "all of them created this year",
    top: "Your top 5",
    private: "Private project",
  },
  languages: {
    lines: "lines of code added",
    deleted: (n) => `and ${n} deleted, because sometimes the best code is the code you remove.`,
  },
  discipline: {
    kicker: "Discipline",
    conventional: "of commits follow the Angular convention",
    tests: (pct) => `${pct} of the lines you added are tests.`,
  },
  summary: { title: "My year in code", commits: "commits", days: "active days", repos: "repos", streak: "day streak", top: "Top language", persona: "Profile" },
  ui: {
    next: "Next",
    prev: "Previous",
    download: "Download image",
    downloading: "Rendering…",
    switchTo: "FR",
    hint: "Tap an edge or use the arrow keys",
    generatedFrom: "Generated from my local git repos",
  },
  weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  weekdaysShort: ["M", "T", "W", "T", "F", "S", "S"],
  monthsShort: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
};

export const dictionaries: Record<Locale, Dictionary> = { fr, en };

const tags: Record<Locale, string> = { fr: "fr-FR", en: "en-GB" };

// Intl sépare les milliers en français par une espace fine insécable (U+202F) que
// toutes les polices ne dessinent pas : on la remplace par une espace insécable classique.
const NARROW_NBSP = /\u202f/g;

export function formatNumber(n: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(tags[locale], { maximumFractionDigits: digits, minimumFractionDigits: digits })
    .format(n)
    .replace(NARROW_NBSP, "\u00a0");
}

export function formatPercent(ratio: number, locale: Locale): string {
  return new Intl.NumberFormat(tags[locale], { style: "percent", maximumFractionDigits: 0 })
    .format(ratio)
    .replace(NARROW_NBSP, "\u00a0");
}

/** Formate une date AAAA-MM-JJ sans passer par le fuseau du navigateur. */
export function formatDay(isoDay: string, locale: Locale, withYear = false): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat(tags[locale], {
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
  // En français on écrit « 1er janvier », pas « 1 janvier ».
  return locale === "fr" && d === 1 ? formatted.replace(/^1 /, "1er ") : formatted;
}

export function formatMonth(monthIndex: number, locale: Locale): string {
  return new Intl.DateTimeFormat(tags[locale], { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, monthIndex, 1)));
}

export function formatHour(hour: number, locale: Locale): string {
  return locale === "fr" ? `${hour} h` : `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "am" : "pm"}`;
}
