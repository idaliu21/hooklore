import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPatterns, getAllTags, getPatternsByTag } from "@/lib/data";
import { PatternCard } from "@/components/PatternCard";
import { TagBadge, AllTagBadge } from "@/components/TagBadge";

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${label} Patterns`,
    description: `Browse free ${label.toLowerCase()} crochet patterns with US-standard instructions.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const patterns = getPatternsByTag(slug);
  const allTags = getAllTags();
  const totalPatterns = getAllPatterns().length;

  if (!patterns.length) notFound();

  const label = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">
        {label} Patterns
      </h1>
      <p className="text-stone-500 mb-6">
        {patterns.length} pattern{patterns.length !== 1 ? "s" : ""} tagged with &ldquo;{label}&rdquo;
      </p>

      {/* Other tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        <AllTagBadge count={totalPatterns} />
        {allTags.map((tag) => (
          <TagBadge
            key={tag.slug}
            tag={tag.slug}
            count={tag.count}
            active={tag.slug === slug}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {patterns.map((p) => (
          <PatternCard key={p.id} pattern={p} />
        ))}
      </div>
    </div>
  );
}
