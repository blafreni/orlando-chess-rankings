import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { recordVisit } from "@/lib/keeper-api";

export function VisitBeacon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef("");

  useEffect(() => {
    if (pathname.startsWith("/keeper") || pathname.startsWith("/table-cards")) return;
    const key = `${pathname}@${Math.floor(Date.now() / 15_000)}`;
    if (last.current === key) return;
    last.current = key;
    void recordVisit({ data: { path: pathname } }).catch(() => undefined);
  }, [pathname]);

  return null;
}
