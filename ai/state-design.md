# State Design: CipherComp

## User Journey States

### State 1: Disconnected (Landing)
- User sees: hero message, "Why This Matters" context, wallet connect prompt
- Primary action: connect wallet
- Visual: full-width storytelling layout, no panels/forms visible
- Feeling: editorial, authoritative, this is a real problem

### State 2: Connected, Empty Form
- User sees: salary form (role dropdown, location dropdown, salary input)
- Right panel: empty placeholder encouraging submission
- Primary action: fill out form
- Visual: form is the focus, right panel is dim/ghost

### State 3: Form Filled, Ready to Submit
- User sees: completed form with live submission count
- Primary action: encrypt & submit button activates
- Visual: button glows/elevates when ready, submission count shows progress

### State 4: Submitting (2-step)
- Step A: "Encrypting in browser..." — cofhejs is working
- Step B: "Submitting to chain..." — tx sent, waiting for receipt
- Visual: distinct loading states for each step (encryption is local, submission is on-chain)
- No interaction possible during this

### State 5: Submitted, Below Threshold
- User sees: confirmation of submission + locked results panel
- The lock is meaningful: "3 more people need to submit before anyone can see percentiles"
- Visual: right panel shows a countdown/progress toward MIN_SAMPLE
- Feeling: anticipation, you're contributing to something that unlocks for everyone

### State 6: Threshold Met, Can Query
- User sees: unlocked results panel with 8 salary buckets
- Each bucket shows the threshold amount
- Primary action: click a bucket (or "Reveal All") to request decryption
- Visual: buckets look interactive, have hover states, feel tappable

### State 7: Decrypting
- Specific bucket(s) show "Decrypting on Fhenix..." state
- CoFHE async decrypt takes 5-30 seconds
- Visual: pulsing/breathing animation on the decrypting bucket
- Other buckets still clickable

### State 8: Results Visible
- Bucket shows: percentile number + bar fill + count label
- Bar animates from 0 to final width
- Visual: the data feels significant, not just numbers
- Each revealed bucket stays visible (accumulated results)

## Key Interaction: The Encryption Moment

The most important UX moment is Step 4A: when the user's salary gets encrypted. This is the core value prop — "your data never leaves your device unencrypted." This moment should FEEL meaningful:
- Brief visual indication that encryption is happening locally
- Transition from plaintext to encrypted (conceptual, not literal)
- Then the on-chain submission is secondary

## Layout Structure

NOT a symmetric two-panel grid. The form and results serve different purposes:

- **Form panel (left):** compact, focused, feels like a private input
- **Results panel (right):** expands as data comes in, starts minimal
- **Below the fold:** context (why this matters), NOT feature cards
- **No "How It Works" section with numbered cards** — that's AI slop. The product should be self-evident (Krug: if you need to explain it, simplify it)

## What to Remove from Current Design
- Gradient text headline (Hard No in style config)
- "How It Works" 3-card section (AI slop pattern #1)
- Tech stack badges at bottom (self-certifying badges)
- "Privacy badge" shimmer (decorative, not functional)
- The "5" hardcoded in the placeholder text
- Feature-card icons (Heroicons outline = AI slop)
