# Error Boundaries Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add React Error Boundaries so component crashes show friendly recovery UI instead of white-screening the app.

**Architecture:** Single `ErrorBoundary` class component with a `level` prop controlling two behaviors — top-level (full-page reload fallback) and view-level (inline retry + escape to List View). Clean minimal styling, distinct from vintage content.

**Tech Stack:** React class component (required for `componentDidCatch`), Tailwind CSS, lucide-react icons.

---

### Task 1: Create ErrorBoundary component

**Files:**
- Create: `kinship-app/src/components/ErrorBoundary.jsx`

**Step 1: Create the component**

```jsx
import { Component } from 'react';
import { AlertTriangle, RefreshCw, List } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoToList = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { level = 'view' } = this.props;

    if (level === 'top') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              The application encountered an unexpected error. Please reload to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} />
              Reload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full text-center">
          <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            This view encountered an error
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Something went wrong loading this content.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            {this.props.onReset && (
              <button
                onClick={this.handleGoToList}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <List size={14} />
                Go to List View
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
```

**Step 2: Verify it renders without errors**

Run: `cd kinship-app && npm run dev`
Check: app loads normally (no boundaries triggered yet).

**Step 3: Commit**

```bash
git add kinship-app/src/components/ErrorBoundary.jsx
git commit -m "feat: add ErrorBoundary component with top and view-level fallbacks (#168)"
```

---

### Task 2: Add top-level Error Boundary in main.jsx

**Files:**
- Modify: `kinship-app/src/main.jsx`

**Step 1: Wrap App with top-level boundary**

Add import and wrap `<App />`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { HashRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ErrorBoundary level="top">
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
```

**Step 2: Verify app still loads**

Run: `cd kinship-app && npm run dev`
Check: app loads normally.

**Step 3: Commit**

```bash
git add kinship-app/src/main.jsx
git commit -m "feat: wrap App with top-level ErrorBoundary in main.jsx (#168)"
```

---

### Task 3: Add view-level Error Boundaries in App.jsx — Left Sidebar

**Files:**
- Modify: `kinship-app/src/App.jsx:2314-2368`

**Step 1: Import ErrorBoundary at top of App.jsx**

Add to imports (near other component imports):

```jsx
import ErrorBoundary from './components/ErrorBoundary';
```

**Step 2: Wrap left sidebar view blocks**

Wrap each view mode conditional block in the left sidebar section (lines 2314-2368) with `<ErrorBoundary level="view" onReset={() => setViewMode('list')}>`.

The list/graph sidebar block (lines 2315-2329):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{(viewMode === 'list' || viewMode === 'graph') && (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
        ...
    </div>
)}
</ErrorBoundary>
```

The threads block (lines 2331-2347):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{viewMode === 'threads' && (
    ...
)}
</ErrorBoundary>
```

The hitlist block (lines 2349-2356):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{viewMode === 'hitlist' && (
    ...
)}
</ErrorBoundary>
```

The outliers block (lines 2358-2368):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{viewMode === 'outliers' && (
    ...
)}
</ErrorBoundary>
```

**Step 3: Verify app loads and sidebar views render**

Run: `cd kinship-app && npm run dev`
Check: click through each view mode — all render correctly.

**Step 4: Commit**

```bash
git add kinship-app/src/App.jsx
git commit -m "feat: wrap sidebar view modes with ErrorBoundary (#168)"
```

---

### Task 4: Add view-level Error Boundaries in App.jsx — Right Panel

**Files:**
- Modify: `kinship-app/src/App.jsx:2384-2427`

**Step 1: Wrap right panel view blocks**

The graph view block (lines 2384-2396):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{viewMode === 'graph' && (
    <div className="absolute inset-0 z-0">
        <GraphView ... />
    </div>
)}
</ErrorBoundary>
```

The fleet view block (lines 2399-2403):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{viewMode === 'fleet' && (
    <div className="absolute inset-0 z-0 bg-[#F9F5F0]">
        <TheFleet ... />
    </div>
)}
</ErrorBoundary>
```

The profile/placeholder block (lines 2405-2427):
```jsx
<ErrorBoundary level="view" onReset={() => setViewMode('list')}>
{selectedAncestor ? (
    <ImmersiveProfile ... />
) : (
    viewMode !== 'graph' && viewMode !== 'fleet' && (
        <div className="h-full flex flex-col items-center justify-center ...">
            ...
        </div>
    )
)}
</ErrorBoundary>
```

**Step 2: Verify app loads and right panel views render**

Run: `cd kinship-app && npm run dev`
Check: Graph View, Fleet View, and profile detail all render correctly.

**Step 3: Commit**

```bash
git add kinship-app/src/App.jsx
git commit -m "feat: wrap right panel views with ErrorBoundary (#168)"
```

---

### Task 5: Verify build succeeds

**Step 1: Run production build**

Run: `cd kinship-app && npm run build`
Expected: Build completes with no errors.

**Step 2: Final commit if needed, then verify**

Run: `cd kinship-app && npm run build:gh-pages`
Expected: GitHub Pages build completes with no errors.
