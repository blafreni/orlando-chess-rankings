import { createFileRoute } from "@tanstack/react-router";
import { LoadingBoard } from "@/components/loading-board";
import { RecordGameForm } from "@/components/record-game-form";
import { UndoLastGame } from "@/components/undo-last-game";
import { getClubSnapshot } from "@/lib/club-api";
import { useClub } from "@/lib/use-club";

export const Route = createFileRoute("/record")({
  loader: () => getClubSnapshot(),
  component: RecordPage,
});

function RecordPage() {
  const initial = Route.useLoaderData();
  const { data: snapshot } = useClub(initial);

  if (!snapshot) return <LoadingBoard />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            After the handshake
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Record a game
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            Pick the club, then White, Black, and the winner. Ratings move on the city board
            the moment you save.
          </p>
        </div>
        <UndoLastGame lastGame={snapshot.lastGame} />
      </div>
      <RecordGameForm
        clubs={snapshot.clubs}
        players={snapshot.players}
        standings={snapshot.standings}
      />
    </div>
  );
}
