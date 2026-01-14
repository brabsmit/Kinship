import re

# Mock the function logic
def get_hero_image_logic(loc, y):
    loc = loc.lower()

    # Helper to check for state boundary
    def is_state(text, states):
        regex = r'\b(' + '|'.join(states) + r')\b'
        return bool(re.search(regex, text, re.IGNORECASE))

    # West Coast & Gold Rush (1840-1880)

    # San Francisco Early Days
    if (("san francisco" in loc or "yerba buena" in loc) and y < 1860):
        return "sf_1848"

    # Gold Rush Context
    if (is_state(loc, ["california", "ca", "calif"]) and y >= 1848 and y < 1855):
        return "gold_rush_scene"

    # General West
    is_west = is_state(loc, ["california", "ca", "calif", "oregon", "or", "utah", "ut", "utah territory", "oregon territory"])
    is_wa = is_state(loc, ["washington", "wa"]) and not ("d.c." in loc or "dc" in loc)

    if ((is_west or is_wa) and y >= 1840 and y < 1880):
        return "west_map_1850"

    return "other"

# Test Cases
test_cases = [
    ("San Francisco, CA", 1849, "sf_1848"),
    ("Sacramento, California", 1850, "gold_rush_scene"),
    ("Portland, Oregon", 1860, "west_map_1850"),
    ("Seattle, WA", 1870, "west_map_1850"),
    ("Salt Lake City, UT", 1855, "west_map_1850"),
    # Negative Cases
    ("Washington, D.C.", 1860, "other"),
    ("Washington DC", 1860, "other"),
    ("Cambridge, MA", 1860, "other"),
    ("Canton, OH", 1860, "other"),
    ("Utica, NY", 1860, "other"),
    ("Orlando, FL", 1860, "other"),
    ("New Orleans, LA", 1860, "other"),
    ("Orange, NJ", 1860, "other")
]

print("Running Logic Tests...")
failed = False
for loc, year, expected in test_cases:
    result = get_hero_image_logic(loc, year)
    if result != expected:
        print(f"FAILED: {loc} ({year}) -> Got {result}, Expected {expected}")
        failed = True
    else:
        print(f"PASSED: {loc} ({year}) -> {result}")

if not failed:
    print("\nAll logic tests passed!")
else:
    print("\nSome tests failed.")
    exit(1)
