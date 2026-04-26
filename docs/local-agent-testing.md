# Local Agent Testing

Use this when handing the repo to a local coding agent or running it yourself.

## Setup

```bash
git clone https://github.com/Kendubu1/kanye.rest.git
cd kanye.rest
npm install
```

## Validate data

```bash
npm test
```

This validates `bars.json` and `projects.json`.

## Run the Worker locally

```bash
npm run dev
```

By default Wrangler serves the Worker at `http://127.0.0.1:8787`.

## Smoke test routes

In a second terminal:

```bash
npm run smoke
```

To target another deployed/local URL:

```bash
SEAN_REST_BASE_URL=https://example.workers.dev npm run smoke
```

Routes checked:

- `/`
- `/?format=text`
- `/top`
- `/projects`
- `/project/detroit`
- `/level/blue-cheese`
- `/pungency/60`
- `/health`

## Local-only lyric pull test

```bash
npm run lyrics:test
```

Or target a specific lyrics/reference endpoint:

```bash
LYRICS_TEST_URL="https://example.com/reference" npm run lyrics:test
```

Rules:

- Do not commit fetched lyrics.
- Do not write lyric dumps, caches, or full lyric output to the repo.
- Use this only to confirm that a local pipeline can reach a lyrics/reference source.
- Public API records should store only short reviewed snippets, metadata, timestamps, scoring, and source references.

## Agent task prompt

```txt
Test the Sean.rest repo end-to-end.

1. Pull latest master or the provided PR branch.
2. Run npm install.
3. Run npm test.
4. Run npm run dev.
5. In a second terminal, run npm run smoke.
6. Run npm run lyrics:test only as a local connectivity test.
7. Do not commit real lyrics, lyric dumps, caches, or full lyric output.
8. Report route failures, Wrangler issues, or validation failures.
```
