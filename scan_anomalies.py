import json
import re

def scan_anomalies():
    with open("kinship-app/src/family_data.json", "r") as f:
        data = json.load(f)

    unique_dates = {}
    unknown_count = 0

    for p in data:
        stats = p.get("vital_stats", {})
        b_date = stats.get("born_date", "Unknown")
        d_date = stats.get("died_date", "Unknown")

        if b_date == "Unknown": unknown_count += 1
        else: unique_dates[b_date] = stats.get("born_year_int")

        if d_date == "Unknown": unknown_count += 1
        else: unique_dates[d_date] = stats.get("died_year_int")

    print(f"Total 'Unknown' dates: {unknown_count}")
    print(f"Total Unique Date Strings: {len(unique_dates)}")

    # Filter for interesting ones
    # exclude simple "YYYY" or "M/D/YYYY"
    interesting = []
    for d, i in unique_dates.items():
        if not re.match(r'^\d{4}$', d) and not re.match(r'^\d{1,2}/\d{1,2}/\d{4}$', d):
            interesting.append((d, i))

    print(f"Interesting Date Formats found: {len(interesting)}")
    for d, i in sorted(interesting, key=lambda x: x[0])[:50]:
        print(f"  '{d}' -> {i}")

if __name__ == "__main__":
    scan_anomalies()
