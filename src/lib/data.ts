import type { Pattern, TagInfo } from "./types";
import patternsJson from "@/content/patterns.json";

const patterns: Pattern[] = patternsJson as Pattern[];

export function getAllPatterns(): Pattern[] {
  return patterns;
}

export function getPatternBySlug(slug: string): Pattern | undefined {
  return patterns.find((p) => p.slug === slug);
}

export function getPatternsByTag(tag: string): Pattern[] {
  return patterns.filter((p) => p.tags.includes(tag));
}

export function getAllTags(): TagInfo[] {
  const tagCounts = new Map<string, number>();
  for (const p of patterns) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  return Array.from(tagCounts.entries())
    .map(([slug, count]) => ({
      slug,
      label: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getAllSlugs(): string[] {
  return patterns.map((p) => p.slug);
}
