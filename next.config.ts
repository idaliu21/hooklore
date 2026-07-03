import type { NextConfig } from "next";

/**
 * Legacy note_id URLs → semantic slugs (2026-07). Kept as permanent redirects
 * so pages indexed under the old URLs pass their equity to the new ones.
 */
const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  "686300370000000010013181": "small-elephant-amigurumi",
  "69ccaa970000000023025702": "four-corner-granny-square-flower",
  "69131d80000000000302da99": "cat-face-motif-scarf",
  "694c1160000000001e009871": "angel-pixel-chart",
  "69ce55af000000002301144a": "black-cat-pixel-placemat",
  "67df9db2000000001b038af8": "stardew-valley-pixel-chart",
  "69c6284800000000230110f0": "earth-globe-pendant",
  "6942540d000000001e0004c2": "round-scalloped-coaster",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(LEGACY_SLUG_REDIRECTS).map(([noteId, slug]) => ({
      source: `/pattern/${noteId}`,
      destination: `/pattern/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
