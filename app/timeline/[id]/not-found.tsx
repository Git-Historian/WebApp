import Link from "next/link";

export default function TimelineNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <h1 className="text-24 font-mono text-[color:var(--color-high-contrast)]">
        Timeline not found
      </h1>
      <p className="text-14 text-[color:var(--color-gray9)]">
        This timeline may have expired or the link may be incorrect.
      </p>
      <Link
        href="/"
        className="text-14 text-[color:var(--color-gray9)] underline underline-offset-4 hover:text-[color:var(--color-high-contrast)] transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
