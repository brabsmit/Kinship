# Tailwind Design Tokens Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all hardcoded hex color arbitrary values with semantic Tailwind design tokens defined in tailwind.config.js.

**Architecture:** Add color tokens to `tailwind.config.js` under `theme.extend.colors`, then find-and-replace arbitrary values in each component file. No test framework exists — verification is build success + grep for remaining arbitrary hex values.

**Tech Stack:** Tailwind CSS 3.4, React/JSX

---

### Task 1: Define color tokens in tailwind.config.js

**Files:**
- Modify: `kinship-app/tailwind.config.js`

**Step 1: Add the color token definitions**

Replace the empty `extend: {}` with:

```js
extend: {
  colors: {
    accent:    { DEFAULT: '#E67E22' },
    ink:       { DEFAULT: '#3e3221' },
    navy:      { DEFAULT: '#2C3E50', light: '#34495E' },
    gold:      { light: '#FFF8E1', pale: '#FFECB3', DEFAULT: '#F59E0B', dark: '#B45309', darker: '#78350F' },
    parchment: { light: '#fdfbf7', DEFAULT: '#F9F5F0', warm: '#f4e4bc', tan: '#eaddcf', cool: '#eef2f5', muted: '#FAFAF9' },
    maternal:  { DEFAULT: '#831843' },
  },
},
```

**Step 2: Verify build**

Run: `cd kinship-app && npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add kinship-app/tailwind.config.js
git commit -m "feat: define Tailwind design tokens for vintage color palette (#171)"
```

---

### Task 2: Migrate VoyageCard.jsx (ink token — 15 replacements)

**Files:**
- Modify: `kinship-app/src/components/VoyageCard.jsx`

**Step 1: Replace all ink color references**

Apply these replacements throughout the file:
- `[#3e3221]` → `ink` (covers `text-[#3e3221]`, `border-[#3e3221]`, `bg-[#3e3221]`)
- `[#3e3221]/50` → `ink/50` (opacity variant)
- `[#3e3221]/20` → `ink/20` (opacity variant)
- `[#eaddcf]` → `parchment-tan`
- `[#f4e4bc]` → `parchment-warm`

**Step 2: Verify no remaining arbitrary hex values (except intended ones)**

Run: `grep -n '\[#' kinship-app/src/components/VoyageCard.jsx`
Expected: No matches.

**Step 3: Verify build**

Run: `cd kinship-app && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add kinship-app/src/components/VoyageCard.jsx
git commit -m "refactor: replace hardcoded hex colors with design tokens in VoyageCard (#171)"
```

---

### Task 3: Migrate TheFleet.jsx (accent, navy, parchment tokens)

**Files:**
- Modify: `kinship-app/src/components/TheFleet.jsx`

**Step 1: Replace all hex color references**

- `[#E67E22]` → `accent`
- `[#2C3E50]` → `navy`
- `[#F9F5F0]` → `parchment`
- `[#f4e4bc]` → `parchment-warm`
- `[#eef2f5]` → `parchment-cool`

**Step 2: Verify no remaining arbitrary hex values**

Run: `grep -n '\[#' kinship-app/src/components/TheFleet.jsx`
Expected: No matches.

**Step 3: Commit**

```bash
git add kinship-app/src/components/TheFleet.jsx
git commit -m "refactor: replace hardcoded hex colors with design tokens in TheFleet (#171)"
```

---

### Task 4: Migrate FilterMenu.jsx (accent, gold, navy, maternal tokens)

**Files:**
- Modify: `kinship-app/src/components/FilterMenu.jsx`

**Step 1: Replace all hex color references**

- `[#E67E22]` → `accent`
- `[#F59E0B]` → `gold`
- `[#FFF8E1]` → `gold-light`
- `[#2C3E50]` → `navy`
- `[#831843]` → `maternal`

**Step 2: Verify no remaining arbitrary hex values**

Run: `grep -n '\[#' kinship-app/src/components/FilterMenu.jsx`
Expected: No matches.

**Step 3: Commit**

```bash
git add kinship-app/src/components/FilterMenu.jsx
git commit -m "refactor: replace hardcoded hex colors with design tokens in FilterMenu (#171)"
```

---

### Task 5: Migrate AboutPage.jsx (navy tokens)

**Files:**
- Modify: `kinship-app/src/components/AboutPage.jsx`

**Step 1: Replace all hex color references**

- `[#2C3E50]` → `navy`
- `[#34495E]` → `navy-light`

**Step 2: Verify no remaining arbitrary hex values**

Run: `grep -n '\[#' kinship-app/src/components/AboutPage.jsx`
Expected: No matches.

**Step 3: Commit**

```bash
git add kinship-app/src/components/AboutPage.jsx
git commit -m "refactor: replace hardcoded hex colors with design tokens in AboutPage (#171)"
```

---

### Task 6: Migrate OutliersDashboard.jsx and GenerationalHandshake.jsx (accent token)

**Files:**
- Modify: `kinship-app/src/components/OutliersDashboard.jsx`
- Modify: `kinship-app/src/components/GenerationalHandshake.jsx`

**Step 1: Replace hex color references in both files**

- `[#E67E22]` → `accent`

**Step 2: Verify no remaining arbitrary hex values**

Run: `grep -n '\[#' kinship-app/src/components/OutliersDashboard.jsx kinship-app/src/components/GenerationalHandshake.jsx`
Expected: No matches.

**Step 3: Commit**

```bash
git add kinship-app/src/components/OutliersDashboard.jsx kinship-app/src/components/GenerationalHandshake.jsx
git commit -m "refactor: replace hardcoded hex colors with design tokens in OutliersDashboard and GenerationalHandshake (#171)"
```

---

### Task 7: Migrate App.jsx (all remaining tokens — largest file)

**Files:**
- Modify: `kinship-app/src/App.jsx`

**Step 1: Replace all hex color references**

Apply these replacements (skip `[#8B4513]` and `[#5D2E0C]` in the THREADS array):
- `[#E67E22]` → `accent`
- `[#F59E0B]` → `gold`
- `[#2C3E50]` → `navy`
- `[#F9F5F0]` → `parchment`
- `[#FFF8E1]` → `gold-light`
- `[#FFECB3]` → `gold-pale`
- `[#FAFAF9]` → `parchment-muted`
- `[#fdfbf7]` → `parchment-light`
- `[#B45309]` → `gold-dark`
- `[#78350F]` → `gold-darker`
- `[#F9F5F0]` → `parchment` (in bg classes)

**Step 2: Verify only thread colors remain**

Run: `grep -n '\[#' kinship-app/src/App.jsx`
Expected: Only 2 matches — the THREADS array entries for `#8B4513` and `#5D2E0C`.

**Step 3: Commit**

```bash
git add kinship-app/src/App.jsx
git commit -m "refactor: replace hardcoded hex colors with design tokens in App.jsx (#171)"
```

---

### Task 8: Final verification

**Step 1: Full build check**

Run: `cd kinship-app && npm run build`
Expected: Build succeeds with no errors.

**Step 2: Audit remaining hex values across all source files**

Run: `grep -rn '\[#' kinship-app/src/ --include='*.jsx' --include='*.js'`
Expected: Only the 2 THREADS array entries in App.jsx.

**Step 3: Run dev server and visually verify**

Run: `cd kinship-app && npm run dev`
Check: Open http://localhost:4000, verify colors look identical across List View, a VoyageCard, TheFleet page, and the About page.

**Step 4: Commit build verification (if any fixes needed)**

If all good, no commit needed — previous commits cover everything.
