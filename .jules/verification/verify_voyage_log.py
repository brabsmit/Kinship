from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Assuming app is running at localhost:4000
        page = browser.new_page()

        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        # Navigate to a profile with a voyage (John Benjamin - 8.2.2.1.2.1.1 has a voyage on the Lion?)
        # Let's try ID 1.2.1.2.1.1.1.1 (Susan and Ellen)
        url = "http://127.0.0.1:4000/?id=1.2.1.2.1.1.1.1"
        print(f"Navigating to {url}")
        page.goto(url)

        # Dismiss initial modal if present "I'm not related"
        try:
            page.get_by_text("I'm not related / Skip for now").click(timeout=3000)
            print("Dismissed initial modal")
        except:
            print("No initial modal found")

        # Wait for profile to load (look for Name)
        try:
            page.wait_for_selector("text=John Porter, Sr.", timeout=10000)
            print("Profile loaded")
        except:
            print("Profile load timeout")

        time.sleep(2) # Allow renders to finish and logs to flush

        browser.close()

if __name__ == "__main__":
    run()
