import requests
import json
from datetime import datetime
import time

# SPARQL Endpoint
URL = "https://query.wikidata.org/sparql"

# Query for significant events 1600-1950
# We look for instances of 'war', 'battle', 'treaty', 'historical event', 'invention'
# filtering by date and sitelinks (proxy for significance)
SPARQL_QUERY = """
SELECT DISTINCT ?event ?eventLabel ?date ?coords ?sitelinks ?typeLabel WHERE {
  { ?event wdt:P31/wdt:P279* wd:Q198. BIND("War" AS ?typeLabel) } # War
  UNION
  { ?event wdt:P31/wdt:P279* wd:Q178561. BIND("Battle" AS ?typeLabel) } # Battle
  UNION
  { ?event wdt:P31/wdt:P279* wd:Q131967. BIND("Treaty" AS ?typeLabel) } # Treaty
  UNION
  { ?event wdt:P31/wdt:P279* wd:Q1190554. BIND("Event" AS ?typeLabel) } # Historical Event
  UNION
  { ?event wdt:P31/wdt:P279* wd:Q185441. BIND("Disaster" AS ?typeLabel) } # Natural Disaster

  ?event wdt:P585 ?date .
  FILTER (?date >= "1600-01-01T00:00:00Z"^^xsd:dateTime && ?date <= "1950-12-31T00:00:00Z"^^xsd:dateTime)

  ?event wdt:P625 ?coords .
  ?event wikibase:sitelinks ?sitelinks .
  FILTER (?sitelinks > 10) . # Filter out minor events

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 300
"""

def fetch_data():
    print("Fetching data from Wikidata...")
    try:
        response = requests.get(URL, params={'format': 'json', 'query': SPARQL_QUERY}, headers={'User-Agent': 'KinshipBot/1.0'})
        response.raise_for_status()
        data = response.json()
        return data['results']['bindings']
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def parse_coordinate(coord_str):
    # Format: Point(-74.006 40.7128)
    try:
        clean = coord_str.replace("Point(", "").replace(")", "")
        lon, lat = clean.split(" ")
        return float(lat), float(lon)
    except:
        return None, None

def process_results(results):
    events = []

    # Manually add some "Global" events that might lack specific coords or be crucial
    # Or rely on the query. Let's rely on query but maybe mark very high sitelink events as "Global" candidates?
    # Actually, the user requirement is: "If > 500 miles, suppress... unless it's a global event".
    # How do we know if it's Global?
    # Heuristic: Wars involving "World War", "Revolution" might be broad.
    # Or we can just set a high threshold for "Global" based on sitelinks?
    # Let's add a "global" flag if the label contains "World War", "Pandemic", etc.

    global_keywords = ["World War", "Pandemic", "Industrial Revolution", "Enlightenment", "Great Depression", "Spanish Flu"]

    for item in results:
        label = item['eventLabel']['value']
        date_str = item['date']['value']

        # Parse year
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
            year = dt.year
        except:
            # Handle potential negative years or other formats if necessary, though query filters 1600+
            continue

        lat, lon = parse_coordinate(item['coords']['value'])
        if lat is None:
            continue

        event_type = item.get('typeLabel', {}).get('value', 'Event')
        sitelinks = int(item['sitelinks']['value'])

        is_global = any(k in label for k in global_keywords)
        # Also treat very high sitelinks as potentially global? Maybe not. "Battle of Waterloo" is specific location but global impact.
        # The user's example: "California Gold Rush" -> Suppress for Englishman.
        # "World War" -> Show.

        # Special overrides for things we know are global but have a specific point location in Wikidata (e.g. start of WW1 in Sarajevo)
        if "World War" in label:
            is_global = True

        events.append({
            "year": year,
            "label": label,
            "type": event_type.lower(),
            "lat": lat,
            "lon": lon,
            "sitelinks": sitelinks,
            "global": is_global
        })

    # Sort by year
    events.sort(key=lambda x: x['year'])
    return events

def main():
    results = fetch_data()
    if not results:
        print("No results found or error occurred.")
        return

    events = process_results(results)
    print(f"Processed {len(events)} events.")

    # Save to file
    output_path = 'kinship-app/src/history_data.json'
    with open(output_path, 'w') as f:
        json.dump(events, f, indent=4)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    main()
