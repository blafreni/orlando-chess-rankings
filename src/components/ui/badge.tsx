import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums",
  {
    variants: {
      variant: {
        default: "bg-sunken text-fg",
        win: "bg-primary text-primary-fg",
        loss: "bg-loss text-primary-fg",
        draw: "bg-walnut text-primary-fg",
        outline: "border border-border-strong text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
