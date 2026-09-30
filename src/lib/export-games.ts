import type { AnnotatedGame, GameResult } from "@/lib/elo";

const RESULT_LABEL: Record<GameResult, string> = {
  white: "White Wins (1-0)",
  black: "Black Wins (0-1)",
  draw: "Draw (1/2-1/2)",
};

const PGN_RESULT: Record<GameResult, string> = {
  white: "1-0",
  black: "0-1",
  draw: "1/2-1/2",
};

export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function gamesToCsv(games: AnnotatedGame[]): string {
  const header = [
    "Date of Match",
    "White Player Name",
    "Black Player Name",
    "Match Result",
    "Club",
    "White Rating",
    "Black Rating",
  ];
  const rows = [...games]
    .sort((a, b) => {
      const byDate = a.playedOn.localeCompare(b.playedOn);
      if (byDate !== 0) return byDate;
      return a.id - b.id;
    })
    .map((game) =>
      [
        game.playedOn,
        game.whiteName,
        game.blackName,
        RESULT_LABEL[game.result],
        game.clubName,
        String(Math.round(game.whiteRatingBefore)),
        String(Math.round(game.blackRatingBefore)),
      ]
        .map(csvEscape)
        .join(","),
    );
  return `\uFEFF${[header.join(","), ...rows].join("\n")}\n`;
}

function pgnDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "????.??.??";
  return `${year}.${month}.${day}`;
}

export function gamesToPgn(games: AnnotatedGame[]): string {
  const ordered = [...games].sort((a, b) => {
    const byDate = a.playedOn.localeCompare(b.playedOn);
    if (byDate !== 0) return byDate;
    return a.id - b.id;
  });
  return ordered
    .map((game) => {
      const result = PGN_RESULT[game.result];
      return [
        `[Event "${escapePgn(game.clubName || "Orlando Chess Rankings")}"]`,
        `[Site "Orlando, FL"]`,
        `[Date "${pgnDate(game.playedOn)}"]`,
        `[Round "-"]`,
        `[White "${escapePgn(game.whiteName)}"]`,
        `[Black "${escapePgn(game.blackName)}"]`,
        `[Result "${result}"]`,
        `[WhiteElo "${Math.round(game.whiteRatingBefore)}"]`,
        `[BlackElo "${Math.round(game.blackRatingBefore)}"]`,
        "",
        `${result}`,
      ].join("\n");
    })
    .join("\n\n");
}

function escapePgn(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export function exportFileName(clubName: string | null, extension: "csv" | "pgn"): string {
  const stamp = new Date();
  const date = `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, "0")}-${String(stamp.getDate()).padStart(2, "0")}`;
  const slug = clubName
    ? clubName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : "orlando-chess";
  return `${slug || "orlando-chess"}-games-${date}.${extension}`;
}

export function downloadText(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
