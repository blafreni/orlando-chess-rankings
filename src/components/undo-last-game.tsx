import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { AnnotatedGame } from "@/lib/elo";
import { undoLastGame } from "@/lib/club-api";
import { useInvalidateClub } from "@/lib/use-club";

function describe(game: AnnotatedGame): string {
  if (game.result === "draw") {
    return `${game.whiteName} and ${game.blackName} drew`;
  }
  if (game.result === "white") {
    return `${game.whiteName} beat ${game.blackName}`;
  }
  return `${game.blackName} beat ${game.whiteName}`;
}

export function UndoLastGame({ lastGame }: { lastGame: AnnotatedGame | null }) {
  const invalidate = useInvalidateClub();
  const [busy, setBusy] = useState(false);
  if (!lastGame) return null;

  async function confirm() {
    setBusy(true);
    try {
      const undone = await undoLastGame();
      toast.success(
        `Removed: ${undone.whiteName} vs ${undone.blackName}. Ratings are back to before that game.`,
      );
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not undo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Undo last game
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Undo the last game?</AlertDialogTitle>
          <AlertDialogDescription>
            This takes {describe(lastGame)} off the board and puts both ratings
            back. Use this if someone tapped the wrong names.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={busy}>
            {busy ? "Removing…" : "Yes, undo it"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
