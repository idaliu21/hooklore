import type { PatternMeta } from "@/lib/types";
import { AFFILIATE_ENABLED, affiliateUrl } from "@/lib/affiliate";

function hasSpecs(meta: PatternMeta): boolean {
  return Boolean(
    meta.difficulty ||
      meta.hookSize ||
      meta.yarnWeight ||
      meta.finishedSize ||
      meta.estimatedTime ||
      (meta.materials && meta.materials.length)
  );
}

/** "At a glance" info block: intro + spec grid + materials + abbreviations. */
export function PatternInfo({ meta }: { meta?: PatternMeta }) {
  if (!meta) return null;
  if (!meta.intro && !hasSpecs(meta) && !meta.abbreviationsUsed?.length) return null;

  const specs: { label: string; value?: string }[] = [
    { label: "Difficulty", value: meta.difficulty },
    { label: "Hook", value: meta.hookSize },
    { label: "Yarn", value: meta.yarnWeight },
    { label: "Finished size", value: meta.finishedSize },
    { label: "Time", value: meta.estimatedTime },
  ].filter((s) => s.value);

  return (
    <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
      {meta.intro && (
        <p className="text-stone-700 leading-relaxed">{meta.intro}</p>
      )}

      {specs.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          {specs.map((s) => (
            <div key={s.label}>
              <dt className="text-[11px] uppercase tracking-wider text-stone-400">
                {s.label}
              </dt>
              <dd className="text-sm font-medium text-stone-800">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {meta.materials && meta.materials.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-400 mb-1">
            Materials
          </p>
          <ul className="list-disc list-inside text-sm text-stone-700 space-y-0.5">
            {meta.materials.map((m, i) => (
              <li key={i}>
                {AFFILIATE_ENABLED ? (
                  <a
                    href={affiliateUrl(m)}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="text-stone-700 underline decoration-stone-300 underline-offset-2 hover:text-amber-700 hover:decoration-amber-400"
                  >
                    {m}
                  </a>
                ) : (
                  m
                )}
              </li>
            ))}
          </ul>
          {AFFILIATE_ENABLED && (
            <p className="mt-2 text-[11px] leading-snug text-stone-400">
              As an Amazon Associate, Hooklore earns from qualifying purchases.
              Material links open a search on Amazon.
            </p>
          )}
        </div>
      )}

      {meta.abbreviationsUsed && meta.abbreviationsUsed.length > 0 && (
        <p className="mt-4 text-xs text-stone-500">
          <span className="uppercase tracking-wider text-stone-400">Stitches used: </span>
          {meta.abbreviationsUsed.join(", ")}
        </p>
      )}
    </section>
  );
}
