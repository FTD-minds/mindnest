---
description: "Run pre-merge checks (type-check, lint, build) and prepare a PR. Asks for confirmation before committing or pushing."
---

# /ship — Pre-Merge Checklist & PR Prep

Run this command before any merge or PR. It checks everything in order and requires two explicit confirmations before touching git history or the remote.

## Step 1 — Git Status

```bash
git status
git diff --stat
```

Report what files are changed, untracked, or staged. Summarize the scope of the change to the user before proceeding.

## Step 2 — Type Check

```bash
npm run type-check
```

If this fails: **stop**. Show the full error. Do not proceed until the user fixes it or explicitly asks to skip.

## Step 3 — Lint

```bash
npm run lint
```

If this fails: **stop**. Show the errors. Do not proceed until resolved or explicitly skipped by the user.

## Step 4 — Build

```bash
npm run build
```

If this fails: **stop**. Show the errors. This is the final gate — a broken build must never be pushed.

## Step 5 — Two-File Rule Diff Check

Verify that if `components/MindNestLanding.tsx` was changed, `public/mindnest-preview.html` was also changed — and vice versa.

```bash
git diff --name-only | grep -E "(MindNestLanding|mindnest-preview)"
```

If only one of the two was modified: **warn the user** and do not proceed until both are updated or the user explicitly confirms neither was a visual change.

## Step 6 — CONFIRMATION #1: Commit

> "All checks passed. Ready to commit. Confirm commit message or provide your own:"

- Suggest a commit message following the project style (conventional commits: `feat:`, `fix:`, `chore:`, etc.)
- **Wait for explicit confirmation before running `git commit`.**
- Never commit if any previous check failed without explicit user override.

```bash
git add <specific files — never git add -A without listing them>
git commit -m "..."
```

## Step 7 — CONFIRMATION #2: Push

> "Committed. Ready to push to origin/main. This will trigger a Vercel auto-deploy to mindnest-delta.vercel.app. Confirm?"

- **Wait for explicit confirmation before running `git push`.**
- Never push directly to `main` without this second confirmation.
- Never use `--force` on `main`.

```bash
git push origin main
```

## After Push

- Report the Vercel deploy URL: https://mindnest-delta.vercel.app
- Optionally suggest opening a PR on GitHub if this is a feature branch.

## Rules

- Two separate confirmations are always required (commit and push are separate steps).
- Never skip confirmations even if the user says "just ship it" — restate the two-step requirement.
- Never commit if type-check, lint, or build failed.
- Never push to main directly — always confirm.
