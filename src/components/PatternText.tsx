"use client";

import { useState } from "react";
import type { PatternTranslation } from "@/lib/types";

export function PatternText({ patterns }: { patterns: PatternTranslation[] }) {
  const [expanded, setExpanded] = useState(true);

  if (!patterns.length) return null;

  return (
    <section className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-lg font-semibold text-stone-900 mb-4"
      >
        <span>Pattern Instructions</span>
        <span className="text-xs text-stone-400 ml-1">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="space-y-6">
          {patterns.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200 shadow-sm"
            >
              {p.englishText && (
                <pre className="font-mono text-[15px] sm:text-base leading-7 sm:leading-8 whitespace-pre-wrap text-stone-800 tracking-wide">
                  {p.englishText}
                </pre>
              )}
              {p.notes && (
                <div className="mt-5 pt-4 border-t border-stone-100 bg-amber-50/50 -mx-5 -mb-5 px-5 pb-5 rounded-b-xl">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-amber-900/80 whitespace-pre-wrap leading-relaxed">
                    {p.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
