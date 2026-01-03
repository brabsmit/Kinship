import json
import random

# Load data
with open('kinship-app/src/family_data.json', 'r') as f:
    data = json.load(f)

# Inject sample voyage
found = False
for p in data:
    if "Hector" in p['story']['notes'] or "Greenock" in p['story']['notes']:
         # This person likely has it, but if pipeline extracted it, it should be there.
         # If not, we force one for demo.
         if not p['story'].get('voyages'):
             p['story']['voyages'] = [{
                 "ship_name": "The Hector",
                 "type": "Brig",
                 "year": "1773",
                 "departure": "Greenock, Scotland",
                 "arrival": "Pictou, Nova Scotia",
                 "class": "Passenger"
             }]
             print(f"Injected voyage into {p['name']} ({p['id']})")
             found = True
             break

if not found:
    # Pick a random person to inject
    p = data[0]
    p['story']['voyages'] = [{
         "ship_name": "The Hector",
         "type": "Brig",
         "year": "1773",
         "departure": "Greenock, Scotland",
         "arrival": "Pictou, Nova Scotia",
         "class": "Passenger"
    }]
    print(f"Injected voyage into random person {p['name']} ({p['id']})")

with open('kinship-app/src/family_data.json', 'w') as f:
    json.dump(data, f, indent=4)
