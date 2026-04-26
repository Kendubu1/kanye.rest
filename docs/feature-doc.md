# Sean.rest — Feature Spec v0.1

## Summary

Sean.rest is an API-first project for cataloging and ranking Big Sean's cheesiest bars. The API returns short reviewed snippets, metadata, scoring details, and source references. Full lyrics are not hosted.

## Goals

- Build a lightweight REST API that can power a future website.
- Score bars with a consistent cheese and pungency model.
- Preserve metadata like project, track, section, and timestamp where possible.
- Keep the project legally safer by storing short snippets only, not full lyrics.
- Support explicit rap lyrics in analysis without treating explicitness itself as a negative.

## Initial Project Scope

1. Dark Sky Paradise
2. Detroit 2
3. I Decided.
4. Finally Famous
5. Hall of Fame
6. Detroit

Detroit is included as a core mixtape source even though it is not a studio album.

## API Routes

- `GET /` — random approved bar
- `GET /?format=text` — text-only random approved bar
- `GET /top?limit=10` — highest-pungency approved bars
- `GET /projects` — list source projects
- `GET /project/:slug` — random approved bar from a project
- `GET /track/:slug` — approved bars from a specific song
- `GET /level/:cheese_level` — approved bars by cheese level
- `GET /pungency/:min` — approved bars at or above a pungency threshold
- `GET /health` — API health check

## Public Bar Object

```json
{
  "id": "detroit-001",
  "bar": "short reviewed snippet only",
  "artist": "Big Sean",
  "song": "Song Title",
  "song_slug": "song-title",
  "project": "Detroit",
  "project_slug": "detroit",
  "project_type": "mixtape",
  "year": 2012,
  "track_number": 6,
  "section": "verse 1",
  "line_position": "early",
  "timestamp_start": "00:58",
  "timestamp_end": "01:03",
  "explicit": true,
  "content_flags": ["profanity"],
  "scores": {
    "forced_wordplay": 8,
    "caption_energy": 5,
    "setup_payoff_cringe": 7,
    "pungency_memorability": 8,
    "delivery_contrast": 6,
    "explicitness_modifier": 3
  },
  "cheese_score": 6.75,
  "pungency": 68,
  "cheese_level": "Blue Cheese",
  "tags": ["forced wordplay", "oversold punchline"],
  "verdict": "A goofy punchline delivered with enough confidence to become memorable.",
  "source": {
    "provider": "Genius",
    "url": "reference URL",
    "lyrics_hosted": false
  },
  "review_status": "approved",
  "approved_public": true
}
```

## Launch Criteria

- API returns a random reviewed bar.
- `bars.json` has at least 25 approved public bars.
- At least 3 projects are represented.
- `/top`, `/projects`, `/project/:slug`, and `?format=text` work.
- Explicit content is flagged.
- Full lyrics are not hosted.
- README explains purpose, API usage, and disclaimer.

## Later Website Direction

The site can use a 90s/Y2K visual style with a cheese meter, pungency warning animations, chrome/glitter typography, hit counter, and fake music-player UI. The website should consume this API rather than duplicate data.
