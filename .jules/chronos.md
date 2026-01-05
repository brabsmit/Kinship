## 2024-05-23 - Logic Anomaly
**Observation:** Found profile 'John Knight' (12.2.1.2.2.1.1) with Born Year 1631 and Died Year 1614.
**Action:** Identified as source data error. No code fix possible without guessing. Preserved as is for human review.

## 2024-05-23 - Format Anomaly
**Observation:** Found 'Uncertain' as a date string for 'Emma Carter Potter'.
**Action:** Handled by returning None (null) in integer field, correct behavior.

## 2024-05-23 - Regex Logic Enhancement
**Observation:** Standard "between" dates were defaulting to the first found year, but "bet." abbreviations were not handled.
**Action:** Updated regex to explicitly catch `bet.` and `between` to ensure 1770 is captured from "between 1770 and 1780" with clear intent. Added comprehensive comments.
