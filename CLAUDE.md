# Kinship Chronicles

A digital genealogy application that transforms Word document research into an interactive family history explorer. Built for the Dodge/Smith extended family. Deployed to GitHub Pages.

**Live site:** https://brabsmit.github.io/Kinship/

## Tech Stack

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 3.4 + ReactFlow + React-Leaflet
- **Icons:** lucide-react
- **Fonts:** Playfair Display (headings), Merriweather (body)
- **AI:** Google Gemini API for research suggestions
- **Data Pipeline:** Python (python-docx, google-genai, dateparser, requests)
- **Deployment:** GitHub Actions → GitHub Pages (HashRouter for compatibility)

## Project Structure

```
Kinship/
├── kinship-app/              # React application
│   ├── src/
│   │   ├── App.jsx           # Main component (monolith — all views, state, routing)
│   │   ├── components/       # 14 feature components
│   │   ├── context/          # AuthContext (session-based auth)
│   │   ├── services/         # aiReasoning.js (Gemini API integration)
│   │   ├── utils/            # Helpers (urlSync, economics, geo, assetMapper)
│   │   ├── family_data.json  # Generated — all genealogy profiles (~5.2MB)
│   │   ├── history_data.json # Generated — historical events for context
│   │   ├── hitlist_data.json # Generated — AI-flagged research gaps
│   │   ├── ship_cache.json   # Cached ship specifications from Gemini
│   │   └── wikimedia_cache.json # Cached Wikimedia Commons image URLs
│   └── vite.config.js        # Dev server, CORS proxy, security headers
├── scripts/                  # Pipeline and data generation
│   ├── genealogy_pipeline.py # Main ETL: Word docs → JSON
│   ├── fetch_history.py      # Wikidata SPARQL → history_data.json
│   └── generate_hitlist.py   # Data quality scoring → hitlist_data.json
├── tests/                    # Verification and test scripts
├── docs/                     # Specifications and plans
│   └── source_specification.md  # Word document schema reference
└── *.md                      # User guide, deployment, mobile, print docs
```

## Data Flow

```
Word Documents (source of truth)
  → scripts/genealogy_pipeline.py (parse, geocode, enrich, tag)
    → family_data.json + history_data.json + hitlist_data.json
      → React app (read-only viewer)
        → GitHub Pages (public deployment)
```

The Word documents are maintained by the family researcher and remain the authoritative source. The app is a read-only viewer.

## Common Commands

```bash
# Frontend development
cd kinship-app
npm install
npm run dev              # Dev server on port 4000

# Production build
npm run build            # Output to dist/

# GitHub Pages build
npm run build:gh-pages   # Sets VITE_BASE_PATH=/Kinship/

# Data pipeline (from repo root)
python scripts/genealogy_pipeline.py    # Regenerate family_data.json
python scripts/fetch_history.py         # Regenerate history_data.json
python scripts/generate_hitlist.py      # Regenerate hitlist_data.json
```

## Environment Variables

```
VITE_GEMINI_API_KEY=...    # Google Gemini API key (domain-restricted)
VITE_USER_PASSWORD=...     # Simple password for AI features
VITE_BASE_PATH=/Kinship/   # Set for GitHub Pages deployment
```

## Conventions

- **Components:** Functional React components only, no class components
- **Styling:** Tailwind CSS utility classes. Vintage/parchment aesthetic with sepia tones
- **Icons:** Always use lucide-react — no other icon libraries
- **State:** useState + useContext (AuthContext). No Redux/Zustand. URL params synced via urlSync.js
- **Data:** Static JSON imports — no REST API, no database
- **Routing:** HashRouter with react-router-dom (required for GitHub Pages)
- **Error handling:** Try-catch with graceful fallbacks; deterministic fallbacks when AI unavailable

## View Modes

The app has 6 view modes, all rendered in App.jsx:

1. **List View** (default) — sortable table of all ancestors
2. **Graph View** — ReactFlow interactive family tree with dagre layout
3. **Fleet View** — ocean voyage visualization with ship specs
4. **Narrative Threads** — 10 curated historical narratives (Mayflower, Salem, Patriots, etc.)
5. **Hitlist** — AI-flagged research priorities with recommendations
6. **Outliers Dashboard** — statistical superlatives (centenarians, large families)

## Key Architectural Notes

- **App.jsx is monolithic (2,437 lines)** — contains all view rendering, 20+ useState calls, and business logic. Decomposition is tracked in issue #172.
- **family_data.json (5.2MB)** is bundled in the JS — imported directly in App.jsx. Moving to public/ is tracked in issue #173.
- **Hierarchical IDs** — Person IDs like "1.2.3.1" reflect family tree structure (parent path)
- **Wikimedia images** — 150+ historical locations mapped to Commons images via assetMapper.js
- **Gemini CORS** — Vite dev server proxies `/google-ai` to the Gemini API endpoint

## What NOT to Do

- Do not add TypeScript — not planned for this project
- Do not add a test framework — not justified for a read-only family viewer
- Do not add a backend/database — Word docs are the source of truth
- Do not change the HashRouter to BrowserRouter — GitHub Pages requires hash routing
- Do not commit `.env` files or API keys
