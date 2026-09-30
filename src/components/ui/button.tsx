import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[transform,background-color,opacity,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg hover:bg-primary-hover",
        secondary:
          "bg-surface text-fg border border-border-strong hover:bg-sunken",
        ghost: "bg-transparent text-fg hover:bg-sunken",
        walnut: "bg-walnut text-primary-fg hover:opacity-90",
        danger: "bg-loss text-primary-fg hover:opacity-90",
        outline:
          "bg-transparent text-fg border-2 border-fg hover:bg-fg hover:text-surface",
      },
      size: {
        default: "min-h-14 px-5 text-lg rounded-lg",
        sm: "min-h-11 px-4 text-base rounded-md",
        lg: "min-h-16 px-6 text-xl rounded-xl",
        icon: "size-14 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
