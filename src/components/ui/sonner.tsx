import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-surface text-fg border border-border-strong text-lg font-medium shadow-md",
          title: "text-lg",
          description: "text-base text-muted",
        },
      }}
    />
  );
}
