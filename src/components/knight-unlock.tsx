import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { KnightMark } from "@/components/knight-mark";
import { KEEPER_TAPS, unlockKeeper } from "@/lib/keeper";

export function KnightUnlock() {
  const navigate = useNavigate();
  const taps = useRef(0);
  const timer = useRef<number | null>(null);

  function handleTap() {
    taps.current += 1;
    if (timer.current) window.clearTimeout(timer.current);
    if (taps.current >= KEEPER_TAPS) {
      taps.current = 0;
      unlockKeeper();
      void navigate({ to: "/keeper" });
      return;
    }
    timer.current = window.setTimeout(() => {
      taps.current = 0;
    }, 2500);
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Orlando Chess Rankings mark"
    >
      <KnightMark className="size-12 text-primary sm:size-14" />
    </button>
  );
}
