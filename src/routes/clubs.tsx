import { Link, createFileRoute } from "@tanstack/react-router";
import { AddClubDialog } from "@/components/add-club-dialog";
import { EmptyState, LoadingBoard } from "@/components/loading-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getClubSnapshot } from "@/lib/club-api";
import { useClub } from "@/lib/use-club";
import { writeLastClubId } from "@/lib/utils";

export const Route = createFileRoute("/clubs")({
  loader: () => getClubSnapshot(),
  component: ClubsPage,
});

function ClubsPage() {
  const initial = Route.useLoaderData();
  const { data: snapshot } = useClub(initial);

  if (!snapshot) return <LoadingBoard />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            Central Florida
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Clubs
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            Every meetup shares one Orlando rating. Add your club, then record games as usual.
          </p>
        </div>
        <AddClubDialog />
      </div>

      {snapshot.clubs.length === 0 ? (
        <EmptyState
          title="No clubs yet"
          body="Add the first meetup. Friday Chess Club is a good start."
          action={<AddClubDialog triggerLabel="Add a club" />}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {snapshot.clubs.map((club) => {
            const games = snapshot.games.filter((game) => game.clubId === club.id);
            const players = new Set(games.flatMap((game) => [game.whiteId, game.blackId]));
            return (
              <li key={club.id}>
                <Card className="flex h-full flex-col gap-4 p-5">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">{club.name}</h2>
                    <p className="mt-1 text-lg text-muted">{club.location}</p>
                    <p className="text-lg text-muted">{club.meets}</p>
                  </div>
                  <p className="text-base text-muted">
                    {games.length} game{games.length === 1 ? "" : "s"} · {players.size} player
                    {players.size === 1 ? "" : "s"}
                  </p>
                  <Button asChild className="mt-auto self-start">
                    <Link
                      to="/record"
                      onClick={() => writeLastClubId(club.id)}
                    >
                      Record a game here
                    </Link>
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
