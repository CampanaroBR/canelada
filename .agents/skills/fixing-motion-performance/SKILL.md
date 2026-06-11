---
name: fixing-motion-performance
description: Audit and fix animation performance issues including layout thrashing, compositor properties, scroll-linked motion, and blur effects.
---

# fixing-motion-performance

Fix animation performance issues.

## Rules

- Default to transform and opacity for motion
- Never animate layout properties continuously
- Never drive animation from scroll events
- Keep blur animation small (<=8px)
- Use will-change sparingly
