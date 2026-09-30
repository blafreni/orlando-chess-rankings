import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AddPlayerDialog } from "@/components/add-player-dialog";
import { ClubFilter } from "@/components/club-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordGame } from "@/lib/club-api";
import type { AnnotatedGame, ClubRow, PlayerRow, Standing } from "@/lib/elo";
import { roundRating } from "@/lib/elo";
import { useInvalidateClub } from "@/lib/use-club";
import {
  cn,
  readLastClubId,
  recentWeekdayIso,
  signedDelta,
  todayIso,
  WEEKDAYS,
  writeLastClubId,
} from "@/lib/utils";

export function RecordGameForm({
  clubs,
  players,
  standings,
  initialClubId,
}: {
  clubs: ClubRow[];
  players: PlayerRow[];
  standings: Standing[];
  initialClubId?: number | null;
}) {
  const invalidate = useInvalidateClub();
  const [clubId, setClubId] = useState<number | null>(null);
  const [whiteId, setWhiteId] = useState<number | null>(null);
  const [blackId, setBlackId] = useState<number | null>(null);
  const [result, setResult] = useState<"white" | "black" | "draw" | null>(null);
  const [playedOn, setPlayedOn] = useState(todayIso());
  const [busy, setBusy] = useState(false);
  const [lastRecorded, setLastRecorded] = useState<AnnotatedGame | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (clubId !== null) return;
    const saved = readLastClubId();
    const fromProp = initialClubId && clubs.some((club) => club.id === initialClubId)
      ? initialClubId
      : null;
    const fromSaved = saved && clubs.some((club) => club.id === saved) ? saved : null;
    const friday = clubs.find((club) => club.name === "Friday Chess Club");
    setClubId(fromProp ?? fromSaved ?? friday?.id ?? clubs[0]?.id ?? null);
  }, [clubs, clubId, initialClubId]);

  const club = clubs.find((row) => row.id === clubId) ?? null;

  const ratingById = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of standings) map.set(row.playerId, row.rating);
    return map;
  }, [standings]);

  const filtered = players.filter((player) =>
    player.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const white = players.find((player) => player.id === whiteId);
  const black = players.find((player) => player.id === blackId);
  const ready = clubId && whiteId && blackId && result && playedOn;
  const meetingLabel =
    club?.meetsWeekday !== null && club?.meetsWeekday !== undefined
      ? `This ${WEEKDAYS[club.meetsWeekday]}`
      : null;

  async function submit() {
    if (!clubId || !whiteId || !blackId || !result) return;
    setBusy(true);
    try {
      const recorded = await recordGame({
        data: { clubId, whiteId, blackId, result, playedOn },
      });
      writeLastClubId(clubId);
      setLastRecorded(recorded);
      toast.success("Game is on the board. Ratings updated.");
      setWhiteId(null);
      setBlackId(null);
      setResult(null);
      setQuery("");
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record game.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {lastRecorded ? <RecordedBanner game={lastRecorded} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Which club?</CardTitle>
          <CardDescription>
            Tap the meetup where the game was played. One city rating, whichever club you sit at.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clubs.length === 0 ? (
            <p className="text-lg text-muted">Add a club first, then record a game.</p>
          ) : (
            <ClubFilter clubs={clubs} selectedId={clubId} onSelect={setClubId} allowAll={false} />
          )}
          {club ? (
            <p className="mt-3 text-base text-muted">
              {club.location}
              {club.meets ? ` · ${club.meets}` : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Who played?</CardTitle>
          <CardDescription>
            Tap a name for White, then a name for Black. Big buttons, no tiny menus.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="player-search">Find a name</Label>
              <Input
                id="player-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type to filter"
                autoComplete="off"
              />
            </div>
            <AddPlayerDialog triggerLabel="New player" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PlayerColumn
              title="White"
              selectedId={whiteId}
              disabledId={blackId}
              players={filtered}
              ratings={ratingById}
              onSelect={(id) => {
                setWhiteId(id);
                if (result === "white" || result === "black") setResult(null);
              }}
            />
            <PlayerColumn
              title="Black"
              selectedId={blackId}
              disabledId={whiteId}
              players={filtered}
              ratings={ratingById}
              onSelect={(id) => {
                setBlackId(id);
                if (result === "white" || result === "black") setResult(null);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Who won?</CardTitle>
          <CardDescription>
            {white && black
              ? `${white.name} had White. ${black.name} had Black.`
              : "Pick both players first."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button
            type="button"
            size="lg"
            variant={result === "white" ? "default" : "secondary"}
            disabled={!white}
            onClick={() => setResult("white")}
          >
            {white ? `${white.name} won` : "White won"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant={result === "draw" ? "walnut" : "secondary"}
            disabled={!white || !black}
            onClick={() => setResult("draw")}
          >
            Draw
          </Button>
          <Button
            type="button"
            size="lg"
            variant={result === "black" ? "default" : "secondary"}
            disabled={!black}
            onClick={() => setResult("black")}
          >
            {black ? `${black.name} won` : "Black won"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When was it played?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="played-on">Date</Label>
            <Input
              id="played-on"
              type="date"
              value={playedOn}
              onChange={(event) => setPlayedOn(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setPlayedOn(todayIso())}>
              Today
            </Button>
            {meetingLabel && club && club.meetsWeekday !== null ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPlayedOn(recentWeekdayIso(club.meetsWeekday as number))}
              >
                {meetingLabel}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto sm:self-start"
        disabled={!ready || busy}
        onClick={submit}
      >
        {busy ? "Saving…" : "Record this game"}
      </Button>
    </div>
  );
}

function PlayerColumn({
  title,
  players,
  selectedId,
  disabledId,
  ratings,
  onSelect,
}: {
  title: string;
  players: PlayerRow[];
  selectedId: number | null;
  disabledId: number | null;
  ratings: Map<number, number>;
  onSelect: (id: number) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-lg font-semibold">{title}</legend>
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => {
          const selected = player.id === selectedId;
          const disabled = player.id === disabledId;
          return (
            <button
              key={player.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(player.id)}
              className={cn(
                "flex min-h-14 flex-col items-start justify-center rounded-lg border-2 px-3 py-2 text-left transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-border bg-surface text-fg hover:border-border-strong hover:bg-sunken",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <span className="text-lg font-semibold leading-tight">{player.name}</span>
              <span className={cn("text-sm tabular-nums", selected ? "text-primary-fg/80" : "text-muted")}>
                {roundRating(ratings.get(player.id) ?? 1200)}
              </span>
            </button>
          );
        })}
      </div>
      {players.length === 0 ? (
        <p className="mt-3 text-base text-muted">No names match that search.</p>
      ) : null}
    </fieldset>
  );
}

function RecordedBanner({ game }: { game: AnnotatedGame }) {
  const headline =
    game.result === "draw"
      ? `${game.whiteName} and ${game.blackName} drew.`
      : game.result === "white"
        ? `${game.whiteName} beat ${game.blackName}.`
        : `${game.blackName} beat ${game.whiteName}.`;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary px-5 py-4 text-primary-fg">
      <p className="font-display text-2xl font-semibold">{headline}</p>
      <p className="mt-2 text-lg">
        {game.clubName} · {game.whiteName} {roundRating(game.whiteRatingBefore)} →{" "}
        {roundRating(game.whiteRatingBefore + game.whiteDelta)} ({signedDelta(game.whiteDelta)})
        <span className="mx-2 opacity-60">·</span>
        {game.blackName} {roundRating(game.blackRatingBefore)} →{" "}
        {roundRating(game.blackRatingBefore + game.blackDelta)} ({signedDelta(game.blackDelta)})
      </p>
    </div>
  );
}
