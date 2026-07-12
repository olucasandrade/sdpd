# ISSUE-06: Accessibility — keyboard traps, unlabeled controls, contrast, motion

**Severity:** Medium-High (parts of the game are unusable without a mouse)
**Type:** Bug / A11y
**Effort:** ~1 day
**Files touched:** `src/pages/HomePage.tsx`, `src/components/game/NodeInspector.tsx`, `src/components/diagram/*.tsx`, `src/components/layout/Header.tsx`, `src/components/guide/GuidePanel.tsx`, `src/index.css`, `src/i18n/locales/*.json`, `src/main.tsx`

## Problems and fixes, in priority order

### 6a. Case cards on the home page are click-only `<div>`s

`HomePage.tsx` (~line 194): each case row is a `motion.div` with `onClick={() => unlocked && navigate(...)}` — no `role`, no `tabIndex`, no key handling. Keyboard users can only reach the small inner "Open" `Button`; screen readers announce nothing actionable. There is also a **nested interactive element**: the inner `Button` (~line 251) also navigates, so mouse clicks fire two handlers for the same navigation (harmless today, fragile tomorrow).

**Fix (recommended shape):** make the whole card a single `<motion.button type="button">`, remove the redundant inner `Button`, keep the visual "Open" affordance as a styled `<span>`:

```tsx
<motion.button
  type="button"
  disabled={!unlocked}
  onClick={() => navigate(`/case/${c.id}`)}
  aria-label={`Case ${c.number}: ${c.title} — ${done ? 'cleared' : unlocked ? 'open' : 'locked'}`}
  className="…existing classes… text-left w-full focus-visible:ring-2 focus-visible:ring-amber-500/60"
>
  …existing children minus the inner <Button>…
</motion.button>
```

`disabled` on locked cards gives correct semantics for free. `Sidebar.tsx` already does this correctly with `<button disabled>` — mirror that pattern. (The aria-label strings should come from i18n, e.g. keys `a11y.caseCard.cleared` / `.open` / `.locked`.)

### 6b. NodeInspector modal has no dialog semantics, focus management, or Escape handling

`NodeInspector.tsx`: the overlay is a `div` with `onClick={onClose}`. Missing: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape-to-close, focus moving into the dialog on open and returning to the trigger on close, focus trapping.

**Fix:**
- `useEffect` on open: save `document.activeElement`, focus the close button, add `keydown` listener (Escape → `onClose()`); on cleanup restore focus.
- Add `role="dialog" aria-modal="true" aria-labelledby="inspector-title"` to the inner `motion.div`; `id="inspector-title"` on the `h3`.
- The close `&times;` button needs `aria-label={t('inspector.close')}` — add `"inspector.close": "Close inspector"` / `"Fechar inspetor"` to both locale files.

### 6c. Diagram nodes must be keyboard-inspectable

`SystemDiagram.tsx` sets `elementsSelectable={false}`; inspection happens via custom node components (`src/components/diagram/DatabaseNode.tsx`, `ServerNode.tsx`, `ClientNode.tsx`) that attach `onInspect` from `data`. Whatever element inside each node component handles the click must be a `<button>` (or `role="button" tabIndex={0}` with Enter/Space handling) with `aria-label` like `Inspect ${label} (${status})`. Inspect all three node files and apply the same pattern. Inspectable nodes already pulse visually (`.node-inspectable` in `index.css`); they just need the semantic equivalent.

### 6d. Language toggle and icon buttons lack labels

- `Header.tsx` (~line 83): the locale toggle renders just "PT"/"EN" — add `aria-label={locale === 'en' ? 'Mudar para Português' : 'Switch to English'}`.
- `GuidePanel.tsx` (line 25): the close `&times;` button needs an `aria-label`.

### 6e. Contrast is far below WCAG on most secondary text

The noir theme uses white at very low alphas on near-black (`--color-noir-950: #050810`): `text-white/20`, `text-white/30`, even `/15` for real content (case subtitles, category counters, briefing text; feedback text is `text-white/50`). White at 30% on `#0a0e1a` is ≈1.9:1 — WCAG AA needs 4.5:1 for normal text.

**Fix policy (keeps the aesthetic):**
- Player-essential content (subtitles, briefs, question text, feedback, concept explanations): minimum `text-white/70`.
- Secondary labels (section headers, counters): minimum `text-white/50`.
- Reserve `/30` and below for purely decorative elements.

Sweep with `grep -rn "white/[123]0\|white/15" src/` and adjust case by case. Overlaps with `UX-01-readability.md` — execute together.

### 6f. Reduced motion is not respected

Framer Motion animations (hero spring, `CaseSuccess.tsx` particles, hover nudges) and infinite CSS animations (`shield-glow`, `pulse-glow`, scan-line overlay, `edge-animated` in `index.css`) ignore `prefers-reduced-motion`.

**Fix:**
- Wrap the app in Framer Motion's `<MotionConfig reducedMotion="user">` (in `src/main.tsx` or `App.tsx`) — one line.
- In `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .shield-glow, .node-inspectable, .edge-animated path, .bg-dotgrid-animated {
    animation: none !important;
  }
}
```

### 6g. Page titles never change

`document.title` is always the static string from `index.html` regardless of route. In `CasePage.tsx`:

```tsx
useEffect(() => {
  document.title = `${caseData.title} — SDPD`;
  return () => { document.title = 'SDPD — Systems Design Police Department'; };
}, [caseData.title]);
```

Similar for `/chaos`. Helps screen-reader users, history, and tab management. (Overlaps with `ISSUE-07-seo-performance.md`.)

## Verification

1. Keyboard-only run: Tab from page load → reach and activate a case card → inspect a diagram node with Enter → close inspector with Escape (focus returns) → answer both questions → reach "Next Case". No mouse at any point.
2. VoiceOver (macOS) spot check: case cards announce number/title/state; inspector announces as a dialog.
3. Enable macOS "Reduce motion": shield/scanline/particle animations stop.
4. Lighthouse accessibility audit ≥ 95; fix anything it flags that this doc missed.

## Acceptance criteria

- [ ] Entire core loop completable with keyboard only.
- [ ] Inspector has dialog semantics + focus management + Escape.
- [ ] All icon-only/ambiguous controls have aria-labels in both locales.
- [ ] No player-essential text below ~`white/70`.
- [ ] `prefers-reduced-motion` disables Framer and CSS animation loops.
- [ ] Lighthouse a11y ≥ 95.
