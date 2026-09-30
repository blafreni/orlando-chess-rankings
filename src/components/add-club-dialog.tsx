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
import { addClub } from "@/lib/club-api";
import { useInvalidateClub } from "@/lib/use-club";
import { WEEKDAYS } from "@/lib/utils";

export function AddClubDialog({
  triggerLabel = "Add a club",
}: {
  triggerLabel?: string;
}) {
  const invalidate = useInvalidateClub();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [meets, setMeets] = useState("");
  const [weekday, setWeekday] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const club = await addClub({
        data: {
          name,
          location,
          meets,
          meetsWeekday: weekday === "" ? null : Number(weekday),
        },
      });
      toast.success(`${club.name} is on the board.`);
      setName("");
      setLocation("");
      setMeets("");
      setWeekday("");
      setOpen(false);
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add club.");
    } finally {
      setBusy(false);
    }
  }

  const ready = name.trim().length >= 2 && location.trim().length >= 2 && meets.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add a club</DialogTitle>
            <DialogDescription>
              Any meetup can join the Orlando board. Games you record here count toward one city rating.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-club-name">Club name</Label>
              <Input
                id="new-club-name"
                autoComplete="off"
                placeholder="e.g. Friday Chess Club"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-club-location">Where</Label>
              <Input
                id="new-club-location"
                autoComplete="off"
                placeholder="e.g. Winter Park Community Center"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-club-meets">When</Label>
              <Input
                id="new-club-meets"
                autoComplete="off"
                placeholder="e.g. Fridays 12:00–3:00"
                value={meets}
                onChange={(event) => setMeets(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-club-day">Usual day</Label>
              <select
                id="new-club-day"
                className="flex min-h-14 w-full rounded-lg border border-border-strong bg-surface px-4 text-lg text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={weekday}
                onChange={(event) => setWeekday(event.target.value)}
              >
                <option value="">Varies</option>
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}s
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy || !ready}>
              {busy ? "Adding…" : "Add this club"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
