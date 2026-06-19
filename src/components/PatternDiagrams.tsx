import type { PatternImage } from "@/lib/types";

/**
 * Visual crochet charts only. Chinese text-shorthand diagrams (type "text_diagram")
 * are intentionally excluded — they're unreadable to an English audience and the
 * written Pattern Instructions already cover their content. Symbol/pixel/charted
 * diagrams are language-agnostic, so they're worth showing.
 */
export function PatternDiagrams({
  diagrams,
  title,
}: {
  diagrams: PatternImage[];
  title: string;
}) {
  const charts = diagrams.filter((d) => d.type === "symbol_diagram");
  if (charts.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Crochet Diagrams</h2>
      <div className="space-y-4">
        {charts.map((img, i) => (
          <div
            key={i}
            className="rounded-xl border border-stone-200 bg-white p-2 overflow-hidden"
          >
            {/* Charts have varied aspect ratios and sit below the fold — a plain
                lazy <img> avoids next/image's fixed-dimension constraints. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.medium}
              alt={`${title} crochet symbol chart${charts.length > 1 ? ` ${i + 1}` : ""}`}
              loading="lazy"
              className="w-full h-auto rounded-lg"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
