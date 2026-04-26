# 🧀 sean.rest

**A free REST API for Big Sean's cheesiest bars.**

Sean.rest is an API-first archive of short reviewed Big Sean lyric snippets, ranked by cheesiness, pungency, and accidental comedy. The API stores metadata, scoring details, timestamps when available, and source references.

Full lyrics are not hosted.

## Usage

```txt
GET https://api.sean.rest
```

Example JSON response:

```json
{
  "id": "detroit-001",
  "bar": "short reviewed snippet only",
  "artist": "Big Sean",
  "song": "Song Title",
  "project": "Detroit",
  "project_type": "mixtape",
  "cheese_score": 6.75,
  "pungency": 68,
  "cheese_level": "Blue Cheese",
  "tags": ["forced wordplay", "oversold punchline"],
  "verdict": "A goofy punchline delivered with enough confidence to become memorable.",
  "source": {
    "provider": "Genius",
    "url": "reference URL",
    "lyrics_hosted": false
  }
}
```

Text-only response:

```txt
GET https://api.sean.rest?format=text
```

## Routes

```txt
GET /                         Random approved bar
GET /?format=text             Text-only random approved bar
GET /top?limit=10             Highest-pungency approved bars
GET /projects                 List source projects
GET /project/:slug            Random approved bar from a project
GET /track/:slug              Approved bars from a specific song
GET /level/:cheese_level      Approved bars by cheese level
GET /pungency/:min            Approved bars at or above a pungency threshold
GET /health                   API health check
```

## Starting project scope

1. Dark Sky Paradise
2. Detroit 2
3. I Decided.
4. Finally Famous
5. Hall of Fame
6. Detroit

## Cheese levels

| Pungency | Level | Meaning |
|---:|---|---|
| 0-20 | Mozzarella | Barely cheesy |
| 21-40 | Mild Gouda | Light cornball energy |
| 41-60 | Aged Gouda | Clearly cheesy |
| 61-80 | Blue Cheese | Strong, funky, memorable |
| 81-100 | Limburger | Dangerously pungent |

## Scoring docs

- [Feature spec](docs/feature-doc.md)
- [Scoring model](docs/scoring-model.md)

## Data policy

Sean.rest may analyze explicit rap lyrics in context, but the public API should only serve short reviewed snippets. Full lyrics should not be stored or returned.

Records must be marked `approved_public: true` before the API serves them.

## Development

Created using [Cloudflare Workers](https://workers.dev).

```txt
wrangler preview --watch
```

## License

MIT
