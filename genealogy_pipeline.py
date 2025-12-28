import re
import json
import os
from docx import Document

class GenealogyTextPipeline:
    def __init__(self, docx_path):
        self.docx_path = docx_path
        self.family_data = []

    def split_date_location(self, text):
        if not text or text.lower() == "unknown":
            return "Unknown", "Unknown"

        # Check for " in " separator
        in_sep = re.search(r"\s+in\s+", text, re.IGNORECASE)
        if in_sep:
            parts = re.split(r"\s+in\s+", text, flags=re.IGNORECASE, maxsplit=1)
            return parts[0].strip(), parts[1].strip()

        # Check for "," separator
        if "," in text:
            parts = text.split(",", 1)
            return parts[0].strip(), parts[1].strip()

        # No separator found
        # Heuristic: If it contains digits, it's likely a date. Otherwise, location.
        if any(char.isdigit() for char in text):
            return text.strip(), "Unknown"
        else:
            return "Unknown", text.strip()

    def split_sentences(self, text):
        if not text:
            return []
        text = re.sub(r"^NOTES:\s*", "", text, flags=re.IGNORECASE)
        parts = re.split(r'[.;]\s+', text)
        return [p.strip() for p in parts if p.strip()]

    def extract_year(self, text):
        matches = list(re.finditer(r'\b(16|17|18|19)\d{2}\b', text))
        if matches:
            return int(matches[0].group(0))
        return None

    def extract_relative_date(self, text, context_year):
        if not context_year:
            return None
        match = re.search(r'\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty)\s+years?\s+(later|after)', text, re.IGNORECASE)
        if match:
            number_map = {
                "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
                "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50
            }
            num = number_map.get(match.group(1).lower())
            if num:
                return context_year + num
        return None

    def extract_location(self, text):
        loc_regex = r'(?:\b(?:in|at|to|from)\s+)([A-Z][a-zA-Z]+(?:[\s,]+[A-Z][a-zA-Z]+)*)'
        m = re.search(loc_regex, text)
        if m:
            candidate = m.group(1)
            candidate = re.sub(r'\s+in\s+\d{4}.*', '', candidate)
            ignored = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Harvard", "Yale", "College", "University", "War", "Church"]
            if candidate in ignored:
                return None
            return candidate
        return None

    def extract_events_from_text(self, text):
        sentences = self.split_sentences(text)
        events = []
        current_context_year = None

        for sent in sentences:
            year = self.extract_year(sent)
            if year:
                current_context_year = year
            else:
                year = self.extract_relative_date(sent, current_context_year)
                if year:
                    current_context_year = year

            if year:
                loc = self.extract_location(sent)
                events.append({
                    "year": year,
                    "label": sent,
                    "location": loc or "Unknown",
                    "type": "personal"
                })
        return events

    def parse_document(self):
        print(f"--- Scanning Narrative Document ({self.docx_path}) ---")
        try:
            doc = Document(self.docx_path)
        except Exception as e:
            print(f"CRITICAL ERROR: Could not load Word doc. {e}")
            return

        total_paragraphs = len(doc.paragraphs)
        print(f"Total paragraphs in document: {total_paragraphs}")

        current_profile = None
        seen_ids = set()
        current_generation = "Uncategorized" # Default until we hit the first header
        
        # Regex Patterns
        id_pattern = re.compile(r"\{(\d+(\.\d+)*)\}")
        born_pattern = re.compile(r"Born:\s*(.*)", re.IGNORECASE)
        died_pattern = re.compile(r"Died:\s*(.*)", re.IGNORECASE)
        notes_start_pattern = re.compile(r"NOTES:\s*(.*)", re.IGNORECASE)
        source_tag_pattern = re.compile(r"\[source:\s*(.*?)\]", re.IGNORECASE)
        
        # Generation Header Pattern (e.g., "GENERATION I: PARENTS")
        # We look for lines starting with GENERATION (case-insensitive)
        gen_header_pattern = re.compile(r"^(GENERATION\s+[IVXLCDM]+.*)", re.IGNORECASE)

        # Iterate through paragraphs
        for index, para in enumerate(doc.paragraphs):
            if index % 1000 == 0:
                print(f"Processing paragraph {index}/{total_paragraphs}")

            text = para.text.strip()
            if not text:
                continue

            # 1. Check for Generation Header
            gen_match = gen_header_pattern.match(text)
            if gen_match:
                # We found a header like "GENERATION I: PARENTS"
                current_generation = gen_match.group(1).strip()
                # Determine "Clean" label (optional, e.g. just "Generation I")
                # For now we keep the whole descriptive string as it's useful context
                print(f"   > Detected Section: {current_generation}")
                
                # If we were building a profile, save it before moving on (rare but possible)
                if current_profile:
                    self.family_data.append(current_profile)
                    current_profile = None
                continue

            # 2. Check for New ID (Start of a Person)
            match = id_pattern.search(text)
            if match:
                # Save previous profile if exists
                if current_profile:
                    self.family_data.append(current_profile)
                    current_profile = None

                # Initialize New Profile
                uid = match.group(1)

                if uid in seen_ids:
                    print(f"   > Duplicate ID found: {uid}. Skipping new profile creation.")
                    current_profile = None
                    continue
                seen_ids.add(uid)
                
                # Extract Source Tag
                source_match = source_tag_pattern.search(text)
                source_id = source_match.group(1) if source_match else "Unknown"

                # Extract Name
                raw_name = text.split('{')[0].strip()
                clean_name = re.sub(r"\[source:.*?\]", "", raw_name).strip()

                current_profile = {
                    "id": uid,
                    "name": clean_name,
                    "generation": current_generation, # <--- NEW FIELD
                    "vital_stats": {
                        "born_date": "Unknown",
                        "born_location": "Unknown",
                        "died_date": "Unknown",
                        "died_location": "Unknown"
                    },
                    "story": {
                        "notes": "",
                        "life_events": []
                    },
                    "metadata": {
                        "source_id": source_id,
                        "doc_paragraph_index": index + 1
                    }
                }
                continue

            # 3. If we are inside a profile, parse details
            if current_profile:
                # Extract Birth
                b_match = born_pattern.search(text)
                if b_match:
                    raw_born = b_match.group(1).strip()
                    b_date, b_loc = self.split_date_location(raw_born)
                    current_profile["vital_stats"]["born_date"] = b_date
                    current_profile["vital_stats"]["born_location"] = b_loc

                # Extract Death
                d_match = died_pattern.search(text)
                if d_match:
                    raw_died = d_match.group(1).strip()
                    d_date, d_loc = self.split_date_location(raw_died)
                    current_profile["vital_stats"]["died_date"] = d_date
                    current_profile["vital_stats"]["died_location"] = d_loc

                # Extract Notes
                n_match = notes_start_pattern.search(text)
                if n_match:
                    notes_text = n_match.group(1).strip()
                    current_profile["story"]["notes"] = notes_text
                    current_profile["story"]["life_events"] = self.extract_events_from_text(notes_text)

        # Save the last one
        if current_profile:
            self.family_data.append(current_profile)

        print(f"Successfully extracted {len(self.family_data)} profiles from text.")

    def link_family_members(self):
        print("--- Linking Family Members ---")
        id_map = {p['id']: p for p in self.family_data}

        for p in self.family_data:
            pid = p['id']
            # Initialize if not present (although we are modifying the dicts in the list)
            if 'relations' not in p:
                 p['relations'] = {
                    "parents": [],
                    "children": [],
                    "spouses": []
                }

            # 1. Parent/Child Linking (by ID hierarchy)
            # Logic: In this dataset (Ahnentafel-like), 1.1.1 is the PARENT of 1.1.
            # Longer ID = Ancestor. Shorter ID = Descendant.
            if '.' in pid:
                child_id = pid.rsplit('.', 1)[0]
                if child_id in id_map:
                    # Current person (pid) is a PARENT of child_id.
                    if child_id not in p['relations']['children']:
                        p['relations']['children'].append(child_id)

                    # Add current person (pid) as parent to child
                    child_p = id_map[child_id]
                    if 'relations' not in child_p:
                        child_p['relations'] = {"parents": [], "children": [], "spouses": []}
                    if pid not in child_p['relations']['parents']:
                        child_p['relations']['parents'].append(pid)

            # 2. Spouse Linking (by ID Adjacency/Pattern)
            # Pattern A: Dotted IDs ending in .1 and .2 (e.g., 1.1.1 and 1.1.2)
            spouse_candidate = None
            if '.' in pid:
                if pid.endswith('.1'):
                    spouse_candidate = pid[:-1] + '2'
                elif pid.endswith('.2'):
                    spouse_candidate = pid[:-1] + '1'
            # Pattern B: Top-level Integer IDs (e.g., 1 and 2, 3 and 4)
            else:
                try:
                    nid = int(pid)
                    if nid % 2 != 0: # Odd (1, 3, 5) -> Spouse is Next Even
                        spouse_candidate = str(nid + 1)
                    else: # Even (2, 4, 6) -> Spouse is Prev Odd
                        spouse_candidate = str(nid - 1)
                except ValueError:
                    pass

            if spouse_candidate and spouse_candidate in id_map:
                if spouse_candidate not in p['relations']['spouses']:
                    p['relations']['spouses'].append(spouse_candidate)

    def clean_and_save(self):
        # Run linking before saving
        self.link_family_members()

        final_list = []
        
        for p in self.family_data:
            final_profile = {
                "id": p["id"],
                "name": p["name"],
                "generation": p["generation"], # <--- Pass this through to JSON
                "vital_stats": p["vital_stats"],
                "story": {
                    "notes": p["story"]["notes"],
                    "life_events": p["story"].get("life_events", [])
                },
                "relations": p.get("relations", {}),
                "metadata": {
                    "source_ref": p["metadata"]["source_id"],
                    "location_in_doc": f"Paragraph #{p['metadata']['doc_paragraph_index']}"
                }
            }
            final_list.append(final_profile)

        output_filename = "kinship-app/src/family_data.json"
        with open(output_filename, "w", encoding='utf-8') as f:
            json.dump(final_list, f, indent=4, ensure_ascii=True)
        
        print(f"Data saved to {output_filename}")

# ==========================================
# EXECUTION
# ==========================================
if __name__ == "__main__":
    word_file = "GENEALOGY DSD Paternal Ancestry.docx"
    
    if os.path.exists(word_file):
        pipeline = GenealogyTextPipeline(word_file)
        pipeline.parse_document()
        pipeline.clean_and_save()
    else:
        print(f"Error: Could not find {word_file}")