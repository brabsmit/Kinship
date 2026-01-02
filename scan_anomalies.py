import json
import re

def scan_data():
    try:
        with open("kinship-app/src/family_data.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("family_data.json not found")
        return

    anomalies = []
    formats = set()

    total = len(data)
    missing_int_count = 0

    print(f"Scanning {total} records...")

    for p in data:
        vs = p.get("vital_stats", {})

        # Check Born
        b_date = vs.get("born_date", "Unknown")
        b_int = vs.get("born_year_int")

        if b_date != "Unknown" and b_int is None:
            anomalies.append(f"ID {p['id']}: Born '{b_date}' -> Int None")
            formats.add(b_date)
            missing_int_count += 1

        # Check Died
        d_date = vs.get("died_date", "Unknown")
        d_int = vs.get("died_year_int")

        if d_date != "Unknown" and d_int is None:
            anomalies.append(f"ID {p['id']}: Died '{d_date}' -> Int None")
            formats.add(d_date)
            missing_int_count += 1

    print(f"Found {missing_int_count} fields with date strings but missing integer years.")
    print("\n--- Unique Unparsed Formats ---")
    for f in sorted(list(formats))[:50]:
        print(f)

    print("\n--- Sample Anomalies ---")
    for a in anomalies[:20]:
        print(a)

if __name__ == "__main__":
    scan_data()
