// © 2026 Riadh MNASRI
import { describe, expect, it } from "vitest";
import {
  commitType,
  computeWrapped,
  isTestFile,
  languageOf,
  longestStreak,
  parseGitLog,
} from "./stats";
import type { RawCommit, RepoInfo } from "./types";

function commit(date: string, overrides: Partial<RawCommit> = {}): RawCommit {
  return {
    repo: "alpha",
    hash: Math.random().toString(36).slice(2),
    date,
    subject: "feat(core): add something",
    files: [{ path: "src/index.ts", added: 10, deleted: 2 }],
    ...overrides,
  };
}

const repos: RepoInfo[] = [
  { dir: "alpha", displayName: "alpha", isPublic: true, firstCommitDate: "2026-02-01T10:00:00+01:00" },
  { dir: "beta", displayName: "Projet privé", isPublic: false, firstCommitDate: "2024-05-01T10:00:00+02:00" },
];

describe("parseGitLog", () => {
  it("lit les commits et leurs fichiers, en ignorant les binaires", () => {
    // Given
    const output = [
      "@@@abc123|2026-03-14T23:12:05+01:00|feat(ui): add dark mode",
      "",
      "12\t3\tsrc/app/page.tsx",
      "-\t-\tpublic/logo.png",
      "@@@def456|2026-03-15T08:00:00+01:00|fix: typo",
      "",
      "1\t1\tREADME.md",
    ].join("\n");

    // When
    const commits = parseGitLog(output, "alpha");

    // Then
    expect(commits).toHaveLength(2);
    expect(commits[0]).toMatchObject({
      repo: "alpha",
      hash: "abc123",
      date: "2026-03-14T23:12:05+01:00",
      subject: "feat(ui): add dark mode",
      files: [{ path: "src/app/page.tsx", added: 12, deleted: 3 }],
    });
    expect(commits[1].files).toEqual([{ path: "README.md", added: 1, deleted: 1 }]);
  });

  it("garde un sujet qui contient le séparateur", () => {
    // Given
    const output = "@@@abc|2026-01-02T10:00:00+01:00|docs: a | b\n";

    // When
    const [parsed] = parseGitLog(output, "alpha");

    // Then
    expect(parsed.subject).toBe("docs: a | b");
  });
});

describe("languageOf", () => {
  it("reconnaît les langages par extension", () => {
    expect(languageOf("src/app/page.tsx")).toBe("TypeScript");
    expect(languageOf("core/src/main/kotlin/Elo.kt")).toBe("Kotlin");
    expect(languageOf("src/main.rs")).toBe("Rust");
  });

  it("écarte les fichiers générés ou verrouillés", () => {
    expect(languageOf("package-lock.json")).toBeNull();
    expect(languageOf("node_modules/react/index.js")).toBeNull();
    expect(languageOf(".next/server/app.js")).toBeNull();
    expect(languageOf("public/hero.png")).toBeNull();
  });
});

describe("isTestFile", () => {
  it("repère les conventions de test courantes", () => {
    expect(isTestFile("src/lib/stats.test.ts")).toBe(true);
    expect(isTestFile("src/test/kotlin/SwissPairingTest.kt")).toBe(true);
    expect(isTestFile("e2e/login.spec.ts")).toBe(true);
    expect(isTestFile("src/lib/stats.ts")).toBe(false);
  });
});

describe("commitType", () => {
  it("extrait le type Angular", () => {
    expect(commitType("feat(pairing): add round-robin")).toBe("feat");
    expect(commitType("fix: rounding")).toBe("fix");
    expect(commitType("refactor(core)!: rename api")).toBe("refactor");
  });

  it("renvoie null pour un message libre", () => {
    expect(commitType("Initial commit")).toBeNull();
    expect(commitType("wip")).toBeNull();
  });
});

describe("longestStreak", () => {
  it("trouve la plus longue suite de jours consécutifs", () => {
    // Given
    const days = ["2026-01-01", "2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07"];

    // When
    const streak = longestStreak(days);

    // Then
    expect(streak).toEqual({ days: 3, start: "2026-01-05", end: "2026-01-07" });
  });

  it("gère une liste vide", () => {
    expect(longestStreak([])).toEqual({ days: 0, start: null, end: null });
  });
});

describe("computeWrapped", () => {
  it("agrège les chiffres clés de l'année", () => {
    // Given
    const commits = [
      commit("2026-02-02T23:30:00+01:00"),
      commit("2026-02-03T10:00:00+01:00", { subject: "fix(api): null check" }),
      commit("2026-02-03T11:00:00+01:00", {
        repo: "beta",
        subject: "Initial commit",
        files: [{ path: "src/Main.kt", added: 30, deleted: 0 }, { path: "src/test/MainTest.kt", added: 10, deleted: 0 }],
      }),
      commit("2026-02-07T14:00:00+01:00"),
    ];

    // When
    const w = computeWrapped({ commits, repos, year: 2026, periodEnd: "2026-02-10", author: "Riadh" });

    // Then
    expect(w.totalCommits).toBe(4);
    expect(w.activeDays).toBe(3);
    expect(w.reposTouched).toBe(2);
    expect(w.newRepos).toBe(1);
    expect(w.longestStreak).toEqual({ days: 2, start: "2026-02-02", end: "2026-02-03" });
    expect(w.busiestDay).toEqual({ date: "2026-02-03", commits: 2 });
    expect(w.byWeekday[0]).toBe(1); // lundi 2 février
    expect(w.byWeekday[5]).toBe(1); // samedi 7 février
    expect(w.byHour[23]).toBe(1);
    expect(w.daily).toHaveLength(41);
    expect(w.daily[32]).toBe(1);
    expect(w.daily[33]).toBe(2);
    expect(w.topRepos[0]).toEqual({ name: "alpha", commits: 3, isPublic: true });
    expect(w.topRepos[1]).toEqual({ name: "Projet privé", commits: 1, isPublic: false });
    expect(w.linesAdded).toBe(70);
    expect(w.languages[0]).toMatchObject({ name: "Kotlin", lines: 40 });
    expect(w.conventionalShare).toBe(0.75);
    expect(w.testShare).toBeCloseTo(10 / 70);
    expect(w.weekendShare).toBe(0.25);
  });

  it("choisit un profil nocturne quand la nuit domine", () => {
    // Given
    const commits = [
      commit("2026-03-02T23:00:00+01:00"),
      commit("2026-03-03T01:00:00+01:00"),
      commit("2026-03-04T15:00:00+01:00"),
    ];

    // When
    const w = computeWrapped({ commits, repos, year: 2026, periodEnd: "2026-03-31", author: "Riadh" });

    // Then
    expect(w.persona).toBe("night-owl");
  });

  it("ignore les commits hors de l'année demandée", () => {
    // Given
    const commits = [commit("2025-12-31T22:00:00+01:00"), commit("2026-01-01T09:00:00+01:00")];

    // When
    const w = computeWrapped({ commits, repos, year: 2026, periodEnd: "2026-01-31", author: "Riadh" });

    // Then
    expect(w.totalCommits).toBe(1);
  });
});
