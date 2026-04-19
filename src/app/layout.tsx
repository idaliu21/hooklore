import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL || "https://hooklore.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hooklore — A Curated Library of Crochet Patterns",
    template: "%s | Hooklore",
  },
  description:
    "A curated library of crochet patterns — amigurumi, bags, coasters, and more — written in clear US-standard notation.",
  openGraph: {
    type: "website",
    siteName: "Hooklore",
    title: "Hooklore — A Curated Library of Crochet Patterns",
    description:
      "A curated library of crochet patterns, written in clear US-standard notation.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hooklore — A Curated Library of Crochet Patterns",
    description:
      "A curated library of crochet patterns, written in clear US-standard notation.",
  },
  other: {
    "p:domain_verify": "8da838c314294fdc9d069a3a17bea28f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-400">
          <p className="font-serif italic text-stone-500">Stitching stories, one loop at a time.</p>
          <p className="mt-2">Patterns credited to their original designers.</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Hooklore</p>
        </footer>
      </body>
    </html>
  );
}
