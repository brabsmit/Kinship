import json
import os
from google import genai
import re
from dotenv import load_dotenv

load_dotenv()

# Use environment variable for API key
API_KEY = os.getenv("VITE_GEMINI_API_KEY")

DATA_FILE = "kinship-app/src/family_data.json"
OUTPUT_FILE = "kinship-app/src/hitlist_data.json"

def load_family_data():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def calculate_conflict_score(profile):
    score = 0
    issues = []

    # 1. Missing Vital Stats
    born_date = profile["vital_stats"].get("born_date", "Unknown")
    born_loc = profile["vital_stats"].get("born_location", "Unknown")
    died_date = profile["vital_stats"].get("died_date", "Unknown")
    died_loc = profile["vital_stats"].get("died_location", "Unknown")

    if born_date == "Unknown":
        score += 2
        issues.append("Missing Birth Date")
    if born_loc == "Unknown":
        score += 1
        issues.append("Missing Birth Location")
    if died_date == "Unknown":
        score += 2
        issues.append("Missing Death Date")
    if died_loc == "Unknown":
        score += 1
        issues.append("Missing Death Location")

    # 2. Logical Conflicts
    born_year = profile["vital_stats"].get("born_year_int")
    died_year = profile["vital_stats"].get("died_year_int")

    if born_year and died_year:
        if died_year < born_year:
            score += 10
            issues.append(f"Died before born ({born_year} - {died_year})")
        elif (died_year - born_year) > 110:
            score += 5
            issues.append(f"Implausible Lifespan ({died_year - born_year} years)")
        elif (died_year - born_year) < 0:
             # Captured by first check, but just in case
             pass

    # 3. Notes Analysis
    notes = profile["story"].get("notes", "")
    if not notes:
        score += 3
        issues.append("No Biographical Notes")
    else:
        # Check for ambiguity keywords
        if re.search(r'\b(conflict|discrepancy|unsure|tradition|said to be|possibly|probably)\b', notes, re.IGNORECASE):
            score += 3
            issues.append("Ambiguity in Notes")

        if len(notes) < 50:
            score += 1
            issues.append("Short Notes")

    return score, issues

def get_ai_recommendations(profile, issues):
    if not API_KEY:
        print("Warning: VITE_GEMINI_API_KEY not set. Skipping AI analysis.")
        return ["AI recommendations unavailable (missing API key)."]

    prompt = f"""
Act as a professional genealogist. Review this profile which has been flagged for data quality issues: {', '.join(issues)}.

Profile Data:
{json.dumps(profile, indent=2)}

Provide 3 specific, actionable research recommendations to resolve these conflicts or fill these holes.
Return ONLY a JSON object with a "recommendations" key containing a list of 3 strings.
"""

    try:
        #client = genai.Client(api_key=API_KEY)
        #response = client.models.generate_content(
        #    model="gemini-2.0-flash",
        #    contents=prompt
        #)

        text = response.text
        # Clean markdown
        text = re.sub(r'^```json\s*', '', text)
        text = re.sub(r'\s*```$', '', text)

        data = json.loads(text)
        return data.get("recommendations", [])
    except Exception as e:
        print(f"AI Error for {profile['name']}: {e}")
        return ["Error generating AI recommendations."]

def main():
    print("--- Generating Hitlist ---")
    profiles = load_family_data()
    print(f"Loaded {len(profiles)} profiles.")

    scored_profiles = []
    for p in profiles:
        score, issues = calculate_conflict_score(p)
        if score > 0:
            scored_profiles.append({
                "id": p["id"],
                "name": p["name"],
                "score": score,
                "issues": issues,
                "profile_data": p # Keep ref for AI
            })

    # Sort by score descending
    scored_profiles.sort(key=lambda x: x["score"], reverse=True)

    # Take top 10
    top_10 = scored_profiles[:10]
    print(f" identified top {len(top_10)} issues.")

    hitlist = []
    for item in top_10:
        print(f"Processing {item['name']} (Score: {item['score']})...")
        recommendations = get_ai_recommendations(item["profile_data"], item["issues"])

        hitlist.append({
            "id": item["id"],
            "name": item["name"],
            "score": item["score"],
            "issues": item["issues"],
            "recommendations": recommendations,
            "lineage": item["profile_data"].get("lineage", "Unknown"),
            "generation": item["profile_data"].get("generation", "Unknown")
        })

    with open(OUTPUT_FILE, "w") as f:
        json.dump(hitlist, f, indent=2)

    print(f"Hitlist saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
