// © 2026 Riadh MNASRI
"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  formatDay,
  formatHour,
  formatMonth,
  formatNumber,
  formatPercent,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import type { Wrapped } from "@/lib/types";

export interface SlideProps {
  w: Wrapped;
  t: Dictionary;
  locale: Locale;
}

export interface SlideDef {
  id: string;
  /** Classes de fond et de texte de la carte. */
  theme: string;
  render: (p: SlideProps) => ReactNode;
}

/** Compteur animé de 0 à la valeur cible, relancé à chaque montage. */
function CountUp({ value, locale, digits = 0 }: { value: number; locale: Locale; digits?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const duration = 1200;
    let frame = 0;
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / duration);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{formatNumber(digits ? shown : Math.round(shown), locale, digits)}</>;
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="rise font-mono text-[3.4cqw] uppercase tracking-[0.18em] opacity-75">{children}</p>;
}

function Brand({ w }: { w: Wrapped }) {
  return (
    <div className="flex items-center justify-between font-mono text-[2.8cqw] uppercase tracking-[0.14em] opacity-70">
      <span>Code Wrapped {w.year}</span>
      <span>{w.author}</span>
    </div>
  );
}

function Bars({
  values,
  labels,
  highlight,
  barClass,
  height = "34cqw",
}: {
  values: number[];
  labels: string[];
  highlight: number;
  barClass: string;
  height?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[1.4cqw]" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-[1.2cqw]">
          <div
            className={`bar-grow w-full rounded-t-[1.2cqw] ${barClass} ${i === highlight ? "opacity-100" : "opacity-45"}`}
            style={{ height: `${Math.max(2, (v / max) * 100)}%`, animationDelay: `${i * 40}ms` }}
          />
          <span className="font-mono text-[2.6cqw] opacity-70">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function firstActiveDay(w: Wrapped): string | null {
  const i = w.daily.findIndex((n) => n > 0);
  if (i < 0) return null;
  const d = new Date(Date.UTC(w.year, 0, 1 + i));
  return d.toISOString().slice(0, 10);
}

function argmax(values: number[]): number {
  return values.reduce((best, v, i) => (v > values[best] ? i : best), 0);
}

function Heatmap({ w, t }: { w: Wrapped; t: Dictionary }) {
  // Colonnes = semaines, lignes = jours (lundi en haut). Le 1er janvier est décalé à son jour de semaine.
  const jan1 = (new Date(Date.UTC(w.year, 0, 1)).getUTCDay() + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(jan1).fill(null), ...w.daily];
  const weeks = Math.ceil(cells.length / 7);
  const level = (n: number) => (n === 0 ? 0 : n <= 5 ? 1 : n <= 15 ? 2 : n <= 30 ? 3 : 4);
  const shades = ["bg-cream/10", "bg-lime/35", "bg-lime/60", "bg-lime/80", "bg-lime"];

  return (
    <div>
      <div className="grid gap-[0.55cqw]" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)" }}>
        {cells.map((n, i) => (
          <div key={i} className={`aspect-square rounded-[0.5cqw] ${n === null ? "" : shades[level(n)]}`} />
        ))}
      </div>
      <div className="mt-[2cqw] flex items-center justify-end gap-[1cqw] font-mono text-[2.4cqw] opacity-70">
        <span>{t.streak.legendLess}</span>
        {shades.map((s) => (
          <span key={s} className={`size-[2.4cqw] rounded-[0.4cqw] ${s}`} />
        ))}
        <span>{t.streak.legendMore}</span>
      </div>
    </div>
  );
}

function HourClock({ byHour, locale }: { byHour: number[]; locale: Locale }) {
  const max = Math.max(1, ...byHour);
  const peak = argmax(byHour);
  return (
    <svg viewBox="-100 -100 200 200" className="w-[58cqw]" aria-hidden>
      <circle r="30" className="fill-cream/5 stroke-cream/20" strokeWidth="0.6" />
      {byHour.map((v, h) => {
        const angle = (h / 24) * Math.PI * 2 - Math.PI / 2;
        const inner = 34;
        const outer = inner + (v / max) * 58;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return (
          <line
            key={h}
            x1={cos * inner}
            y1={sin * inner}
            x2={cos * outer}
            y2={sin * outer}
            strokeWidth="5.2"
            strokeLinecap="round"
            className={h === peak ? "stroke-coral" : h >= 22 || h < 5 ? "stroke-mustard" : "stroke-cream/35"}
          />
        );
      })}
      {[0, 6, 12, 18].map((h) => {
        const angle = (h / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <text
            key={h}
            x={Math.cos(angle) * 18}
            y={Math.sin(angle) * 18 + 3}
            textAnchor="middle"
            className="fill-cream/60 font-mono"
            fontSize="8"
          >
            {formatHour(h, locale)}
          </text>
        );
      })}
    </svg>
  );
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-teal",
  Kotlin: "bg-coral",
  Java: "bg-mustard",
  HTML: "bg-forest",
  CSS: "bg-lime",
  JavaScript: "bg-[#e0a458]",
  Rust: "bg-[#8c3b2b]",
  Go: "bg-[#5aa9a0]",
  Python: "bg-[#3d5a80]",
};

function langColor(name: string): string {
  return LANG_COLORS[name] ?? "bg-ink/40";
}

export const slides: SlideDef[] = [
  {
    id: "intro",
    theme: "bg-ink text-cream",
    render: ({ w, t, locale }) => (
      <>
        <Brand w={w} />
        <div className="flex flex-1 flex-col justify-center">
          <Kicker>{t.intro.kicker}</Kicker>
          <h1 className="rise mt-[2cqw] font-display text-[32cqw] font-extrabold leading-[0.82] tracking-[-0.04em] text-coral" style={{ animationDelay: "120ms" }}>
            {w.year}
          </h1>
          <p className="rise mt-[4cqw] text-[5.2cqw] font-medium leading-tight" style={{ animationDelay: "240ms" }}>
            {t.intro.period(formatDay(`${w.year}-01-01`, locale), formatDay(w.periodEnd, locale))}
          </p>
        </div>
        <div className="flex gap-[1.6cqw]">
          {["bg-coral", "bg-mustard", "bg-teal", "bg-lime", "bg-cream"].map((c, i) => (
            <span key={c} className={`rise h-[2cqw] flex-1 rounded-full ${c}`} style={{ animationDelay: `${300 + i * 60}ms` }} />
          ))}
        </div>
      </>
    ),
  },
  {
    id: "commits",
    theme: "bg-coral text-ink",
    render: ({ w, t, locale }) => (
      <>
        <Brand w={w} />
        <div className="flex flex-1 flex-col justify-center">
          <p className="rise font-display text-[27cqw] font-extrabold leading-[0.85] tracking-[-0.04em]">
            <CountUp value={w.totalCommits} locale={locale} />
          </p>
          <p className="rise font-display text-[9cqw] font-bold leading-none" style={{ animationDelay: "120ms" }}>
            {t.commits.label}
          </p>
          <p className="rise mt-[6cqw] text-[6cqw] font-semibold leading-tight" style={{ animationDelay: "260ms" }}>
            {t.commits.days(formatNumber(w.activeDays, locale))}
          </p>
          <p className="rise mt-[1.5cqw] text-[4.6cqw] leading-snug opacity-80" style={{ animationDelay: "360ms" }}>
            {t.commits.perDay(formatNumber(w.activeDays ? w.totalCommits / w.activeDays : 0, locale, 1))}
          </p>
        </div>
      </>
    ),
  },
  {
    id: "launch",
    theme: "bg-cream text-ink",
    render: ({ w, t, locale }) => {
      const first = firstActiveDay(w);
      const best = argmax(w.byMonth);
      return (
        <>
          <Brand w={w} />
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="rise font-display text-[10.5cqw] font-extrabold leading-[0.95] tracking-[-0.03em]">
              {first ? t.launch.title(formatDay(first, locale)) : t.launch.empty}
            </h2>
            <p className="rise mt-[3cqw] text-[4.8cqw] font-medium" style={{ animationDelay: "140ms" }}>
              {t.launch.record(formatMonth(best, locale), formatNumber(w.byMonth[best], locale))}
            </p>
          </div>
          <Bars values={w.byMonth} labels={t.monthsShort} highlight={best} barClass="bg-coral" height="42cqw" />
        </>
      );
    },
  },
  {
    id: "streak",
    theme: "bg-forest text-cream",
    render: ({ w, t, locale }) => (
      <>
        <Brand w={w} />
        <div className="flex flex-1 flex-col justify-center">
          <h2 className="rise font-display text-[13cqw] font-extrabold leading-[0.9] tracking-[-0.03em] text-lime">
            {t.streak.title(formatNumber(w.longestStreak.days, locale))}
          </h2>
          {w.longestStreak.start && w.longestStreak.end && (
            <p className="rise mt-[3cqw] text-[4.8cqw] font-medium" style={{ animationDelay: "140ms" }}>
              {t.streak.range(formatDay(w.longestStreak.start, locale), formatDay(w.longestStreak.end, locale))}
            </p>
          )}
        </div>
        <div className="rise" style={{ animationDelay: "240ms" }}>
          <Heatmap w={w} t={t} />
        </div>
      </>
    ),
  },
  {
    id: "busiest",
    theme: "bg-mustard text-ink",
    render: ({ w, t, locale }) => {
      const fav = argmax(w.byWeekday);
      return (
        <>
          <Brand w={w} />
          <div className="flex flex-1 flex-col justify-center">
            <Kicker>{t.busiest.kicker}</Kicker>
            <h2 className="rise mt-[2cqw] font-display text-[14cqw] font-extrabold leading-[0.9] tracking-[-0.03em]" style={{ animationDelay: "100ms" }}>
              {w.busiestDay.date ? formatDay(w.busiestDay.date, locale) : "-"}
            </h2>
            <p className="rise mt-[3cqw] text-[5.4cqw] font-semibold" style={{ animationDelay: "200ms" }}>
              {t.busiest.commits(formatNumber(w.busiestDay.commits, locale))}
            </p>
            <p className="rise mt-[1.5cqw] text-[4.4cqw] opacity-80" style={{ animationDelay: "280ms" }}>
              {t.busiest.favorite(t.weekdays[fav])}
            </p>
          </div>
          <Bars values={w.byWeekday} labels={t.weekdaysShort} highlight={fav} barClass="bg-ink" height="30cqw" />
        </>
      );
    },
  },
  {
    id: "persona",
    theme: "bg-ink text-cream",
    render: ({ w, t, locale }) => {
      const pct =
        w.persona === "early-bird" ? w.earlyShare : w.persona === "weekend-warrior" ? w.weekendShare : w.nightShare;
      return (
        <>
          <Brand w={w} />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Kicker>{t.persona.kicker}</Kicker>
            <h2 className="rise mt-[2cqw] font-display text-[12.5cqw] font-extrabold leading-[0.9] tracking-[-0.03em] text-mustard" style={{ animationDelay: "100ms" }}>
              {t.persona.names[w.persona]}
            </h2>
            <div className="rise my-[3cqw]" style={{ animationDelay: "200ms" }}>
              <HourClock byHour={w.byHour} locale={locale} />
            </div>
            <p className="rise text-[4.8cqw] font-medium leading-snug" style={{ animationDelay: "300ms" }}>
              {t.persona.lines[w.persona](formatPercent(pct, locale))}
            </p>
            <p className="rise mt-[1.2cqw] font-mono text-[3.4cqw] text-coral" style={{ animationDelay: "380ms" }}>
              {t.persona.peak(formatHour(argmax(w.byHour), locale))}
            </p>
          </div>
        </>
      );
    },
  },
  {
    id: "repos",
    theme: "bg-teal text-cream",
    render: ({ w, t, locale }) => {
      const max = Math.max(1, ...w.topRepos.map((r) => r.commits));
      // Les repos privés sont numérotés A, B, C... dans l'ordre du classement.
      const privateRank = w.topRepos.map((r, i) => w.topRepos.slice(0, i + 1).filter((x) => !x.isPublic).length - 1);
      return (
        <>
          <Brand w={w} />
          <div className="mt-[6cqw]">
            <p className="rise font-display text-[24cqw] font-extrabold leading-[0.85] tracking-[-0.04em]">
              <CountUp value={w.reposTouched} locale={locale} />
            </p>
            <p className="rise text-[6.4cqw] font-bold" style={{ animationDelay: "100ms" }}>
              {t.repos.touched}
            </p>
            <p className="rise text-[4.4cqw] opacity-80" style={{ animationDelay: "180ms" }}>
              {w.newRepos === w.reposTouched ? t.repos.allCreated : t.repos.created(formatNumber(w.newRepos, locale))}
            </p>
          </div>
          <div className="mt-auto">
            <p className="mb-[2.4cqw] font-mono text-[3cqw] uppercase tracking-[0.16em] opacity-70">{t.repos.top}</p>
            <ol className="flex flex-col gap-[2cqw]">
              {w.topRepos.map((r, i) => {
                const label = r.isPublic ? r.name : `${t.repos.private} ${String.fromCharCode(65 + privateRank[i])}`;
                return (
                  <li key={i} className="rise" style={{ animationDelay: `${260 + i * 80}ms` }}>
                    <div className="flex items-baseline justify-between gap-[2cqw] text-[4.4cqw] font-semibold">
                      <span className="truncate">
                        <span className="mr-[2cqw] font-mono opacity-60">{i + 1}</span>
                        {!r.isPublic && <span className="mr-[1.4cqw]" aria-hidden>🔒</span>}
                        {label}
                      </span>
                      <span className="font-mono text-[3.6cqw] opacity-80">{formatNumber(r.commits, locale)}</span>
                    </div>
                    <div className="mt-[1cqw] h-[1.4cqw] rounded-full bg-cream/15">
                      <div className="h-full rounded-full bg-mustard" style={{ width: `${(r.commits / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      );
    },
  },
  {
    id: "languages",
    theme: "bg-cream text-ink",
    render: ({ w, t, locale }) => (
      <>
        <Brand w={w} />
        <div className="mt-[6cqw]">
          <p className="rise font-display text-[17cqw] font-extrabold leading-[0.85] tracking-[-0.04em]">
            <CountUp value={w.linesAdded} locale={locale} />
          </p>
          <p className="rise text-[6cqw] font-bold" style={{ animationDelay: "100ms" }}>
            {t.languages.lines}
          </p>
          <p className="rise mt-[1.5cqw] text-[4cqw] leading-snug opacity-75" style={{ animationDelay: "180ms" }}>
            {t.languages.deleted(formatNumber(w.linesDeleted, locale))}
          </p>
        </div>
        <div className="mt-auto">
          <div className="rise flex h-[6cqw] overflow-hidden rounded-[1.6cqw]" style={{ animationDelay: "240ms" }}>
            {w.languages.map((l) => (
              <div key={l.name} className={langColor(l.name)} style={{ width: `${l.share * 100}%` }} />
            ))}
          </div>
          <ul className="mt-[3.4cqw] grid grid-cols-2 gap-x-[4cqw] gap-y-[2cqw]">
            {w.languages.map((l, i) => (
              <li key={l.name} className="rise flex items-center gap-[2cqw] text-[4.2cqw] font-semibold" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <span className={`size-[3.4cqw] shrink-0 rounded-[0.8cqw] ${langColor(l.name)}`} />
                <span className="flex-1 truncate">{l.name}</span>
                <span className="font-mono text-[3.4cqw] opacity-70">{formatPercent(l.share, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "discipline",
    theme: "bg-coral text-ink",
    render: ({ w, t, locale }) => {
      const maxType = Math.max(1, ...w.commitTypes.map((c) => c.count));
      return (
        <>
          <Brand w={w} />
          <div className="mt-[6cqw]">
            <Kicker>{t.discipline.kicker}</Kicker>
            <p className="rise mt-[1cqw] font-display text-[26cqw] font-extrabold leading-[0.85] tracking-[-0.04em]" style={{ animationDelay: "100ms" }}>
              {formatPercent(w.conventionalShare, locale)}
            </p>
            <p className="rise text-[5.4cqw] font-bold leading-tight" style={{ animationDelay: "180ms" }}>
              {t.discipline.conventional}
            </p>
          </div>
          <div className="mt-auto">
            <div className="flex flex-wrap gap-[1.8cqw]">
              {w.commitTypes.slice(0, 8).map((c, i) => (
                <span
                  key={c.type}
                  className="rise rounded-full bg-ink px-[3cqw] py-[1.2cqw] font-mono text-cream"
                  style={{ fontSize: `${3 + (c.count / maxType) * 1.8}cqw`, animationDelay: `${260 + i * 50}ms` }}
                >
                  {c.type} <span className="opacity-60">{formatNumber(c.count, locale)}</span>
                </span>
              ))}
            </div>
            <p className="rise mt-[4cqw] text-[4.6cqw] font-semibold" style={{ animationDelay: "600ms" }}>
              {t.discipline.tests(formatPercent(w.testShare, locale))}
            </p>
          </div>
        </>
      );
    },
  },
  {
    id: "summary",
    theme: "bg-ink text-cream",
    render: ({ w, t, locale }) => {
      const tiles = [
        { value: formatNumber(w.totalCommits, locale), label: t.summary.commits, cls: "bg-coral text-ink" },
        { value: formatNumber(w.activeDays, locale), label: t.summary.days, cls: "bg-mustard text-ink" },
        { value: formatNumber(w.reposTouched, locale), label: t.summary.repos, cls: "bg-teal text-cream" },
        { value: formatNumber(w.longestStreak.days, locale), label: t.summary.streak, cls: "bg-forest text-lime" },
      ];
      return (
        <>
          <div className="font-mono text-[2.8cqw] uppercase tracking-[0.14em] opacity-70">Code Wrapped</div>
          <h2 className="rise mt-[2.4cqw] font-display text-[9.5cqw] font-extrabold leading-[0.9] tracking-[-0.03em]">
            {t.summary.title} <span className="text-coral">{w.year}</span>
          </h2>
          <p className="rise mt-[1.5cqw] text-[4.2cqw] opacity-75" style={{ animationDelay: "80ms" }}>{w.author}</p>
          <div className="mt-[4cqw] grid grid-cols-2 gap-[2.4cqw]">
            {tiles.map((tile, i) => (
              <div key={tile.label} className={`rise rounded-[3cqw] px-[4cqw] py-[3.4cqw] ${tile.cls}`} style={{ animationDelay: `${150 + i * 80}ms` }}>
                <p className="font-display text-[10cqw] font-extrabold leading-none tracking-[-0.03em]">{tile.value}</p>
                <p className="mt-[1cqw] text-[3.6cqw] font-semibold">{tile.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-[2.4cqw] grid grid-cols-[2fr_3fr] gap-[2.4cqw]">
            <div className="rise rounded-[3cqw] border border-cream/20 px-[4cqw] py-[3.4cqw]" style={{ animationDelay: "500ms" }}>
              <p className="font-mono text-[2.8cqw] uppercase tracking-[0.12em] opacity-60">{t.summary.top}</p>
              <p className="mt-[1cqw] truncate text-[5cqw] font-bold">{w.languages[0]?.name ?? "-"}</p>
            </div>
            <div className="rise rounded-[3cqw] border border-cream/20 px-[4cqw] py-[3.4cqw]" style={{ animationDelay: "580ms" }}>
              <p className="font-mono text-[2.8cqw] uppercase tracking-[0.12em] opacity-60">{t.summary.persona}</p>
              <p className="mt-[1cqw] text-[5cqw] font-bold leading-tight text-mustard">{t.persona.names[w.persona]}</p>
            </div>
          </div>
          <p className="mt-auto pt-[2cqw] font-mono text-[2.6cqw] opacity-50">{t.ui.generatedFrom} · © {w.year} {w.author}</p>
        </>
      );
    },
  },
];
