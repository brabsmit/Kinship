from playwright.sync_api import sync_playwright

def verify_epics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to app...")
        page.goto("http://localhost:4000/")

        # Wait for and dismiss the initial modal if it appears
        try:
            page.wait_for_selector("text=I'm not related / Skip for now", timeout=5000)
            page.click("text=I'm not related / Skip for now")
            print("Dismissed initial modal")
        except:
            print("No initial modal found or timed out")

        # Switch to Epics view (BookOpen icon)
        page.get_by_title("Epics").click()
        print("Switched to Epics view")

        # Verify "The Victorian Era" exists
        page.wait_for_selector("text=The Victorian Era", timeout=5000)
        print("Found 'The Victorian Era' thread")

        # Verify "The Pandemic Survivors" exists
        page.wait_for_selector("text=The Pandemic Survivors", timeout=5000)
        print("Found 'The Pandemic Survivors' thread")

        # Take a screenshot
        page.screenshot(path="verification/epics_verification.png")
        print("Screenshot saved to verification/epics_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_epics()
