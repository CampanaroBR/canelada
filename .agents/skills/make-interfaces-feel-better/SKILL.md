---
name: make-interfaces-feel-better
description: Design engineering principles for making interfaces feel polished — animations, hover states, shadows, borders, typography, micro-interactions.
---

# Details that make interfaces feel better

## Core Principles

1. Concentric Border Radius: outer = inner + padding
2. Optical over geometric alignment
3. Shadows over borders for depth
4. Interruptible animations (CSS transitions)
5. Split and stagger enter animations (~100ms delay)
6. Subtle exit animations (small fixed translateY)
7. Font smoothing: -webkit-font-smoothing: antialiased
8. Tabular numbers for dynamic values
9. text-wrap: balance on headings
10. scale(0.96) on button press
11. Never use transition: all — specify exact properties
12. Minimum 40x40px hit area
