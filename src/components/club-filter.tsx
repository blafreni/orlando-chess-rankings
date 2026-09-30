import { cn } from "@/lib/utils";
import type { ClubRow } from "@/lib/elo";

export function ClubFilter({
  clubs,
  selectedId,
  onSelect,
  allowAll = true,
}: {
  clubs: ClubRow[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  allowAll?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Clubs">
      {allowAll ? (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "min-h-12 rounded-lg border-2 px-4 text-lg font-semibold",
            selectedId === null
              ? "border-primary bg-primary text-primary-fg"
              : "border-border bg-surface text-fg hover:border-border-strong hover:bg-sunken",
          )}
        >
          All clubs
        </button>
      ) : null}
      {clubs.map((club) => {
        const selected = club.id === selectedId;
        return (
          <button
            key={club.id}
            type="button"
            onClick={() => onSelect(club.id)}
            className={cn(
              "min-h-12 rounded-lg border-2 px-4 text-lg font-semibold",
              selected
                ? "border-primary bg-primary text-primary-fg"
                : "border-border bg-surface text-fg hover:border-border-strong hover:bg-sunken",
            )}
          >
            {club.name}
          </button>
        );
      })}
    </div>
  );
}
