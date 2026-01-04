## 2024-05-24 - Logic Fail in 'Before' Date Parsing

**Observation:**
Found a profile "Hannah Carman van Wyck" with death date "6/9/1760, Eastwood, NY; not clear what is meant by...".
The pipeline extracted `1760` as the year.
However, because the date string contained "by" (in "...not clear what is meant by..."), the regex `\b(bef|before|by)\b` matched.
The current logic subtracts 1 year for "bef/by", so it *should* have returned 1759 if it was strictly following that logic for the *year*.
Wait, the anomaly log says: `LOGIC FAIL (BEF): ... -> 1760 (Expected 1759)`.
This means the pipeline *returned* 1760.
Why did it return 1760 instead of 1759?
Ah, looking at `_normalize_date` code:
```python
        # Look at the text *before* the year for modifiers
        pre_text = s[:start_index]
        if re.search(r'\b(bef\.?|before|by)\b', pre_text):
             return year_val - 1
```
It only looks at `pre_text` (text *before* the year).
The string is: "6/9/1760, Eastwood, NY; not clear what is meant by..."
The year is 1760.
`pre_text` is "6/9/".
"by" is in the *suffix*, after the year.
So the code correctly ignored the "by" that appears later in the sentence.
My debug script found "by" in `lower` (the whole string) and flagged it as a potential logic fail because it expected the code to handle "by".
BUT, the code correctly *avoided* handling "by" because it was after the date.

**Action:**
This is actually a **FALSE POSITIVE** in my anomaly scanner, but it reveals a potential risk.
If the text was "By 1760, she was dead", `pre_text` would contain "By " and it would subtract 1.
In this specific case, the date is precise "6/9/1760".
The code `_normalize_date` checks for 4-digit year.
If I have "6/9/1760", `year_match` finds 1760. `pre_text` is "6/9/".
It correctly returns 1760.

However, I did notice the Dual Date issue in the previous scan (before I filtered them out).
`William Earl Dodge, Sr. - born: '9/4/1805'` -> 1805.
This is treated as a dual date by my scanner because of `/`, but it's just a standard date.

Real issue to fix:
I want to ensure "1774/5" becomes 1774.
Current code:
```python
        # 4. Handle dual dating like "1774/5" or ranges "1774-1778"
        # The regex picks the first year found...
```
This seems correct.

But what about "aft. 1750"?
If I have "Died: aft 1750".
`year_match` finds 1750.
`pre_text` is "died: aft ".
Regex `r'\b(aft\.?|after)\b'` matches "aft".
Returns 1751.

I need to make sure I am finding *real* messy dates that are failing.
My scanner is currently too aggressive or the data is actually cleaner than I thought.

Let's look at the `family_data.json` content for a specific messy example to verify.
I will read `kinship-app/src/family_data.json` and look for "Hannah Carman".
