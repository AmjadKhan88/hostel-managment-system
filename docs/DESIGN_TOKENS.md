# Design Tokens

Extracted from the client-provided reference dashboard screenshot ("Shopeers").
The reference determines the visual language; we replicate the *system*
(color roles, spacing, radius, density) with our own content and branding —
not the reference's text, logo, or copy.

## Color

| Token         | Hex        | Role                                                |
| -------------- | ---------- | ----------------------------------------------------- |
| `canvas`         | `#F4F6FB`  | Page background behind cards                          |
| `surface`         | `#FFFFFF`  | Card, sidebar, topbar background                       |
| `border`           | `#EBEDF3`  | Hairline borders on cards/inputs                        |
| `ink`                | `#111827`  | Primary text                                              |
| `ink-muted`           | `#6B7280`  | Secondary text (labels, captions)                          |
| `ink-subtle`            | `#9AA1B1`  | Placeholder / faint text                                     |
| `brand-500`               | `#2F6FED`  | Primary action color (buttons, active nav, links)              |
| `success`                    | `#12A150`  | Positive trend indicators, success states                        |
| `success-bg`                    | `#E4F8EC`  | Success badge background                                            |
| `danger`                           | `#F0416C`  | Negative trend indicators, destructive actions                        |
| `danger-bg`                           | `#FDE7ED`  | Danger badge background                                                  |
| `warning`                                | `#F5A524`  | Warning states                                                              |

The full `brand` scale (50–900) exists for hover/active/disabled states and
for chart accents, following the same hue as the reference's primary blue.

## Typography

**Inter** — the reference's sans-serif has tight, modern proportions
consistent with Inter's metrics. Loaded via Google Fonts in `index.html`
with the Tailwind `font-sans` stack falling back to system fonts if it fails
to load.

## Shape & elevation

- `rounded-card` (20px) — dashboard cards, matching the reference's
  generous, consistent card radius.
- `rounded-control` (12px) — buttons, inputs, badges — a smaller radius so
  interactive controls read as a distinct tier from cards.
- `shadow-card` — a soft, low-contrast shadow (no heavy drop shadows),
  matching the reference's subtle elevation.

## Spacing & density

The reference uses generous card padding (~24px) with a comfortable, not
cramped, information density. `surface-card` (in `src/styles/index.css`)
is the base card shell other components build on: white surface, card
radius, hairline border, card shadow.

## What's intentionally deferred

Component-level decisions (exact sidebar width, chart styling, table row
height, stat-card layout) are made when those components are actually built
on their scoped days — Day 1 only establishes the token system they'll all
draw from, so the app stays visually consistent without needing to be
redesigned later.
