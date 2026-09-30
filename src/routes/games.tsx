import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClubFilter } from "@/components/club-filter";
import { ExportGames } from "@/components/export-games";
import { GameResultLine } from "@/components/game-result-line";
import { EmptyState, LoadingBoard } from "@/components/loading-board";
import { UndoLastGame } from "@/components/undo-last-game";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClubSnapshot } from "@/lib/club-api";
import type { AnnotatedGame } from "@/lib/elo";
import { useClub } from "@/lib/use-club";
import { formatClubDate } from "@/lib/utils";

export const Route = createFileRoute("/games")({
  loader: () => getClubSnapshot(),
  component: GamesPage,
});

function GamesPage() {
  const initial = Route.useLoaderData();
  const { data: snapshot } = useClub(initial);
  const [query, setQuery] = useState("");
  const [clubId, setClubId] = useState<number | null>(null);

  const gamesNewestFirst = useMemo(() => {
    const list = snapshot?.games ?? [];
    const scoped = clubId ? list.filter((game) => game.clubId === clubId) : list;
    return [...scoped].sort((a, b) => {
      const byDate = b.playedOn.localeCompare(a.playedOn);
      if (byDate !== 0) return byDate;
      return b.id - a.id;
    });
  }, [snapshot, clubId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return gamesNewestFirst;
    return gamesNewestFirst.filter((game) =>
      `${game.whiteName} ${game.blackName} ${game.clubName}`.toLowerCase().includes(needle),
    );
  }, [gamesNewestFirst, query]);

  if (!snapshot) return <LoadingBoard />;

  const grouped = groupByDate(filtered);
  const club = clubId ? snapshot.clubs.find((row) => row.id === clubId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            Match history
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Games
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            {snapshot.games.length} recorded across {snapshot.clubs.length} club
            {snapshot.clubs.length === 1 ? "" : "s"}. Search by player or club.
          </p>
        </div>
        <UndoLastGame lastGame={snapshot.lastGame} />
      </div>

      <ClubFilter clubs={snapshot.clubs} selectedId={clubId} onSelect={setClubId} />

      <ExportGames games={filtered} clubName={club?.name ?? null} />

      <div className="max-w-md space-y-2">
        <Label htmlFor="game-search">Search players</Label>
        <Input
          id="game-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Vince, Friday…"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            gamesNewestFirst.length === 0
              ? club
                ? `No games at ${club.name} yet`
                : "No games yet"
              : "No matches for that name"
          }
          body={
            snapshot.games.length === 0
              ? "Record the first game and it will show up here for every club."
              : "Try the first name as it appears on the standings."
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((group) => (
            <section key={group.date} className="flex flex-col gap-3">
              <h2 className="font-display text-2xl font-semibold">{group.label}</h2>
              {group.games.map((game) => (
                <GameResultLine key={game.id} game={game} showClub={!clubId} />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDate(games: AnnotatedGame[]) {
  const groups: Array<{ date: string; label: string; games: AnnotatedGame[] }> = [];
  for (const game of games) {
    const current = groups[groups.length - 1];
    if (!current || current.date !== game.playedOn) {
      groups.push({
        date: game.playedOn,
        label: formatClubDate(game.playedOn),
        games: [game],
      });
    } else {
      current.games.push(game);
    }
  }
  return groups;
}
