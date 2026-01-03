
from playwright.sync_api import sync_playwright, expect
import time

def verify_generational_handshake(page):
    # 1. Navigate to the app
    print("Navigating to app...")
    page.goto("http://localhost:4000")

    # 2. Wait for loading
    print("Waiting for page load...")
    page.wait_for_selector('text=Kinship', timeout=10000)

    # 3. Dismiss initial modal (Relationship Selector) if present
    print("Checking for modal...")
    try:
        skip_button = page.get_by_role("button", name="I'm not related / Skip for now")
        if skip_button.is_visible(timeout=5000):
            skip_button.click()
            print("Dismissed relationship modal.")
    except Exception as e:
        print(f"Modal check skipped or failed: {e}")

    # 4. Search for a profile known to have overlaps (e.g., William Earl Dodge)
    # William Earl Dodge is ID "1.1.1.1" or similar?
    # Actually, the user example is "William Earl Dodge".
    # I'll search for "William Earl Dodge".
    print("Searching for William Earl Dodge...")
    search_input = page.get_by_placeholder("Find an ancestor...")
    search_input.fill("William Earl Dodge")

    # Wait for results to filter in the list
    # Click the first result
    print("Clicking result...")
    # The list items are clickable divs.
    # I'll wait for "William Earl Dodge" text in the list.
    page.get_by_text("William Earl Dodge", exact=False).first.click()

    # 5. Wait for profile to open
    print("Waiting for profile...")
    # Profile should slide in. "Generational Handshake" should be visible.
    page.wait_for_selector("text=Generational Handshake", timeout=10000)

    # 6. Scroll to the element
    print("Scrolling to Handshake...")
    handshake_header = page.get_by_text("Generational Handshake")
    handshake_header.scroll_into_view_if_needed()

    # 7. Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/handshake_viz.png")
    print("Screenshot saved to verification/handshake_viz.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_generational_handshake(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
