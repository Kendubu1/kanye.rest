# Candidate Intake

Candidate files are for review work before a bar becomes public API data.

Use this folder to track possible Big Sean bars without committing full lyrics. Candidate records should contain metadata, source references, timestamps when available, and notes about why a bar may be cheesy.

## Rules

- Do not store full lyrics.
- Do not store lyric dumps or copied verses.
- Short snippets may be added only after review.
- Use source URLs for reference.
- Keep `approved_public` bars in `bars.json`, not candidate files.
- Candidate files can contain rough notes and should not be served by the public API.

## Suggested workflow

1. Add candidate metadata in `candidates/<project-slug>.json`.
2. Review the candidate manually.
3. Score using `docs/scoring-model.md`.
4. Generate a `bars.json`-ready object with `npm run candidate:promote`.
5. Copy the generated object into `bars.json` only after review.
6. Run `npm test` before opening a PR.

## Candidate object shape

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
  "candidate_note": "Potential forced wordplay/caption energy.",
  "source": {
    "provider": "Genius",
    "url": "reference URL",
    "lyrics_hosted": false
  },
  "review_status": "needs_review"
}
```

## Promoting a reviewed candidate

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

The helper prints a fully shaped `bars.json` object to stdout. It does not edit `bars.json` automatically.

## Review status values

- `needs_review`
- `scored`
- `approved_for_bars_json`
- `rejected`
