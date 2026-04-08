# Design Research Brief

## Product Category: Private data collection + aggregate reveal
## Comparables Studied: Levels.fyi, Glassdoor Salaries, Linear, Nansen, Signal

## Product Metaphor (Rule 1)
**A sealed ballot box.** You drop your salary in sealed. When enough ballots are collected, only the aggregate count is announced. Individual ballots stay sealed forever. This maps perfectly:
- Submit = dropping a sealed ballot
- MIN_SAMPLE threshold = "polls close when enough votes are in"
- Percentile = the count is announced, not individual ballots
- Shape language: institutional, clean, serious. Not playful.

## Color Meaning (Rule 2)
- **Sealed blue** (#3b82f6 range) = your encrypted data, the sealed state, the private input
- **Revealed green** (#10b981 range) = aggregate data that's been decrypted, the public result
- **Warm neutral** = surfaces, text, the institutional backdrop
- Blue appears on: form inputs, encryption states, the "private" side
- Green appears on: revealed percentiles, bar fills, the "public aggregate" side
- The transition from blue to green IS the product story

## Common Patterns (table stakes):
- Dark background with high-contrast text (Nansen, Linear)
- Clear form hierarchy with generous spacing (Linear)
- Percentile/range visualization as bars, not just numbers (Glassdoor)
- Single dominant CTA (Signal)
- Privacy messaging as negation: "No X. No Y." (Signal)

## Differentiation Opportunities:
- Nobody shows the encryption moment visually (all comparables skip this)
- Glassdoor's range bar is good but static. Ours animates on reveal (async decrypt)
- Signal's negation messaging applied to salary privacy is unused
- The sealed→revealed transition (blue→green) is product-specific, no one else has this

## Anti-patterns (must avoid):
- Icon + title + description feature cards (every AI design, Nansen does this too)
- Gradient text on headlines (Nansen does this, but it's in our Hard No list)
- Stats row with numbers in boxes (generic DeFi pattern)
- Self-certifying badges ("Encrypted", "Secure", "Private")
- Symmetric 3-column grids
- Explaining how the product works instead of showing it

## Stolen Elements (adapt):
- From Glassdoor: percentile range as visual bar (width = percentage)
- From Signal: negation messaging for privacy ("No one sees your salary. Not us. Not them. Not ever.")
- From Linear: 4-layer text color hierarchy (primary/secondary/tertiary/quaternary)
- From Levels.fyi: immediate interaction (form is the hero, not text about the form)
- From Nansen: dark base with bright accent on interactive elements only
