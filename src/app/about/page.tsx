import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Hooklore — a curated library of crochet patterns.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl text-stone-900 mb-2">About</h1>
      <p className="font-serif italic text-brand-700 mb-8">Stitching stories, one loop at a time.</p>
      <div className="prose prose-stone">
        <p>
          <strong>Hooklore</strong> — from <em>hook</em>, the tool, and <em>lore</em>,
          the quiet knowledge passed between makers — is a curated library of
          crochet patterns written in clear, US-standard notation so you can
          follow each design stitch by stitch.
        </p>
        <p>
          Every pattern includes credit to its original designer. If you&apos;re
          an original creator and would like your pattern removed or credited
          differently, please reach out.
        </p>
        <h2>How to read the patterns</h2>
        <p>
          All patterns use standard US crochet abbreviations:
        </p>
        <ul>
          <li><strong>ch</strong> — chain</li>
          <li><strong>sc</strong> — single crochet</li>
          <li><strong>hdc</strong> — half double crochet</li>
          <li><strong>dc</strong> — double crochet</li>
          <li><strong>tr</strong> — treble/triple crochet</li>
          <li><strong>sl st</strong> — slip stitch</li>
          <li><strong>inc</strong> — increase (2 stitches in same stitch)</li>
          <li><strong>dec</strong> — decrease (invisible decrease)</li>
          <li><strong>MR</strong> — magic ring</li>
          <li><strong>FO</strong> — fasten off</li>
        </ul>
        <p>
          Stitch counts are shown in parentheses at the end of each round,
          e.g., <code>Rnd 1: 6 sc in MR (6)</code>.
        </p>
      </div>
    </div>
  );
}
