---
name: baseline-ui
description: Validates animation durations, enforces typography scale, checks component accessibility, and prevents layout anti-patterns in Tailwind CSS projects.
---

# Baseline UI

Enforces an opinionated UI baseline to prevent AI-generated interface slop.

## Stack

- MUST use Tailwind CSS defaults unless custom values already exist
- MUST use `motion/react` when JavaScript animation is required
- MUST use `cn` utility (`clsx` + `tailwind-merge`) for class logic

## Animation

- NEVER add animation unless explicitly requested
- MUST animate only compositor props (`transform`, `opacity`)
- NEVER exceed `200ms` for interaction feedback
- SHOULD respect `prefers-reduced-motion`

## Typography

- MUST use `text-balance` for headings
- MUST use `tabular-nums` for data

## Layout

- MUST use a fixed `z-index` scale
- NEVER use `h-screen`, use `h-dvh`
