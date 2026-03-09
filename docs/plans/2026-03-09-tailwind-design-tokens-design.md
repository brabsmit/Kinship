# Tailwind Design Tokens for Vintage Color Palette

**Issue:** #171
**Date:** 2026-03-09
**Status:** Approved

## Problem

Hardcoded hex colors are scattered across 7 components using Tailwind arbitrary values (e.g., `bg-[#f4e4bc]`, `text-[#3e3221]`). There are 18 unique hex colors with 94 total usages. This makes the vintage palette hard to maintain and inconsistent.

## Design Decisions

- **Naming:** Semantic names with consistent named variants (not numbered shade scales)
- **One-off thread colors:** Left as arbitrary values (they're content data, not design tokens)
- **Opacity modifiers:** Work natively with DEFAULT tokens (e.g., `ink/50`)

## Token Map

```js
colors: {
  accent:    { DEFAULT: '#E67E22' },
  ink:       { DEFAULT: '#3e3221' },
  navy:      { DEFAULT: '#2C3E50', light: '#34495E' },
  gold:      { light: '#FFF8E1', pale: '#FFECB3', DEFAULT: '#F59E0B', dark: '#B45309', darker: '#78350F' },
  parchment: { light: '#fdfbf7', DEFAULT: '#F9F5F0', warm: '#f4e4bc', tan: '#eaddcf', cool: '#eef2f5', muted: '#FAFAF9' },
  maternal:  { DEFAULT: '#831843' },
}
```

## Migration Map

| Old | New | Count | Files |
|-----|-----|-------|-------|
| `[#E67E22]` | `accent` | 35 | App, TheFleet, OutliersDashboard, GenerationalHandshake, FilterMenu |
| `[#3e3221]` | `ink` | 15 | VoyageCard |
| `[#F59E0B]` | `gold` | 11 | App, FilterMenu |
| `[#2C3E50]` | `navy` | 10 | App, AboutPage, TheFleet, FilterMenu |
| `[#F9F5F0]` | `parchment` | 6 | App |
| `[#FFF8E1]` | `gold-light` | 3 | App, FilterMenu |
| `[#f4e4bc]` | `parchment-warm` | 2 | VoyageCard, TheFleet |
| `[#831843]` | `maternal` | 2 | FilterMenu |
| `[#34495E]` | `navy-light` | 2 | AboutPage |
| `[#fdfbf7]` | `parchment-light` | 1 | App |
| `[#eef2f5]` | `parchment-cool` | 1 | TheFleet |
| `[#eaddcf]` | `parchment-tan` | 1 | VoyageCard |
| `[#FFECB3]` | `gold-pale` | 1 | App |
| `[#FAFAF9]` | `parchment-muted` | 1 | App |
| `[#B45309]` | `gold-dark` | 1 | App |
| `[#78350F]` | `gold-darker` | 1 | App |
| `[#5D2E0C]` | skip (thread data) | 1 | App |
| `[#8B4513]` | skip (thread data) | 1 | App |

## Scope

1. Add token definitions to `tailwind.config.js`
2. Find-and-replace across 7 files: App.jsx, VoyageCard.jsx, TheFleet.jsx, FilterMenu.jsx, AboutPage.jsx, OutliersDashboard.jsx, GenerationalHandshake.jsx
3. Verify build succeeds and no visual regressions
