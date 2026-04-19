export function Logo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill="var(--color-brand-50)" stroke="var(--color-brand-500)" strokeWidth="1.5" />
      <path
        d="M 16 25 L 16 12 Q 16 8 12.5 8 Q 10 8 10 10.5"
        stroke="var(--color-brand-600)"
        strokeWidth="2.25"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="25" r="1.4" fill="var(--color-brand-600)" />
    </svg>
  );
}
