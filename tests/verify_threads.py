from playwright.sync_api import sync_playwright

def verify_threads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:4000/")

        # Dismiss modal
        try:
            page.wait_for_selector("button:has-text('Skip for now')", timeout=5000)
            page.click("button:has-text('Skip for now')")
            print("Dismissed initial modal")
        except:
            print("No modal found or already dismissed")

        # Click on Epics/Threads view
        # The title attribute is "Epics"
        page.click("button[title='Epics']")
        print("Switched to Epics view")

        # Wait for threads to load
        page.wait_for_selector("text='The Atlantic Crossers'")
        print("Found 'The Atlantic Crossers' thread")

        page.wait_for_selector("text='The Westward Pioneers'")
        print("Found 'The Westward Pioneers' thread")

        # Take screenshot
        page.screenshot(path="verification/epics_verification.png")
        print("Screenshot saved to verification/epics_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_threads()
