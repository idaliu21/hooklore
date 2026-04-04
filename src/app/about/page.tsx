import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Crochet Pattern Gallery — free translated crochet patterns.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">About</h1>
      <div className="prose prose-stone">
        <p>
          Crochet Pattern Gallery is a collection of free crochet patterns
          translated from Chinese to English. We find beautiful designs shared
          by talented crochet artists on Chinese social media and translate the
          instructions into clear, US-standard crochet notation.
        </p>
        <p>
          Every pattern includes credit to the original designer. If you&apos;re
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
