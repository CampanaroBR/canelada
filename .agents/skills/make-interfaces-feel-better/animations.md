# Animations

Interruptible animations, enter/exit transitions, and contextual icon animations.

## Key Rules

- CSS transitions for interactive state changes (interruptible)
- Keyframes only for one-shot sequences
- Enter: split + stagger with ~100ms delay, use opacity + blur + translateY
- Exit: small fixed translateY (-12px), shorter duration than enter
- Icon animations: scale 0.25→1, opacity 0→1, blur 4px→0
- Scale on press: always 0.96, never below 0.95
- AnimatePresence: use initial={false} for default-state elements
