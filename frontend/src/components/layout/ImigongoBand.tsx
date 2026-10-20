/**
 * Decorative Imigongo art band — traditional Rwandan geometric pattern.
 * Used as a cultural accent under headers, between sections, and above footers.
 *
 * variant="dark"  → classic imigongo photo (rich browns) — for light backgrounds
 * variant="white" → white line-art pattern on a dark brand strip — for headers
 */
export default function ImigongoBand({
  height = 'h-6',
  className = '',
  variant = 'dark',
}: {
  /** Tailwind height class, e.g. 'h-6' (accent) or 'h-16' (divider) */
  height?: string;
  className?: string;
  variant?: 'dark' | 'white';
}) {
  const isWhite = variant === 'white';
  return (
    <div
      aria-hidden
      className={`w-full bg-repeat-x ${height} ${isWhite ? 'bg-brand-900' : ''} ${className}`}
      style={{
        backgroundImage: `url(/images/${isWhite ? 'imigongo-white.webp' : 'imigongo.jpg'})`,
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center',
      }}
    />
  );
}
