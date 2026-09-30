import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AddPlayerDialog } from "@/components/add-player-dialog";
import { ClubFilter } from "@/components/club-filter";
import { EmptyState, LoadingBoard } from "@/components/loading-board";
import { Card } from "@/components/ui/card";
import { getClubSnapshot } from "@/lib/club-api";
import type { AnnotatedGame } from "@/lib/elo";
import { roundRating } from "@/lib/elo";
import { useClub } from "@/lib/use-club";

export const Route = createFileRoute("/players")({
  loader: () => getClubSnapshot(),
  component: PlayersPage,
});

function PlayersPage() {
  const initial = Route.useLoaderData();
  const { data: snapshot } = useClub(initial);
  const [clubId, setClubId] = useState<number | null>(null);

  const rows = useMemo(() => {
    if (!snapshot) return [];
    const clubGames = clubId
      ? snapshot.games.filter((game) => game.clubId === clubId)
      : snapshot.games;
    const playedIds = clubId
      ? new Set(clubGames.flatMap((game) => [game.whiteId, game.blackId]))
      : null;
    const list = playedIds
      ? snapshot.standings.filter((row) => playedIds.has(row.playerId))
      : snapshot.standings;
    return [...list]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => {
        const record = clubId ? clubRecord(row.playerId, clubGames) : row;
        return { ...row, ...record };
      });
  }, [snapshot, clubId]);

  if (!snapshot) return <LoadingBoard />;

  const club = clubId ? snapshot.clubs.find((row) => row.id === clubId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            Player list
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Players
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            {club
              ? `${rows.length} player${rows.length === 1 ? "" : "s"} at ${club.name}. Ratings stay city-wide.`
              : `${snapshot.players.length} players across ${snapshot.clubs.length} club${snapshot.clubs.length === 1 ? "" : "s"}. Tap a name for rating history and head-to-head.`}
          </p>
        </div>
        <AddPlayerDialog />
      </div>

      <ClubFilter clubs={snapshot.clubs} selectedId={clubId} onSelect={setClubId} />

      {rows.length === 0 ? (
        <EmptyState
          title={club ? `No players at ${club.name} yet` : "No players yet"}
          body={
            club
              ? "Record a game at this meetup and those names will show here."
              : "Add whoever sits down at the first board."
          }
          action={<AddPlayerDialog triggerLabel="Add a player" />}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <li key={row.playerId}>
              <Link
                to="/players/$playerId"
                params={{ playerId: String(row.playerId) }}
                className="block no-underline"
              >
                <Card className="flex min-h-20 items-center justify-between gap-3 p-4 hover:bg-sunken">
                  <div>
                    <p className="text-xl font-semibold">{row.name}</p>
                    <p className="text-base text-muted">
                      #{row.rank} · {row.games} game{row.games === 1 ? "" : "s"} · {row.wins}–
                      {row.draws}–{row.losses}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold tabular-nums">
                      {roundRating(row.rating)}
                    </p>
                    <ChevronRight className="size-6 text-muted" aria-hidden="true" />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function clubRecord(playerId: number, games: AnnotatedGame[]) {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  for (const game of games) {
    if (game.whiteId !== playerId && game.blackId !== playerId) continue;
    if (game.result === "draw") draws += 1;
    else if (
      (game.result === "white" && game.whiteId === playerId) ||
      (game.result === "black" && game.blackId === playerId)
    ) {
      wins += 1;
    } else {
      losses += 1;
    }
  }
  return { games: wins + draws + losses, wins, draws, losses };
}
