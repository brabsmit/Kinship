import re
import json
import os
from docx import Document

class GenealogyTextPipeline:
    def __init__(self, docx_path):
        self.docx_path = docx_path
        self.family_data = []

    def parse_document(self):
        print(f"--- Scanning Narrative Document ({self.docx_path}) ---")
        try:
            doc = Document(self.docx_path)
        except Exception as e:
            print(f"CRITICAL ERROR: Could not load Word doc. {e}")
            return

        current_profile = None
        
        # Regex Patterns
        id_pattern = re.compile(r"\{(\d+(\.\d+)*)\}")
        born_pattern = re.compile(r"Born:\s*(.*)", re.IGNORECASE)
        died_pattern = re.compile(r"Died:\s*(.*)", re.IGNORECASE)
        notes_start_pattern = re.compile(r"NOTES:\s*(.*)", re.IGNORECASE)
        # New: Capture the source ID inside the brackets [source: 1234]
        source_tag_pattern = re.compile(r"\[source:\s*(.*?)\]", re.IGNORECASE)

        # Iterate through paragraphs
        for index, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            if not text:
                continue

            # 1. Check for New ID (Start of a Person)
            match = id_pattern.search(text)
            if match:
                # Save previous profile if exists
                if current_profile:
                    self.family_data.append(current_profile)

                # Initialize New Profile
                uid = match.group(1)
                
                # Extract Source Tag (e.g., "1364")
                source_match = source_tag_pattern.search(text)
                source_id = source_match.group(1) if source_match else "Unknown"

                # Extract Name (Everything before the ID, removing the source tag)
                raw_name = text.split('{')[0].strip()
                clean_name = re.sub(r"\[source:.*?\]", "", raw_name).strip()

                current_profile = {
                    "id": uid,
                    "name": clean_name,
                    "vital_stats": {
                        "born": "Unknown",
                        "died": "Unknown"
                    },
                    "story": {
                        "notes": "",
                        "narrative_buffer": [] 
                    },
                    "metadata": {
                        "source_id": source_id,
                        "doc_paragraph_index": index + 1 # 1-based index for "Line Number"
                    }
                }
                continue

            # 2. If we are inside a profile, parse details
            if current_profile:
                # Add line to narrative buffer
                current_profile["story"]["narrative_buffer"].append(text)

                # Extract Birth
                b_match = born_pattern.search(text)
                if b_match:
                    current_profile["vital_stats"]["born"] = b_match.group(1).strip()

                # Extract Death
                d_match = died_pattern.search(text)
                if d_match:
                    current_profile["vital_stats"]["died"] = d_match.group(1).strip()

                # Extract Notes
                n_match = notes_start_pattern.search(text)
                if n_match:
                    current_profile["story"]["notes"] = n_match.group(1).strip()

        # Save the last one
        if current_profile:
            self.family_data.append(current_profile)

        print(f"Successfully extracted {len(self.family_data)} profiles from text.")

    def clean_and_save(self):
        # Post-processing to clean up the data
        final_list = []
        
        for p in self.family_data:
            final_profile = {
                "id": p["id"],
                "name": p["name"],
                "vital_stats": p["vital_stats"],
                "story": {
                    "notes": p["story"]["notes"],
                },
                "metadata": {
                    "source_ref": p["metadata"]["source_id"],
                    "location_in_doc": f"Paragraph #{p['metadata']['doc_paragraph_index']}"
                }
            }
            final_list.append(final_profile)

        output_filename = "family_data.json"
        with open(output_filename, "w", encoding='utf-8') as f:
            json.dump(final_list, f, indent=4, ensure_ascii=False)
        
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