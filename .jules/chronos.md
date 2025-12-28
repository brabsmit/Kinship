# CHRONOS JOURNAL - ANOMALY LOG

## 2024-05-23 - Initial Scan

**Observation:** `born_date` and `died_date` fields contain a mix of formats:
- Standard US format: "9/4/1805"
- Circa: "c. 1806", "c. 1696"
- Year only: "1776"
- Uncertainty/Alternatives: "2/7/1825 or 2/27/1828", "1736 or 1788 (uncertain)"
- Ranges: "1763 - 1785"
- Relative: "before 1790", "after 1/29/1644"
- Dual dating: "1640/41"
- Text clutter: "1635 on \"Marygould\"...", "In GMD (1640)"
- Unknowns: "Unknown", "Disappeared"

**Action:** Will implement `_normalize_date` in `genealogy_pipeline.py` to extract the best possible integer year.
- "c. 1774" -> 1774
- "1774/5" -> 1774
- "aft 1750" -> 1751
- "bef 1800" -> 1799
- "1825 or 1828" -> 1825
- "1635 on ..." -> 1635
