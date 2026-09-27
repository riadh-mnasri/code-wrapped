// © 2026 Riadh MNASRI
import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const description = "Mon année de code en 10 cartes, générée depuis mes repos git. / My year in code, in 10 cards.";

export const metadata: Metadata = {
  metadataBase: new URL("https://code-wrapped-rm.vercel.app"),
  title: "Code Wrapped 2026 · Riadh MNASRI",
  description,
  openGraph: { title: "Code Wrapped 2026 · Riadh MNASRI", description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
