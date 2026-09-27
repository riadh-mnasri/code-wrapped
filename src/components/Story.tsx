// © 2026 Riadh MNASRI
"use client";

import { toJpeg, toPng } from "html-to-image";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { dictionaries, type Locale } from "@/lib/i18n";
import type { Wrapped } from "@/lib/types";
import { slides, StillProvider } from "./slides";

const LOCALE_KEY = "code-wrapped:locale";
/** Largeur de l'image exportée : format portrait 4:5, celui que LinkedIn et Instagram affichent en grand. */
const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1350;
/** Cartes du carrousel LinkedIn, dans l'ordre de lecture : le récap sert d'accroche. */
const CAROUSEL = ["summary", "commits", "streak", "persona", "languages"];
/** Largeur de rendu hors écran des cartes du carrousel, capturées ensuite en x2. */
const OFFSCREEN_WIDTH = 540;
const CARD_CLASS =
  "grain relative flex aspect-[4/5] w-full select-none flex-col overflow-hidden rounded-[1.6rem] p-[7cqw]";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "fr" || saved === "en") return saved;
  } catch {
    // Stockage indisponible (navigation privée) : on retombe sur la langue du navigateur.
  }
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export default function Story({ data }: { data: Wrapped }) {
  const [index, setIndex] = useState(0);
  const [locale, setLocale] = useState<Locale>("fr");
  const [exporting, setExporting] = useState(false);
  const [buildingPdf, setBuildingPdf] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const t = dictionaries[locale];
  const slide = slides[index];

  useEffect(() => {
    // Lecture différée : localStorage et navigator n'existent pas au rendu serveur.
    const initial = readLocale();
    if (initial !== "fr") queueMicrotask(() => setLocale(initial));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // Pas grave : la langue ne sera juste pas mémorisée.
    }
  }, [locale]);

  const go = useCallback((delta: number) => {
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onTap = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    go(e.clientX - rect.left < rect.width / 3 ? -1 : 1);
  };

  const download = async () => {
    const node = cardRef.current;
    if (!node) return;
    setExporting(true);
    try {
      // Les compteurs animés doivent avoir atteint leur valeur finale avant la capture.
      await wait(1300);
      node.classList.add("exporting");
      const url = await toPng(node, { pixelRatio: EXPORT_WIDTH / node.offsetWidth, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `code-wrapped-${data.year}-${String(index + 1).padStart(2, "0")}-${slide.id}.png`;
      a.click();
    } finally {
      node.classList.remove("exporting");
      setExporting(false);
    }
  };

  const downloadCarousel = async () => {
    setBuildingPdf(true);
    try {
      // Les cartes sont montées hors écran, sans animation, quand buildingPdf passe à vrai :
      // on laisse un court délai au rendu (et aux polices) avant de les capturer une par une.
      await wait(400);
      const cards = [...(carouselRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? [])];
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "px", format: [EXPORT_WIDTH, EXPORT_HEIGHT], hotfixes: ["px_scaling"] });
      for (const [i, card] of cards.entries()) {
        // JPEG plutôt que PNG : le PDF reste léger (le grain de fond gonfle beaucoup les PNG).
        const image = await toJpeg(card, { pixelRatio: EXPORT_WIDTH / card.offsetWidth, quality: 0.92 });
        if (i > 0) pdf.addPage([EXPORT_WIDTH, EXPORT_HEIGHT]);
        pdf.addImage(image, "JPEG", 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
      }
      pdf.save(`code-wrapped-${data.year}-carrousel-${locale}.pdf`);
    } finally {
      setBuildingPdf(false);
    }
  };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-5 overflow-hidden px-4 py-6">
      {/* Halo d'ambiance qui reprend la couleur de la carte courante. */}
      <div aria-hidden className={`pointer-events-none absolute inset-0 opacity-25 blur-3xl transition-colors duration-700 ${slide.theme}`} />

      <div className="relative w-[min(100%,calc((100svh-9rem)*0.8))] max-w-[34rem]">
        {/* Le wrapper sert de conteneur : toutes les tailles en cqw suivent la largeur de la carte. */}
        <div className="@container">
        <div className="mb-3 flex gap-1.5" role="tablist" aria-label="Progression">
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1} / ${slides.length}`}
              onClick={() => setIndex(i)}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream/15 transition hover:bg-cream/30"
            >
              <span className={`block h-full rounded-full bg-cream transition-all duration-500 ${i <= index ? "w-full" : "w-0"}`} />
            </button>
          ))}
        </div>

        <div
          ref={cardRef}
          key={`${slide.id}-${locale}`}
          onPointerUp={onTap}
          className={`${CARD_CLASS} cursor-pointer shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ${slide.theme}`}
        >
          {slide.render({ w: data, t, locale })}
        </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={t.ui.prev}
              className="grid size-11 place-items-center rounded-full border border-cream/20 text-lg transition hover:bg-cream/10 active:scale-95 disabled:opacity-30"
            >
              ←
            </button>
            <button
              onClick={() => go(1)}
              disabled={index === slides.length - 1}
              aria-label={t.ui.next}
              className="grid size-11 place-items-center rounded-full border border-cream/20 text-lg transition hover:bg-cream/10 active:scale-95 disabled:opacity-30"
            >
              →
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="h-11 rounded-full border border-cream/20 px-4 font-mono text-sm transition hover:bg-cream/10 active:scale-95"
              aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
            >
              {t.ui.switchTo}
            </button>
            <button
              onClick={download}
              disabled={exporting}
              className="h-11 rounded-full bg-cream px-5 text-sm font-semibold text-ink transition hover:bg-white active:scale-95 disabled:opacity-60"
            >
              {exporting ? t.ui.downloading : t.ui.download}
            </button>
          </div>
        </div>
        <button
          onClick={downloadCarousel}
          disabled={buildingPdf}
          className="mt-3 h-11 w-full rounded-full border border-cream/20 text-sm font-semibold transition hover:bg-cream/10 active:scale-[0.99] disabled:opacity-60"
        >
          {buildingPdf ? t.ui.carouselBusy : t.ui.carousel}
        </button>
        <p className="mt-3 text-center font-mono text-xs text-cream/40">{t.ui.hint}</p>
      </div>

      {buildingPdf && (
        <div ref={carouselRef} aria-hidden className="fixed top-0 -left-[10000px]" style={{ width: OFFSCREEN_WIDTH }}>
          <StillProvider value={true}>
          <div className="@container flex flex-col gap-4">
            {slides
              .filter((s) => CAROUSEL.includes(s.id))
              .sort((a, b) => CAROUSEL.indexOf(a.id) - CAROUSEL.indexOf(b.id))
              .map((s) => (
                <div key={s.id} data-slide className={`${CARD_CLASS} exporting ${s.theme}`}>
                  {s.render({ w: data, t, locale })}
                </div>
              ))}
          </div>
          </StillProvider>
        </div>
      )}

      <footer className="relative font-mono text-xs text-cream/40">© {new Date().getFullYear()} Riadh MNASRI</footer>
    </main>
  );
}
