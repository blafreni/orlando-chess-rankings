import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import {
  buildClubStats,
  type ClubRow,
  type GameResult,
  type GameRow,
  type PlayerRow,
} from "@/lib/elo";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name needs at least 2 letters.")
  .max(32, "Name is too long.")
  .regex(
    /^[A-Za-z][A-Za-z .'-()]*$/,
    "Use letters, spaces, hyphens, apostrophes, or parentheses.",
  );

const clubNameSchema = z
  .string()
  .trim()
  .min(2, "Club name needs at least 2 letters.")
  .max(48, "Club name is too long.")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9 .',&()-]*$/,
    "Use letters, numbers, spaces, or simple punctuation.",
  );

const placeSchema = z
  .string()
  .trim()
  .min(2, "Say where you meet.")
  .max(80, "That location is too long.");

const meetsSchema = z
  .string()
  .trim()
  .min(2, "Say when you meet.")
  .max(48, "Keep the meeting time shorter.");

const resultSchema = z.enum(["white", "black", "draw"]);

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");

type ClubDb = {
  id: number;
  name: string;
  location: string;
  meets: string;
  meets_weekday: number | null;
  created_at: string;
};
type PlayerDb = { id: number; name: string; created_at: string };
type GameDb = {
  id: number;
  white_id: number;
  black_id: number;
  white_name: string;
  black_name: string;
  result: GameResult;
  played_on: string;
  created_at: string;
  club_id: number;
  club_name: string;
};

function asText(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function mapClubs(rows: ClubDb[]): ClubRow[] {
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    location: row.location,
    meets: row.meets,
    meetsWeekday: row.meets_weekday === null || row.meets_weekday === undefined
      ? null
      : Number(row.meets_weekday),
    createdAt: asText(row.created_at),
  }));
}

function mapPlayers(rows: PlayerDb[]): PlayerRow[] {
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    createdAt: asText(row.created_at),
  }));
}

function mapGames(rows: GameDb[]): GameRow[] {
  return rows.map((row) => ({
    id: Number(row.id),
    whiteId: Number(row.white_id),
    blackId: Number(row.black_id),
    whiteName: row.white_name,
    blackName: row.black_name,
    result: row.result,
    playedOn: asText(row.played_on).slice(0, 10),
    createdAt: asText(row.created_at),
    clubId: Number(row.club_id),
    clubName: row.club_name,
  }));
}

async function loadBoard() {
  const sql = await getSql();
  const clubRows = await sql<ClubDb>`
    select
      id,
      name,
      location,
      meets,
      meets_weekday,
      created_at::text as created_at
    from clubs
    order by name asc
  `;
  const playerRows = await sql<PlayerDb>`
    select id, name, created_at::text as created_at
    from players
    order by name asc
  `;
  const gameRows = await sql<GameDb>`
    select
      g.id,
      g.white_id,
      g.black_id,
      w.name as white_name,
      b.name as black_name,
      g.result,
      g.played_on::text as played_on,
      g.created_at::text as created_at,
      g.club_id,
      c.name as club_name
    from games g
    join players w on w.id = g.white_id
    join players b on b.id = g.black_id
    join clubs c on c.id = g.club_id
    order by g.played_on asc, g.id asc
  `;
  return {
    clubs: mapClubs(clubRows),
    players: mapPlayers(playerRows),
    games: mapGames(gameRows),
  };
}

export const getClubSnapshot = createServerFn({ method: "GET" }).handler(
  async () => {
    const { clubs, players, games } = await loadBoard();
    const { standings, games: annotated } = buildClubStats(players, games);
    const lastGame =
      annotated.reduce<typeof annotated[number] | null>((best, game) => {
        if (!best) return game;
        if (game.createdAt > best.createdAt) return game;
        if (game.createdAt === best.createdAt && game.id > best.id) return game;
        return best;
      }, null) ?? null;
    return {
      clubs,
      players,
      games: annotated,
      standings,
      lastGame,
    };
  },
);

export const addPlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ name: nameSchema }).parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const existing = await sql<{ id: number }>`
      select id from players where lower(name) = lower(${data.name}) limit 1
    `;
    if (existing.length > 0) {
      throw new Error(`${data.name} is already on the player list.`);
    }
    const inserted = await sql<{ id: number; name: string }>`
      insert into players (name) values (${data.name})
      returning id, name
    `;
    const row = inserted[0];
    if (!row) throw new Error("Could not add player.");
    return { id: Number(row.id), name: row.name };
  });

export const addClub = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        name: clubNameSchema,
        location: placeSchema,
        meets: meetsSchema,
        meetsWeekday: z.number().int().min(0).max(6).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const existing = await sql<{ id: number }>`
      select id from clubs where lower(name) = lower(${data.name}) limit 1
    `;
    if (existing.length > 0) {
      throw new Error(`${data.name} is already on the club list.`);
    }
    const inserted = await sql<{ id: number; name: string }>`
      insert into clubs (name, location, meets, meets_weekday)
      values (${data.name}, ${data.location}, ${data.meets}, ${data.meetsWeekday})
      returning id, name
    `;
    const row = inserted[0];
    if (!row) throw new Error("Could not add club.");
    return { id: Number(row.id), name: row.name };
  });

export const recordGame = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        clubId: z.number().int().positive(),
        whiteId: z.number().int().positive(),
        blackId: z.number().int().positive(),
        result: resultSchema,
        playedOn: dateSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (data.whiteId === data.blackId) {
      throw new Error("A player cannot sit on both sides of the board.");
    }
    const sql = await getSql();
    const club = await sql<{ id: number }>`
      select id from clubs where id = ${data.clubId} limit 1
    `;
    if (club.length === 0) {
      throw new Error("Pick a club for this game.");
    }
    const found = await sql<{ id: number }>`
      select id from players where id = ${data.whiteId} or id = ${data.blackId}
    `;
    if (found.length !== 2) {
      throw new Error("Both players need to be on the player list.");
    }
    const inserted = await sql<{ id: number }>`
      insert into games (white_id, black_id, result, played_on, club_id)
      values (${data.whiteId}, ${data.blackId}, ${data.result}, ${data.playedOn}::date, ${data.clubId})
      returning id
    `;
    const id = inserted[0]?.id;
    if (!id) throw new Error("Could not record the game.");
    const snapshot = await loadBoard();
    const { games } = buildClubStats(snapshot.players, snapshot.games);
    const recorded = games.find((game) => game.id === Number(id));
    if (!recorded) throw new Error("Game saved, but could not load the result.");
    return recorded;
  });

export const undoLastGame = createServerFn({ method: "POST" }).handler(
  async () => {
    const sql = await getSql();
    const latest = await sql<{
      id: number;
      white_name: string;
      black_name: string;
      result: GameResult;
    }>`
      select g.id, w.name as white_name, b.name as black_name, g.result
      from games g
      join players w on w.id = g.white_id
      join players b on b.id = g.black_id
      order by g.created_at desc, g.id desc
      limit 1
    `;
    const game = latest[0];
    if (!game) throw new Error("There is no game to undo.");
    await sql`delete from games where id = ${game.id}`;
    return {
      id: Number(game.id),
      whiteName: game.white_name,
      blackName: game.black_name,
      result: game.result,
    };
  },
);
