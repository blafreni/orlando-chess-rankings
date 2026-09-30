import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { pageLabel } from "@/lib/keeper";

function normalizePath(raw: string): string | null {
  const path = raw.trim().split("?")[0]?.split("#")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/keeper")) return null;
  if (path.length > 120) return null;
  return path;
}

export const recordVisit = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ path: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const path = normalizePath(data.path);
    if (!path) return { ok: false as const };
    const sql = await getSql();
    await sql`insert into visits (path) values (${path})`;
    return { ok: true as const };
  });

type CountRow = { total: number; today: number; week: number };
type PathRow = { path: string; n: number };
type DayRow = { day: string; n: number };
type RecentRow = { path: string; created_at: string };

export const getKeeperStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [counts] = await sql<CountRow>`
    select
      count(*)::int as total,
      count(*) filter (
        where (created_at at time zone 'America/New_York')::date
          = (now() at time zone 'America/New_York')::date
      )::int as today,
      count(*) filter (
        where created_at >= now() - interval '7 days'
      )::int as week
    from visits
  `;
  const paths = await sql<PathRow>`
    select path, count(*)::int as n
    from visits
    group by path
    order by n desc
    limit 8
  `;
  const days = await sql<DayRow>`
    select
      ((created_at at time zone 'America/New_York')::date)::text as day,
      count(*)::int as n
    from visits
    where created_at >= now() - interval '14 days'
    group by 1
    order by 1 desc
  `;
  const recent = await sql<RecentRow>`
    select path, created_at::text as created_at
    from visits
    order by id desc
    limit 12
  `;
  return {
    today: counts?.today ?? 0,
    week: counts?.week ?? 0,
    total: counts?.total ?? 0,
    pages: paths.map((row) => ({
      path: row.path,
      label: pageLabel(row.path),
      count: Number(row.n),
    })),
    days: days.map((row) => ({ date: row.day, count: Number(row.n) })),
    recent: recent.map((row) => ({
      path: row.path,
      label: pageLabel(row.path),
      at: row.created_at,
    })),
  };
});
