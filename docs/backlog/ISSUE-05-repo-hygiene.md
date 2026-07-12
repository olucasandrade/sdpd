# ISSUE-05: Repo hygiene — missing LICENSE, committed junk files, placeholder metadata

**Severity:** Medium (blocks contributions; README makes false claims)
**Type:** Cleanup / Legal
**Effort:** ~30 minutes
**Files touched:** repo root, `.gitignore`, `package.json`, `README.md`

## Problems and fixes

### 5a. LICENSE file is missing but README claims MIT

`README.md` displays an MIT badge and says "This project is licensed under the MIT License — see the [LICENSE](LICENSE) file" — but there is **no LICENSE file** in the repo (verified: `ls LICENSE*` → no matches). Without a license file the project is legally "all rights reserved", and the whole Contributing section is moot.

**Fix:** create `LICENSE` at the repo root with the standard MIT text, copyright line: `Copyright (c) 2026 Lucas Andrade`.

### 5b. macOS junk committed

`.DS_Store` (root) and `src/.DS_Store` are committed even though `.gitignore` lists `.DS_Store` (gitignore doesn't affect already-tracked files).

**Fix:** `git rm --cached .DS_Store src/.DS_Store` and commit.

### 5c. Screenshots and tool logs at the repo root

`case1.png`, `case1-complete.png`, `case2-guide.png`, `homepage.png`, `sdpd-homepage-full.png` (working screenshots) and `.playwright-mcp/console-*.log` (4 MCP browser-session logs) are committed.

**Fix:**
- If any screenshot is wanted for the README, move it to `docs/images/` and reference it; delete the rest.
- Delete `.playwright-mcp/` and add `.playwright-mcp/` to `.gitignore`.

### 5d. `PODCAST_COPILOTO.md` is personal prep material

It is a Portuguese podcast-interview script for the author (question blocks, answer hooks, follow-ups). It is not project documentation and confuses contributors browsing the repo.

**Fix:** remove from the repo (it stays in git history). If the owner wants it kept, move it under `docs/` — but removal is recommended.

### 5e. `package.json` metadata is placeholder

- `"name": "sdpd-temp"` — rename to `"sdpd"`.
- Missing `"description"`, `"repository"`, `"license"`, `"author"`. Add:

```json
"description": "SDPD — an interactive detective game for learning distributed systems design",
"repository": { "type": "git", "url": "https://github.com/olucasandrade/sdpd.git" },
"license": "MIT",
"author": "Lucas Andrade"
```

### 5f. README inaccuracies

- Clone URL says `https://github.com/yourusername/sdpd.git` — the actual remote is `github.com/olucasandrade/sdpd` (already used correctly by the GitHub button in `HomePage.tsx`). Fix the placeholder.
- "Prerequisites: Node.js 16+ " is wrong — Vite 6 requires Node 18+, and Node 18 is EOL, so state 20+. Keep consistent with the CI matrix (see `ISSUE-01-ci-never-runs.md`).
- Roadmap section: fine to keep; consider linking to `docs/backlog/` once these docs are merged.

## Verification

- `git ls-files | grep -i ds_store` returns nothing; same for `.playwright-mcp` and the root pngs.
- GitHub repo page shows "MIT license" in the sidebar (auto-detected from the LICENSE file).
- `npm run build` unaffected (none of these files are imported by source).

## Acceptance criteria

- [ ] `LICENSE` exists with MIT text and correct copyright.
- [ ] No `.DS_Store`, root screenshots, or `.playwright-mcp` logs tracked by git; `.gitignore` updated.
- [ ] `package.json` has real name, description, repository, license, author.
- [ ] README clone URL and Node prerequisite corrected.
