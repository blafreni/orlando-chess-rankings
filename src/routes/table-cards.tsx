import { Link, createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { TableCard } from "@/components/table-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/table-cards")({
  component: TableCardsPage,
});

function TableCardsPage() {
  return (
    <div className="table-card-sheet flex flex-col gap-6">
      <div className="no-print flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
            Print & laminate
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Table cards
          </h1>
          <p className="mt-2 max-w-xl text-lg text-muted">
            Index-card size (5″ × 3″). Same card works at every club. Print a
            page, cut on the dashed lines, then laminate so you can bring them
            back each week.
          </p>
        </div>
        <ol className="max-w-xl list-decimal space-y-2 pl-6 text-lg text-fg">
          <li>Tap Print. Choose color, letter paper, and scale 100% / actual size.</li>
          <li>Turn off headers and footers in the print dialog.</li>
          <li>Cut along the dashed lines. You get three cards per page.</li>
          <li>Laminate. A 3″ × 5″ pouch, or a letter pouch you trim after.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>
            <Printer className="size-5" aria-hidden="true" />
            Print cards
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/keeper">Back to board room</Link>
          </Button>
        </div>
      </div>

      <div className="table-card-stack">
        <TableCard />
        <TableCard />
        <TableCard />
      </div>
    </div>
  );
}
