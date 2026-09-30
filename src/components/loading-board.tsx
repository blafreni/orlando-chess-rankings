import type { ReactNode } from "react";

export function LoadingBoard({ label = "Loading the club board…" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-10 w-64 max-w-full rounded-md bg-sunken" />
      <div className="h-24 rounded-xl bg-sunken" />
      <div className="h-80 rounded-xl bg-sunken" />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-lg text-muted">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
