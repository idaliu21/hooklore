import Link from "next/link";

export interface Crumb {
  name: string;
  href: string;
}

/** Visual breadcrumb trail. The matching BreadcrumbList JSON-LD is emitted by the page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-4">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span className="text-stone-500" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-brand-600 transition-colors">
                  {item.name}
                </Link>
              )}
              {!isLast && <span className="text-stone-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
