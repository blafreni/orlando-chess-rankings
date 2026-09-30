import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnnotatedGame, Standing } from "@/lib/elo";
import { cn } from "@/lib/utils";

type Cell = { score: number; games: number } | null;

export function Crosstable({
  standings,
  games,
}: {
  standings: Standing[];
  games: AnnotatedGame[];
}) {
  const active = standings.filter((row) => row.games > 0);
  const ids = active.map((row) => row.playerId);
  const cells = new Map<string, Cell>();

  for (const a of ids) {
    for (const b of ids) {
      if (a === b) continue;
      cells.set(`${a}-${b}`, { score: 0, games: 0 });
    }
  }

  for (const game of games) {
    const whiteScore = game.result === "white" ? 1 : game.result === "draw" ? 0.5 : 0;
    const blackScore = 1 - whiteScore;
    const whiteCell = cells.get(`${game.whiteId}-${game.blackId}`);
    const blackCell = cells.get(`${game.blackId}-${game.whiteId}`);
    if (whiteCell) {
      whiteCell.score += whiteScore;
      whiteCell.games += 1;
    }
    if (blackCell) {
      blackCell.score += blackScore;
      blackCell.games += 1;
    }
  }

  if (active.length < 2) return null;

  return (
    <Card className="hidden lg:block">
      <CardHeader>
        <CardTitle>Crosstable</CardTitle>
        <CardDescription>
          Points each player has scored against everyone else this season.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-surface px-2 py-2 text-left text-muted"> </th>
              {active.map((row) => (
                <th key={row.playerId} className="min-w-10 px-1 py-2 font-semibold text-muted">
                  {row.name.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map((row) => (
              <tr key={row.playerId} className="border-t border-border">
                <th className="sticky left-0 bg-surface px-2 py-2 text-left font-semibold">
                  <Link
                    to="/players/$playerId"
                    params={{ playerId: String(row.playerId) }}
                    className="text-fg hover:underline"
                  >
                    {row.name}
                  </Link>
                </th>
                {active.map((col) => {
                  if (row.playerId === col.playerId) {
                    return (
                      <td key={col.playerId} className="bg-sunken px-1 py-2">
                        ·
                      </td>
                    );
                  }
                  const cell = cells.get(`${row.playerId}-${col.playerId}`);
                  if (!cell || cell.games === 0) {
                    return (
                      <td key={col.playerId} className="px-1 py-2 text-subtle">
                        —
                      </td>
                    );
                  }
                  const strong = cell.score > cell.games / 2;
                  const even = cell.score === cell.games / 2;
                  return (
                    <td
                      key={col.playerId}
                      className={cn(
                        "px-1 py-2 tabular-nums font-semibold",
                        strong && "text-win",
                        even && "text-muted",
                        !strong && !even && "text-loss",
                      )}
                    >
                      {formatScore(cell.score)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function formatScore(score: number): string {
  if (Number.isInteger(score)) return String(score);
  return score.toFixed(1);
}
