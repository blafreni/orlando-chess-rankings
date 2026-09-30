import { cn } from "@/lib/utils";

export function KnightMark({
  className,
  title = "Orlando Chess Rankings",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="64" height="64" rx="10" fill="currentColor" />
      <path
        fill="#faf6ee"
        d="M18 50h28v-5.2H18V50zm4.4-8.4c.6-4.6 2.2-8.4 5.4-11.2-2.8-1.6-5.1-4.2-6.4-7.8-.4-1.2.4-2.4 1.7-2.5 2.6-.2 5.4.6 7.6 2.1 1.3-3.4 3.8-6.4 7.8-8.5 1.2-.6 2.6.2 2.7 1.6.2 3.8-.4 8.3-3.2 11.2 3.2.8 5.9 2.8 7.4 5.6 1.8 3.4 1.7 7.4 1.2 10.8H22.4z"
      />
      <path
        fill="#2c4a3e"
        d="M33.2 18.6c-1.6 1.4-2.6 3.3-3.1 5.2 1.8.9 3.3 2.2 4.4 3.8.8-3.1 1-6.2.6-8.6-.3-.2-1.1-.6-1.9-.4z"
        opacity="0.35"
      />
    </svg>
  );
}
