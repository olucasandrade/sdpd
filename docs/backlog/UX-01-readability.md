# UX-01: Readability overhaul — type scale, contrast, information density

**Severity:** High UX impact (the #1 visual problem across the app)
**Type:** UX/UI improvement
**Effort:** ~1 day
**Files touched:** nearly every component (sweep), `src/index.css`

## Diagnosis

The noir/cyberpunk aesthetic is strong and worth keeping, but it is currently achieved by making almost everything tiny and faint. Concrete patterns measured across the codebase:

1. **Micro-typography everywhere.** `text-[10px]` and `text-[11px]` are the dominant sizes — section labels, log lines, key-term definitions, feedback metadata, even buttons (the "Open" button on home case cards is 11px). 10px is below comfortable reading size, and the long-form educational content suffers most: `GuidePanel.tsx` concept explanations render at `text-xs` (12px) with definitions at 11px.
2. **Sub-legible contrast.** Core reading content sits at `text-white/20`–`/50`: case subtitles `/20`, brief paragraphs and concept summaries `/30`–`/45`, diagnosis feedback `/50`. See `ISSUE-06-accessibility.md` §6e for the WCAG math; this doc is the coherent *design* pass, not a mechanical alpha bump.
3. **Everything whispers, so nothing speaks.** All secondary text is equally faint and tiny, so hierarchy comes only from position. On the case page the actual question (`text-sm`) is visually weaker than the decorative phase-number chip beside it.

## Prescription

### 1. A real type scale — no more arbitrary px values

| Role | Class to use | Replaces |
|---|---|---|
| Overline/labels ("CASE FILE", "DIAGNOSE") | `text-xs` + `tracking-widest` | `text-[10px]` |
| Meta/mono data (log lines, counters) | `text-xs` | `text-[10px]`, `text-[11px]` |
| Body (briefs, feedback, explanations) | `text-sm` + `leading-relaxed` | `text-xs` |
| Emphasized body (question text) | `text-base font-medium` | `text-sm` |
| Card titles | `text-base` | `text-sm` |

Rule for the sweep: **every current size goes up one notch**; nothing below 12px survives except true decoration. The dense noir feel is preserved by spacing and color, not font size.

### 2. Contrast ladder

Three tiers, applied mechanically in the same sweep:

- `text-white/90` — primary content (titles, questions, answer options).
- `text-white/70` — reading content (briefs, feedback, explanations, subtitles). **Floor for anything the player must read.**
- `text-white/45` — true metadata (counters, timestamps). Never for sentences.
- Below `/45` — decoration only (dividers, ghost numbers).

Accents: `amber-400`/`cyan-400` for interactive/emphasis; avoid alpha-faded accent text (`amber-400/60` etc.) on small sizes.

### 3. Density fixes on specific screens

- **Case page right panel (`CasePage.tsx`, 400px):** the brief's narrative is the longest text in the game — minimum `text-sm text-white/70 leading-relaxed`. Increase stack spacing (`space-y-4` → `space-y-5/6`).
- **NodeInspector logs:** the log lines are the game's actual *evidence*, at 11px mono `/30`. Make them `text-xs`, default `text-white/60`; keep the existing ERROR/WARN red/amber coloring (it works well).
- **GuidePanel:** explanations → `text-sm text-white/75 leading-relaxed`; key-term definitions → `text-xs text-white/60`.
- **Home case cards:** subtitle `text-[11px] text-white/20` → `text-xs text-white/50`.
- **CaseSuccess stats:** `text-[11px] text-white/30` → `text-xs text-white/60`.

### 4. Keep the noir identity intact

Do NOT touch: the palette in `@theme` (`index.css`), glows (`neon-border`, `node-glow-*`), scan-line/noise overlays, `font-display` (Bebas Neue) heroes/headers, dot grid. The aesthetic lives there — not in 10px text.

## Execution plan for the implementing model

1. `grep -rn "text-\[10px\]\|text-\[11px\]" src/` — build the full occurrence list.
2. Classify each: label → `text-xs tracking-widest`; data → `text-xs`; body → `text-sm`.
3. `grep -rn "text-white/\(1[05]\|20\|30\|35\|40\|45\|50\)" src/` — reclassify per the ladder in §2.
4. Visual QA at 1440px and 375px on: Home, case-01 (brief + both questions + wrong-answer feedback), NodeInspector open, GuidePanel open, Chaos page, CaseSuccess.
5. Attach before/after screenshots to the PR.

## Acceptance criteria

- [ ] No `text-[10px]` remains; `text-[11px]` only with a documented exception added to this file.
- [ ] No sentence-length text below `text-white/70`.
- [ ] Brief, feedback, and guide content comfortably readable on a 13" laptop (owner sign-off).
- [ ] Noir styling (palette, glows, overlays, display font) visually unchanged.
- [ ] Before/after screenshots attached to the PR.
