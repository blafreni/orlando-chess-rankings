import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { AnnotatedGame } from "@/lib/elo";
import { roundRating } from "@/lib/elo";
import { cn, formatClubDate, signedDelta } from "@/lib/utils";

export function GameResultLine({
  game,
  highlightId,
  showClub = true,
}: {
  game: AnnotatedGame;
  highlightId?: number;
  showClub?: boolean;
}) {
  const summary =
    game.result === "draw"
      ? "drew"
      : game.result === "white"
        ? `${game.whiteName} won`
        : `${game.blackName} won`;

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          {formatClubDate(game.playedOn)}
          {showClub && game.clubName ? ` · ${game.clubName}` : ""}
        </p>
        <p className="mt-1 text-xl font-semibold leading-snug">
          <PlayerName
            id={game.whiteId}
            name={game.whiteName}
            highlight={highlightId === game.whiteId}
          />
          <span className="mx-2 text-subtle">vs</span>
          <PlayerName
            id={game.blackId}
            name={game.blackName}
            highlight={highlightId === game.blackId}
          />
        </p>
        <p className="mt-1 text-base text-muted">
          White {roundRating(game.whiteRatingBefore)} ({signedDelta(game.whiteDelta)}) · Black{" "}
          {roundRating(game.blackRatingBefore)} ({signedDelta(game.blackDelta)})
        </p>
      </div>
      <Badge
        variant={game.result === "draw" ? "draw" : "win"}
        className={cn("self-start px-3 py-1 text-base sm:self-center")}
      >
        {summary}
      </Badge>
    </article>
  );
}

function PlayerName({
  id,
  name,
  highlight,
}: {
  id: number;
  name: string;
  highlight: boolean;
}) {
  return (
    <Link
      to="/players/$playerId"
      params={{ playerId: String(id) }}
      className={cn(
        "text-fg underline-offset-4 hover:underline",
        highlight && "text-primary",
      )}
    >
      {name}
    </Link>
  );
}
