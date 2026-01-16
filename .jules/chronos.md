## 2024-05-23 - Date/Location Parsing Leaks
**Observation:** found 12 profiles where `born_location` is "Unknown" because the location text remained attached to `born_date` (e.g., "before 11/14/1621, St. Albans, Hertfordshire, England").
**Action:** Improved `split_date_location` to handle comma-separated location suffixes that `dateparser` fails to separate, especially when preceded by modifiers like "before" or dates with slashes.
