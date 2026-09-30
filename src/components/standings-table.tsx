import { Link } from "@tanstack/react-router";
import { FormPills } from "@/components/form-pills";
import { Card } from "@/components/ui/card";
import type { Standing } from "@/lib/elo";
import { roundRating } from "@/lib/elo";
import { cn, formatClubDate, signedDelta } from "@/lib/utils";

export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {standings.map((row) => (
          <Link
            key={row.playerId}
            to="/players/$playerId"
            params={{ playerId: String(row.playerId) }}
            className="block no-underline"
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tabular-nums text-walnut">
                    {row.rank}
                  </span>
                  <div>
                    <p className="text-xl font-semibold text-fg">{row.name}</p>
                    <p className="text-base text-muted">
                      {row.wins}–{row.draws}–{row.losses}
                      {row.lastPlayed ? ` · ${formatClubDate(row.lastPlayed)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tabular-nums leading-none">
                    {roundRating(row.rating)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-semibold tabular-nums",
                      row.trend > 1 ? "text-win" : row.trend < -1 ? "text-loss" : "text-muted",
                    )}
                  >
                    {signedDelta(row.trend)}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <FormPills form={row.form} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">Orlando standings by rating</caption>
            <thead className="bg-sunken text-base text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Player</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">W–D–L</th>
                <th className="px-4 py-3 font-semibold">Form</th>
                <th className="px-4 py-3 font-semibold">Last played</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr key={row.playerId} className="border-t border-border hover:bg-sunken/60">
                  <td className="px-4 py-3 text-2xl font-bold tabular-nums text-walnut">
                    {row.rank}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: String(row.playerId) }}
                      className="text-xl font-semibold text-fg underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xl font-semibold tabular-nums">
                      {roundRating(row.rating)}
                    </span>
                    <span
                      className={cn(
                        "ml-2 text-sm font-semibold tabular-nums",
                        row.trend > 1 ? "text-win" : row.trend < -1 ? "text-loss" : "text-subtle",
                      )}
                    >
                      {signedDelta(row.trend)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-lg tabular-nums">{row.score.toFixed(1)}</td>
                  <td className="px-4 py-3 text-lg tabular-nums">
                    {row.wins}–{row.draws}–{row.losses}
                  </td>
                  <td className="px-4 py-3">
                    <FormPills form={row.form} />
                  </td>
                  <td className="px-4 py-3 text-base text-muted">
                    {row.lastPlayed ? formatClubDate(row.lastPlayed) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
