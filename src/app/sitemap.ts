import type { MetadataRoute } from "next";
import { getAllPatterns, getAllTags } from "@/lib/data";

const BASE_URL = process.env.SITE_URL || "https://crochet-patterns.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const patterns = getAllPatterns();
  const tags = getAllTags();

  const patternUrls = patterns.map((p) => ({
    url: `${BASE_URL}/pattern/${p.slug}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const tagUrls = tags.map((t) => ({
    url: `${BASE_URL}/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...patternUrls,
    ...tagUrls,
  ];
}
