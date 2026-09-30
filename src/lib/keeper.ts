export const KEEPER_STORAGE_KEY = "ocr-board-room";
export const KEEPER_TAPS = 5;

export function isKeeperUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEEPER_STORAGE_KEY) === "1";
}

export function unlockKeeper() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEEPER_STORAGE_KEY, "1");
}

export function lockKeeper() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEEPER_STORAGE_KEY);
}

export function pageLabel(path: string): string {
  if (path === "/") return "Standings";
  if (path.startsWith("/record")) return "Record a game";
  if (path.startsWith("/games")) return "Games";
  if (path.startsWith("/clubs")) return "Clubs";
  if (path.startsWith("/players/")) return "Player profile";
  if (path.startsWith("/players")) return "Players";
  if (path.startsWith("/ratings")) return "How ratings work";
  return path;
}
