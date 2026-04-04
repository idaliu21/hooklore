import Link from "next/link";

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="text-xl">🧶</span>
          <span className="hidden sm:inline">Crochet Pattern Gallery</span>
          <span className="sm:hidden">Patterns</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">
            Browse
          </Link>
          <Link href="/about" className="text-stone-600 hover:text-stone-900 transition-colors">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
