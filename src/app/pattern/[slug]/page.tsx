import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getPatternBySlug } from "@/lib/data";
import { ImageCarousel } from "@/components/ImageCarousel";
import { PatternText } from "@/components/PatternText";
import { TagBadge } from "@/components/TagBadge";
import Image from "next/image";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) return {};

  const ogImage = pattern.productPhotos[0]?.medium || pattern.allImages[0]?.medium;
  const description =
    pattern.patterns[0]?.englishText?.slice(0, 155).replace(/\n/g, " ") ||
    pattern.description ||
    `Free crochet pattern: ${pattern.title}`;

  return {
    title: pattern.title,
    description,
    openGraph: {
      title: pattern.title,
      description: `Free crochet pattern by @${pattern.author}`,
      images: ogImage ? [{ url: ogImage, width: 800, height: 600 }] : [],
      type: "article",
    },
    other: {
      "pinterest-rich-pin": "true",
    },
  };
}

function getStructuredData(pattern: NonNullable<ReturnType<typeof getPatternBySlug>>) {
  const steps = pattern.patterns[0]?.englishText
    ?.split("\n")
    .filter((line) => /^Rnd|^Row|^Step/i.test(line.trim()))
    .map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: text.trim(),
    }));

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: pattern.title,
    description: `Free crochet pattern translated from Chinese. Original design by @${pattern.author}.`,
    image: pattern.productPhotos[0]?.medium,
    author: {
      "@type": "Person",
      name: pattern.author || "Unknown",
    },
    step: steps?.length ? steps : undefined,
  };
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(pattern)),
        }}
      />
      {/* Product Photos */}
      {pattern.productPhotos.length > 0 && (
        <ImageCarousel images={pattern.productPhotos} />
      )}

      {/* Title & Author */}
      <div className="mt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          {pattern.title}
        </h1>
        {pattern.author && (
          <p className="text-sm text-stone-400 mt-1">
            Original design by <span className="font-medium">@{pattern.author}</span>
          </p>
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

      {/* Pattern Text */}
      <PatternText patterns={pattern.patterns} />

      {/* Diagrams */}
      {pattern.diagrams.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            Crochet Diagrams
          </h2>
          <div className="grid gap-4">
            {pattern.diagrams.map((d, i) => (
              <a
                key={i}
                href={d.full}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-stone-200 bg-white"
              >
                <Image
                  src={d.medium}
                  alt={`Diagram ${i + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <p className="text-xs text-stone-400 text-center py-2">
                  Tap to view full size
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
