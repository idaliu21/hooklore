/**
 * Single source of truth for the site's canonical origin and brand constants.
 *
 * IMPORTANT: every place that needs an absolute URL (metadata, sitemap, robots,
 * JSON-LD, OG/Pinterest tags) must derive it from here. The default below is the
 * real production domain so the site stays correct even if SITE_URL is not set in
 * the deploy environment (which previously caused sitemap/robots to broadcast a
 * placeholder domain).
 */
export const SITE_URL = (process.env.SITE_URL || "https://www.hooklore.com").replace(/\/+$/, "");

export const SITE_NAME = "Hooklore";

export const SITE_DESCRIPTION =
  "A curated library of free crochet patterns — amigurumi, bags, coasters, gaming characters and more — written in clear US-standard notation.";

export const SITE_TAGLINE = "Stitching stories, one loop at a time.";

/** Social / external profiles used for the Organization `sameAs` entity graph. */
export const SITE_SAME_AS: string[] = [
  "https://www.pinterest.com/hooklore/",
];

/** Build an absolute URL from a site-relative path (e.g. "/pattern/foo"). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
