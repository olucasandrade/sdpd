# ISSUE-07: SEO/social metadata missing + all 66 case JSONs eagerly bundled

**Severity:** Medium (hurts discoverability and initial load; both cheap to fix)
**Type:** Improvement / Performance / SEO
**Effort:** ~half a day
**Files touched:** `index.html`, `src/hooks/useCase.ts`, callers of `useCase`/`useAllCases`, host config file

## Part A — SEO & social metadata

### Problem

`index.html` contains only charset, viewport, title, an emoji favicon, and Google Fonts links. Missing: meta description, Open Graph tags, Twitter card, canonical URL, theme-color. When anyone shares the game on X/LinkedIn/Discord — the main growth channel for a free dev-education game — the preview is blank.

### Fix

Add to `<head>` in `index.html` (replace `PRODUCTION-URL` with the deployed origin):

```html
<meta name="description" content="SDPD — a detective game for distributed systems design. Investigate 33 system-failure cases, diagnose root causes, and prescribe fixes. Free, open source, EN/PT-BR." />
<meta name="theme-color" content="#050810" />
<link rel="canonical" href="https://PRODUCTION-URL/" />

<meta property="og:type" content="website" />
<meta property="og:title" content="SDPD — Systems Design Police Department" />
<meta property="og:description" content="Solve 33 distributed-systems failure cases as a detective. Learn replication, caching, consistency, and more — free and open source." />
<meta property="og:url" content="https://PRODUCTION-URL/" />
<meta property="og:image" content="https://PRODUCTION-URL/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="SDPD — Systems Design Police Department" />
<meta name="twitter:description" content="Solve 33 distributed-systems failure cases as a detective." />
<meta name="twitter:image" content="https://PRODUCTION-URL/og-image.png" />
```

Create `public/og-image.png` (1200×630): shield logo + tagline on the noir background — the existing `homepage.png` screenshot at the repo root (before ISSUE-05 deletes it) can be cropped as a stopgap.

**SPA routing fallback:** the app uses `BrowserRouter`, so `/case/:id` URLs 404 on static hosts without a rewrite. Add the host-appropriate config (Vercel `vercel.json` rewrites, Netlify `_redirects`, or GitHub Pages 404 trick). If the host is unknown, add `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Per-route `document.title` updates are specced in `ISSUE-06-accessibility.md` §6g.

## Part B — Case data is eagerly imported into the main bundle

### Problem

`src/hooks/useCase.ts` statically imports **all 66 case JSON files** (33 EN + 33 pt-BR) plus both concept files — ~75 import lines feeding two arrays. Every byte of every case in both languages ships in the initial JS bundle before the player opens anything. Case files run ~8–15 KB each; total is several hundred KB and grows linearly with each new case and language. (The 46 `src/data/builder/*.json` files are *not* imported today and cost nothing — keep it that way until FEATURE-01.)

### Fix — lazy case bodies + eager lightweight index

The Home page and Sidebar only need `id`, `number`, `title`, `subtitle` per case; the full body is only needed on `CasePage`.

1. Replace the static imports with lazy globs:

```ts
const loaders: Record<string, Record<string, () => Promise<{ default: Case }>>> = {
  en: import.meta.glob('../data/cases/case-*.json'),
  'pt-BR': import.meta.glob('../data/cases/pt-BR/case-*.json'),
};
```

2. `useCase(caseId)` becomes effect-based: `useState<Case | null>` + `useEffect` that resolves the matching loader and guards against unmount races. Important: `CasePage.tsx` currently treats `null` as "Case not found" — add a distinct `loading` state so players don't flash the not-found message while the chunk loads.

3. For the case *list* (`useAllCases`, used by `HomePage`, `Sidebar`, `CaseSuccess`), generate a small metadata index at build time: `scripts/generate-case-index.mjs` reads `src/data/cases/**/*.json` and writes `src/data/case-index.json` + pt-BR variant containing `[{ id, number, title, subtitle, conceptId }]`. Wire it as `"predev"`/`"prebuild"` npm scripts. Import only the index eagerly.

4. Vite code-splits each glob entry automatically; no `vite.config.ts` change needed.

**Simpler fallback** (if judged too invasive): keep the active-locale cases eager but lazy-glob the inactive locale. Halves the cost in ~20 changed lines.

### Also in this pass — self-host fonts

`index.html` loads 3 families from fonts.googleapis.com — render-blocking, third-party, and breaks offline use. Replace with `@fontsource/bebas-neue`, `@fontsource/dm-sans`, `@fontsource/space-mono`: npm install, import in `src/main.tsx` (weights actually used: DM Sans 400/500/600/700, Space Mono 400/700, Bebas Neue 400), delete the three `<link>` tags.

## Verification

1. `npm run build` — `dist/assets/` shows separate chunks for case data; main bundle shrinks materially (compare `du -sh dist` pre/post; grep `dist/assets/*.js` for a distinctive case-33 string — it must not be in the entry chunk).
2. `npm run preview` — Home renders the full list from the index; opening a case lazy-loads its chunk (Network tab); locale switch works; deep link `/case/case-15` works; no "Case not found" flash.
3. Link-preview checker (e.g. opengraph.xyz) renders image/title/description.
4. Network tab shows no requests to fonts.googleapis.com.

## Acceptance criteria

- [ ] OG/Twitter/description/theme-color tags present; `og-image.png` renders in a preview checker.
- [ ] SPA fallback rewrite configured for the production host.
- [ ] Initial bundle no longer contains all case bodies for both locales.
- [ ] Distinct loading state on `CasePage` (no not-found flash).
- [ ] Fonts self-hosted.
