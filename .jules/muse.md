## 2024-05-31 - Visual Asset Validation & Enhancements
**Source:** Wikimedia Commons (Public Domain)
**Logic:**
- **URL Stabilization:** Replaced multiple unstable `1280px` thumbnail URLs with `1024px` versions to prevent 429/404 errors.
- **Broken Asset Fixes:**
    - `england_countryside`: Replaced "Albury House" (404) with *Albury with tree-stump in foreground* (Wenceslaus Hollar).
    - `ne_map_1634`: Switched to a stable direct URL for William Wood's *New England's Prospect* map.
    - `long_island_1686`: Switched to a validated 1024px thumbnail.
- **Enhanced Mapping Logic:**
    - **Plymouth Colony:** Explicitly prioritized *Pilgrims Going to Church* for 1620-1660 settlements.
    - **Colonial Fallbacks:** Ensured `ne_map_1634` covers broader New England queries in the 17th century if specific town maps are missing.

**Status:**
- All `ASSETS` entries now use high-availability Wikimedia Commons URLs.
- Thumbnails capped at `1024px` for optimal performance/reliability.
