## 2024-10-18 - Dual Dating Standards
**Observation:** Found 601 records using slash notation (e.g., "1774/5" or "1/2/1700"). This indicates Old Style/New Style dating or ambiguous source records.
**Action:** Validated that normalization logic defaults to the first year (Start Date) per standard historical convention. Confirmed "Before/After" logic shifts the year by 1.

## 2024-10-18 - Date Normalization Logic Refinement
**Observation:** Current "living in" logic requires the preposition "in".
**Action:** broadened regex to catch "living" or "fl." without "in" to capture more activity dates. Tightened fallback parsing to prevent modern-year guessing for incomplete dates.
