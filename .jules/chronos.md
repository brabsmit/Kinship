## 2024-05-22 - Date Parsing Anomalies

**Observation:**
- `split_date_location` was naively splitting by comma, causing locations like "E. Greenwich" (no digits) to be treated as Dates if they lacked a comma, or "Derby, CT" to be split into Date="Derby", Loc="CT" if they had one but no year.
- Locations without years (e.g. "New York") were sometimes remaining in `died_date` because the heuristic `any(char.isdigit())` failed for pure text, but the fallback behavior wasn't clean.
- "possibly" and "Unknown date" were appearing in Date fields.

**Action:**
- Refined `split_date_location` to:
    1. Respect ` in ` as a primary separator.
    2. Use Regex to find the *last* 4-digit year to handle ranges (`1750-1752`).
    3. Use the year's end position to split Date/Location safely (checking if the following text looks like a location).
    4. Fallback: If no year, check for keywords ("unknown", "?") or digits. If neither, assume it's a Location (e.g. "New York").
- Updated `_normalize_date` to explicitly handle "unknown", "?", "uncertain" and return `None`.
- Verified that "c. 1660", "bef 1790", "aft 1750" are correctly parsed to integers.
