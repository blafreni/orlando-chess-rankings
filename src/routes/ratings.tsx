import { Link, createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { K_FACTOR, START_RATING } from "@/lib/elo";

export const Route = createFileRoute("/ratings")({
  component: RatingsPage,
});

function RatingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-walnut">
          The ranking system
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          How ratings work
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Orlando Chess Rankings uses a local Elo rating — the same idea as chess
          websites, scaled for club nights. It is not a US Chess or FIDE rating.
          One number follows you to every meetup on this board.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <Fact
          title="Everyone starts at 1200"
          body="The first time your name is added, you sit at 1200. That is the club average. Play games and the number moves."
        />
        <Fact
          title="Beat a stronger player, gain more"
          body="A win against someone rated above you is a bigger jump than a win against someone below you. An upset is supposed to count."
        />
        <Fact
          title="A close game moves you less"
          body="If two players are about even, the winner picks up a moderate amount and the loser drops the same amount. Nothing wild."
        />
        <Fact
          title="Draws are shared"
          body="A draw with an equal player leaves both numbers still. A draw with someone stronger nudges you up a little and them down a little."
        />
        <Fact
          title="One rating, every club"
          body="Friday, Tuesday, Saturday — it all feeds the same number. Filter a club to see who sat there. The rating itself stays city-wide."
        />
        <Fact
          title="The list is highest number first"
          body="Rank is by rating. If two people match, the one with the better score (win = 1, draw = ½) is ahead, then the one who has played more games."
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>What a game is usually worth</CardTitle>
          <CardDescription>
            These are rounded. The exact change shows on each game after you record it.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-lg">
            <caption className="sr-only">Typical rating changes</caption>
            <thead>
              <tr className="border-b border-border text-base text-muted">
                <th className="py-2 pr-4 font-semibold">Matchup</th>
                <th className="py-2 pr-4 font-semibold">If the first player wins</th>
                <th className="py-2 font-semibold">If they draw</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <ExampleRow matchup="1200 vs 1200" win="Winner +16, loser −16" draw="No change" />
              <ExampleRow matchup="1400 vs 1200" win="Winner +8, loser −8" draw="1200 +8, 1400 −8" />
              <ExampleRow matchup="1200 beats 1400" win="Winner +24, loser −24" draw="—" />
            </tbody>
          </table>
        </CardContent>
      </Card>

      <section className="flex max-w-2xl flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">For the curious</h2>
        <p className="text-lg text-muted">
          After each game we update both players with classic Elo, K = {K_FACTOR}.
          You start at {START_RATING}.
        </p>
        <p className="text-lg text-fg">
          New rating = old rating + {K_FACTOR} × (result − expected)
        </p>
        <p className="text-lg text-muted">
          Result is 1 for a win, ½ for a draw, 0 for a loss. Expected is how
          likely you were to score against that opponent:
        </p>
        <p className="text-lg text-fg">
          Expected = 1 ÷ (1 + 10<sup>((their rating − yours) ÷ 400)</sup>)
        </p>
        <p className="text-lg text-muted">
          We replay every recorded game in order, from oldest to newest, to get
          today’s numbers. White and black do not get a bonus — only the result
          matters.
        </p>
      </section>

      <p className="text-lg text-muted">
        <Link to="/" className="font-semibold text-fg underline underline-offset-4">
          Back to standings
        </Link>
        {" · "}
        <Link to="/record" className="font-semibold text-fg underline underline-offset-4">
          Record a game
        </Link>
      </p>
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-lg text-muted">{body}</p>
    </Card>
  );
}

function ExampleRow({
  matchup,
  win,
  draw,
}: {
  matchup: string;
  win: string;
  draw: string;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 font-semibold">{matchup}</td>
      <td className="py-3 pr-4">{win}</td>
      <td className="py-3">{draw}</td>
    </tr>
  );
}
