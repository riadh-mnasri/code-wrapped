// © 2026 Riadh MNASRI
import type { Persona, RawCommit, RepoInfo, Wrapped } from "./types";

export const COMMIT_MARKER = "@@@";

/**
 * Lit la sortie de `git log --format=@@@%H|%aI|%s --numstat`.
 * Les fichiers binaires (« - - chemin ») sont ignorés.
 */
export function parseGitLog(output: string, repo: string): RawCommit[] {
  const commits: RawCommit[] = [];
  let current: RawCommit | null = null;

  for (const line of output.split("\n")) {
    if (line.startsWith(COMMIT_MARKER)) {
      const [hash, date, ...subject] = line.slice(COMMIT_MARKER.length).split("|");
      current = { repo, hash, date, subject: subject.join("|"), files: [] };
      commits.push(current);
      continue;
    }
    const match = /^(\d+)\t(\d+)\t(.+)$/.exec(line);
    if (match && current) {
      current.files.push({ path: match[3], added: Number(match[1]), deleted: Number(match[2]) });
    }
  }
  return commits;
}

const IGNORED_PATH = /(^|\/)(node_modules|\.next|dist|build|out|target|vendor|coverage|\.gradle)\//;
const IGNORED_FILE = /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|Cargo\.lock|go\.sum|\.min\.(js|css)|\.map)$/;

const LANGUAGES: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript",
  mts: "TypeScript",
  js: "JavaScript",
  jsx: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  kt: "Kotlin",
  kts: "Kotlin",
  java: "Java",
  rs: "Rust",
  go: "Go",
  py: "Python",
  scala: "Scala",
  css: "CSS",
  scss: "CSS",
  html: "HTML",
  sql: "SQL",
  sh: "Shell",
  tf: "Terraform",
};

/**
 * Langage d'un fichier d'après son extension, ou null s'il ne doit pas compter.
 * La doc et la config (Markdown, JSON, YAML) sont volontairement exclues : on mesure du code.
 */
export function languageOf(path: string): string | null {
  if (IGNORED_PATH.test(path) || IGNORED_FILE.test(path)) return null;
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGES[ext] ?? null;
}

export function isTestFile(path: string): boolean {
  return (
    /\.(test|spec)\.[a-z]+$/i.test(path) ||
    /(^|\/)(test|tests|__tests__|e2e)\//i.test(path) ||
    /Tests?\.(kt|java|scala)$/.test(path)
  );
}

const ANGULAR_TYPE = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]*\))?!?:/i;

