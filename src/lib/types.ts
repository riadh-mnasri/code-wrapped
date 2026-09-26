// © 2026 Riadh MNASRI

/** Un fichier touché par un commit, tel que remonté par `git log --numstat`. */
export interface FileChange {
  path: string;
  added: number;
  deleted: number;
}

/** Un commit brut, lu depuis un repo local. */
export interface RawCommit {
  repo: string;
  hash: string;
  /** Date ISO 8601 avec le décalage horaire de l'auteur (ex. 2026-03-14T23:12:05+01:00). */
  date: string;
  subject: string;
  files: FileChange[];
}

export interface RepoInfo {
  /** Nom du dossier local. */
  dir: string;
  /** Nom affichable : le vrai nom si le repo est public, sinon anonymisé. */
  displayName: string;
  isPublic: boolean;
  /** Date ISO du tout premier commit du repo (toutes années confondues). */
  firstCommitDate: string | null;
}

export type Persona = "night-owl" | "early-bird" | "weekend-warrior" | "metronome";

export interface Wrapped {
  year: number;
  /** Dernier jour couvert (AAAA-MM-JJ), utile si l'année n'est pas terminée. */
  periodEnd: string;
  author: string;
  totalCommits: number;
  activeDays: number;
  reposTouched: number;
  newRepos: number;
  linesAdded: number;
  linesDeleted: number;
  longestStreak: { days: number; start: string | null; end: string | null };
  busiestDay: { date: string | null; commits: number };
  /** Lundi = 0 ... dimanche = 6. */
  byWeekday: number[];
  byHour: number[];
  byMonth: number[];
  /** Un compteur par jour de l'année, du 1er janvier à periodEnd. */
  daily: number[];
  nightShare: number;
  earlyShare: number;
  weekendShare: number;
  persona: Persona;
  topRepos: { name: string; commits: number; isPublic: boolean }[];
  languages: { name: string; lines: number; share: number }[];
  commitTypes: { type: string; count: number }[];
  conventionalShare: number;
  testShare: number;
}
