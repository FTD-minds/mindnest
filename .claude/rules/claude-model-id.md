---
paths:
  - app/api/nest/**
  - app/api/nest-voice/**
  - app/api/activities/**
  - app/api/community/**
  - app/api/wellness/**
  - lib/claude/**
---

# Anthropic Model ID Rule

## Rules

- All Anthropic API calls in this project must use the exact model ID: **`claude-haiku-4-5-20251001`**
- Never upgrade or change the model ID without explicit written approval from the user.
- Never use `claude-3-haiku`, `claude-3-haiku-20240307`, `claude-haiku`, or any other shorthand or older variant.
- Never use a more expensive or capable model (Sonnet, Opus) without explicit user approval — this has direct cost implications.
- If adding a new API route that calls Anthropic, import the client from `@/lib/claude` and use the same model constant.

## Correct usage

```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  // ...
})
```

## Why

The product is cost-optimized for Haiku at scale. Silently switching to a more expensive model would blow the unit economics. The specific versioned model ID is required by the Anthropic SDK — aliases are not stable across releases.
