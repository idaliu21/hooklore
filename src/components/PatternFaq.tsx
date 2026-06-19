import type { PatternFaq as PatternFaqItem } from "@/lib/types";

/** FAQ block. The matching FAQPage JSON-LD is emitted by the page. */
export function PatternFaq({ items }: { items?: PatternFaqItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="rounded-xl border border-stone-200 bg-white p-4 [&[open]>summary]:mb-2"
          >
            <summary className="cursor-pointer font-medium text-stone-800 text-sm">
              {item.question}
            </summary>
            <p className="text-sm text-stone-600 leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
