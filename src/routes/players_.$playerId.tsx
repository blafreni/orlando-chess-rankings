import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FormPills } from "@/components/form-pills";
import { GameResultLine } from "@/components/game-result-line";
import { EmptyState, LoadingBoard } from "@/components/loading-board";
import { RatingChart } from "@/components/rating-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClubSnapshot } from "@/lib/club-api";
import { roundRating } from "@/lib/elo";
import { useClub } from "@/lib/use-club";

export const Route = createFileRoute("/players_/$playerId")({
  loader: () => getClubSnapshot(),
  component: PlayerPage,
});

function PlayerPage() {
  const { playerId } = Route.useParams();
  const id = Number(playerId);
  const initial = Route.useLoaderData();
  const { data: snapshot } = useClub(initial);

  if (!snapshot) return <LoadingBoard />;

  const standing = snapshot.standings.find((row) => row.playerId === id);
  if (!standing) {
    return (
      <EmptyState
        title="Player not found"
        body="They may have been removed from the player list."
        action={
          <Link to="/players" className="font-semibold underline underline-offset-4">
            Back to players
          </Link>
        }
      />
    );
  }

  const games = snapshot.games
    .filter((game) => game.whiteId === id || game.blackId === id)
    .slice()
    .reverse();

  const clubsPlayed = [...new Set(games.map((game) => game.clubName))];
  const headToHead = buildHeadToHead(id, snapshot.games);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          to="/players"
          className="inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-muted no-underline hover:text-fg"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          All players
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
              Rank {standing.rank}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {standing.name}
            </h1>
            <p className="mt-2 text-lg text-muted">
              {standing.wins} wins · {standing.draws} draws · {standing.losses} losses
            </p>
            {clubsPlayed.length > 0 ? (
              <p className="mt-1 text-base text-muted">Played at {clubsPlayed.join(", ")}</p>
            ) : null}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-5xl font-bold tabular-nums leading-none">
              {roundRating(standing.rating)}
            </p>
            <p className="mt-2 text-base text-muted">Orlando rating</p>
          </div>
        </div>
        <div className="mt-4">
          <FormPills form={standing.form} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating</CardTitle>
          <CardDescription>How the number has moved this season.</CardDescription>
        </CardHeader>
        <CardContent>
          <RatingChart history={standing.ratingHistory} />
        </CardContent>
      </Card>

      {headToHead.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Head to head</CardTitle>
            <CardDescription>Score against each opponent.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {headToHead.map((row) => (
              <Link
                key={row.opponentId}
                to="/players/$playerId"
                params={{ playerId: String(row.opponentId) }}
                className="flex min-h-14 items-center justify-between gap-3 py-3 text-fg no-underline hover:bg-sunken"
              >
                <span className="text-lg font-semibold">{row.name}</span>
                <span className="text-lg tabular-nums text-muted">
                  {row.wins}–{row.draws}–{row.losses}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">Games</h2>
        {games.length === 0 ? (
          <p className="text-lg text-muted">No games recorded yet.</p>
        ) : (
          games.map((game) => (
            <GameResultLine key={game.id} game={game} highlightId={id} />
          ))
        )}
      </section>
    </div>
  );
}

function buildHeadToHead(playerId: number, games: Awaited<ReturnType<typeof getClubSnapshot>>["games"]) {
  const map = new Map<
    number,
    { opponentId: number; name: string; wins: number; draws: number; losses: number }
  >();

  for (const game of games) {
    const isWhite = game.whiteId === playerId;
    const isBlack = game.blackId === playerId;
    if (!isWhite && !isBlack) continue;
    const opponentId = isWhite ? game.blackId : game.whiteId;
    const opponentName = isWhite ? game.blackName : game.whiteName;
    const row = map.get(opponentId) ?? {
      opponentId,
      name: opponentName,
      wins: 0,
      draws: 0,
      losses: 0,
    };
    if (game.result === "draw") row.draws += 1;
    else if ((game.result === "white" && isWhite) || (game.result === "black" && isBlack)) {
      row.wins += 1;
    } else {
      row.losses += 1;
    }
    map.set(opponentId, row);
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
