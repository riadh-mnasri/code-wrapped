// © 2026 Riadh MNASRI
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import data from "@/data/wrapped.json";
import { dictionaries, formatNumber } from "@/lib/i18n";
import type { Wrapped } from "@/lib/types";

const w = data as Wrapped;
const t = dictionaries.fr;

export const alt = `Code Wrapped ${w.year} de ${w.author} : ${formatNumber(w.totalCommits, "fr")} commits, ${w.activeDays} jours actifs, ${w.reposTouched} repos`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#15120f";
const CREAM = "#f4ede1";
const CORAL = "#ff5a36";
const MUSTARD = "#f2c14e";
const TEAL = "#0e7c7b";
const FOREST = "#1f3b2d";
const LIME = "#c6f36b";

async function font(file: string) {
  return readFile(join(process.cwd(), "assets", file));
}

export default async function Image() {
  const tiles = [
    { value: formatNumber(w.totalCommits, "fr"), label: t.summary.commits, bg: CORAL, fg: INK },
    { value: formatNumber(w.activeDays, "fr"), label: t.summary.days, bg: MUSTARD, fg: INK },
    { value: formatNumber(w.reposTouched, "fr"), label: t.summary.repos, bg: TEAL, fg: CREAM },
    { value: formatNumber(w.longestStreak.days, "fr"), label: t.summary.streak, bg: FOREST, fg: LIME },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          color: CREAM,
          padding: 64,
          fontFamily: "Bricolage",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 500 }}>
          <div style={{ display: "flex", fontFamily: "JetBrains", fontSize: 22, letterSpacing: 4, opacity: 0.7 }}>
            CODE WRAPPED
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>
              {t.summary.title}
            </div>
            <div style={{ display: "flex", fontSize: 150, fontWeight: 800, lineHeight: 0.95, letterSpacing: -6, color: CORAL }}>
              {String(w.year)}
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 30, fontWeight: 600 }}>{w.author}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[CORAL, MUSTARD, TEAL, LIME, CREAM].map((c) => (
              <div key={c} style={{ display: "flex", width: 80, height: 12, borderRadius: 6, background: c }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginLeft: "auto", width: 560, alignContent: "center" }}>
          {tiles.map((tile) => (
            <div
              key={tile.label}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 270,
                height: 225,
                padding: 30,
                justifyContent: "flex-end",
                borderRadius: 28,
                background: tile.bg,
                color: tile.fg,
              }}
            >
              <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
                {tile.value}
              </div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 28, fontWeight: 600 }}>{tile.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: await font("BricolageGrotesque-ExtraBold.woff"), weight: 800, style: "normal" },
        { name: "Bricolage", data: await font("BricolageGrotesque-SemiBold.woff"), weight: 600, style: "normal" },
        { name: "JetBrains", data: await font("JetBrainsMono-Medium.woff"), weight: 500, style: "normal" },
      ],
    },
  );
}
