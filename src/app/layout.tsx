import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://crochet-patterns.example.com"),
  title: {
    default: "Crochet Pattern Gallery — Free Translated Patterns",
    template: "%s | Crochet Pattern Gallery",
  },
  description:
    "Free crochet patterns translated from Chinese to English. Amigurumi, bags, coasters, and more with clear US-standard instructions.",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-400">
          <p>Patterns translated from original Chinese designs. Credit to original authors.</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Crochet Pattern Gallery</p>
        </footer>
      </body>
    </html>
  );
}
