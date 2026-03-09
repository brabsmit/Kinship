# Error Boundaries Design

**Issue:** #168 — Add React Error Boundaries for graceful failure handling
**Date:** 2026-03-09

## Problem

No React Error Boundaries exist. A single component crash (bad data, null reference, ReactFlow error) white-screens the entire app for non-technical family members with no recovery path.

## Design Decisions

- **Two boundary layers:** top-level (catastrophic) + per-view-mode (isolated)
- **Single component with `level` prop:** one `ErrorBoundary.jsx`, two behaviors
- **Clean minimal fallback UI:** white/gray card, sans-serif — clearly distinct from vintage content
- **Retry + escape hatch:** "Try Again" re-renders the failed component, "Go to List View" navigates to safety

## Component: `src/components/ErrorBoundary.jsx`

React class component (required for `componentDidCatch`).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `"top"` \| `"view"` | `"view"` | Controls fallback UI style |
| `onReset` | `function` | — | Called when user clicks "Go to List View" |
| `children` | `node` | — | Wrapped content |

### State

- `hasError` (boolean) — triggers fallback rendering
- `error` (Error) — logged to console

### Fallback UI

**Top-level (`level="top"`):**
- Centered full-page message: "Something went wrong"
- "Reload" button → `window.location.reload()`

**View-level (`level="view"`):**
- Inline card: "This view encountered an error"
- "Try Again" button → resets `hasError` to re-render children
- "Go to List View" link → calls `onReset` prop

### Error Logging

`componentDidCatch` logs to `console.error`. No external error service.

## Integration

### main.jsx

Wrap `<App />` inside top-level boundary:

```jsx
<ErrorBoundary level="top">
  <App />
</ErrorBoundary>
```

Provider hierarchy: StrictMode → HashRouter → AuthProvider → ErrorBoundary(top) → App

### App.jsx

Wrap each view mode's rendered content with a view-level boundary:

```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
  {viewMode === 'graph' && <GraphView ... />}
</ErrorBoundary>
```

Each view mode (list, graph, fleet, threads, hitlist, outliers) gets its own boundary in both the left sidebar and right panel rendering sections.

## Scope

- Create: `src/components/ErrorBoundary.jsx`
- Modify: `src/main.jsx` (add top-level boundary)
- Modify: `src/App.jsx` (wrap view mode blocks)