export function commitType(subject: string): string | null {
  const match = ANGULAR_TYPE.exec(subject.trim());
  return match ? match[1].toLowerCase() : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayNumber(isoDay: string): number {
  const [y, m, d] = isoDay.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

function isoDayFromNumber(n: number): string {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

/** Plus longue suite de jours consécutifs, à partir de jours AAAA-MM-JJ triés et uniques. */
export function longestStreak(days: string[]): Wrapped["longestStreak"] {
  if (days.length === 0) return { days: 0, start: null, end: null };
  let best = { days: 1, start: days[0], end: days[0] };
  let runStart = days[0];
  let runLength = 1;

  for (let i = 1; i < days.length; i++) {
    if (dayNumber(days[i]) - dayNumber(days[i - 1]) === 1) {
      runLength++;
    } else {
      runStart = days[i];
      runLength = 1;
    }
    if (runLength > best.days) best = { days: runLength, start: runStart, end: days[i] };
  }
  return best;
}

function share(part: number, total: number): number {
  return total === 0 ? 0 : part / total;
}

function pickPersona(night: number, early: number, weekend: number): Persona {
  if (night >= 0.25) return "night-owl";
  if (early >= 0.25) return "early-bird";
  if (weekend >= 0.35) return "weekend-warrior";
  return "metronome";
}

interface ComputeInput {
  commits: RawCommit[];
  repos: RepoInfo[];
  year: number;
  periodEnd: string;
  author: string;
}

export function computeWrapped({ commits, repos, year, periodEnd, author }: ComputeInput): Wrapped {
  const inYear = commits.filter((c) => c.date.startsWith(`${year}-`) && c.date.slice(0, 10) <= periodEnd);
  const repoByDir = new Map(repos.map((r) => [r.dir, r]));

  const firstDay = dayNumber(`${year}-01-01`);
  const daily = new Array<number>(dayNumber(periodEnd) - firstDay + 1).fill(0);
  const byWeekday = new Array<number>(7).fill(0);
  const byHour = new Array<number>(24).fill(0);
  const byMonth = new Array<number>(12).fill(0);
  const perRepo = new Map<string, number>();
  const perLanguage = new Map<string, number>();
  const perType = new Map<string, number>();
  let linesAdded = 0;
  let linesDeleted = 0;
  let testLines = 0;
  let night = 0;
  let early = 0;
  let weekend = 0;
  let conventional = 0;

  for (const c of inYear) {
    const day = c.date.slice(0, 10);
    const hour = Number(c.date.slice(11, 13));
    const n = dayNumber(day);
    // 1er janvier 1970 = jeudi : on recale pour que lundi = 0.
    const weekday = (((n + 3) % 7) + 7) % 7;

    daily[n - firstDay]++;
    byWeekday[weekday]++;
    byHour[hour]++;
    byMonth[Number(day.slice(5, 7)) - 1]++;
    perRepo.set(c.repo, (perRepo.get(c.repo) ?? 0) + 1);

    if (hour >= 22 || hour < 5) night++;
    if (hour >= 5 && hour < 9) early++;
    if (weekday >= 5) weekend++;

    const type = commitType(c.subject);
    if (type) {
      conventional++;
      perType.set(type, (perType.get(type) ?? 0) + 1);
    }

    for (const f of c.files) {
      const lang = languageOf(f.path);
      if (!lang) continue;
      linesAdded += f.added;
      linesDeleted += f.deleted;
      perLanguage.set(lang, (perLanguage.get(lang) ?? 0) + f.added);
      if (isTestFile(f.path)) testLines += f.added;
    }
  }

  const activeDayList = daily
    .map((count, i) => (count > 0 ? isoDayFromNumber(firstDay + i) : null))
    .filter((d): d is string => d !== null);

  const busiestIndex = daily.reduce((best, count, i) => (count > daily[best] ? i : best), 0);
  const total = inYear.length;

  const touchedDirs = [...perRepo.keys()];
  const newRepos = touchedDirs.filter((dir) => repoByDir.get(dir)?.firstCommitDate?.startsWith(`${year}-`)).length;

  return {
    year,
    periodEnd,
    author,
    totalCommits: total,
    activeDays: activeDayList.length,
    reposTouched: touchedDirs.length,
    newRepos,
    linesAdded,
    linesDeleted,
    longestStreak: longestStreak(activeDayList),
    busiestDay: total === 0
      ? { date: null, commits: 0 }
      : { date: isoDayFromNumber(firstDay + busiestIndex), commits: daily[busiestIndex] },
    byWeekday,
    byHour,
    byMonth,
    daily,
    nightShare: share(night, total),
    earlyShare: share(early, total),
    weekendShare: share(weekend, total),
    persona: pickPersona(share(night, total), share(early, total), share(weekend, total)),
    topRepos: [...perRepo.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dir, count]) => {
        const info = repoByDir.get(dir);
        return { name: info?.displayName ?? dir, commits: count, isPublic: info?.isPublic ?? false };
      }),
    languages: [...perLanguage.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, lines]) => ({ name, lines, share: share(lines, linesAdded) })),
    commitTypes: [...perType.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count })),
    conventionalShare: share(conventional, total),
    testShare: share(testLines, linesAdded),
  };
}
