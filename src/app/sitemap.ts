import type { MetadataRoute } from "next";
import { getAllPatterns, getAllTags, getPatternsByTag } from "@/lib/data";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/** A stable reference date so home/tag lastmod doesn't churn on every build. */
function latestCreatedAt(patterns: ReturnType<typeof getAllPatterns>): Date {
  let max = 0;
  for (const p of patterns) {
    const t = p.createdAt ? Date.parse(p.createdAt) : 0;
    if (!Number.isNaN(t) && t > max) max = t;
  }
  return max ? new Date(max) : new Date(0);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const patterns = getAllPatterns();
  const tags = getAllTags();
  const siteLastMod = latestCreatedAt(patterns);

  const patternUrls: MetadataRoute.Sitemap = patterns.map((p) => {
    // Feed product photos to Google Images (visual-traffic goal).
    const images = (p.productPhotos.length ? p.productPhotos : p.allImages)
      .slice(0, 8)
      .map((img) => absoluteUrl(img.full || img.medium));

    return {
      url: absoluteUrl(`/pattern/${p.slug}`),
      lastModified: p.createdAt ? new Date(p.createdAt) : siteLastMod,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(images.length ? { images } : {}),
    };
  });

  const tagUrls: MetadataRoute.Sitemap = tags.map((t) => ({
    url: absoluteUrl(`/tag/${t.slug}`),
    lastModified: latestCreatedAt(getPatternsByTag(t.slug)),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: siteLastMod,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: siteLastMod,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...patternUrls,
    ...tagUrls,
  ];
}
