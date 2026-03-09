
import json
import re

# Simulate the frontend logic
def verify_logic():
    try:
        with open('kinship-app/src/family_data.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("family_data.json not found, cannot verify with real data.")
        return

    print(f"Loaded {len(data)} profiles.")

    centenarians = []
    large_families = []
    young_parents = []

    for person in data:
        # Extract born year
        born_date = person.get('vital_stats', {}).get('born_date')
        died_date = person.get('vital_stats', {}).get('died_date')

        born_year = int(re.search(r'\d{4}', born_date).group(0)) if born_date and re.search(r'\d{4}', born_date) else 0
        died_year = int(re.search(r'\d{4}', died_date).group(0)) if died_date and re.search(r'\d{4}', died_date) else 0

        # 1. Centenarians
        if born_year and died_year and died_year > born_year:
            age = died_year - born_year
            if age > 90:
                centenarians.append({'name': person['name'], 'age': age})

        # 2. Large Families
        children = []
        relations = person.get('relations', {})
        if relations and 'children' in relations:
            children = relations['children']
        else:
            person_id = str(person['id'])
            for other in data:
                other_id = str(other['id'])
                if other_id.startswith(person_id + '.') and len(other_id.split('.')) == len(person_id.split('.')) + 1:
                    children.append(other_id)

        if len(children) >= 10:
            large_families.append({'name': person['name'], 'count': len(children)})

        # 3. Young Parents
        if born_year and len(children) > 0:
            earliest_child_year = 9999
            valid_child = False

            # Find children objects
            children_objs = [p for p in data if str(p['id']) in children] # Simplification using ID matching

            for child in children_objs:
                c_date = child.get('vital_stats', {}).get('born_date')
                c_year = int(re.search(r'\d{4}', c_date).group(0)) if c_date and re.search(r'\d{4}', c_date) else 0
                if c_year > 0 and c_year < earliest_child_year:
                    earliest_child_year = c_year
                    valid_child = True

            if valid_child:
                age_at_first_child = earliest_child_year - born_year
                if 10 < age_at_first_child < 18:
                    young_parents.append({'name': person['name'], 'age': age_at_first_child})

    # Sort
    centenarians.sort(key=lambda x: x['age'], reverse=True)
    large_families.sort(key=lambda x: x['count'], reverse=True)
    young_parents.sort(key=lambda x: x['age'])

    print("\n--- Centenarians (Top 3) ---")
    for c in centenarians[:3]:
        print(f"{c['name']}: {c['age']}")

    print("\n--- Large Families (Top 5) ---")
    for f in large_families[:5]:
        print(f"{f['name']}: {f['count']} children")

    print("\n--- Young Parents (Top 5) ---")
    for p in young_parents[:5]:
        print(f"{p['name']}: {p['age']} years old")

if __name__ == "__main__":
    verify_logic()
