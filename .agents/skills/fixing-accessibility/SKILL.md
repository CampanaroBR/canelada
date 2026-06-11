---
name: fixing-accessibility
description: Audit and fix HTML accessibility issues including ARIA labels, keyboard navigation, focus management, color contrast, and form errors.
---

# fixing-accessibility

Fix accessibility issues in UI code.

## Quick Reference

- Every interactive control must have an accessible name
- Icon-only buttons must have aria-label
- All interactive elements must be reachable by Tab
- Modals must trap focus while open
- Errors must be linked to fields using aria-describedby
- Minimum 44x44px touch targets
