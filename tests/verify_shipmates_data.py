
import json
import os

def verify_shipmates():
    print("--- Verifying Shipmates Data ---")

    file_path = "kinship-app/src/family_data.json"
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    shipmates_found = 0
    profiles_with_shipmates = 0

    for p in data:
        if "story" in p and "voyages" in p["story"]:
            for v in p["story"]["voyages"]:
                if "shipmates" in v:
                    shipmates_count = len(v["shipmates"])
                    ship_name = v.get("ship_name", "Unknown")
                    print(f"Profile {p['id']} ({p['name']}) has {shipmates_count} shipmates on '{ship_name}':")
                    for mate in v["shipmates"]:
                        print(f"  - {mate['name']} ({mate['id']})")

                    shipmates_found += shipmates_count
                    profiles_with_shipmates += 1

    print("-" * 30)
    print(f"Total profiles with shipmates: {profiles_with_shipmates}")
    print(f"Total shipmate connections found: {shipmates_found}")

    if profiles_with_shipmates > 0:
        print("SUCCESS: Shipmates data populated.")
    else:
        print("WARNING: No shipmates found. This might be correct if no ships are shared, or a bug.")

if __name__ == "__main__":
    verify_shipmates()
