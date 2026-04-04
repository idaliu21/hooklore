import Link from "next/link";

const TAG_COLORS: Record<string, string> = {
  amigurumi: "bg-pink-50 text-pink-700",
  bag: "bg-amber-50 text-amber-700",
  coaster: "bg-green-50 text-green-700",
  scarf: "bg-blue-50 text-blue-700",
  applique: "bg-violet-50 text-violet-700",
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-orange-50 text-orange-700",
  advanced: "bg-red-50 text-red-700",
};

function getColor(tag: string): string {
  return TAG_COLORS[tag] || "bg-stone-100 text-stone-600";
}

function formatLabel(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function TagBadge({
  tag,
  size = "md",
  count,
}: {
  tag: string;
  size?: "sm" | "md";
  count?: number;
}) {
  const cls =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5 rounded"
      : "text-xs px-2.5 py-1 rounded-md font-medium";

  return (
    <Link
      href={`/tag/${tag}`}
      className={`inline-block ${getColor(tag)} ${cls} hover:opacity-80 transition-opacity`}
    >
      {formatLabel(tag)}
      {count !== undefined && <span className="ml-1 opacity-60">{count}</span>}
    </Link>
  );
}
