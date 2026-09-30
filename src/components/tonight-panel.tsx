import { Link } from "@tanstack/react-router";
import { GameResultLine } from "@/components/game-result-line";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnnotatedGame, ClubRow, Standing } from "@/lib/elo";
import { roundRating } from "@/lib/elo";
import { formatClubDate, recentWeekdayIso, todayIso, writeLastClubId } from "@/lib/utils";

export function NextGamesCard({
  games,
  standings,
}: {
  games: AnnotatedGame[];
  standings: Standing[];
}) {
  const suggestions = suggestPairings(standings, games);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Good next games</CardTitle>
        <CardDescription>
          Closest ratings who have not played each other recently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-lg text-muted">Add a couple of players to get pairing ideas.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((pair) => (
              <div
                key={`${pair.a.playerId}-${pair.b.playerId}`}
                className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-lg leading-snug">
                  <span className="font-semibold">{pair.a.name}</span>
                  <span className="text-muted"> {roundRating(pair.a.rating)}</span>
                  <span className="mx-2 text-subtle">vs</span>
                  <span className="font-semibold">{pair.b.name}</span>
                  <span className="text-muted"> {roundRating(pair.b.rating)}</span>
                </p>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-muted">
                  {pair.gap} pts apart
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ClubSessionCard({
  games,
  club,
}: {
  games: AnnotatedGame[];
  club: ClubRow | null;
}) {
  const today = todayIso();
  const meetingDate =
    club?.meetsWeekday !== null && club?.meetsWeekday !== undefined
      ? recentWeekdayIso(club.meetsWeekday)
      : today;
  const todayGames = games.filter((game) => game.playedOn === today);
  const sessionDate = todayGames.length > 0 ? today : meetingDate;
  const sessionGames = games.filter((game) => game.playedOn === sessionDate);
  const isToday = sessionDate === today;
  const title = club
    ? isToday
      ? `${club.name} · today`
      : club.name
    : isToday
      ? "Today across clubs"
      : "Latest games";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {formatClubDate(sessionDate)}
          {club?.meets ? ` · ${club.meets}` : ""}
          {sessionGames.length === 0
            ? " · no games recorded yet"
            : ` · ${sessionGames.length} game${sessionGames.length === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sessionGames.length === 0 ? (
          <div>
            <p className="text-lg text-muted">
              When the first board finishes, tap Record a game. Ratings update on the city board right away.
            </p>
            <Button asChild className="mt-4 no-print">
              <Link
                to="/record"
                onClick={() => {
                  if (club) writeLastClubId(club.id);
                }}
              >
                Record a game
              </Link>
            </Button>
          </div>
        ) : (
          sessionGames
            .slice()
            .reverse()
            .map((game) => <GameResultLine key={game.id} game={game} showClub={!club} />)
        )}
      </CardContent>
    </Card>
  );
}

function suggestPairings(standings: Standing[], games: AnnotatedGame[]) {
  const recent = new Set<string>();
  const sortedGames = [...games].sort((a, b) => b.playedOn.localeCompare(a.playedOn) || b.id - a.id);
  for (const game of sortedGames.slice(0, 24)) {
    const lo = Math.min(game.whiteId, game.blackId);
    const hi = Math.max(game.whiteId, game.blackId);
    recent.add(`${lo}-${hi}`);
  }

  const pool = standings.filter((row) => row.games > 0);
  const used = new Set<number>();
  const pairs: Array<{ a: Standing; b: Standing; gap: number }> = [];

  const ranked = [...pool].sort((a, b) => b.rating - a.rating);
  for (const a of ranked) {
    if (used.has(a.playerId) || pairs.length >= 4) continue;
    let best: Standing | null = null;
    let bestGap = Infinity;
    for (const b of ranked) {
      if (b.playerId === a.playerId || used.has(b.playerId)) continue;
      const lo = Math.min(a.playerId, b.playerId);
      const hi = Math.max(a.playerId, b.playerId);
      if (recent.has(`${lo}-${hi}`)) continue;
      const gap = Math.abs(a.rating - b.rating);
      if (gap < bestGap) {
        bestGap = gap;
        best = b;
      }
    }
    if (best) {
      used.add(a.playerId);
      used.add(best.playerId);
      pairs.push({ a, b: best, gap: Math.round(bestGap) });
    }
  }
  return pairs;
}
