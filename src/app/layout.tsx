import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from "@/components/GoogleTagManager";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_SAME_AS,
  absoluteUrl,
} from "@/lib/site";

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

const SITE_TITLE = `${SITE_NAME} — A Curated Library of Crochet Patterns`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  other: {
    "p:domain_verify": "8da838c314294fdc9d069a3a17bea28f",
  },
};

/** Brand entity graph injected on every page for E-E-A-T / AI entity recognition. */
const orgWebsiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/icon.svg"),
      sameAs: SITE_SAME_AS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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
      <GoogleTagManager />
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgWebsiteJsonLd) }}
        />
        <GoogleTagManagerNoscript />
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
