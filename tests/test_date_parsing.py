import re
import dateparser.search

# Copying the relevant methods from genealogy_pipeline.py for isolated testing

def split_date_location(text):
    if not text or text.lower() == "unknown":
        return "Unknown", "Unknown"

    # 1. " in " separator (Strongest)
    in_sep = re.search(r"\s+in\s+", text, re.IGNORECASE)
    if in_sep:
        parts = re.split(r"\s+in\s+", text, flags=re.IGNORECASE, maxsplit=1)
        date_candidate = parts[0].strip()
        loc_candidate = parts[1].strip()

        if re.match(r'^\d{4}$', loc_candidate):
             return text.strip(), "Unknown"

        date_candidate = re.sub(r'^(Born|Died|Buried|Baptized|Married):?\s*', '', date_candidate, flags=re.IGNORECASE)
        return date_candidate, loc_candidate

    # 2. Fallback: Use dateparser
    try:
        dates = dateparser.search.search_dates(text, languages=['en'])
    except Exception:
        dates = None

    if dates:
        first_date_str = dates[0][0]
        start_idx = text.find(first_date_str)
        last_date_str = dates[-1][0]
        end_idx = text.rfind(last_date_str) + len(last_date_str)

        pre_text = text[:start_idx]
        mod_pattern = r'(?i)\b(?:c\.?|ca\.?|circa|about|abt\.?|before|bef\.?|by|after|aft\.?|bet\.?|between|living\s+in|fl\.?)\s*$'
        mod_match = re.search(mod_pattern, pre_text)

        if mod_match:
            start_idx = mod_match.start()

        date_part = text[start_idx:end_idx].strip()
        date_part = re.sub(r'\s+(in|at|on)$', '', date_part, flags=re.IGNORECASE)

        prefix = text[:start_idx].strip()
        suffix = text[end_idx:].strip()

        suffix = re.sub(r'^(in|at|on)\b\s*', '', suffix, flags=re.IGNORECASE)
        prefix = re.sub(r'^(Born|Died|Buried|Baptized|Married):?\s*', '', prefix, flags=re.IGNORECASE)

        loc_parts = []
        if prefix.strip(",; "): loc_parts.append(prefix.strip(",; "))
        if suffix.strip(",; "): loc_parts.append(suffix.strip(",; "))

        location = ", ".join(loc_parts)
        if not location:
            location = "Unknown"

        return date_part, location

    # 3. No date found by dateparser

    # The problematic keyword logic
    keywords = ["unknown", "?", "disappeared", "uncertain", "infant"]
    if any(k in text.lower() for k in keywords):
         return text.strip(), "Unknown"

    if any(char.isdigit() for char in text):
         return text.strip(), "Unknown"

    return "Unknown", text.strip()

def test_case(input_str):
    d, l = split_date_location(input_str)
    print(f"Input: '{input_str}'\n  -> Date: '{d}'\n  -> Loc : '{l}'")

print("--- Test Run ---")
test_case("possibly")
test_case("possibly.")
test_case("Possibly")
test_case("Unknown date, assume New Haven, CT")
test_case("England?")
test_case("1774/5")
test_case("bef 1790")
test_case("Born 1850 in Hartford")
