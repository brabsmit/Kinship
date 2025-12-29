# Source Specification: GENEALOGY DSD Paternal Ancestry.docx

This document defines the schema, structure, and parsing rules for the `GENEALOGY DSD Paternal Ancestry.docx` source file. It serves as the contract for the Data Hygienist and the parsing pipeline.

## 1. Document Structure

The document is a structured Word document containing genealogical data organized by generation headers.

### Header Hierarchy
Generations are demarcated by bold, capitalized headers using Roman numerals.
*   **Format:** `GENERATION [Roman Numeral]: [Title]`
*   **Examples:**
    *   `GENERATION I: PARENTS - FATHER`
    *   `GENERATION II: GRANDPARENTS`
    *   `GENERATION XII: TEN GREAT GRANDPARENTS`

### Profile Block
Each individual entry follows a consistent block pattern, though early generations (I-III) may lack explicit IDs.

**Pattern:**
```text
[Name] {ID}
Born: [Date], [Location]
Married: [Date] to [Spouse Name] in [Location]
Died: [Date], [Location]
Buried: [Location]
NOTES: [Narrative text...]
```

**Example:**
```text
William Earl Dodge, Sr. {1}
Born:  9/4/1805, Hartford, CT
Married:  6/24/1828 to Melissa Phelps
Died:  2/9/1883, Manhattan, NY
Buried:  Woodlawn Cemetery, Bronx, NY
NOTES: From Phyllis Dodge: Said to have run away to sea...
```

### ID Logic
The document uses a **Reverse Lineage Path** system (customized decimal system) to track ancestry.

*   **Root IDs:** The "Probands" or key ancestors in Generation IV are assigned integer IDs (e.g., `{1}`, `{2}`, `{5}`).
*   **Ancestral IDs:** Ancestors are identified by appending `.1` (Father) or `.2` (Mother) to the child's ID.
    *   **Example:**
        *   `{1}`: William Earl Dodge, Sr.
        *   `{1.1}`: Father of William
        *   `{1.2}`: Mother of William
        *   `{1.1.1}`: Paternal Grandfather of William
*   **Spousal Inference:** Spouses are inferred by the last digit.
    *   An ID ending in `.1` (Male) is the spouse of the corresponding `.2` (Female) sharing the same prefix.
    *   Example: `{1.1.2.1}` is the spouse of `{1.1.2.2}`.

## 2. Field Formats

### Dates
*   **Standard:** `MM/DD/YYYY` (e.g., `9/4/1805`)
*   **Year Only:** `YYYY` (e.g., `1829`)
*   **Approximate:** `c. YYYY` (e.g., `c. 1835`)
*   **Relative:** `bef. YYYY`, `aft. YYYY` (e.g., `bef. 1750`)

### Locations
*   **Standard:** `City, State` (e.g., `Hartford, CT`)
*   **With Notes:** `City, State (Note)` (e.g., `Manhattan, NY (12 Beekman St.)`)
    *   *Parsing Rule:* The text inside the final parentheses should be extracted as a `location_note`.
*   **Separators:**
    *   Comma: `City, State`
    *   Preposition: `City in State` or `Date in Location` (e.g., `1829 in Newburgh, NY`)

### Marriage Field
*   **Standard:** `Married: [Date] to [Spouse]`
*   **With Location:** `Married: [Date] to [Spouse] in [Location]`
*   **Multiple Marriages:** `Married: (1) [Date] to [Spouse]; (2) [Date] to [Spouse]`
    *   *Current Anomaly:* The pipeline may need adjustment to fully parse multiple marriages structured this way.

## 3. Anomalies & Deviations

1.  **Missing IDs (Generations I-III):**
    *   Profiles in the first three generations (e.g., `Bayard Dodge`, `Cleveland Hoadley Dodge`) often lack `{ID}` tags in the text.
    *   *Implication:* These profiles may be skipped by ID-based regex parsers or require manual ID assignment/inference.

2.  **Typographical Errors:**
    *   Example: `Married: 10/11/1883 in to Grace` (Extra "in").

3.  **Inconsistent Spousal Listings:**
    *   Wives are sometimes listed immediately after husbands without a full profile block or distinct `{ID}` in the earlier generations.

4.  **Unknowns:**
    *   Placeholders like `(UNKNOWN)` or `?` appear in names and locations.
