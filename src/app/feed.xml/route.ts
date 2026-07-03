import { getAllPatterns } from "@/lib/data";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, absoluteUrl } from "@/lib/site";

// Static at build time — the pattern set only changes on redeploy.
export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function patternDescription(p: ReturnType<typeof getAllPatterns>[number]): string {
  return (
    p.meta?.intro ||
    p.description ||
    `Free crochet pattern: ${p.title}, written in US-standard notation.`
  );
}

export async function GET() {
  const patterns = [...getAllPatterns()].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  });

  const latest = patterns[0]?.createdAt
    ? new Date(patterns[0].createdAt).toUTCString()
    : new Date(0).toUTCString();

  const items = patterns
    .map((p) => {
      const url = absoluteUrl(`/pattern/${p.slug}`);
      const cover = p.productPhotos[0] || p.allImages[0];
      const enclosure = cover
        ? `\n      <enclosure url="${escapeXml(absoluteUrl(cover.full || cover.medium))}" type="image/webp" />`
        : "";
      const pubDate = p.createdAt ? new Date(p.createdAt).toUTCString() : latest;
      return `    <item>
      <title>${escapeXml(`${p.title} Crochet Pattern`)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(patternDescription(p))}</description>${
        p.tags.map((t) => `\n      <category>${escapeXml(t)}</category>`).join("")
      }${enclosure}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Free Crochet Patterns</title>
    <link>${escapeXml(SITE_URL)}</link>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${latest}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
