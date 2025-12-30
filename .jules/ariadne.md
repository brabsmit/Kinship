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

## 2024-05-24 - The Web Grows
**Discovery:** Found 327 text-based connections. Identified key clusters around "Reverend Samuel Blatchford" (14 mentions) and "Jacob Parish" (10 mentions).
**Action:** Implemented enhanced `_find_mentions` logic with expanded keywords (Classmate, Tutor, Rival) and improved name normalization.
**Ambiguity Report:** Several names mapped to multiple IDs and were excluded to prevent false links:
- William Sr. (3 IDs)
- William Earl Dodge (2 IDs)
- David Jr. (2 IDs)
- David Hoadley (2 IDs)
- Daniel Parish (2 IDs)
