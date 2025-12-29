# ARIADNE'S JOURNAL - CONNECTION LOG
## 2024-05-22 - Ambiguous Links
**Discovery:** "Sarah Dodge" is a common name mapping to multiple IDs (1.2, 5.1.2.2).
**Action:** Filtered out ambiguous name mappings from the index to prevent incorrect linking.

## 2024-05-24 - Performance Optimization
**Discovery:** The initial implementation of `_find_mentions` was iterating over thousands of names for every clause in every profile note, causing severe performance bottlenecks and timeouts.
**Action:** Refactored the search logic to:
1. Extract potential name candidates (capitalized word sequences) from the text using regex.
2. Intersect these candidates with a set of known unique names (O(1) lookup).
3. Only perform expensive context and keyword checks for the handful of valid candidates found in each note.
This drastically reduced the complexity from O(Profiles * Clauses * Names) to O(Profiles * Candidates).
