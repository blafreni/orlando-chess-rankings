import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { EmptyState, LoadingBoard } from "@/components/loading-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClubSnapshot } from "@/lib/club-api";
import { CHANGELOG } from "@/lib/changelog";
import { isKeeperUnlocked, lockKeeper } from "@/lib/keeper";
import { getKeeperStats } from "@/lib/keeper-api";
import { useClub } from "@/lib/use-club";
import { formatClubDate, todayIso } from "@/lib/utils";

type VisitStats = Awaited<ReturnType<typeof getKeeperStats>>;

export const Route = createFileRoute("/keeper")({
  loader: () => getClubSnapshot(),
  component: KeeperPage,
});

function KeeperPage() {
  const initial = Route.useLoaderData();
  const navigate = useNavigate();
  const { data: snapshot } = useClub(initial);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [visits, setVisits] = useState<VisitStats | null>(null);

  useEffect(() => {
    const open = isKeeperUnlocked();
    setUnlocked(open);
    if (!open) return;
    void getKeeperStats()
      .then(setVisits)
      .catch(() => setVisits(null));
  }, []);

  if (unlocked === null || !snapshot) return <LoadingBoard />;

  if (!unlocked) {
    return (
      <EmptyState
        title="Nothing to see here"
        body="This square is empty. Head back to the standings."
        action={
          <Button asChild>
            <Link to="/">Back to standings</Link>
          </Button>
        }
      />
    );
  }

  if (!visits) return <LoadingBoard label="Opening the board room…" />;

  const today = todayIso();
  const weekAgo = shiftIso(today, -6);
  const gamesThisWeek = snapshot.games.filter((game) => game.playedOn >= weekAgo).length;
  const lastGame = snapshot.lastGame;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            Quiet square
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Board room
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            Looks, games, and a list of what changed on the site. Bookmark this
            page on your phone. On a new phone, tap the green knight five times.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button asChild>
            <Link to="/table-cards">
              <Printer className="size-5" aria-hidden="true" />
              Print table cards
            </Link>
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              lockKeeper();
              void navigate({ to: "/" });
            }}
          >
            Lock this page
          </Button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Looks today" value={visits.today} hint="Florida time" />
        <StatCard label="Looks this week" value={visits.week} hint="Last 7 days" />
        <StatCard label="Looks all time" value={visits.total} hint="Since counting started" />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Games recorded" value={snapshot.games.length} />
        <StatCard label="Games this week" value={gamesThisWeek} />
        <StatCard
          label="Players"
          value={snapshot.players.length}
          hint={`${snapshot.clubs.length} clubs`}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>What’s new</CardTitle>
          <CardDescription>Changes to the website, newest first.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          {CHANGELOG.map((day) => (
            <section key={day.date + day.items[0]} className="flex flex-col gap-3">
              <h3 className="font-display text-xl font-semibold">{formatClubDate(day.date)}</h3>
              <ul className="flex flex-col gap-2">
                {day.items.map((item) => (
                  <li key={item} className="flex gap-3 text-lg leading-snug">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </CardContent>
      </Card>

      {lastGame ? (
        <Card>
          <CardHeader>
            <CardTitle>Last game in</CardTitle>
            <CardDescription>
              {formatClubDate(lastGame.playedOn)}
              {lastGame.clubName ? ` · ${lastGame.clubName}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {lastGame.whiteName} vs {lastGame.blackName}
            <span className="ml-2 font-normal text-muted">
              {lastGame.result === "draw"
                ? "drew"
                : lastGame.result === "white"
                  ? `${lastGame.whiteName} won`
                  : `${lastGame.blackName} won`}
            </span>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Where people go</CardTitle>
          <CardDescription>Pages opened most often.</CardDescription>
        </CardHeader>
        <CardContent>
          {visits.pages.length === 0 ? (
            <p className="text-lg text-muted">No looks yet. Share the site and come back.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visits.pages.map((page) => (
                <li key={page.path} className="flex items-baseline justify-between gap-4 text-lg">
                  <span>{page.label}</span>
                  <span className="tabular-nums font-semibold">{page.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last few looks</CardTitle>
          <CardDescription>Newest first. The board room is not counted.</CardDescription>
        </CardHeader>
        <CardContent>
          {visits.recent.length === 0 ? (
            <p className="text-lg text-muted">Waiting on the first visitor.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visits.recent.map((row, index) => (
                <li
                  key={`${row.at}-${index}`}
                  className="flex flex-col gap-0.5 text-lg sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span>{row.label}</span>
                  <span className="text-base text-muted">{formatVisitTime(row.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-walnut">{label}</p>
      <p className="mt-2 font-display text-5xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? <p className="mt-1 text-base text-muted">{hint}</p> : null}
    </Card>
  );
}

function shiftIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatVisitTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
