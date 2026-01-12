# Chronos Journal - Anomaly Log

## 2024-05-22 - Initial Scan
**Observation:** Starting the scan for messy date data in `family_data.json`.
**Action:** Will inspect the file and log specific findings.

## 2024-05-22 - Pipeline Fix: Greedy Date Extraction
**Observation:** Many records had location information mixed into the date field (e.g., `'1/16/1737, Warren, MA (Worcester at the time, Warren recognized 1741'`). This was caused by `split_date_location` greedily capturing everything between the first and last detected year.
**Action:** Refined `split_date_location` in `genealogy_pipeline.py`.
- Added logic to inspect the text *between* multiple date candidates.
- If the "gap" contains words that are not connectors (like "or", "between"), the extraction stops at the first date.
- This successfully cleaned up cases like `'1/16/1737, Warren, MA...'` which now parses as just `'1/16/1737'`.
- Also handled `/5` suffixes in "1654/5" explicitly.

**Observation:** Stubborn cases remain where `dateparser` likely fails or finds digits in location text.
- `'110/7/1668, New Haven, CT'`: Likely a typo in source "110" which dateparser rejects, falling back to returning the whole string.
- `'1/17/1693, MA'`: The comma wasn't sufficient to split? Or maybe "MA" was seen as part of date?
- `'1603, St'`: Likely "1603, St. ...". "St" might be seen as "September"? No, `St` is Saint. `dateparser` might be skipping it?

**Action:** The major structural contamination (long notes in date fields) is significantly reduced. Remaining issues are mostly specific source data ambiguities or typos.
