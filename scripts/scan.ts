// © 2026 Riadh MNASRI
//
// Scanne tous les repos git d'un dossier et produit src/data/wrapped.json.
// Usage : npm run scan -- [--root ~/IdeaProjects] [--year 2026] [--author riadh] [--owner riadh-mnasri]
//                        [--reveal repo1,repo2] (repos privés dont on accepte d'afficher le nom)
//
// Seules des statistiques agrégées sont écrites. Les noms des repos privés
// (ou absents de GitHub) sont anonymisés, les messages de commit ne sont jamais exportés.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { COMMIT_MARKER, computeWrapped, parseGitLog } from "../src/lib/stats";
import type { RawCommit, RepoInfo } from "../src/lib/types";

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const root = resolve(arg("root", join(homedir(), "IdeaProjects")).replace(/^~/, homedir()));
const year = Number(arg("year", String(new Date().getFullYear())));
const authorPattern = arg("author", "riadh");
const owner = arg("owner", "riadh-mnasri");
const displayAuthor = arg("name", "Riadh MNASRI");
const revealed = new Set(
  arg("reveal", "")
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean),
);

function git(dir: string, args: string[]): string {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function publicRepos(): Set<string> {
  try {
    const json = execFileSync("gh", ["repo", "list", owner, "--limit", "1000", "--json", "name,visibility"], {
      encoding: "utf8",
    });
    const list = JSON.parse(json) as { name: string; visibility: string }[];
    return new Set(list.filter((r) => r.visibility === "PUBLIC").map((r) => r.name.toLowerCase()));
  } catch {
    console.warn("gh indisponible : tous les repos seront traités comme privés.");
    return new Set();
  }
}

function remoteName(dir: string): string | null {
  const url = git(dir, ["remote", "get-url", "origin"]).trim();
  const match = new RegExp(`github\\.com[:/]${owner}/([^/]+?)(\\.git)?$`, "i").exec(url);
  return match ? match[1] : null;
}

function localDay(date: Date): string {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const today = localDay(new Date());
const periodEnd = today < `${year}-12-31` ? today : `${year}-12-31`;

const publics = publicRepos();
const dirs = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(root, d.name, ".git")))
  .map((d) => d.name);

const repos: RepoInfo[] = [];
const commits: RawCommit[] = [];
const seen = new Set<string>();

for (const dir of dirs) {
  const path = join(root, dir);
  const log = git(path, [
    "log",
    "--all",
    "--no-merges",
    "--regexp-ignore-case",
    `--author=${authorPattern}`,
    `--since=${year}-01-01T00:00:00`,
    `--until=${periodEnd}T23:59:59`,
    `--format=${COMMIT_MARKER}%H|%aI|%s`,
    "--numstat",
  ]);
  const repoCommits = parseGitLog(log, dir).filter((c) => {
    // Un même commit peut exister dans deux clones locaux (fork, copie) : on ne le compte qu'une fois.
    if (seen.has(c.hash)) return false;
    seen.add(c.hash);
    return true;
  });
  if (repoCommits.length === 0) continue;

  const name = remoteName(path);
  const isPublic = name !== null && (publics.has(name.toLowerCase()) || revealed.has(name.toLowerCase()));
  const firstCommitDate = git(path, ["log", "--all", "--reverse", "--format=%aI"]).split("\n")[0] || null;

  repos.push({ dir, displayName: isPublic ? name : "private", isPublic, firstCommitDate });
  commits.push(...repoCommits);
}

const wrapped = computeWrapped({ commits, repos, year, periodEnd, author: displayAuthor });

const outDir = join(process.cwd(), "src", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "wrapped.json"), JSON.stringify(wrapped, null, 2) + "\n");

console.log(
  `${wrapped.totalCommits} commits sur ${wrapped.reposTouched} repos (${repos.filter((r) => r.isPublic).length} publics), ` +
    `${wrapped.activeDays} jours actifs, du 01/01 au ${periodEnd}. Écrit dans src/data/wrapped.json`,
);
