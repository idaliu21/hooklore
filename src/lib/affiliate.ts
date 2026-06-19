/**
 * Amazon affiliate link helpers.
 *
 * Materials in patterns.json are free-text strings (e.g. "Mohair yarn, indigo",
 * "2.5 mm hook"). We turn each into an Amazon search link so users can buy the
 * supplies, and append the Associates tag for commission.
 *
 * Configure via env (set in Vercel → Project → Environment Variables):
 *   NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG  e.g. "hooklore-20"  (required to earn)
 *   NEXT_PUBLIC_AMAZON_DOMAIN          e.g. "www.amazon.com" (optional, default below)
 *
 * Until the tag is set, AFFILIATE_ENABLED is false: materials render as plain
 * text (no links, no disclosure), so the page looks exactly as it does today.
 */

const AMAZON_TAG = (process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG || "").trim();
const AMAZON_DOMAIN = (
  process.env.NEXT_PUBLIC_AMAZON_DOMAIN || "www.amazon.com"
).replace(/^https?:\/\//, "").replace(/\/+$/, "");

/** True once an Associates tag is configured — gates the links + disclosure. */
export const AFFILIATE_ENABLED = AMAZON_TAG.length > 0;

/**
 * Clean a material string into a sensible Amazon search query:
 * drop parenthetical notes ("(colorways 70/06)"), normalise separators, collapse
 * whitespace. "4-ply cotton yarn (colorways 70 / 06)" -> "4-ply cotton yarn".
 */
export function materialToQuery(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, " ") // strip "( ... )"
    .replace(/[,/|]+/g, " ") // commas / slashes -> space
    .replace(/\s+/g, " ")
    .trim();
}

/** Build an Amazon search URL for a material, with the Associates tag if set. */
export function amazonSearchUrl(raw: string): string {
  const query = materialToQuery(raw) || raw.trim();
  const base = `https://${AMAZON_DOMAIN}/s?k=${encodeURIComponent(query)}`;
  return AMAZON_TAG ? `${base}&tag=${encodeURIComponent(AMAZON_TAG)}` : base;
}
