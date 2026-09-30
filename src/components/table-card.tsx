import { KnightMark } from "@/components/knight-mark";
import { RankingsQr } from "@/components/rankings-qr";
import { SITE_HOST } from "@/lib/site";

export function TableCard() {
  return (
    <article className="table-card">
      <div className="table-card-stripe" aria-hidden="true" />
      <div className="table-card-body">
        <div className="table-card-copy">
          <div className="table-card-brand">
            <KnightMark className="table-card-mark text-primary" />
            <div>
              <p className="table-card-kicker">Central Florida chess</p>
              <h2 className="table-card-title">Orlando Chess Rankings</h2>
            </div>
          </div>
          <p className="table-card-lead">Scan to see standings and record a game.</p>
          <p className="table-card-note">Every club. One rating. No login.</p>
        </div>
        <div className="table-card-scan">
          <RankingsQr />
          <p className="table-card-url">{SITE_HOST}</p>
        </div>
      </div>
    </article>
  );
}
