# Surfaces

## Concentric Border Radius

outerRadius = innerRadius + padding

## Shadows over Borders

Use layered transparent box-shadow for depth on cards and buttons.
Light: 0px 0px 0px 1px rgba(0,0,0,0.06), ...
Dark: 0 0 0 1px rgba(255,255,255,0.08)

## Image Outlines

Light: outline: 1px solid rgba(0,0,0,0.1)
Dark: outline: 1px solid rgba(255,255,255,0.1)
Always outline-offset: -1px

## Minimum Hit Area

40x40px minimum. Extend with pseudo-element if needed.
