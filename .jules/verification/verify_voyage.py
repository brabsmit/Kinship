from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Assuming app is running at 127.0.0.1:4000
        page = browser.new_page()

        # Navigate to a profile with a voyage (John Porter - 1.2.1.2.1.1.1.1 has a voyage on the Lion?)
        # Let's try ID 1.2.1.2.1.1.1.1
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
        page.wait_for_selector("text=John Porter", timeout=10000)
        print("Profile loaded")

        # Scroll down to see Voyage Card
        # VoyageCard contains "Passage Ticket"
        try:
            page.wait_for_selector("text=Passage Ticket", timeout=5000)
            print("Voyage Card found")

            # Take screenshot of the voyage card area
            card = page.locator("text=Passage Ticket").locator("xpath=../..")
            card.screenshot(path=".jules/verification/voyage_card.png")
            print("Screenshot saved to .jules/verification/voyage_card.png")

        except Exception as e:
            print(f"Voyage Card not found: {e}")
            page.screenshot(path=".jules/verification/full_page_error.png")

        browser.close()

if __name__ == "__main__":
    run()
