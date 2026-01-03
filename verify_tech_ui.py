from playwright.sync_api import sync_playwright

def verify_technology_context():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to a profile (e.g., ID 1 which is William E. Dodge)
        page.goto('http://localhost:4000/?id=1.1')

        # Skip modal if present
        try:
             page.wait_for_selector('text=Skip for now', timeout=5000)
             page.click('text=Skip for now')
        except:
             pass

        # Wait for the profile to load
        try:
             page.wait_for_selector('text=The World They Knew', timeout=10000)
        except Exception as e:
             page.screenshot(path='verification/debug_fail.png')
             print("Failed to find selector. Screenshot taken.")
             raise e

        # Screenshot the "World They Knew" section
        # Locate the element containing the text
        section = page.locator('text=The World They Knew').locator('..').locator('..')

        # Scroll to view if necessary
        section.scroll_into_view_if_needed()

        section.screenshot(path='verification/technology_context.png')
        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    verify_technology_context()
