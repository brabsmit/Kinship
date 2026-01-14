from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for loading
    time.sleep(2)

    # Search for "California" to find a relevant profile for the West Coast pack
    print("Searching for California profile...")
    page.fill("input[placeholder='Find an ancestor...']", "California")
    time.sleep(1)

    # Click the first result if available
    # The search results are divs with onClick handlers
    # We look for a result that matches.

    # Let's try to click a profile that we know exists or search blindly.
    # We can also try searching for "Ireland" or "Scotland"

    # Assuming the search works and shows list items.
    # List items have class 'group py-3 pr-4...'

    # Select first result
    first_result = page.locator("div.group.cursor-pointer").first
    if first_result.count() > 0:
        print("Clicking first result...")
        first_result.click()
        time.sleep(2)

        # Take screenshot of the profile view
        print("Taking screenshot...")
        page.screenshot(path=".jules/verification/hero_image_test.png")
    else:
        print("No results found for 'California'. Trying 'Ireland'...")
        page.fill("input[placeholder='Find an ancestor...']", "Ireland")
        time.sleep(1)
        first_result = page.locator("div.group.cursor-pointer").first
        if first_result.count() > 0:
            first_result.click()
            time.sleep(2)
            page.screenshot(path=".jules/verification/hero_image_test.png")
        else:
            print("No results found.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_hero_images(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
