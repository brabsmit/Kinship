import re
import requests
import sys

# Path to the JS file
JS_FILE = 'kinship-app/src/utils/researchSources.js'

def extract_urls(filepath):
    urls = []
    with open(filepath, 'r') as f:
        content = f.read()
        # Simple regex to find url: "..."
        # We look for url: "http..."
        matches = re.findall(r'url:\s*"(https?://[^"]+)"', content)
        for url in matches:
            urls.append(url)
    return urls

def verify_url(url):
    try:
        # User-Agent is important for some sites like FamilySearch to not block scripts immediately (though they still might with 403/429)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)

        # FamilySearch often returns 200 even if it's a soft-block or login page, which is fine for "link existence".
        # 403 Forbidden might happen if they have strict bot protection.
        # We consider 200, 403 (often means exists but blocked), 429 (rate limit) as "likely valid link structure".
        # 404 is the main enemy.

        if response.status_code == 200:
            return True, f"200 OK"
        elif response.status_code in [403, 429]:
             return True, f"{response.status_code} (Protected but exists)"
        else:
            return False, f"{response.status_code}"
    except Exception as e:
        return False, str(e)

def main():
    print(f"Extracting URLs from {JS_FILE}...")
    urls = extract_urls(JS_FILE)
    print(f"Found {len(urls)} URLs.")

    failures = []

    for url in urls:
        print(f"Checking {url}...", end=" ")
        success, msg = verify_url(url)
        print(msg)
        if not success:
            failures.append((url, msg))

    if failures:
        print("\nFAILURES:")
        for url, msg in failures:
            print(f"- {url}: {msg}")
        sys.exit(1)
    else:
        print("\nAll URLs verified successfully (or are protected but valid).")
        sys.exit(0)

if __name__ == "__main__":
    main()
