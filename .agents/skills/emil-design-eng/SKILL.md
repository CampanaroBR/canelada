---
name: emil-design-eng
description: Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great.
---

# Design Engineering

Build interfaces where every detail compounds into something that feels right.

## Animation Framework

- Ask: how often will users see this? If 100+/day, no animation.
- Use ease-out for entering elements
- UI animations under 300ms
- Never animate from scale(0) — start from scale(0.95)
- Add scale(0.97) on :active for button feedback
- Use CSS transitions for interactive elements (interruptible)

## Component Principles

- Buttons must have :active scale feedback
- Popovers should scale from their trigger (transform-origin)
- Tooltips: skip delay on subsequent hovers
