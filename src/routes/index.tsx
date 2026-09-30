import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { AddClubDialog } from "@/components/add-club-dialog";
import { AddPlayerDialog } from "@/components/add-player-dialog";
import { ClubFilter } from "@/components/club-filter";
import { Crosstable } from "@/components/crosstable";
import { EmptyState, LoadingBoard } from "@/components/loading-board";
import { StandingsTable } from "@/components/standings-table";
import { ClubSessionCard, NextGamesCard } from "@/components/tonight-panel";
import { UndoLastGame } from "@/components/undo-last-game";
import { Button } from "@/components/ui/button";
import { getClubSnapshot } from "@/lib/club-api";
import { useClub } from "@/lib/use-club";

export const Route = createFileRoute("/")({
  loader: () => getClubSnapshot(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  const { data: snapshot } = useClub(initial);
  const [clubId, setClubId] = useState<number | null>(null);

  const view = useMemo(() => {
    if (!snapshot) return null;
    const club = clubId ? snapshot.clubs.find((row) => row.id === clubId) ?? null : null;
    const games = clubId
      ? snapshot.games.filter((game) => game.clubId === clubId)
      : snapshot.games;
    const playedIds = new Set(games.flatMap((game) => [game.whiteId, game.blackId]));
    const standings = snapshot.standings
      .filter((row) => (clubId ? playedIds.has(row.playerId) : row.games > 0))
      .map((row, index) => ({ ...row, rank: index + 1 }));
    return { club, games, standings };
  }, [snapshot, clubId]);

  if (!snapshot || !view) return <LoadingBoard />;

  const { standings, games, lastGame, clubs } = snapshot;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            Orlando Chess Rankings
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Leaderboard
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            One rating for every club in Central Florida. Record a game at your meetup and it
            counts on this board.
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/record">Record a game</Link>
          </Button>
          <AddPlayerDialog />
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
          <UndoLastGame lastGame={lastGame} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Clubs</h2>
            <p className="text-base text-muted">
              Tap a club to see its boards. Rankings stay city-wide.
            </p>
          </div>
          <AddClubDialog />
        </div>
        <ClubFilter clubs={clubs} selectedId={clubId} onSelect={setClubId} />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Rankings</h2>
          <p className="text-base text-muted">
            {view.club
              ? `Players who have sat at ${view.club.name}. Rating is the Orlando number.`
              : "Highest Orlando rating first among players who have a game on the board. Form is the last five games."}{" "}
            <Link to="/ratings" className="font-semibold text-fg underline underline-offset-4">
              How ratings work
            </Link>
          </p>
        </div>
        {view.standings.length === 0 ? (
          <EmptyState
            title={view.club ? `No games at ${view.club.name} yet` : "The board is empty"}
            body={
              view.club
                ? "Record the first game at this meetup and it will show here."
                : "Add a player, then record a game. No login needed."
            }
            action={<AddPlayerDialog triggerLabel="Add a player" />}
          />
        ) : (
          <StandingsTable standings={view.standings} />
        )}
      </section>

      <NextGamesCard games={view.games} standings={view.club ? view.standings : standings} />

      <ClubSessionCard games={view.games} club={view.club} />

      <Crosstable standings={view.standings} games={view.games} />

      <p className="text-base text-muted">
        Need the full roster?{" "}
        <Link to="/players" className="font-semibold text-fg underline underline-offset-4">
          See every player
        </Link>
        {" · "}
        <Link to="/clubs" className="font-semibold text-fg underline underline-offset-4">
          All clubs
        </Link>
        {" · "}
        <Link to="/ratings" className="font-semibold text-fg underline underline-offset-4">
          How ratings work
        </Link>
        .
      </p>
    </div>
  );
}
