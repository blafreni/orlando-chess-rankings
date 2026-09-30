import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Swords, Trophy } from "lucide-react";
import { KnightUnlock } from "@/components/knight-unlock";
import { VisitBeacon } from "@/components/visit-beacon";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Standings", icon: Trophy, match: (path: string) => path === "/" },
  {
    to: "/record",
    label: "Record a game",
    icon: Swords,
    match: (path: string) => path.startsWith("/record"),
  },
  {
    to: "/games",
    label: "Games",
    icon: ClipboardList,
    match: (path: string) => path.startsWith("/games"),
  },
] as const;

export function ClubLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-3"
      >
        Skip to standings
      </a>

      <VisitBeacon />
      <div className="board-stripe" />

      <header className="no-print border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <KnightUnlock />
            <Link to="/" className="flex flex-col text-fg no-underline">
              <span className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                Orlando Chess Rankings
              </span>
              <span className="text-base text-muted">
                Central Florida · one rating, every club
              </span>
            </Link>
          </div>

          <nav aria-label="Club pages" className="hidden lg:block">
            <ul className="flex items-center gap-2">
              {nav.map((item) => {
                const active = item.match(pathname);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "inline-flex min-h-12 items-center gap-2 rounded-lg px-4 text-lg font-semibold no-underline",
                        active
                          ? "bg-primary text-primary-fg"
                          : "text-fg hover:bg-sunken",
                      )}
                    >
                      <item.icon className="size-5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/clubs"
                  className={cn(
                    "inline-flex min-h-12 items-center rounded-lg px-4 text-lg font-semibold no-underline",
                    pathname.startsWith("/clubs")
                      ? "bg-sunken text-fg"
                      : "text-muted hover:bg-sunken hover:text-fg",
                  )}
                >
                  Clubs
                </Link>
              </li>
              <li>
                <Link
                  to="/players"
                  className={cn(
                    "inline-flex min-h-12 items-center rounded-lg px-4 text-lg font-semibold no-underline",
                    pathname.startsWith("/players")
                      ? "bg-sunken text-fg"
                      : "text-muted hover:bg-sunken hover:text-fg",
                  )}
                >
                  Players
                </Link>
              </li>
              <li>
                <Link
                  to="/ratings"
                  className={cn(
                    "inline-flex min-h-12 items-center rounded-lg px-4 text-lg font-semibold no-underline",
                    pathname.startsWith("/ratings")
                      ? "bg-sunken text-fg"
                      : "text-muted hover:bg-sunken hover:text-fg",
                  )}
                >
                  How ratings work
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-12"
      >
        {children}
      </main>

      <nav
        aria-label="Club pages"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-3 gap-1 px-2 py-2">
          {nav.map((item) => {
            const active = item.match(pathname);
            const isRecord = item.to === "/record";
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-2 text-center text-sm font-semibold no-underline",
                    isRecord && !active && "bg-primary text-primary-fg",
                    isRecord && active && "bg-primary-hover text-primary-fg",
                    !isRecord && active && "bg-sunken text-fg",
                    !isRecord && !active && "text-muted",
                  )}
                >
                  <item.icon className="size-6" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
