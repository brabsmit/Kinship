
import json
from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:4000", timeout=30000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        try:
            skip_button = page.get_by_role('button', name="I'm not related / Skip for now")
            if skip_button.is_visible(timeout=5000):
                print("Dismissing relationship modal...")
                skip_button.click()
        except:
            print("No relationship modal found.")

        # Wait for "Kinship" header
        page.wait_for_selector('h1', timeout=10000)

        print("Searching for 'Dodge'...")
        search_box = page.get_by_placeholder("Find an ancestor...")
        search_box.fill("Dodge")

        time.sleep(3)

        # Check if list is empty?
        # The list items are inside a div with className "bg-white" inside GenerationGroup.

        # Let's try to find text "Dodge" anywhere on page
        # print("Page text content:", page.locator('body').text_content())

        # We need to click something that opens the profile.
        # It seems my selectors are failing.
        # Maybe because of hydration or something?

        # Let's try to click by role 'heading' level 3 which is used for names in GenerationGroup
        # <h3 className={`font-bold text-sm truncate ...`}>

        try:
            # Wait for at least one h3
            page.wait_for_selector('h3', timeout=5000)

            # Click the first h3
            page.locator('h3').first.click()
            print("Clicked first h3.")
        except Exception as e:
            print(f"Failed to click h3: {e}")
            page.screenshot(path=".jules/verification/failed_click.png")
            # Maybe no results?
            # Try clearing search
            search_box.clear()
            time.sleep(1)
            # Try clicking h3 again
            try:
                page.locator('h3').first.click()
                print("Clicked first h3 after clearing search.")
            except:
                print("Still failed.")
                return

        # Wait for "Journey" in the right panel
        try:
            page.wait_for_selector('h2:has-text("Journey")', timeout=10000)
        except:
            print("Journey section not found")
            page.screenshot(path=".jules/verification/failed_journey.png")
            return

        # Scroll to map
        journey_header = page.get_by_text("Journey")
        journey_header.scroll_into_view_if_needed()

        print("Waiting for map...")
        time.sleep(3)

        screenshot_path = ".jules/verification/map_view.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
