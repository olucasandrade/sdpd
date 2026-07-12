# UX-02: Mobile experience — broken guide toggle, cramped header, no case navigation

**Severity:** High UX impact (interview preppers study on phones/commutes)
**Type:** UX/UI improvement
**Effort:** ~1–2 days
**Files touched:** `src/components/layout/Header.tsx`, `src/components/layout/GameLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/guide/GuidePanel.tsx`, `src/pages/CasePage.tsx`, `src/pages/ChaosPage.tsx`, `src/index.css`

## Current state (verified in code)

- `Sidebar.tsx` is `max-md:hidden` — reasonable, but there is **no mobile substitute** for jumping between cases; the only path is back through Home.
- `GuidePanel.tsx` is `max-lg:hidden` — but the Header's GUIDE button still renders and still toggles `guideOpen`. **On any screen narrower than `lg` (1024px), tapping GUIDE does literally nothing visible.** That includes iPads. Broken control.
- `Header.tsx` packs into one 48px row: logo + two-line title, pulsing rank pill, `N/33 CASES` counter, locale toggle, `[ CHAOS ]`, `[ GUIDE ]`. At 375px this overflows; nothing collapses.
- `CasePage.tsx` on mobile stacks the diagram (`min-h-[300px]`) above the panel; the diagram fills the first screenful, so the brief — the thing you must read first — starts below the fold with no hint it exists.
- `ChaosPage.tsx` stacks the same way; workable, same fold problem.

## Fixes

### 1. Fix the GUIDE dead button (smallest, do first)

On `< lg`, render `GuidePanel` as a full-screen overlay / bottom sheet instead of hiding it. In `GuidePanel.tsx`, replace `max-lg:hidden` with responsive positioning, e.g.:

```tsx
<aside className="lg:static lg:w-72 max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full max-lg:bg-noir-950/95 …">
```

Exact markup is the implementer's choice — the acceptance test is: tapping GUIDE on a phone shows the guide; tapping × closes it.

### 2. Header: collapse to essentials on small screens

- `< md`: show icon-only logo (drop the two-line text block), the rank pill, and a hamburger button.
- The hamburger opens a drawer containing: case list (reuse the list markup from `Sidebar.tsx`), locale toggle, Chaos link, Guide toggle, GitHub link.
- Implementation shape: lift a `menuOpen` state into `GameLayout.tsx` (or keep it in `Header.tsx`), animate the drawer with Framer's `AnimatePresence` (already a dependency). Give it `role="dialog" aria-modal="true"` + Escape close, consistent with `ISSUE-06-accessibility.md`.

### 3. Case page: tabs instead of stacking on mobile

On `< lg`, replace the vertical stack with two tabs pinned under the header: **Case File** | **Diagram**, defaulting to Case File (players must read the brief first; the current layout buries it). Desktop layout untouched.

- State: `const [mobileTab, setMobileTab] = useState<'file' | 'diagram'>('file')` in `CasePage.tsx`.
- Badge on the Diagram tab showing inspectable-node count ("3 to inspect") to pull players in: `caseData.diagram.nodes.filter(n => n.inspectable).length`.
- React Flow handles touch (pinch-zoom/pan) by default with the current `zoomOnScroll`/`panOnDrag` props in `SystemDiagram.tsx` — verify on a real device.

### 4. Touch targets

Ensure all tap targets are ≥ 44×44px: the locale toggle (`px-1.5 py-0.5` — far too small), inspector close ×, drawer rows. Overlaps with the size bump in `UX-01-readability.md`.

### 5. Viewport height

`index.css` sets `#root { height: 100vh }` with `body { overflow: hidden }`. On iOS Safari, `100vh` includes the collapsed URL bar → bottom content clipped. Use:

```css
#root { height: 100vh; height: 100dvh; }
```

## Verification

Chrome DevTools device mode plus at least one real phone:

1. iPhone SE (375×667): header fits one line; hamburger opens drawer; every destination reachable.
2. Full case flow on phone: open case → land on Case File tab → read brief → switch to Diagram → pinch-zoom → tap a node → inspector opens and closes cleanly → answer both questions → success screen fully visible.
3. GUIDE shows the guide overlay on phone and iPad portrait.
4. No horizontal scroll anywhere; nothing hidden behind the iOS URL bar.

## Acceptance criteria

- [ ] GUIDE toggle has a visible effect at every viewport width.
- [ ] Case list reachable from any page on mobile (drawer).
- [ ] Header fits 375px without wrap/overflow.
- [ ] Case page defaults to the brief on mobile; diagram in a tab with inspect-count badge.
- [ ] `100dvh` applied; nothing clipped on iOS Safari.
- [ ] All tap targets ≥ 44px.
