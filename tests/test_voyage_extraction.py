import unittest
import re

def extract_voyages(text):
    voyages = []
    if not text: return voyages, text

    # Pattern 1: Explicit Tag
    # [Ship: Name | Type: X | Year: Y | Departure: A | Arrival: B]
    tag_pattern = r'\[Ship:\s*([^\]]+)\]'

    def replace_tag(match):
        content = match.group(1)
        parts = [p.strip() for p in content.split('|')]

        voyage = {
            "ship_name": parts[0],
            "type": "Unknown",
            "year": "Unknown",
            "departure": "Unknown",
            "arrival": "Unknown",
            "class": "Passenger"
        }

        for part in parts[1:]:
            if ":" in part:
                k, v = part.split(":", 1)
                k = k.strip().lower()
                v = v.strip()
                if k == "type": voyage["type"] = v
                elif k == "year": voyage["year"] = v
                elif k == "departure": voyage["departure"] = v
                elif k == "arrival": voyage["arrival"] = v
                elif k == "class": voyage["class"] = v

        voyages.append(voyage)
        return "" # Remove tag

    new_text = re.sub(tag_pattern, replace_tag, text, flags=re.IGNORECASE)

    # Pattern 2: Natural Language
    nl_pattern = r'(?:arrived|sailed|came) on the ([A-Z][a-z]+(?: [A-Z][a-z]+)*)'
    matches = re.finditer(nl_pattern, new_text)
    for m in matches:
        ship_name = m.group(1)
        if not any(v['ship_name'] == ship_name for v in voyages):
             voyages.append({
                "ship_name": ship_name,
                "type": "Unknown",
                "year": "Unknown",
                "departure": "Unknown",
                "arrival": "Unknown",
                "class": "Passenger"
            })

    # Cleanup extra spaces left by removal
    new_text = re.sub(r'\s{2,}', ' ', new_text).strip()
    return voyages, new_text

class TestVoyageExtraction(unittest.TestCase):
    def test_explicit_tag(self):
        text = "Notes here. [Ship: The Hector | Type: Brig | Year: 1773 | Departure: Greenock | Arrival: Pictou] More notes."
        voyages, cleaned = extract_voyages(text)
        self.assertEqual(len(voyages), 1)
        self.assertEqual(voyages[0]['ship_name'], "The Hector")
        self.assertEqual(voyages[0]['type'], "Brig")
        self.assertEqual(voyages[0]['year'], "1773")
        self.assertEqual(voyages[0]['departure'], "Greenock")
        self.assertEqual(voyages[0]['arrival'], "Pictou")
        self.assertNotIn("[Ship:", cleaned)
        self.assertIn("Notes here. More notes.", cleaned)

    def test_natural_language(self):
        text = "He arrived on the Hector in 1773."
        voyages, cleaned = extract_voyages(text)
        self.assertEqual(len(voyages), 1)
        self.assertEqual(voyages[0]['ship_name'], "Hector")
        self.assertIn("arrived on the Hector", cleaned)

if __name__ == '__main__':
    unittest.main()
