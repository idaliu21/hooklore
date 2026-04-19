import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="font-serif text-6xl text-brand-500 mb-4">404</p>
      <h1 className="font-serif text-2xl text-stone-900 mb-3">A dropped stitch.</h1>
      <p className="text-stone-500 mb-8">
        This pattern unraveled somewhere along the way. Let&apos;s pick up a fresh strand.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        Back to patterns
      </Link>
    </div>
  );
}
