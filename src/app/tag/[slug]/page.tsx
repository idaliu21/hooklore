import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPatterns, getAllTags, getPatternsByTag } from "@/lib/data";
import { PatternCard } from "@/components/PatternCard";
import { TagBadge, AllTagBadge } from "@/components/TagBadge";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { TAG_INTROS } from "@/content/tag-intros";

/**
 * Tag pages with fewer than this many patterns are kept crawlable (links pass
 * equity) but `noindex` — a 1–2 item listing is near-duplicate thin content that
 * would otherwise bloat the index. Raise/lower to tune what gets indexed.
 */
const MIN_INDEXABLE_TAG_COUNT = 3;

function tagLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const patterns = getPatternsByTag(slug);
  const label = tagLabel(slug);
  const title = `Free ${label} Crochet Patterns`;
  const introFirstSentence = TAG_INTROS[slug]?.split(/(?<=[.!?])\s/)[0];
  const description =
    introFirstSentence && introFirstSentence.length <= 160
      ? introFirstSentence
      : `Browse free ${label.toLowerCase()} crochet patterns with clear, US-standard instructions — diagrams, photos and step-by-step stitch counts.`;
  const url = absoluteUrl(`/tag/${slug}`);

  const cover = patterns[0]?.productPhotos[0] || patterns[0]?.allImages[0];
  const ogImage = cover ? absoluteUrl(cover.full || cover.medium) : undefined;

  const indexable = patterns.length >= MIN_INDEXABLE_TAG_COUNT;

  return {
    title,
    description,
    alternates: { canonical: `/tag/${slug}` },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      images: ogImage ? [{ url: ogImage, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function getStructuredData(slug: string, label: string, patterns: ReturnType<typeof getPatternsByTag>, crumbs: Crumb[]) {
  const pageUrl = absoluteUrl(`/tag/${slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name: `Free ${label} Crochet Patterns`,
        isPartOf: { "@id": `${absoluteUrl("/")}#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: patterns.length,
          itemListElement: patterns.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/pattern/${p.slug}`),
            name: p.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: absoluteUrl(c.href),
        })),
      },
    ],
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

  const label = tagLabel(slug);
  const crumbs: Crumb[] = [
    { name: "Patterns", href: "/" },
    { name: label, href: `/tag/${slug}` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(slug, label, patterns, crumbs)),
        }}
      />

      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-bold text-stone-900 mb-2 mt-4">
        Free {label} Crochet Patterns
      </h1>
      {TAG_INTROS[slug] ? (
        <div className="text-stone-600 mb-2 max-w-2xl space-y-3">
          {TAG_INTROS[slug].split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      ) : (
        <p className="text-stone-600 mb-2 max-w-2xl">
          A curated collection of {label.toLowerCase()} crochet patterns, each written in
          clear US-standard notation with photos, diagrams and stitch-by-stitch counts so
          you can follow along from your first chain to fasten off.
        </p>
      )}
      <p className="text-stone-400 text-sm mb-6">
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
