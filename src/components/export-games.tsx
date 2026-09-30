import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnnotatedGame } from "@/lib/elo";
import {
  downloadText,
  exportFileName,
  gamesToCsv,
  gamesToPgn,
} from "@/lib/export-games";

export function ExportGames({
  games,
  clubName,
}: {
  games: AnnotatedGame[];
  clubName: string | null;
}) {
  const count = games.length;
  const disabled = count === 0;
  const scope = clubName ? clubName : "every club";

  function saveCsv() {
    downloadText(
      exportFileName(clubName, "csv"),
      gamesToCsv(games),
      "text/csv;charset=utf-8",
    );
    toast.success(`Saved ${count} game${count === 1 ? "" : "s"} as a spreadsheet.`);
  }

  function savePgn() {
    downloadText(
      exportFileName(clubName, "pgn"),
      gamesToPgn(games),
      "application/x-chess-pgn",
    );
    toast.success(`Saved ${count} game${count === 1 ? "" : "s"} as PGN.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download these games</CardTitle>
        <CardDescription>
          {disabled
            ? "Record a game first, then you can download the list."
            : `Downloads the ${count} game${count === 1 ? "" : "s"} showing now (${scope}). Pick a club above to export just that meetup. Spreadsheet files open in Excel or Google Sheets. PGN files open in chess programs.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={saveCsv} disabled={disabled} className="sm:min-w-56">
          <Download className="size-5" aria-hidden="true" />
          Spreadsheet
        </Button>
        <Button
          variant="secondary"
          onClick={savePgn}
          disabled={disabled}
          className="sm:min-w-56"
        >
          <Download className="size-5" aria-hidden="true" />
          Chess PGN
        </Button>
      </CardContent>
    </Card>
  );
}
