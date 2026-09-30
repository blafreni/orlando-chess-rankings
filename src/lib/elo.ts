export const START_RATING = 1200;
export const K_FACTOR = 32;

export type GameResult = "white" | "black" | "draw";

export type PlayerRow = {
  id: number;
  name: string;
  createdAt: string;
};

export type ClubRow = {
  id: number;
  name: string;
  location: string;
  meets: string;
  meetsWeekday: number | null;
  createdAt: string;
};

export type GameRow = {
  id: number;
  whiteId: number;
  blackId: number;
  whiteName: string;
  blackName: string;
  result: GameResult;
  playedOn: string;
  createdAt: string;
  clubId: number;
  clubName: string;
};

export type AnnotatedGame = GameRow & {
  whiteRatingBefore: number;
  blackRatingBefore: number;
  whiteDelta: number;
  blackDelta: number;
  winnerId: number | null;
};

export type Standing = {
  playerId: number;
  name: string;
  rating: number;
  wins: number;
  draws: number;
  losses: number;
  games: number;
  score: number;
  lastPlayed: string | null;
  form: Array<"W" | "D" | "L">;
  trend: number;
  rank: number;
  ratingHistory: Array<{ date: string; rating: number }>;
};

export function expectedScore(rating: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - rating) / 400));
}

export function buildClubStats(players: PlayerRow[], games: GameRow[]) {
  const ratings = new Map<number, number>();
  const wins = new Map<number, number>();
  const draws = new Map<number, number>();
  const losses = new Map<number, number>();
  const lastPlayed = new Map<number, string>();
  const form = new Map<number, Array<"W" | "D" | "L">>();
  const history = new Map<number, Array<{ date: string; rating: number }>>();

  for (const player of players) {
    ratings.set(player.id, START_RATING);
    wins.set(player.id, 0);
    draws.set(player.id, 0);
    losses.set(player.id, 0);
    form.set(player.id, []);
    history.set(player.id, [{ date: player.createdAt.slice(0, 10), rating: START_RATING }]);
  }

  const sorted = [...games].sort((a, b) => {
    const byDate = a.playedOn.localeCompare(b.playedOn);
    if (byDate !== 0) return byDate;
    return a.id - b.id;
  });

  const annotated: AnnotatedGame[] = [];

  for (const game of sorted) {
    const whiteBefore = ratings.get(game.whiteId) ?? START_RATING;
    const blackBefore = ratings.get(game.blackId) ?? START_RATING;
    const whiteExpected = expectedScore(whiteBefore, blackBefore);
    const blackExpected = expectedScore(blackBefore, whiteBefore);
    const whiteScore = game.result === "white" ? 1 : game.result === "draw" ? 0.5 : 0;
    const blackScore = 1 - whiteScore;
    const whiteDelta = K_FACTOR * (whiteScore - whiteExpected);
    const blackDelta = K_FACTOR * (blackScore - blackExpected);
    const whiteAfter = whiteBefore + whiteDelta;
    const blackAfter = blackBefore + blackDelta;

    ratings.set(game.whiteId, whiteAfter);
    ratings.set(game.blackId, blackAfter);
    lastPlayed.set(game.whiteId, game.playedOn);
    lastPlayed.set(game.blackId, game.playedOn);

    const whiteForm = form.get(game.whiteId) ?? [];
    const blackForm = form.get(game.blackId) ?? [];
    if (game.result === "draw") {
      draws.set(game.whiteId, (draws.get(game.whiteId) ?? 0) + 1);
      draws.set(game.blackId, (draws.get(game.blackId) ?? 0) + 1);
      whiteForm.push("D");
      blackForm.push("D");
    } else if (game.result === "white") {
      wins.set(game.whiteId, (wins.get(game.whiteId) ?? 0) + 1);
      losses.set(game.blackId, (losses.get(game.blackId) ?? 0) + 1);
      whiteForm.push("W");
      blackForm.push("L");
    } else {
      wins.set(game.blackId, (wins.get(game.blackId) ?? 0) + 1);
      losses.set(game.whiteId, (losses.get(game.whiteId) ?? 0) + 1);
      whiteForm.push("L");
      blackForm.push("W");
    }
    form.set(game.whiteId, whiteForm);
    form.set(game.blackId, blackForm);

    history.get(game.whiteId)?.push({ date: game.playedOn, rating: whiteAfter });
    history.get(game.blackId)?.push({ date: game.playedOn, rating: blackAfter });

    annotated.push({
      ...game,
      whiteRatingBefore: whiteBefore,
      blackRatingBefore: blackBefore,
      whiteDelta,
      blackDelta,
      winnerId: game.result === "white" ? game.whiteId : game.result === "black" ? game.blackId : null,
    });
  }

  const standings: Standing[] = players
    .map((player) => {
      const w = wins.get(player.id) ?? 0;
      const d = draws.get(player.id) ?? 0;
      const l = losses.get(player.id) ?? 0;
      const rating = ratings.get(player.id) ?? START_RATING;
      const playerForm = (form.get(player.id) ?? []).slice(-5);
      const playerHistory = history.get(player.id) ?? [];
      const fiveAgo = playerHistory[Math.max(0, playerHistory.length - 6)]?.rating ?? START_RATING;
      return {
        playerId: player.id,
        name: player.name,
        rating,
        wins: w,
        draws: d,
        losses: l,
        games: w + d + l,
        score: w + d * 0.5,
        lastPlayed: lastPlayed.get(player.id) ?? null,
        form: playerForm,
        trend: rating - fiveAgo,
        rank: 0,
        ratingHistory: playerHistory,
      };
    })
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.score !== a.score) return b.score - a.score;
      if (b.games !== a.games) return b.games - a.games;
      return a.name.localeCompare(b.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return { standings, games: annotated };
}

export function roundRating(rating: number): number {
  return Math.round(rating);
}
