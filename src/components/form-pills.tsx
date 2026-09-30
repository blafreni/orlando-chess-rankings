import { cn } from "@/lib/utils";

export function FormPills({ form }: { form: Array<"W" | "D" | "L"> }) {
  if (form.length === 0) {
    return <span className="text-subtle">—</span>;
  }
  return (
    <span className="inline-flex gap-1" aria-label={`Recent form ${form.join(" ")}`}>
      {form.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-sm text-xs font-bold",
            result === "W" && "bg-primary text-primary-fg",
            result === "D" && "bg-walnut text-primary-fg",
            result === "L" && "bg-loss text-primary-fg",
          )}
        >
          {result}
        </span>
      ))}
    </span>
  );
}
