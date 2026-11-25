import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDB — Is it good now? | Nate Wang",
  description:
    "Game ratings, tracked over time. Launch score vs. current score, Steam Overall vs. Recent, and the patch that moved it.",
};

const games = [
  {
    name: "No Man's Sky",
    year: "2016",
    launch: "Metacritic PC 61",
    now: "VideoGamesCritic 82 (50 at launch)",
    steam: "Steam 85% overall / 92% recent 30d",
    turningPoint: "NEXT / Beyond and later updates",
  },
  {
    name: "Cyberpunk 2077",
    year: "2020",
    launch: "Metacritic PC 86 / PS4 57",
    now: "Steam 95% past 30d; Phantom Liberty 89",
    steam: "Steam 87–88% overall",
    turningPoint: "Update 2.0 + Phantom Liberty, Sep 2023",
  },
  {
    name: "Fallout 76",
    year: "2018",
    launch: "Metacritic PC 52",
    now: "Steam ~72% positive now",
    steam: "Steam ~72% positive",
    turningPoint: "Wastelanders, Apr 2020",
  },
  {
    name: "Battlefield 2042",
    year: "2021",
    launch: "Steam 22% positive at launch",
    now: "VideoGamesCritic 56 (41 at launch)",
    steam: "Steam 47% overall",
    turningPoint: "Season 1–2 updates, Update 4.00",
  },
  {
    name: "Starfield",
    year: "2023",
    launch: "Metacritic PC 85",
    now: "Steam 55–58% Mixed — the inverse case",
    steam: "Steam 55–58% positive, Mixed",
    turningPoint: "Shattered Space did not move it out of Mixed",
  },
  {
    name: "Sea of Thieves",
    year: "2018",
    launch: "Metacritic PC 67",
    now: "Steam 88% Very Positive; PS5 81",
    steam: "Steam 88% positive",
    turningPoint: "Hungering Deep onward, quarterly Seasons",
  },
];

export default function GdbPage() {
  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 mb-4">
          GDB — Game Database
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Is it good <span className="text-white">now</span>?
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-10 max-w-2xl">
          Launch scores freeze. Games don&apos;t. GDB tracks review scores over
          time — launch vs. current, Steam Overall vs. Recent — and the patch
          or expansion that moved them.
        </p>

        <div className="space-y-4">
          {games.map((game) => (
            <article
              key={game.name}
              className="border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2 className="text-xl font-semibold">{game.name}</h2>
                <span className="text-sm text-zinc-500 shrink-0">
                  {game.year}
                </span>
              </div>
              <dl className="text-sm text-zinc-400 space-y-1">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-500">Launch</dt>
                  <dd>{game.launch}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-500">Now</dt>
                  <dd>{game.now}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-500">Steam</dt>
                  <dd>{game.steam}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-500">Turned</dt>
                  <dd>{game.turningPoint}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <p className="text-sm text-zinc-500 leading-relaxed mt-10">
          Tier A launch list — 6 games with verified launch-vs-now gaps, as of
          November 2026. Scores are snapshots and move daily; historical
          snapshots will be served from the gdb Postgres database once
          crawling is live. Metacritic scores shown are frozen launch scores,
          labelled by platform — never a recomputed score presented as
          Metacritic&apos;s.
        </p>
        <p className="mt-6">
          <a href="/" className="text-zinc-300 underline underline-offset-4">
            ← Back to natewang.dev
          </a>
        </p>
      </div>
    </main>
  );
}
