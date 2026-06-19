import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  getPatternBySlug,
  getRelatedPatterns,
} from "@/lib/data";
import type { Pattern } from "@/lib/types";
import { ImageCarousel } from "@/components/ImageCarousel";
import { PatternText } from "@/components/PatternText";
import { PatternInfo } from "@/components/PatternInfo";
import { PatternFaq } from "@/components/PatternFaq";
import { PatternCard } from "@/components/PatternCard";
import { TagBadge } from "@/components/TagBadge";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { PinItButton } from "@/components/PinItButton";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function tagLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Breadcrumb trail: Home → primary tag → pattern. */
function breadcrumbsFor(pattern: Pattern): Crumb[] {
  const crumbs: Crumb[] = [{ name: "Patterns", href: "/" }];
  const primaryTag = pattern.tags[0];
  if (primaryTag) {
    crumbs.push({ name: tagLabel(primaryTag), href: `/tag/${primaryTag}` });
  }
  crumbs.push({ name: pattern.title, href: `/pattern/${pattern.slug}` });
  return crumbs;
}

function metaDescription(pattern: Pattern): string {
  return (
    pattern.meta?.intro ||
    pattern.patterns[0]?.englishText?.slice(0, 155).replace(/\s+/g, " ").trim() ||
    pattern.description ||
    `Free crochet pattern: ${pattern.title}, written in US-standard notation.`
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) return {};

  const cover = pattern.productPhotos[0] || pattern.allImages[0];
  const ogImage = cover ? absoluteUrl(cover.full || cover.medium) : undefined;
  const description = metaDescription(pattern);

  return {
    title: `${pattern.title} Crochet Pattern`,
    description,
    alternates: { canonical: `/pattern/${pattern.slug}` },
    openGraph: {
      type: "article",
      title: `${pattern.title} — Free Crochet Pattern`,
      description,
      url: absoluteUrl(`/pattern/${pattern.slug}`),
      images: ogImage ? [{ url: ogImage, alt: `${pattern.title} crochet pattern` }] : [],
      authors: pattern.author ? [pattern.author] : undefined,
      publishedTime: pattern.createdAt
        ? new Date(pattern.createdAt).toISOString()
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${pattern.title} — Free Crochet Pattern`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    other: {
      "pinterest-rich-pin": "true",
    },
  };
}

function getStructuredData(pattern: Pattern, crumbs: Crumb[]) {
  const pageUrl = absoluteUrl(`/pattern/${pattern.slug}`);
  const images = (pattern.productPhotos.length ? pattern.productPhotos : pattern.allImages)
    .slice(0, 6)
    .map((img) => absoluteUrl(img.full || img.medium));

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: `${pattern.title} Crochet Pattern`,
      description: metaDescription(pattern),
      image: images.length ? images : undefined,
      datePublished: pattern.createdAt
        ? new Date(pattern.createdAt).toISOString()
        : undefined,
      author: {
        "@type": "Person",
        name: pattern.author || "Unknown",
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
      keywords: pattern.tags.length
        ? pattern.tags.map(tagLabel).join(", ")
        : undefined,
      isAccessibleForFree: true,
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
  ];

  if (pattern.meta?.faq && pattern.meta.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: pattern.meta.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) notFound();

  const crumbs = breadcrumbsFor(pattern);
  const related = getRelatedPatterns(pattern.slug, 6);
  const cover = pattern.productPhotos[0] || pattern.allImages[0];
  const pinMedia = cover ? absoluteUrl(cover.full || cover.medium) : "";
  const pinDescription = [
    `${pattern.title} — free crochet pattern`,
    pattern.tags.map((t) => `#${t.replace(/-/g, "")}`).join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(pattern, crumbs)),
        }}
      />

      <Breadcrumbs items={crumbs} />

      {/* Product Photos */}
      {pattern.productPhotos.length > 0 && (
        <ImageCarousel images={pattern.productPhotos} title={pattern.title} />
      )}

      {/* Title & Author */}
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            {pattern.title}
          </h1>
          {pattern.author && (
            <p className="text-sm text-stone-400 mt-1">
              Original design by <span className="font-medium">@{pattern.author}</span>
            </p>
          )}
        </div>
        {pinMedia && (
          <PinItButton
            url={absoluteUrl(`/pattern/${pattern.slug}`)}
            media={pinMedia}
            description={pinDescription}
          />
        )}
      </div>

      {/* Tags */}
      {pattern.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {pattern.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* At-a-glance info (materials, hook, difficulty, intro) */}
      <PatternInfo meta={pattern.meta} />

      {/* Pattern Text */}
      <PatternText patterns={pattern.patterns} />

      {/* FAQ */}
      <PatternFaq items={pattern.meta?.faq} />

      {/* Related patterns — internal linking */}
      {related.length > 0 && (
        <section className="mt-12 border-t border-stone-200 pt-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">
            More crochet patterns
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {related.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
