import Link from "next/link";
import { Logo } from "./Logo";

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-stone-50/85 backdrop-blur-md border-b border-stone-200">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-stone-900">
          <Logo />
          <span className="font-serif text-xl tracking-tight">Hooklore</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-stone-600 hover:text-brand-600 transition-colors">
            Browse
          </Link>
          <Link href="/about" className="text-stone-600 hover:text-brand-600 transition-colors">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
