export type ChangeLogDay = {
  date: string;
  items: string[];
};

/** Newest first. Keep this in plain club language — it shows in the board room. */
export const CHANGELOG: ChangeLogDay[] = [
  {
    date: "2026-09-20",
    items: [
      "Standings hide players who have not recorded a game yet. They still show on the Players list.",
    ],
  },
  {
    date: "2026-09-18",
    items: [
      "New page: How ratings work — a plain-language write-up of the Elo system, with examples.",
    ],
  },
  {
    date: "2026-09-17",
    items: [
      "Vince’s name is now Vince Bercx.",
    ],
  },
  {
    date: "2026-09-14",
    items: [
      "Printable 3″ × 5″ table cards with a QR code, from the board room. Same cards work at every club.",
      "Players page: filter the list by club, same as Games.",
    ],
  },
  {
    date: "2026-09-12",
    items: [
      "Board room: secret page with visit counts, club totals, and this changelog. Tap the green knight five times to open it.",
      "Games page: download a spreadsheet (Excel / Google Sheets) or a PGN file for chess programs. Filter by club first to export just that meetup.",
    ],
  },
  {
    date: "2026-09-11",
    items: [
      "Copied the live roster and games so this board matches the website: Nate, Randy, Florin, George, Maurice, Mustafa, Mike D, plus games from Sep 8, 9, and 11.",
      "Mike Dowell’s name is now Mike D. Mike (Staff) is a different person and stayed on the list.",
      "Friday Chess Club meets at the Winter Park Community Center, Fridays 12:00–3:00.",
      "Winter Park Tuesday Nights meets at AJ’s Chocolate House, Tuesdays 6:00–9:00.",
      "Added BarkHaven Chess Club (Tuesdays 6–9) and Tin & Taco Chess Club (Thursdays 6–10).",
      "Renamed Orlando Chess Club to Colonialtown Saturdays.",
      "One rating board for every Central Florida club (orlandochessrankings.com).",
      "Tapping a player’s name opens their profile again.",
      "First version of the club site: standings with ratings, record a game, player list, and game history — large type, no login.",
      "Standings page order: rankings, then Good next games, then the session card.",
      "Loaded the Friday Chess Club roster and games through Sep 4.",
    ],
  },
];
