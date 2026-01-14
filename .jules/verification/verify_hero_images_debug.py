from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app on port 4000...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    # Check page content
    print(page.title())

    # Try searching for "Dodge" (Common name in dataset)
    print("Searching for Dodge...")
    page.fill("input[placeholder='Find an ancestor...']", "Dodge")
    time.sleep(2)

    page.screenshot(path=".jules/verification/debug_dodge.png")

    # Click first result
    first_result = page.locator("div.group.cursor-pointer").first
    if first_result.count() > 0:
        print("Clicking Dodge profile...")
        first_result.click()
        time.sleep(3)
        page.screenshot(path=".jules/verification/hero_image_dodge.png")
    else:
        print("No Dodge found.")

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
