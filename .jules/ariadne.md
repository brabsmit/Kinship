## 2024-05-24 - The Weaving of Threads
**Discovery:** Found that many "Child" entries in the genealogy text were actually duplicates of full profiles defined elsewhere. For example, "Thomas Powell" appeared as a child entry multiple times but also as a main profile.
**Action:** Implemented logic to prioritize "Real" profiles over "Child" entries (`_c` IDs) when resolving ambiguous names. This reduced ambiguous name logs from 273 to 58.

**Discovery:** Relationships in text were often one-sided. If "John Skinner" mentioned "Deacon Joseph Olmstead" as a cousin, Joseph didn't know about John.
**Action:** Implemented a "Stitching" phase to create symmetrical reverse links (e.g., "Cousin" -> "Cousin", "Mentioned" -> "Mentioned by"). Added 392 reverse connections.

**Discovery:** Significant clustering around "Reverend Samuel Blatchford" (14 mentions) and "Solomon Bliss" (13 mentions), indicating they were central figures in the family narrative.

## 2026-01-04 - Automated Link Analysis
**Discovery:** Analyzed narrative text and found 420 potential connections.
**Ambiguity Report:** 58 ambiguous references found (e.g., Thomas Powell, Reverend Timothy Woodbridge, John Post).
**Cluster Alert:** High frequency mentions detected for: Reverend Samuel Blatchford (14), Solomon Bliss (13), Reverend John Blatchford (12).
**Action:** Systematic text scanning and cross-linking applied.

## 2026-01-13 - Automated Link Analysis
**Discovery:** Analyzed narrative text and found 420 potential connections.
**Ambiguity Report:** 58 ambiguous references found (e.g., Thomas Powell, Reverend Timothy Woodbridge, John Post).
**Cluster Alert:** High frequency mentions detected for: Reverend Samuel Blatchford (14), Solomon Bliss (13), Reverend John Blatchford (12).
**Action:** Systematic text scanning and cross-linking applied.
