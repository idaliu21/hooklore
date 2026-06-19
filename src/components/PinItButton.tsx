"use client";

export function PinItButton({
  url,
  media,
  description,
}: {
  /** Absolute URL of the page being pinned. */
  url: string;
  /** Absolute URL of the image to pin (prefer the vertical 2:3 pin image). */
  media: string;
  /** Pin description (title + relevant tags). */
  description: string;
}) {
  const href =
    "https://www.pinterest.com/pin/create/button/" +
    `?url=${encodeURIComponent(url)}` +
    `&media=${encodeURIComponent(media)}` +
    `&description=${encodeURIComponent(description)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-pin-custom="true"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#e60023] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      aria-label="Save this pattern to Pinterest"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345c-.091.378-.293 1.193-.333 1.36-.052.22-.174.266-.402.16-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.608 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12C24 5.372 18.627 0 12 0z" />
      </svg>
      Save
    </a>
  );
}
