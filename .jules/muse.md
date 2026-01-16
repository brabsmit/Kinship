## 2024-03-24 - [Northeast Visual Pack]
**Source:** Wikipedia Commons
**Logic:**
- **NYC (1800-1900):** Mapped to `ny_1800` (Bird's Eye View 1873) to capture the 19th-century urban explosion. Moved from fallback to "Special Override" to enforce this style over generic Wikimedia results.
- **New England (1600-1700):** Mapped to `ne_map_1634` (William Wood's Map) for profiles born in the first century of settlement.
- **Connecticut (1700-1800):** Mapped to `ct_1700` (Colony Plan 1766) to distinguish from earlier settlement and later industrial eras.
- **England (Pre-1650):** Expanded `england_countryside` logic to reliably catch "England" in location strings, fixing a bug where only exact matches worked.
