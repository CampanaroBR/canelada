# Ramp DESIGN.md — Design System Reference

Source: designmd.co/d/ramp  
Extracted: 2026-06-11

---

## Brand Philosophy

Ramp is the corporate card company that made expense management aspirational. The yellow-green accent (#B5FF4D) is used as a "savings" color — the amount Ramp has saved your company is displayed in this electric shade, making frugality feel exciting. The product reads as the anti-expense-report: modern, fast, and built by people who understand that finance software should be as good as consumer software.

---

## Color Tokens

### CSS Variables (globals.css format)

```css
:root {
  --radius: 0.625rem;
  --background: #ffffff;
  --foreground: #0D0D0D;
  --card: #F8F8F8;
  --card-foreground: #0D0D0D;
  --popover: #F8F8F8;
  --popover-foreground: #0D0D0D;
  --primary: #B5FF4D;
  --primary-foreground: #0D0D0D;
  --secondary: #F0F0F0;
  --secondary-foreground: #0D0D0D;
  --muted: #F0F0F0;
  --muted-foreground: #6B7280;
  --accent: #B5FF4D;
  --accent-foreground: #0D0D0D;
  --destructive: #EF4444;
  --destructive-foreground: #ffffff;
  --border: #E5E5E5;
  --input: #E5E5E5;
  --ring: #B5FF4D;
}
```

### Named Color Tokens

| Token | Value | Role |
|---|---|---|
| primary | #B5FF4D | Electric yellow-green — savings highlight, primary CTA |
| on-primary | #0D0D0D | Text on top of primary |
| primary-hover | #A8F040 | Hover state |
| ink | #0D0D0D | Near-true black for authority |
| ink-muted | #6B7280 | Secondary text |
| canvas (light) | #ffffff | Product dashboard background |
| surface-1 | #F8F8F8 | Cards on white |
| surface-2 | #F0F0F0 | Secondary surfaces |
| border | #E5E5E5 | Borders on light |
| marketing-bg | #0D0D0D | Dark marketing canvas |

### Dual Palette System

- **Dashboard (light):** Pure white canvas — finance-grade clarity. Yellow-green as primary CTA and savings amount highlight.
- **Marketing (dark):** #0D0D0D canvas with white body text. Yellow-green carries over as the brand anchor.

---

## Typography

**Ramp Grotesk** (ABC Diatype-derived) — a precise, slightly condensed grotesque.
- Display tracking: **-0.03em**
- Bold at headlines, lighter at body
- Financial data tables use **tabular figures** for column alignment
- Tabular numerals ensure columns align correctly across thousands of transactions

---

## Components & Patterns

- **Spend chart:** Yellow-green bars showing category spend, clean white background
- **Expense table:** Merchant logo + name + employee + amount + status pill — dense but scannable
- **Card management:** Physical card render + spending limit + recent transactions
- **Savings dashboard:** Large yellow-green number — total saved through Ramp intelligence
- **Approval workflow:** Step-by-step flow for expense approval routing
- **Receipt matching:** AI-matched receipts with confidence score visualization

---

## Spacing & Layout

- **Dashboard:** 240px sidebar, content max 1200px
- **Table row height:** 48px for comfortable clicking
- **Card grid:** 3-column with 24px gap
- **Marketing:** 1440px max, dramatic full-bleed sections

---

## Motion & Interaction

- **Savings counter** animates up on dashboard load — the number increasing is the signature Ramp delight moment. Wrap in `prefers-reduced-motion` guard.
- Approval actions have immediate feedback
- Charts load with subtle bar-rise animation
- All transitions respect `@media (prefers-reduced-motion: reduce)`

---

## Accessibility

### Contrast Ratios
- `#B5FF4D` on `#ffffff`: **1.2:1** — fails AA (decorative only on white; MUST use `#0D0D0D` text on top)
- `#0D0D0D` on `#ffffff`: **19.4:1** — passes AA + AAA
- `#6B7280` on `#ffffff`: **4.8:1** — passes AA, fails AAA
- `#B5FF4D` on `#0D0D0D`: **16.1:1** — safe for text on dark canvas

### Minimum Requirements
- Touch target: **44×44px** minimum for all interactive elements
- Focus indicator: `#0D0D0D` outline, 2px, 2px offset
- Focus contrast: 19.4:1 against #ffffff background

### Critical Rule
> The yellow-green (#B5FF4D) is essentially invisible as a foreground color on white (1.2:1). It only works as a **background fill** with dark (#0D0D0D) text on top. Every use of #B5FF4D must have #0D0D0D text over it (achieves 16.1:1). On dark canvas (#0D0D0D), #B5FF4D as text achieves 16.1:1 — that context is safe.

---

## Design Rationale

1. **Yellow-green as "savings made visible"** — Associating an unusual, high-energy color with financial gain turns a dashboard metric into an emotionally charged product moment.
2. **White product canvas for trust** — Finance teams need data clarity above brand expressiveness. White earns trust through precision.
3. **Dark marketing, light product — same accent** — Carrying the yellow-green across both surfaces creates continuity between evaluation and daily use.
4. **Tabular figures as precision signal** — A professional-grade detail that communicates Ramp is a serious financial platform.
5. **Savings counter animation as brand signature** — Transforms a static number into a performance.

---

## Application to Canelada (Dark Mode Adaptation)

Canelada is dark-only (`#0A0A0A` canvas), which maps to Ramp's **marketing palette** (not the light dashboard):
- `#B5FF4D` on `#0A0A0A` achieves ~16:1 contrast — **safe for text**
- Use `#B5FF4D` as accent fills with `#0D0D0D` text on top
- Use `#B5FF4D` as display text/numbers on dark surfaces
- Surface cards use `#141414` / `#1C1C1C` to layer above base
