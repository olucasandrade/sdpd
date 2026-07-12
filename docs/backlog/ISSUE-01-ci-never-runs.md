# ISSUE-01: CI pipeline never runs (branch name mismatch)

**Severity:** Critical
**Type:** Bug / DevOps
**Effort:** ~15 minutes
**Files touched:** `.github/workflows/ci-cd.yml`

## Problem

The GitHub Actions workflow at `.github/workflows/ci-cd.yml` is configured to trigger on:

```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

But the repository's default branch is **`master`** (verified with `git branch -a`; remote HEAD points to `origin/master`). There is no `main` or `develop` branch. **The workflow has never executed and will never execute.** Lint failures, TypeScript errors, and broken builds can land on `master` completely unchecked.

## Fix — step by step

1. Open `.github/workflows/ci-cd.yml`.
2. Replace both branch lists so the workflow triggers on `master`:

```yaml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```

3. Fix the `security` job's Snyk step: it will fail for any run where the `SNYK_TOKEN` secret is unset (forks, or if the secret was never configured). `if:` cannot reference `secrets` directly in step conditions, so use the output-variable pattern:

```yaml
    - name: Check for Snyk token
      id: snyk-check
      run: echo "has_token=${{ secrets.SNYK_TOKEN != '' }}" >> "$GITHUB_OUTPUT"
    - name: Check dependencies for vulnerabilities
      if: steps.snyk-check.outputs.has_token == 'true'
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      continue-on-error: true
```

   If this feels like too much ceremony, simply delete the Snyk step — `npm audit` already covers the basic need and the step is `continue-on-error: true` anyway. Deleting is the recommended option.

4. The `Check TypeScript` step runs `npx tsc --noEmit`, and `npm run build` already runs `tsc -b` (see `package.json`: `"build": "tsc -b && vite build"`). The separate step is redundant but gives clearer failure messages — keep it.

5. Update the Node matrix: Node 18 reached end-of-life in April 2025. Change `node-version: [18.x, 20.x]` to `[20.x, 22.x]`. Also update the README "Prerequisites" section (currently says "Node.js 16+"), which is wrong — Vite 6 requires Node 18+ minimum.

## Verification

1. Commit the change to a branch, push, and open a PR targeting `master` — the workflow must appear in the PR checks.
2. Merge and confirm the workflow runs on the push to `master` (Actions tab).
3. In a scratch branch, introduce a deliberate TypeScript error and confirm CI fails; revert.

## Acceptance criteria

- [ ] Workflow triggers on push and PR to `master`.
- [ ] `npm ci`, lint, typecheck, and build all pass on the current codebase.
- [ ] Snyk step removed (or guarded so it doesn't error when the secret is missing).
- [ ] README prerequisites match the actual Node requirement.
