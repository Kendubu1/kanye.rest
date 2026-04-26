# Sean.rest — Next Session Guide

This document is the handoff guide for the next work session.

## Current project state

Sean.rest is now an API-first Cloudflare Worker project for ranking Big Sean's cheesiest bars. The repo has moved beyond the original Kanye REST clone and now includes:

- Cloudflare Worker API scaffold
- `bars.json` public API data model
- `projects.json` project list
- Synthetic seed data for testing
- Validation script and CI workflow
- Local Wrangler dev tooling
- Local smoke test script
- Local-only lyrics connectivity test script
- Candidate intake docs and example
- Candidate promotion helper
- `/stats` endpoint
- `/demo` visible Y2K-style preview page

## Key safety rule

Do not host full lyrics.

Public API records should contain only:

- Short reviewed snippets
- Metadata
- Timestamp/section references when available
- Scoring data
- Commentary/verdict
- Source link
- `source.lyrics_hosted: false`

Do not commit:

- Full lyrics
- Lyric dumps
- Scraped lyric caches
- Whole verses
- Bulk lyric text files

## Important URLs/routes

```txt
GET /demo                                  Visible Y2K-style demo page
GET /                                      Random approved real bar
GET /?include_synthetic=true              Random approved synthetic or real bar
GET /?format=text&include_synthetic=true  Text-only synthetic test response
GET /top?limit=10                         Highest-pungency approved real bars
GET /projects                             List source projects
GET /stats                                API data stats
GET /project/:slug                        Random approved real bar from a project
GET /track/:slug                          Approved real bars from a song
GET /level/:cheese_level                  Approved bars by cheese level
GET /pungency/:min                        Approved bars at or above threshold
GET /health                               API health check
```

## Current starter projects

1. Dark Sky Paradise
2. Detroit 2
3. I Decided.
4. Finally Famous
5. Hall of Fame
6. Detroit

Detroit is included even though it is a mixtape because it is important to the Big Sean catalog and likely useful for finding funny bars.

## What candidates are

Candidates are possible bars that may be worth scoring later.

Think of them as the maybe pile:

```txt
Candidates = rough review list
bars.json  = approved public API data
```

A candidate should usually contain metadata and review notes, not a public snippet yet.

Example:

```json
{
  "candidate_id": "detroit-candidate-001",
  "artist": "Big Sean",
  "song": "Song Title",
  "song_slug": "song-title",
  "project": "Detroit",
  "project_slug": "detroit",
  "project_type": "mixtape",
  "year": 2012,
  "track_number": null,
  "section": "verse 1",
  "line_position": "unknown",
  "timestamp_start": null,
  "timestamp_end": null,
  "snippet_status": "not_added",
  "candidate_snippet": null,
  "candidate_note": "Potential forced wordplay / caption energy.",
  "source": {
    "provider": "Genius",
    "url": "reference URL",
    "lyrics_hosted": false
  },
  "review_status": "needs_review"
}
```

## How to find candidates

Start with Detroit.

Goal for the first real intake pass:

```txt
Project: Detroit
Candidates: 10–15
Approved bars target: 3–5
```

Candidate-finding signals:

- Forced pun
- Obvious double meaning
- Motivational one-liner
- Corny romantic line
- Goofy sexual line
- Overly serious life advice
- Awkward metaphor
- Brand or celebrity comparison
- Food/body-part comparison
- Line that sounds like a tweet
- Line that feels very Big Sean

Safe workflow:

1. Pull track metadata and source links.
2. Review lyric/reference pages manually or via local-only tooling.
3. Do not commit full lyric text.
4. Add only candidate metadata, timestamps, notes, and source URLs.
5. Later, manually approve short snippets for `bars.json`.

## Local testing commands

```bash
npm install
npm test
npm run dev
```

Then in another terminal:

```bash
npm run smoke
npm run lyrics:test
```

Notes:

- `npm test` validates `bars.json` and `projects.json`.
- `npm run dev` runs Wrangler.
- `npm run smoke` tests API routes.
- `npm run lyrics:test` only checks lyric-source connectivity and does not write files.

## Candidate promotion command

After a candidate is reviewed and a short snippet is approved, generate a `bars.json`-ready object:

```bash
npm run candidate:promote -- candidates/detroit.json detroit-candidate-001 \
  --bar="short reviewed snippet" \
  --forced_wordplay=8 \
  --caption_energy=6 \
  --setup_payoff_cringe=7 \
  --pungency_memorability=8 \
  --delivery_contrast=6 \
  --explicitness_modifier=2 \
  --tags="forced wordplay,caption energy" \
  --verdict="Corny, but the confidence sells it."
```

The helper prints a complete object to stdout. It does not edit `bars.json` automatically.

## Cheese scoring model

Formula:

```txt
cheese_score =
  forced_wordplay * 0.25 +
  caption_energy * 0.20 +
  setup_payoff_cringe * 0.20 +
  pungency_memorability * 0.15 +
  delivery_contrast * 0.10 +
  explicitness_modifier * 0.10
```

Then:

```txt
pungency = round(cheese_score * 10)
```

Levels:

```txt
0–20    Mozzarella
21–40   Mild Gouda
41–60   Aged Gouda
61–80   Blue Cheese
81–100  Limburger
```

## Recommended next PRs

### PR 10 — Add first Detroit candidates

Create:

```txt
candidates/detroit.json
```

Add 10–15 candidate entries. Do not add full lyrics.

### PR 11 — Add first approved real bars

Promote the best 3–5 Detroit candidates into `bars.json`.

Requirements:

- Short snippets only
- `source.lyrics_hosted: false`
- Scores populated
- `approved_public: true`
- `review_status: approved`
- Run `npm test`

### PR 12 — Improve demo behavior

Once real bars exist, make `/demo` prefer real bars, then fallback to synthetic only if no real bars are available.

### PR 13 — Add leaderboard page

Create a visible page or route for top pungency bars:

```txt
/top-demo
```

Possible UI elements:

- Top 10 pungency list
- Cheese labels
- Project filter
- Synthetic/real badge

## Open design direction

The site should stay weird, fun, and Y2K/90s-inspired.

Ideas:

- Chrome/glitter typography
- Pungency meter
- Cheese warning labels
- Fake Winamp player
- Hit counter
- Album tabs like burned CDs
- “Bless me with a bar” random button
- Cheese leaderboard
- Detroit-first review mode

## Stopping point from this session

Current best visible artifact:

- `/demo` route in the Worker
- Static preview was generated in chat for mobile viewing

Current best next action:

```txt
Start PR 10: Add first Detroit candidates.
```
