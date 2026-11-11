import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Fully static export (2026-11). Nothing here runs on a server: every route
   * is prerendered, the only Route Handler (`feed.xml`) is `force-static`, and
   * the data comes from src/content/patterns.json at build time. `next build`
   * therefore writes plain HTML/CSS/JS to out/, which Cloudflare Pages serves
   * without the per-request CDN quota that got the Vercel team suspended.
   *
   * Consequence: `redirects()` is unsupported here. The eight legacy note_id
   * redirects now live in public/_redirects — edit them there.
   */
  output: "export",

  /**
   * Vercel's image optimizer is off: its monthly transformation quota ran out
   * (every /_next/image request 402'd, so the whole site showed broken images).
   * scripts/export-data.py already emits each photo as thumb/medium/full WebP
   * and the components pick the right one, so there is nothing left to optimize
   * at request time — serve the static files directly. This is also the
   * combination a static export supports without a custom loader.
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
