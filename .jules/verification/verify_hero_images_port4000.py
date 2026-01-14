from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app on port 4000...")
    page.goto("http://localhost:4000")

    # Wait for loading
    time.sleep(5)

    # Check if we are on the page (look for title Kinship)
    # The title in the code is "Kinship" in h1

    # Search for "California" to find a relevant profile for the West Coast pack
    print("Searching for California...")
    page.fill("input[placeholder='Find an ancestor...']", "California")
    time.sleep(2)

    # Select first result
    first_result = page.locator("div.group.cursor-pointer").first
    if first_result.count() > 0:
        print("Clicking first result...")
        first_result.click()
        time.sleep(3)

        # Take screenshot of the profile view
        print("Taking screenshot...")
        page.screenshot(path=".jules/verification/hero_image_test_ca.png")
    else:
        print("No results found for 'California'. Trying 'Ireland'...")
        page.fill("input[placeholder='Find an ancestor...']", "Ireland")
        time.sleep(2)
        first_result = page.locator("div.group.cursor-pointer").first
        if first_result.count() > 0:
            first_result.click()
            time.sleep(3)
            page.screenshot(path=".jules/verification/hero_image_test_ie.png")
        else:
            print("No results found for Ireland.")
            # Take a debug screenshot
            page.screenshot(path=".jules/verification/debug_search.png")

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
