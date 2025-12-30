import re
import json
import os
import requests
import time
import hashlib
from docx import Document
from collections import defaultdict

class GenealogyTextPipeline:
    def __init__(self):
        self.family_data = []
        self.image_cache = self.load_cache()
        self.cache_updated = False

    def load_cache(self):
        cache_file = "./kinship-app/src/wikimedia_cache.json"
        if os.path.exists(cache_file):
            with open(cache_file, "r") as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return {}
        return {}

    def save_cache(self):
        if self.cache_updated:
            with open("./kinship-app/src/wikimedia_cache.json", "w") as f:
                json.dump(self.image_cache, f, indent=4)
            print("Wikimedia cache saved.")

    def fetch_wikimedia_image(self, location, year):
        if not location or location.lower() == "unknown":
            return None

        # Determine Century
        century = ""
        if year:
            c_val = (year // 100) + 1
            century = f"{c_val}th century"
        else:
            century = "historical"

        # Create a cache key
        cache_key = f"{location}|{century}"
        if cache_key in self.image_cache:
            return self.image_cache[cache_key]

        # Construct Search Queries
        queries = [
            f"{location} {century} map",
            f"{location} historical"
        ]

        # Clean up location for search (remove detailed parts if too long?)
        # For now, use as is.


        api_url = "https://commons.wikimedia.org/w/api.php"

        for q in queries:
            # Check if we need to save cache incrementally
            if self.cache_updated and len(self.image_cache) % 5 == 0:
                self.save_cache()
                self.cache_updated = False

            params = {
                "action": "query",
                "generator": "search",
                "gsrnamespace": "6", # File namespace
                "gsrsearch": q,
                "gsrlimit": "1",
                "prop": "imageinfo",
                "iiprop": "url|extmetadata",
                "iiurlwidth": "1024",
                "format": "json"
            }

            try:
                # Be polite
                time.sleep(0.1)
                response = requests.get(api_url, params=params, headers={"User-Agent": "GenealogyApp/1.0 (contact@example.com)"}, timeout=5)
                data = response.json()

                if "query" in data and "pages" in data["query"]:
                    # Get first result
                    page_id = list(data["query"]["pages"].keys())[0]
                    page = data["query"]["pages"][page_id]

                    if "imageinfo" in page:
                        info = page["imageinfo"][0]
                        thumb_url = info.get("thumburl", info.get("url"))

                        metadata = info.get("extmetadata", {})
                        description = metadata.get("ImageDescription", {}).get("value", q)
                        # Clean HTML from description if needed, or keep it simple
                        # Simple regex to strip HTML tags
                        description = re.sub(r'<[^>]+>', '', description)[:150] + "..."

                        result = {
                            "src": thumb_url,
                            "alt": f"Historical image of {location}",
                            "caption": description,
                            "style": { "filter": "sepia(20%) contrast(110%)" } # Default vintage style
                        }

                        self.image_cache[cache_key] = result
                        self.cache_updated = True
                        print(f"   [Wikimedia] Found image for '{q}'")
                        return result

            except Exception as e:
                print(f"   [Wikimedia] Error fetching for '{q}': {e}")
                continue

        # Cache miss (None) to avoid re-searching
        self.image_cache[cache_key] = None
        self.cache_updated = True
        return None

    def _normalize_date(self, raw_date_string):
        """
        Parses a raw date string and returns a best-guess integer year.
        Returns None if no valid year is found.
        """
        if not raw_date_string:
            return None

        # Clean up the string
        s = raw_date_string.strip().lower()
        if s == "unknown" or s == "?" or s == "uncertain":
            return None

        # Extract the first 4-digit year candidate to work with
        # (1000-2999).
        # We capture the group to ensure we get the year digits.
        year_match = re.search(r'\b(1[0-9]{3}|20[0-2][0-9])', s)
        if not year_match:
            return None

        year_val = int(year_match.group(1))
        start_index = year_match.start()

        # Look at the text *before* the year for modifiers
        pre_text = s[:start_index]

        # 1. Handle "before" / "bef" / "by"
        # Logic: if "bef", "before", or "by" appears in the text preceding the year, return year - 1
        if re.search(r'\b(bef\.?|before|by)\b', pre_text):
            return year_val - 1

        # 2. Handle "after" / "aft"
        # Logic: if "aft" or "after" appears, return year + 1
        if re.search(r'\b(aft\.?|after)\b', pre_text):
            return year_val + 1

        # 3. Handle dual dating like "1774/5" or ranges "1774-1778"
        # The regex picks the first year found, which is standard genealogical practice for sorting (start date).

        # 4. Handle "living in" or "fl."
        # If "living in 1774", we return 1774 as the best anchor.

        return year_val

    def split_date_location(self, text):
        if not text or text.lower() == "unknown":
            return "Unknown", "Unknown"

        # 1. " in " separator (Strongest)
        # Handles: "May 1, 1850 in Hartford" -> "May 1, 1850", "Hartford"
        in_sep = re.search(r"\s+in\s+", text, re.IGNORECASE)
        if in_sep:
            parts = re.split(r"\s+in\s+", text, flags=re.IGNORECASE, maxsplit=1)
            return parts[0].strip(), parts[1].strip()

        # 2. Look for a Year (1000-2999)
        # Find the LAST occurrence of a year to handle ranges like 1750-1752, but ensure we don't accidentally
        # split "1850" from "1860" if both are in the date field (e.g. range).
        # Strategy: Find the last year. If text follows it that looks like a location (starts with comma/semicolon/letters), split.

        years = list(re.finditer(r'\b(1[0-9]{3}|20[0-2][0-9])\b', text))

        if years:
            last_year = years[-1]
            end_of_year = last_year.end()

            # Check what comes after
            after = text[end_of_year:].strip()

            # Case: "1850" -> All date
            if not after:
                return text.strip(), "Unknown"

            # Case: "1850, Hartford" -> Split
            if after.startswith(",") or after.startswith(";"):
                date_part = text[:end_of_year].strip()
                loc_part = after.lstrip(",; ").strip()
                return date_part, loc_part

            # Case: "1850 Hartford" -> Implicit split (rare but possible)
            # Check if it starts with letters (Location name)
            # Avoid splitting "1774/5" where "/5" is not a location
            if after[0].isalpha():
                 date_part = text[:end_of_year].strip()
                 loc_part = after.strip()
                 return date_part, loc_part

            # Fallback: If after is just symbols like "/5" or "-1752" (Wait, if -1752, it would be caught as a year match)
            # If we are here, "after" does NOT contain a year (because we picked the last one).
            # So if it's "/5" it stays with date.

            return text.strip(), "Unknown"

        # 3. No year found
        # Heuristics for "No Year"

        # If text is keywords like "Unknown", "?", "Disappeared"
        keywords = ["unknown", "?", "disappeared", "uncertain", "infant"]
        if any(k in text.lower() for k in keywords):
             return text.strip(), "Unknown"

        # If it contains digits, assume Date (e.g. "May 1", "aged 5")
        if any(char.isdigit() for char in text):
             return text.strip(), "Unknown"
        else:
             # No digits. "Hartford, CT". "New York".
             # Treat as Location.
             return "Unknown", text.strip()

    def _parse_location_hierarchy(self, location_string):
        """
        Parses a location string into structured components (City, State, Country).
        Uses simple comma-splitting heuristics.
        """
        if not location_string or location_string.lower() == "unknown":
            return None

        parts = [p.strip() for p in location_string.split(',')]

        hierarchy = {
            "raw": location_string,
            "city": None,
            "county": None,
            "state": None,
            "country": None
        }

        # Common US State Abbreviations/Names appearing in this dataset
        us_states = ["CT", "MA", "NY", "NJ", "PA", "VA", "RI", "NH", "VT", "ME", "DE", "MD", "SC", "NC", "GA", "OH", "IL", "MI"]

        if len(parts) == 1:
            # Just a city or country?
            val = parts[0]
            if val in ["USA", "England", "UK", "Canada"]:
                hierarchy["country"] = val
            elif val in us_states:
                hierarchy["state"] = val
                hierarchy["country"] = "USA"
            else:
                hierarchy["city"] = val

        elif len(parts) >= 2:
            last = parts[-1]

            # Check if last part is a US State
            if last.upper() in us_states or last in ["Connecticut", "Massachusetts", "New York", "New Jersey", "Pennsylvania"]:
                hierarchy["country"] = "USA"
                hierarchy["state"] = last
                hierarchy["city"] = parts[0]
                if len(parts) > 2:
                    hierarchy["county"] = parts[1] # Middle part often county

            elif last in ["USA", "United States"]:
                hierarchy["country"] = "USA"
                hierarchy["state"] = parts[-2] if len(parts) > 1 else None
                hierarchy["city"] = parts[0]

            elif last in ["England", "UK", "Great Britain"]:
                hierarchy["country"] = "UK"
                hierarchy["city"] = parts[0]
                if len(parts) > 2:
                    hierarchy["county"] = parts[1]

            else:
                # Generic fallback: City, Region
                hierarchy["city"] = parts[0]
                hierarchy["state"] = parts[-1]

        return hierarchy

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

    def parse_document(self, docx_path, lineage_label):
        print(f"--- Scanning Narrative Document ({docx_path}) ---")
        try:
            doc = Document(docx_path)
        except Exception as e:
            print(f"CRITICAL ERROR: Could not load Word doc. {e}")
            return

        total_paragraphs = len(doc.paragraphs)
        print(f"Total paragraphs in document: {total_paragraphs}")

        current_profiles = []
        seen_ids = set()
        current_generation = "Uncategorized"
        
        # Regex Patterns
        id_pattern = re.compile(r"\{(\d+(\.\d+)*)\}")
        born_pattern = re.compile(r"Born:\s*(.*)", re.IGNORECASE)
        died_pattern = re.compile(r"Died:\s*(.*)", re.IGNORECASE)
        children_pattern = re.compile(r"Children:\s*(.*)", re.IGNORECASE)
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
                if current_profiles:
                    self.family_data.extend(current_profiles)
                    current_profiles = []
                continue

            matches = list(id_pattern.finditer(text))

            # Guard: If the line is actually a Note or Vital Stat line that happens to reference an ID,
            # ignore it as a profile header.
            # Also exclude cross-reference lines like "See Name..." or relationship pointers "Father of..."
            see_pattern = re.compile(r"^See\s+", re.IGNORECASE)
            rel_pointer_pattern = re.compile(r"^(Father|Mother|Parent|Maternal|Paternal)\s+(Grand)?(father|mother|parent|of)\s+", re.IGNORECASE)

            is_metadata_line = (
                born_pattern.match(text) or
                died_pattern.match(text) or
                children_pattern.match(text) or
                notes_start_pattern.match(text) or
                see_pattern.match(text) or
                rel_pointer_pattern.match(text)
            )

            if matches and not is_metadata_line:
                if current_profiles:
                    self.family_data.extend(current_profiles)
                    current_profiles = []

                # Handle First ID (always create)
                first_match = matches[0]

                # Name is everything before the first ID
                raw_name = text[:first_match.start()].strip()
                clean_name = re.sub(r"\[source:.*?\]", "", raw_name).strip()
                
                source_match = source_tag_pattern.search(text)
                source_id = source_match.group(1) if source_match else "Unknown"

                # Check First ID
                uid = first_match.group(1)
                if uid not in seen_ids:
                    seen_ids.add(uid)
                    current_profiles.append({
                        "id": uid,
                        "name": clean_name,
                        "lineage": lineage_label,
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
                    })

                # Check subsequent IDs (aliases)
                # Logic: Consecutive IDs separated by " & ", " / ", " and "
                for i in range(1, len(matches)):
                    prev = matches[i-1]
                    curr = matches[i]

                    # Text between matches
                    between = text[prev.end():curr.start()]

                    if re.match(r"^\s*(&|/|and)\s*$", between, re.IGNORECASE):
                        # It is an alias
                        uid_alias = curr.group(1)
                        if uid_alias not in seen_ids:
                            seen_ids.add(uid_alias)
                            current_profiles.append({
                                "id": uid_alias,
                                "name": clean_name, # Same name
                                "lineage": lineage_label,
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
                            })
                    else:
                        # Break chain if separator is not alias-like
                        break

                continue

            if current_profiles:
                # Pre-calculate matches for this line
                b_match = born_pattern.search(text)
                d_match = died_pattern.search(text)
                n_match = notes_start_pattern.search(text)
                c_match = children_pattern.search(text)

                for current_profile in current_profiles:
                    if b_match:
                        raw_born = b_match.group(1).strip()
                        b_date, b_loc_raw = self.split_date_location(raw_born)
                        b_loc, b_note = self._extract_location_note(b_loc_raw)

                        current_profile["vital_stats"]["born_date"] = b_date
                        current_profile["vital_stats"]["born_location"] = b_loc
                        if b_note:
                            current_profile["vital_stats"]["born_location_note"] = b_note
                        current_profile["vital_stats"]["born_year_int"] = self._normalize_date(b_date)
                        current_profile["vital_stats"]["born_hierarchy"] = self._parse_location_hierarchy(b_loc)

                    if d_match:
                        raw_died = d_match.group(1).strip()
                        d_date, d_loc_raw = self.split_date_location(raw_died)
                        d_loc, d_note = self._extract_location_note(d_loc_raw)

                        current_profile["vital_stats"]["died_date"] = d_date
                        current_profile["vital_stats"]["died_location"] = d_loc
                        if d_note:
                            current_profile["vital_stats"]["died_location_note"] = d_note
                        current_profile["vital_stats"]["died_year_int"] = self._normalize_date(d_date)
                        current_profile["vital_stats"]["died_hierarchy"] = self._parse_location_hierarchy(d_loc)

                    if n_match:
                        notes_text = n_match.group(1).strip()
                        current_profile["story"]["notes"] = notes_text
                        current_profile["story"]["life_events"] = self.extract_events_from_text(notes_text)

                    if c_match:
                        raw_children = c_match.group(1).strip()
                        # Also check next paragraphs if they look like list items or continuation?
                        # For now, simplistic parsing of the line
                        self._parse_children(raw_children, current_profile, lineage_label, current_generation, index)

        if current_profiles:
            self.family_data.extend(current_profiles)

    def _parse_children(self, text, parent_profile, lineage_label, generation, index):
        """
        Parses the children text block and creates sibling profiles.
        Format variations:
        - "Name (Year); Name (Year)"
        - "Name (Year-Year)"
        - "Name [Spouse] (Year)"
        """
        if not text: return

        # Split by semicolon usually separates distinct children entries
        # If no semicolon, maybe commas? But names have commas (Last, First).
        # Heuristic: split by semicolon first.
        segments = [s.strip() for s in text.split(';') if s.strip()]

        # If no semicolons, it might be a single child or comma separated?
        # Check if there are years in parens to guide splitting?
        # For now, stick to semicolons or newlines (handled by loop above but here text is one line)

        child_count = 0
        for segment in segments:
            # Extract Name and Year
            # Regex: Name (Date)
            # Name might include [Spouse]

            # Find parens with digits (dates)
            date_match = re.search(r'\(([^)]*\d+[^)]*)\)', segment)

            raw_date = "Unknown"
            clean_name = segment

            if date_match:
                raw_date = date_match.group(1)
                # Remove the date part from name
                clean_name = segment.replace(f"({raw_date})", "").strip()

            # Clean name further (remove " and " or "others")
            if "others" in clean_name.lower():
                continue

            clean_name = clean_name.strip()
            if not clean_name: continue

            # Generate a unique ID for this child
            # Format: P<ParentID>_c<Index>
            # Note: Parent ID must exist.
            if not parent_profile or 'id' not in parent_profile:
                continue

            # Check if this child already exists as a main profile?
            # We will handle this in deduplication or linking phase,
            # but we need to create the object first.

            child_id = f"{parent_profile['id']}_c{child_count}"
            child_count += 1

            # Create Child Profile
            child_profile = {
                "id": child_id,
                "name": clean_name,
                "lineage": lineage_label,
                "generation": generation, # Technically next gen down, but close enough for now
                "vital_stats": {
                    "born_date": raw_date, # Often range "1884-1976" or just "1884"
                    "born_location": "Unknown",
                    "died_date": "Unknown", # Extracted later from range
                    "died_location": "Unknown"
                },
                "story": {
                    "notes": f"Child of {parent_profile['name']}. Source text: {segment}",
                    "life_events": []
                },
                "metadata": {
                    "source_id": "Derived",
                    "doc_paragraph_index": index + 1,
                    "is_child_entry": True,
                    "parent_id": parent_profile['id']
                }
            }

            # Handle Date Ranges in born_date
            # e.g. "1884-1976" -> born 1884, died 1976
            if "-" in raw_date or "–" in raw_date: # Handle en-dash too
                split_char = "–" if "–" in raw_date else "-"
                parts = raw_date.split(split_char)
                if len(parts) >= 2:
                    child_profile["vital_stats"]["born_date"] = parts[0].strip()
                    child_profile["vital_stats"]["died_date"] = parts[1].strip()

            child_profile["vital_stats"]["born_year_int"] = self._normalize_date(child_profile["vital_stats"]["born_date"])
            child_profile["vital_stats"]["died_year_int"] = self._normalize_date(child_profile["vital_stats"]["died_date"])

            self.family_data.append(child_profile)

        print(f"Successfully extracted {len(self.family_data)} profiles from text.")

    def _has_exclusion_context(self, text, match_start):
        # Look at the 50 chars before the match
        start_search = max(0, match_start - 50)
        pre_text = text[start_search:match_start].lower()

        exclusions = [
            "mother of", "father of", "sister of", "brother of",
            "wife of", "husband of", "widow of", "son of", "daughter of",
            "child of", "spouse of", "married to", "mother to", "father to",
            "husband was", "father was", "son was", "daughter was", "wife was",
            "husband's", "father's", "wife's", "son's", "daughter's",
            "consort of", "relict of"
        ]

        for exc in exclusions:
            if exc in pre_text:
                return True
        return False

    def extract_tags(self, profile):
        tags = []
        notes = profile["story"]["notes"]
        born_loc = profile["vital_stats"]["born_location"]
        died_loc = profile["vital_stats"]["died_location"]

        # 1. Immigrant
        # Heuristic: Born in UK/Europe, Died in USA/MA/CT
        # Or keyword "immigrant", "came to america"
        is_immigrant = False
        immigrant_keywords = r'\b(immigrant|emigrated|came to america|arrived in|arrived with)\b'
        for match in re.finditer(immigrant_keywords, notes, re.IGNORECASE):
            if not self._has_exclusion_context(notes, match.start()):
                is_immigrant = True
                break

        # Simple location check (Location based check is usually safe from context errors)
        uk_locations = ["England", "UK", "Britain", "London", "Dorset", "Essex", "Somerset", "Lincolnshire", "Suffolk", "Kent", "Holland", "Netherlands", "Scotland", "Ireland", "Wales"]
        us_locations = ["MA", "CT", "NY", "NJ", "USA", "Massachusetts", "Connecticut", "New York", "Pennsylvania", "New Hampshire", "Rhode Island"]

        born_uk = any(l.lower() in born_loc.lower() for l in uk_locations)
        died_us = any(l.lower() in died_loc.lower() for l in us_locations)

        if born_uk and died_us:
            is_immigrant = True

        if is_immigrant:
            tags.append("Immigrant")

        # 2. Mayflower
        mayflower_keywords = r'\bMayflower\b'
        for match in re.finditer(mayflower_keywords, notes, re.IGNORECASE):
             if not self._has_exclusion_context(notes, match.start()):
                 tags.append("Mayflower")
                 break

        # 3. War Veteran
        # Keywords: War, Revolution, Army, Regiment, Captain, Lieutenant, General, Soldier, Private
        war_keywords = r'\b(served in|soldier|captain|major|lieutenant|general|ensign|private|sergeant|colonel|veteran|war of|revolutionary war|civil war|french and indian war)\b'
        for match in re.finditer(war_keywords, notes, re.IGNORECASE):
             if not self._has_exclusion_context(notes, match.start()):
                 tags.append("War Veteran")
                 break

        # Name check for rank
        name_keywords = r'captain|major|lieutenant|Lt\.|general|ensign|private|sergeant|colonel'
        if re.search(name_keywords, profile["name"], re.IGNORECASE):
             # Basic check to avoid Mrs. Captain
             if not re.search(r'\b(mrs|miss|ms)\b', profile["name"], re.IGNORECASE):
                tags.append("War Veteran")

        # 4. Founder / Settler
        founder_keywords = r'\b(founder|settler|pioneer|first settler|original proprietor)\b'
        for match in re.finditer(founder_keywords, notes, re.IGNORECASE):
             if not self._has_exclusion_context(notes, match.start()):
                 tags.append("Founder")
                 break

        # 5. Salem Witch Trials
        witch_keywords = r'\b(witch|salem trials|accused of witchcraft)\b'
        for match in re.finditer(witch_keywords, notes, re.IGNORECASE):
             if not self._has_exclusion_context(notes, match.start()):
                 tags.append("Salem Witch Trials")
                 break

        # 6. Education
        edu_keywords = r'\b(Harvard|Yale|College|University)\b'
        for match in re.finditer(edu_keywords, notes, re.IGNORECASE):
             if not self._has_exclusion_context(notes, match.start()):
                 tags.append("University Educated")
                 break

        # 7. Quaker
        quaker_keywords = r'\b(Quaker|Friends)\b'
        for match in re.finditer(quaker_keywords, notes, re.IGNORECASE):
             if not self._has_exclusion_context(notes, match.start()):
                 tags.append("Quaker")
                 break

        return list(set(tags))

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

            # Skip implicit linking for child entries (IDs with '_c')
            # because they don't follow the strict structural hierarchy
            if '.' in pid and '_c' not in pid:
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
        name_index = defaultdict(list)

        for p in self.family_data:
            full_name = p['name']
            pid = p['id']

            # Normalize: "William E. Dodge" -> "William E. Dodge"
            # Remove [source: ...] if present (should be clean already but double check)
            clean_name = full_name.split('{')[0].strip()
            name_index[clean_name].append(pid)

            # Variations
            parts = clean_name.split()
            if len(parts) > 2:
                # First Last
                short_name = f"{parts[0]} {parts[-1]}"
                name_index[short_name].append(pid)

        # Filter ambiguous
        clean_name_index = {}
        for name, ids in name_index.items():
            if len(set(ids)) == 1:
                clean_name_index[name] = ids[0]

        # Optimization: Create a set of names for fast lookup
        known_names = set(clean_name_index.keys())

        # Keywords for relationship types
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
        id_map = {p['id']: p for p in self.family_data}

        for p in self.family_data:
            p['related_links'] = []
            notes = p['story']['notes']
            if not notes: continue

            # Optimization: Extract potential name candidates (Capitalized words sequences)
            # Regex: \b[A-Z][a-z]+(?: [A-Z][a-z\.]+)+\b
            # Matches "William Dodge", "Mr. Phelps", "Anson G. Phelps"
            candidates = set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z\.]+)+\b', notes))

            # Filter candidates that are known names
            valid_candidates = candidates.intersection(known_names)

            if not valid_candidates:
                continue

            # Now verify context for valid candidates
            clauses = re.split(r'[.;,]', notes)
            source_born = self._get_birth_year(p)
            found_ids = set()

            for clause in clauses:
                if not clause.strip(): continue

                for name in valid_candidates:
                    if name not in clause: continue # Fast string check

                    # Exact word boundary check
                    if not re.search(r'\b' + re.escape(name) + r'\b', clause):
                        continue

                    target_id = clean_name_index[name]
                    if target_id == p['id']: continue
                    if target_id in found_ids: continue

                    # Date sanity check
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

                    for k, v in keywords.items():
                        if re.search(r'\b' + re.escape(k) + r'\b', lower_clause):
                            if v in ["Spouse", "Business Partner", "Friend"] and not is_contemporary:
                                rel_type = "Mentioned"
                            else:
                                rel_type = v
                            break

                    # Context sentence
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
        # 1. First pass: separate "Real" profiles from "Child" entries
        real_profiles = {}
        child_entries = []

        for p in self.family_data:
            if p.get("metadata", {}).get("is_child_entry"):
                child_entries.append(p)
            else:
                pid = p['id']
                if pid not in real_profiles:
                    real_profiles[pid] = p

        # 2. Process Child Entries:
        # If a child entry matches a Real Profile by Name, discard the child entry (the real one is better).
        # Otherwise, keep the child entry.

        # Build Name Map for Real Profiles
        real_name_map = {}
        for pid, p in real_profiles.items():
            # Normalize name: remove parens, extra spaces
            norm = re.sub(r'\(.*?\)', '', p['name']).strip().lower()
            real_name_map[norm] = pid

        final_profiles = list(real_profiles.values())

        for child in child_entries:
            # Clean child name for matching
            # Child name might be "Grace Dodge (John) Olmsted..." -> "Grace Dodge Olmsted"
            # It's tricky.
            # Simple check: if "Grace Dodge" is in the real profile name?

            # Simple normalization
            c_name = re.sub(r'\[.*?\]', '', child['name']) # remove spouses in brackets
            c_name = re.sub(r'\(.*?\)', '', c_name)
            # Remove suffixes like ", 1st son", ", 2nd daughter", etc.
            c_name = re.sub(r',\s*\d+(?:st|nd|rd|th)?\s+(?:son|daughter|child)', '', c_name, flags=re.IGNORECASE)
            c_name = re.sub(r',\s+(?:son|daughter|child)', '', c_name, flags=re.IGNORECASE)
            c_name = c_name.strip().lower()

            match_found = False
            for real_name, real_id in real_name_map.items():
                # Check for strong match
                if c_name == real_name or (len(c_name) > 5 and c_name in real_name):
                    # Link parent to this REAL profile instead of the child entry
                    parent_id = child["metadata"]["parent_id"]

                    # Add parent/child link
                    if parent_id in real_profiles:
                         parent = real_profiles[parent_id]
                         if 'relations' not in parent: parent['relations'] = {"children": [], "parents": [], "spouses": []}
                         if real_id not in parent['relations']['children']:
                             parent['relations']['children'].append(real_id)

                    real_p = real_profiles[real_id]
                    if 'relations' not in real_p: real_p['relations'] = {"children": [], "parents": [], "spouses": []}

                    # Prevent linking self as parent (e.g. if child name matches parent name)
                    if parent_id != real_id:
                        if parent_id not in real_p['relations']['parents']:
                            real_p['relations']['parents'].append(parent_id)

                    match_found = True
                    break

            if not match_found:
                # Keep this child entry as a new profile
                final_profiles.append(child)

                # Link to parent
                parent_id = child["metadata"]["parent_id"]
                if parent_id in real_profiles:
                     parent = real_profiles[parent_id]
                     if 'relations' not in parent: parent['relations'] = {"children": [], "parents": [], "spouses": []}
                     # Add this child ID
                     if child['id'] not in parent['relations']['children']:
                         parent['relations']['children'].append(child['id'])

                # Link child to parent
                if 'relations' not in child: child['relations'] = {"children": [], "parents": [], "spouses": []}
                child['relations']['parents'].append(parent_id)

        self.family_data = final_profiles

        # Re-deduplicate just in case?
        # self.family_data already unique by logic above.

        self.link_family_members()
        self._find_mentions()

        print("--- Fetching Hero Images from Wikimedia ---")
        final_list = []
        
        for p in self.family_data:
            # Fetch Image
            born_loc = p["vital_stats"]["born_location"]
            born_year = p["vital_stats"].get("born_year_int")

            hero_image = self.fetch_wikimedia_image(born_loc, born_year)

            # Extract Tags
            tags = self.extract_tags(p)

            final_profile = {
                "id": p["id"],
                "name": p["name"],
                "lineage": p.get("lineage", "Unknown"),
                "generation": p["generation"],
                "vital_stats": p["vital_stats"],
                "story": {
                    "notes": p["story"]["notes"],
                    "life_events": p["story"].get("life_events", []),
                    "tags": tags
                },
                "hero_image": hero_image,
                "relations": p.get("relations", {}),
                "related_links": p.get("related_links", []),
                "metadata": {
                    "source_ref": p["metadata"]["source_id"],
                    "location_in_doc": f"Paragraph #{p['metadata']['doc_paragraph_index']}"
                }
            }
            final_list.append(final_profile)

        # Save Cache
        self.save_cache()

        output_filename = "kinship-app/src/family_data.json"
        with open(output_filename, "w", encoding='utf-8') as f:
            json.dump(final_list, f, indent=4, ensure_ascii=True)
        
        print(f"Data saved to {output_filename}")

if __name__ == "__main__":
    files = {
        "Paternal": "GENEALOGY DSD Paternal Ancestry.docx",
        "Maternal": "GENEALOGY DSD Maternal Ancestry.docx"
    }

    pipeline = GenealogyTextPipeline()

    for lineage, filename in files.items():
        if os.path.exists(filename):
            pipeline.parse_document(filename, lineage)
        else:
            print(f"Error: Could not find {filename}")

    pipeline.clean_and_save()
