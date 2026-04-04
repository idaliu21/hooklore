import { getAllPatterns, getAllTags } from "@/lib/data";
import { PatternCard } from "@/components/PatternCard";
import { TagBadge } from "@/components/TagBadge";

export default function HomePage() {
  const patterns = getAllPatterns();
  const tags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
          Crochet Pattern Gallery
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          Free crochet patterns translated from Chinese to English.
          Clear US-standard instructions you can follow stitch by stitch.
        </p>
      </section>

      {/* Tags */}
      {tags.length > 0 && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag) => (
              <TagBadge key={tag.slug} tag={tag.slug} count={tag.count} />
            ))}
          </div>
        </section>
      )}

      {/* Pattern Grid */}
      <section>
        <h2 className="text-lg font-semibold text-stone-700 mb-4">
          All Patterns ({patterns.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {patterns.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
