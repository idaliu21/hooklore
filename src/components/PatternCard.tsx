import Image from "next/image";
import Link from "next/link";
import type { Pattern } from "@/lib/types";

const TAG_COLORS: Record<string, string> = {
  amigurumi: "bg-pink-50 text-pink-700",
  bag: "bg-amber-50 text-amber-700",
  coaster: "bg-green-50 text-green-700",
  scarf: "bg-blue-50 text-blue-700",
  beginner: "bg-emerald-50 text-emerald-700",
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] || "bg-stone-100 text-stone-600";
}

function tagLabel(tag: string) {
  return tag.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function PatternCard({ pattern }: { pattern: Pattern }) {
  const coverImage = pattern.productPhotos[0] || pattern.allImages[0];

  return (
    <Link
      href={`/pattern/${pattern.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {coverImage && (
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={coverImage.thumb}
            alt={pattern.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium text-sm text-stone-900 line-clamp-2 leading-snug">
          {pattern.title}
        </h3>
        {pattern.author && (
          <p className="text-xs text-stone-400 mt-1">by @{pattern.author}</p>
        )}
        {pattern.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {pattern.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${tagColor(tag)}`}>
                {tagLabel(tag)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
