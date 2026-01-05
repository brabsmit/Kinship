## 2024-05-30 - East Anglia & Long Island Pack
**Source:** Wikimedia Commons (Public Domain)
**Logic:**
- **East Anglia (Norfolk/Essex/Suffolk):** Mapped to *A Mapp of ye County of Norfolk* (Speed/Hollar, 1670). This provides a specific regional identity for the large cluster of ancestors from Norwich, Dedham, and Hingham, England, distinguishing them from the generic "UK" map.
- **Long Island (Colonial):** Mapped to *Map of Long Island (1686)*. This captures the unique Dutch/English colonial interface for the Oyster Bay and Hempstead clusters (1650-1750), which previously fell back to generic New England maps.
- **Norwich, CT:** Explicitly routed to *Puritan Life* (Boughton) for early settlement (<1700) and *Plan of the Colony of Connecticut* (1766) for the 18th century.

**Assets Added:**
- `norfolk_map_1610`: A Mapp of ye County of Norfolk (John Speed/Wenceslaus Hollar)
- `long_island_1686`: Map of Long Island (1686)

## 2024-05-30 - Virginia, Pennsylvania & Industrial Pack
**Source:** Wikimedia Commons (Public Domain)
**Logic:**
- **Virginia (17th Century):** Mapped to *Adventures of Captain John Smith in Virginia (1624)*. Essential for the Jamestown/Virginia settlers.
- **Pennsylvania (Colonial):** Mapped to *Thomas Holme's Map of Pennsylvania (1687)*. Perfect for Quaker ancestors and early PA settlers, showing original land grants.
- **Industrial Era (Mill Towns):** Mapped to *Bird's Eye View of Lowell, MA (1876)*. Applied to profiles born 1820-1920 in key industrial cities (Lowell, Lawrence, Pittsburgh, etc.) to replace generic antique backgrounds with period-appropriate industrialization imagery.

**Assets Added:**
- `va_smith_1612`: Adventures of Captain John Smith in Virginia (1624)
- `pa_holme_1687`: Thomas Holme's Map of Pennsylvania (1687)
- `industrial_19th`: Bird's Eye View of Lowell, Massachusetts (1876)

## 2024-05-31 - Colonial & Frontier Visual Pack
**Theme:** Filling the gaps in Colonial New England and the Westward Expansion.
**Objective:** Provide visual context for ancestors in NJ, RI, Northern New England, and the Midwest (OH, MI, IL).

**Sources:**
- All assets are sourced from Wikimedia Commons (Public Domain / Creative Commons).
- Maps are primarily from the Library of Congress collection via Wikimedia.

**New Assets:**
1.  **New Jersey (1777):** *The Province of New Jersey, divided into East and West (Faden).*
    -   *Logic:* Use for any NJ birth/death prior to 1850.
2.  **Rhode Island (1814):** *Carey's Map of Rhode Island.*
    -   *Logic:* Use for RI events.
3.  **New Hampshire (1796):** *Greenleaf Map of New Hampshire.*
    -   *Logic:* Use for NH and VT (Northern NE context).
4.  **Ohio (1804):** *Map of Ohio (Early Statehood).*
    -   *Logic:* Visual anchor for the "Westward Pioneers" thread in the Midwest.
5.  **Michigan (1831):** *Burr Map of Michigan.*
    -   *Logic:* For ancestors moving into the Michigan Territory.
6.  **Illinois (1818):** *Melish Map of Illinois.*
    -   *Logic:* For early Illinois settlers.

**Visual Philosophy:**
-   **Sepia Tone:** All maps are treated with `sepia(20%)` to maintain visual consistency with the existing "Antique Paper" theme.
-   **Fallback:** Profiles in specific towns (e.g., "Englewood, NJ") will now gracefully degrade to the State Map instead of the generic texture.

## 2024-06-01 - Muse's Visual Context Pack
**Theme:** "The Empty State" Solution
**Objective:** Eliminate text-only profiles by enforcing period-accurate visual fallbacks for every major region and era in the dataset.

**Logic & Refinements:**
1.  **New England (1600-1700):** refined logic to distinguish between "Settlers" (Engraving) and "Geography" (Map).
    -   *Plymouth / Early Settlers:* Now prioritizes *Pilgrims Going to Church* (Boughton) to emphasize the human element of the Great Migration.
    -   *Boston / Mass Bay:* Falls back to *Southern New England in 1634* or *Bonner's Map of Boston (1722)*.
2.  **Connecticut (1700-1800):** Enforced *Map of the Colony of Connecticut (1766)* for all CT towns (including Norwich) to ensure a consistent colonial aesthetic.
3.  **New York (19th Century):** Standardized on *Bird's Eye View of NYC (1873)* for the 1800s urban explosion.
4.  **Pre-1650 England:** Solidified the use of *English Countryside (Hollar)* for rural locations (Devon, Somerset) and *Visscher's London* for the capital.

**Philosophy:** "A profile without an image is a book without a cover."
