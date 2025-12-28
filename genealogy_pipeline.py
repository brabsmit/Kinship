import re
import json
import os
from docx import Document
from collections import defaultdict

class GenealogyTextPipeline:
    def __init__(self, docx_path):
        self.docx_path = docx_path
        self.family_data = []

    def _normalize_date(self, raw_date_string):
        """
        Parses a raw date string and returns a best-guess integer year.
        Returns None if no valid year is found.
        """
        if not raw_date_string or raw_date_string.lower() == "unknown":
            return None

        # Clean up the string
        s = raw_date_string.strip().lower()

        # Extract the first 4-digit year candidate to work with
        # (1000-2999)
        year_match = re.search(r'\b(1[0-9]{3}|20[0-2][0-9])\b', s)
        if not year_match:
            return None

        year_val = int(year_match.group(0))
        start_index = year_match.start()

        # Look at the text *before* the year for modifiers
        pre_text = s[:start_index]

        # 1. Handle "before" / "bef"
        # Logic: if "bef" or "before" appears in the text preceding the year
        if re.search(r'\b(bef\.?|before)\b', pre_text):
            return year_val - 1

        # 2. Handle "after" / "aft"
        if re.search(r'\b(aft\.?|after)\b', pre_text):
            return year_val + 1

        # 3. Standard Year Extraction
        return year_val

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

    def _extract_location_note(self, location_text):
        """
        Separates a trailing parenthetical note from the location string.
        Returns (clean_location, note).
        """
        if not location_text or location_text == "Unknown":
            return location_text, None

        # Regex to find text ending with (note)
        # We capture the main part (lazy) and the content inside the *last* set of parens.
        # This handles cases like "Location (Note)" -> "Location", "Note"
        match = re.search(r'^(.*?)\s*\(([^)]+)\)$', location_text)
        if match:
            clean_loc = match.group(1).strip()
            note = match.group(2).strip()
            # If the resulting location is empty, it means the whole string was in parens
            # e.g. "(Unknown)" -> loc="", note="Unknown".
            # In this case, we probably shouldn't split it, or treat it as just note?
            # For now, if clean_loc is empty, we return the original string to avoid data loss/empty location.
            if not clean_loc:
                return location_text, None

            return clean_loc, note

        return location_text, None

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
        current_generation = "Uncategorized"
        
        # Regex Patterns
        id_pattern = re.compile(r"\{(\d+(\.\d+)*)\}")
        born_pattern = re.compile(r"Born:\s*(.*)", re.IGNORECASE)
        died_pattern = re.compile(r"Died:\s*(.*)", re.IGNORECASE)
        notes_start_pattern = re.compile(r"NOTES:\s*(.*)", re.IGNORECASE)
        source_tag_pattern = re.compile(r"\[source:\s*(.*?)\]", re.IGNORECASE)
        
        gen_header_pattern = re.compile(r"^(GENERATION\s+[IVXLCDM]+.*)", re.IGNORECASE)

        for index, para in enumerate(doc.paragraphs):
            if index % 1000 == 0:
                print(f"Processing paragraph {index}/{total_paragraphs}")

            text = para.text.strip()
            if not text:
                continue

            gen_match = gen_header_pattern.match(text)
            if gen_match:
                current_generation = gen_match.group(1).strip()
                print(f"   > Detected Section: {current_generation}")
                if current_profile:
                    self.family_data.append(current_profile)
                    current_profile = None
                continue

            match = id_pattern.search(text)
            if match:
                if current_profile:
                    self.family_data.append(current_profile)
                    current_profile = None

                uid = match.group(1)

                if uid in seen_ids:
                    print(f"   > Duplicate ID found: {uid}. Skipping new profile creation.")
                    current_profile = None
                    continue
                seen_ids.add(uid)
                
                source_match = source_tag_pattern.search(text)
                source_id = source_match.group(1) if source_match else "Unknown"

                raw_name = text.split('{')[0].strip()
                clean_name = re.sub(r"\[source:.*?\]", "", raw_name).strip()

                current_profile = {
                    "id": uid,
                    "name": clean_name,
                    "generation": current_generation,
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

            if current_profile:
                b_match = born_pattern.search(text)
                if b_match:
                    raw_born = b_match.group(1).strip()
                    b_date, b_loc_raw = self.split_date_location(raw_born)
                    b_loc, b_note = self._extract_location_note(b_loc_raw)

                    current_profile["vital_stats"]["born_date"] = b_date
                    current_profile["vital_stats"]["born_location"] = b_loc
                    if b_note:
                        current_profile["vital_stats"]["born_location_note"] = b_note
                    current_profile["vital_stats"]["born_year_int"] = self._normalize_date(b_date)

                d_match = died_pattern.search(text)
                if d_match:
                    raw_died = d_match.group(1).strip()
                    d_date, d_loc_raw = self.split_date_location(raw_died)
                    d_loc, d_note = self._extract_location_note(d_loc_raw)

                    current_profile["vital_stats"]["died_date"] = d_date
                    current_profile["vital_stats"]["died_location"] = d_loc
                    if d_note:
                        current_profile["vital_stats"]["died_location_note"] = d_note
                    current_profile["vital_stats"]["died_year_int"] = self._normalize_date(d_date)

                n_match = notes_start_pattern.search(text)
                if n_match:
                    notes_text = n_match.group(1).strip()
                    current_profile["story"]["notes"] = notes_text
                    current_profile["story"]["life_events"] = self.extract_events_from_text(notes_text)

        if current_profile:
            self.family_data.append(current_profile)

        print(f"Successfully extracted {len(self.family_data)} profiles from text.")

    def link_family_members(self):
        print("--- Linking Family Members ---")
        id_map = {p['id']: p for p in self.family_data}

        for p in self.family_data:
            pid = p['id']
            if 'relations' not in p:
                 p['relations'] = {
                    "parents": [],
                    "children": [],
                    "spouses": []
                }

            if '.' in pid:
                child_id = pid.rsplit('.', 1)[0]
                if child_id in id_map:
                    if child_id not in p['relations']['children']:
                        p['relations']['children'].append(child_id)

                    child_p = id_map[child_id]
                    if 'relations' not in child_p:
                        child_p['relations'] = {"parents": [], "children": [], "spouses": []}
                    if pid not in child_p['relations']['parents']:
                        child_p['relations']['parents'].append(pid)

            spouse_candidate = None
            if '.' in pid:
                if pid.endswith('.1'):
                    spouse_candidate = pid[:-1] + '2'
                elif pid.endswith('.2'):
                    spouse_candidate = pid[:-1] + '1'
            else:
                try:
                    nid = int(pid)
                    if nid % 2 != 0:
                        spouse_candidate = str(nid + 1)
                    else:
                        spouse_candidate = str(nid - 1)
                except ValueError:
                    pass

            if spouse_candidate and spouse_candidate in id_map:
                if spouse_candidate not in p['relations']['spouses']:
                    p['relations']['spouses'].append(spouse_candidate)

    def _get_birth_year(self, profile):
        raw = profile.get("vital_stats", {}).get("born_date", "")
        match = re.search(r'\d{4}', raw)
        if match:
            return int(match.group(0))
        return None

    def _find_mentions(self):
        print("--- Ariadne: Weaving Connections ---")
        # Build Name Index
        # Use a list to handle duplicates (collisions)
        name_index = defaultdict(list)

        for p in self.family_data:
            full_name = p['name']
            pid = p['id']

            # Normalize
            normalized_name = " ".join([n.capitalize() for n in full_name.split()])
            name_index[normalized_name].append(pid)

            # Variations: First Last
            parts = normalized_name.split()
            if len(parts) > 2:
                short_name = f"{parts[0]} {parts[-1]}"
                # Only add short name if it doesn't conflict with an existing full name
                # (though here we just append to list and filter later)
                name_index[short_name].append(pid)

        # Filter ambiguous names
        clean_name_index = {}
        for name, ids in name_index.items():
            unique_ids = list(set(ids))
            if len(unique_ids) == 1:
                clean_name_index[name] = unique_ids[0]
            else:
                # Ambiguous name (e.g., "Sarah Dodge" -> [1.2, 5.1.2.2?])
                # We skip linking based on this name to avoid false positives
                # print(f"Ambiguous name skipped: {name} -> {unique_ids}")
                pass

        # Keywords for relationship types
        # These must appear in the same CLAUSE as the name
        keywords = {
            "partner": "Business Partner",
            "business": "Business Partner",
            "firm": "Business Partner",
            "married": "Spouse",
            "wife": "Spouse",
            "husband": "Spouse",
            "spouse": "Spouse",
            "wed": "Spouse",
            "cousin": "Cousin",
            "friend": "Friend",
            "neighbor": "Neighbor",
            "associate": "Associate"
        }

        count = 0
        sorted_names = sorted(clean_name_index.keys(), key=len, reverse=True)
        id_map = {p['id']: p for p in self.family_data}

        for p in self.family_data:
            p['related_links'] = []
            notes = p['story']['notes']
            if not notes:
                continue

            source_born = self._get_birth_year(p)
            found_ids = set()

            # Split into clauses for tighter context
            # Split on punctuation (. ; ,)
            clauses = re.split(r'[.;,]', notes)

            for clause in clauses:
                if not clause.strip():
                    continue

                for name in sorted_names:
                    target_id = clean_name_index[name]
                    if target_id == p['id']:
                        continue
                    if target_id in found_ids:
                        continue

                    # Regex for exact word match in this clause
                    pattern = r'\b' + re.escape(name) + r'\b'
                    if re.search(pattern, clause):

                        # Date sanity check for strict relationships (Spouse, Partner)
                        # If dates are wildly off (>100 years), assume it's a "Mentioned" (e.g. ancestor)
                        # or skip if it looks like a collision.
                        target_p = id_map.get(target_id)
                        target_born = self._get_birth_year(target_p) if target_p else None

                        is_contemporary = True
                        if source_born and target_born:
                            diff = abs(source_born - target_born)
                            if diff > 80:
                                is_contemporary = False

                        found_ids.add(target_id)

                        # Determine Type
                        rel_type = "Mentioned"
                        lower_clause = clause.lower()

                        # Search for keywords in the clause
                        for k, v in keywords.items():
                            # Use regex for keyword matching to avoid partial matches
                            if re.search(r'\b' + re.escape(k) + r'\b', lower_clause):
                                # If keyword implies contemporary but they are not, downgrade to Mentioned
                                if v in ["Spouse", "Business Partner", "Friend"] and not is_contemporary:
                                    rel_type = "Mentioned"
                                else:
                                    rel_type = v
                                break

                        # Context sentence (full sentence)
                        full_sentences = self.split_sentences(notes)
                        source_sentence = clause.strip()
                        for s in full_sentences:
                            if clause.strip() in s:
                                source_sentence = s
                                break

                        p['related_links'].append({
                            "target_id": target_id,
                            "relation_type": rel_type,
                            "source_text": source_sentence.strip()
                        })
                        count += 1

        print(f"Ariadne found {count} text-based connections.")

    def clean_and_save(self):
        self.link_family_members()
        self._find_mentions()

        final_list = []
        
        for p in self.family_data:
            final_profile = {
                "id": p["id"],
                "name": p["name"],
                "generation": p["generation"],
                "vital_stats": p["vital_stats"],
                "story": {
                    "notes": p["story"]["notes"],
                    "life_events": p["story"].get("life_events", [])
                },
                "relations": p.get("relations", {}),
                "related_links": p.get("related_links", []),
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

if __name__ == "__main__":
    word_file = "GENEALOGY DSD Paternal Ancestry.docx"
    
    if os.path.exists(word_file):
        pipeline = GenealogyTextPipeline(word_file)
        pipeline.parse_document()
        pipeline.clean_and_save()
    else:
        print(f"Error: Could not find {word_file}")
