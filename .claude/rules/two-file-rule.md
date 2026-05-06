---
paths:
  - components/MindNestLanding.tsx
  - public/mindnest-preview.html
---

# Two-File Rule — Landing Page Sync

`components/MindNestLanding.tsx` and `public/mindnest-preview.html` are a **paired set** and must always be updated together in the same commit.

## Rules

- Whenever any visual change is made to the landing page, BOTH files must be updated.
- Never commit a change to one without the other.
- The standalone HTML preview (`mindnest-preview.html`) must remain visually in sync with the Next.js component (`MindNestLanding.tsx`) at all times.
- Before committing, diff both files to confirm the UI change is reflected in both.
- This rule is non-negotiable. It applies to copy changes, layout changes, color changes, component additions, and removals.

## Why

`mindnest-preview.html` is used for stakeholder reviews, design sharing, and Vercel preview links. If it drifts from the live component, reviews become unreliable and misleading.
