# Sean.rest Cheese Scoring Model

## Purpose

This model scores candidate Big Sean bars for comedic cheesiness. The goal is not to rank lyrics as good or bad. The goal is to identify bars that are corny, funny, awkward, overconfident, forced, memorable, or accidentally iconic.

## Copyright and lyric handling

- Do not reproduce full lyrics.
- Store only short reviewed snippets.
- Use source links for reference.
- Include timestamps and section metadata when available.
- Public API output should avoid hateful slurs unless a manual safe-display policy is added later.
- Explicit rap lyrics may be analyzed in context.

## Explicit content rule

Do not reject a bar because it contains profanity, sex, drugs, violence, or adult themes. Only increase the explicitness modifier if the explicit content makes the bar more awkward, juvenile, forced, or unintentionally funny.

## Weighted scoring formula

```txt
cheese_score =
  forced_wordplay * 0.25 +
  caption_energy * 0.20 +
  setup_payoff_cringe * 0.20 +
  pungency_memorability * 0.15 +
  delivery_contrast * 0.10 +
  explicitness_modifier * 0.10
```

```txt
pungency = round(cheese_score * 10)
```

## Cheese levels

| Pungency | Level | Meaning |
|---:|---|---|
| 0-20 | Mozzarella | Barely cheesy |
| 21-40 | Mild Gouda | Light cornball energy |
| 41-60 | Aged Gouda | Clearly cheesy |
| 61-80 | Blue Cheese | Strong, funky, memorable |
| 81-100 | Limburger | Dangerously pungent |

## Categories

### 1. Forced wordplay — 25%

Measures how stretched, obvious, or dad-joke-like the bar feels.

High-score signals:

- Forced pun
- Obvious double meaning
- Awkward metaphor
- Punchline feels too easy

### 2. Caption energy — 20%

Measures whether the bar sounds like an Instagram caption, gym selfie quote, breakup post, hustle reel, or inspirational wallpaper.

High-score signals:

- Motivational poster energy
- Sounds deeper than it is
- Sounds like a tweet
- Made-for-caption phrasing

### 3. Setup-to-payoff cringe — 20%

Measures whether the line builds up to a payoff that does not land as hard as intended.

High-score signals:

- Big setup, weak punchline
- Dramatic pause for a goofy line
- Bar waits for applause it did not earn

### 4. Pungency / memorability — 15%

Measures how much the line sticks in your head because it is weird, funny, bold, or accidentally iconic.

High-score signals:

- Easy to quote
- Easy to clown
- Weird enough to remember
- So corny it becomes fun

### 5. Delivery contrast — 10%

Measures whether the confidence or seriousness of the delivery makes the bar funnier.

High-score signals:

- Serious delivery for goofy content
- Overconfident punchline
- Cinematic tone for a silly bar

### 6. Explicitness modifier — 10%

Measures whether explicit content adds to the corniness. It does not punish explicitness by default.

High-score signals:

- Sex line feels goofy
- Drug/flex line feels try-hard
- Explicit punchline is the reason the bar is cheesy

## Candidate selection signals

Flag a lyric as a candidate when it contains:

- Forced pun
- Obvious double meaning
- Motivational one-liner
- Corny romantic line
- Goofy sexual line
- Overly serious life advice
- Awkward metaphor
- Brand or celebrity comparison
- Food or body-part comparison
- Bar that sounds like a tweet
- Bar fans might quote, meme, or clown

## Model prompt

```txt
You are scoring Big Sean lyrics for Sean.rest, a comedic API that ranks cheesy bars.

Analyze explicit rap lyrics in context. Do not reject a bar because it includes profanity, sex, drugs, violence, or adult themes. Only increase the explicitness modifier if the explicit content makes the bar more awkward, juvenile, forced, or unintentionally funny.

Do not reproduce full lyrics. Select only short snippets for commentary and reference.

For each candidate bar, score the following from 0 to 10:

1. forced_wordplay
2. caption_energy
3. setup_payoff_cringe
4. pungency_memorability
5. delivery_contrast
6. explicitness_modifier

Then calculate:
cheese_score =
  forced_wordplay * 0.25 +
  caption_energy * 0.20 +
  setup_payoff_cringe * 0.20 +
  pungency_memorability * 0.15 +
  delivery_contrast * 0.10 +
  explicitness_modifier * 0.10

pungency = round(cheese_score * 10)

Map pungency to:
0-20 Mozzarella
21-40 Mild Gouda
41-60 Aged Gouda
61-80 Blue Cheese
81-100 Limburger

Return structured JSON only.
```

## Review status values

- `needs_review`
- `approved`
- `rejected`

Only records with `approved_public: true` should be served by the public API.
