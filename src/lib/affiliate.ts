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

/** Words that describe our pattern's colour scheme, not the product on Amazon. */
const NOISE_WORDS = /\b(colou?rways?|approx\.?|optional|preferred|your choice)\b/gi;

/** Fibres that imply the material is yarn even when the word "yarn" is absent. */
const FIBRE_WORDS =
  /\b(cotton|mohair|wool|acrylic|chenille|velvet|angora|alpaca|bamboo|milk fiber)\b/i;

/**
 * Clean a material string into a sensible Amazon search query:
 * drop parenthetical notes ("(colorways 70/06)"), normalise separators, strip
 * colour-scheme noise, and cap the length — long descriptor tails ("dark green
 * body, light green flap") tank search relevance.
 * Also make sure yarn searches actually say "yarn": "4-ply sport-weight cotton"
 * would surface clothing, "4-ply sport-weight cotton yarn" surfaces yarn.
 */
export function materialToQuery(raw: string): string {
  let q = raw
    .replace(/\([^)]*\)/g, " ") // strip "( ... )"
    .replace(/[,/|]+/g, " ") // commas / slashes -> space
    .replace(NOISE_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Keep queries short: the first words carry the signal.
  const words = q.split(" ");
  if (words.length > 8) q = words.slice(0, 8).join(" ");

  // Trim dangling connectives left by the cap or the noise strip
  // ("Yarn in Royal Blue Willow Green Wheat and" -> "... Wheat").
  q = q.replace(/(\s*\b(and|or|in|for|with|the|a|an)\b)+$/i, "").trim();

  if (!/\byarn\b/i.test(q) && FIBRE_WORDS.test(q)) q += " yarn";

  return q;
}

/** Build an Amazon search URL for a material, with the Associates tag if set. */
export function amazonSearchUrl(raw: string): string {
  const query = materialToQuery(raw) || raw.trim();
  const base = `https://${AMAZON_DOMAIN}/s?k=${encodeURIComponent(query)}`;
  return AMAZON_TAG ? `${base}&tag=${encodeURIComponent(AMAZON_TAG)}` : base;
}

/** Build a direct Amazon product (ASIN) URL, with the Associates tag if set. */
export function amazonProductUrl(asin: string): string {
  const base = `https://${AMAZON_DOMAIN}/dp/${asin}`;
  return AMAZON_TAG ? `${base}?tag=${encodeURIComponent(AMAZON_TAG)}` : base;
}

/**
 * Curated, evergreen Amazon products for common crochet supplies (US ASINs,
 * picked for high ratings + long-term availability). Tools/notions are one
 * product that fits any pattern, which converts far better than a search page.
 * Yarn is intentionally NOT here — fibre/weight/colour vary too much, so it
 * falls back to a search link where the user picks their own.
 *
 * `test` runs against the cleaned material string. Order matters: first match
 * wins, so put the more specific patterns first (e.g. "yarn needle" before any
 * generic yarn handling — though yarn itself has no entry).
 */
const PRODUCT_CATALOG: { test: RegExp; asin: string }[] = [
  // Yarn / tapestry / darning needle (must come before anything matching "yarn")
  { test: /(yarn|tapestry|darning|weav(ing|e)|blunt)\s*needle|缝针|毛线针/i, asin: "B0CZXN7FT1" },
  // Stitch markers
  { test: /stitch\s*marker|\bmarkers?\b|记号/i, asin: "B0F28Z5BZK" },
  // Safety eyes (amigurumi)
  { test: /safety\s*eyes?|(black|plastic|doll|amigurumi|toy)\s+eyes\b|安全眼|玩偶眼/i, asin: "B0CRYZTN3K" },
  // Fiberfill / stuffing
  { test: /fiber\s*fill|fibre\s*fill|fiberfill|poly-?fil|stuffing|填充|填充棉/i, asin: "B004ALQ0M2" },
  // Crochet hook (kit also includes markers/needles) — keep last of the tools
  { test: /\bhook\b|crochet\s*hook|钩针/i, asin: "B0C33QM3KR" },
];

/**
 * Resolve the best affiliate URL for a material: a direct product link when the
 * material matches a curated category, otherwise an Amazon search link.
 */
export function affiliateUrl(raw: string): string {
  const cleaned = materialToQuery(raw);
  const hit = PRODUCT_CATALOG.find((p) => p.test.test(cleaned));
  return hit ? amazonProductUrl(hit.asin) : amazonSearchUrl(raw);
}
