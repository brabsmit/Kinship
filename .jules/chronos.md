## 2024-05-21 - Initial Scan
**Observation:** Scanning `family_data.json` reveals 475 profiles with "Unknown" dates out of roughly 2500.
Some "Unknown" dates might be recoverable.
Found date formats like:
- "1/10/1654/5" (Double dating)
- "bef 1750"
- "1692, probably Sudbury..."
- "1736 or 1788" (Wide ambiguity)

**Action:**
- Validated that `_normalize_date` handles "bef", "aft", and double dating correctly by picking the first year or modifying it.
- Will verify if `split_date_location` correctly separates complex date/location strings to ensure `_normalize_date` gets the right input.
