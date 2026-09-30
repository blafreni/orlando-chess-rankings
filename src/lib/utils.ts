import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function formatClubDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function todayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Most recent `weekday` (0=Sun … 6=Sat) on or before `now`. */
export function recentWeekdayIso(weekday: number, now = new Date()): string {
  const delta = (now.getDay() - weekday + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() - delta);
  return todayIso(date);
}

/** Most recent Friday on or before `now` (legacy club night). */
export function currentFridayIso(now = new Date()): string {
  return recentWeekdayIso(5, now);
}

export function signedDelta(n: number): string {
  const rounded = Math.round(n);
  if (rounded > 0) return `+${rounded}`;
  return String(rounded);
}

const LAST_CLUB_KEY = "orlando-rankings-club-id";

export function readLastClubId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LAST_CLUB_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function writeLastClubId(id: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_CLUB_KEY, String(id));
}
