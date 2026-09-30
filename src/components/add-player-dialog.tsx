import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPlayer } from "@/lib/club-api";
import { useInvalidateClub } from "@/lib/use-club";

export function AddPlayerDialog({
  triggerLabel = "Add a player",
}: {
  triggerLabel?: string;
}) {
  const invalidate = useInvalidateClub();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const player = await addPlayer({ data: { name } });
      toast.success(`${player.name} is on the player list.`);
      setName("");
      setOpen(false);
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add player.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add a player</DialogTitle>
            <DialogDescription>
              First names work best. Anyone at a club can add a newcomer.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-2">
            <Label htmlFor="new-player-name">Name</Label>
            <Input
              id="new-player-name"
              autoComplete="off"
              placeholder="e.g. Norbert"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy || name.trim().length < 2}>
              {busy ? "Adding…" : "Add this player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
