from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app on port 4000...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    # Dismiss Relationship Selector Modal
    # It has text "Who are you in this story?"
    # And buttons for branches.
    # Let's try to click "I'm a Guest" or just pick "Dodge" branch.

    print("Dismissing modal...")
    # Try finding "Guest" button
    guest_btn = page.get_by_text("Guest / Researcher")
    if guest_btn.count() > 0:
        guest_btn.click()
        time.sleep(1)
    else:
        # Try clicking the first profile-like button in the grid
        buttons = page.locator("div.grid button")
        if buttons.count() > 0:
            buttons.first.click()
            time.sleep(1)

    # Wait for modal to disappear
    time.sleep(2)

    # Search for "California"
    print("Searching for California...")
    page.fill("input[placeholder='Find an ancestor...']", "California")
    time.sleep(2)

    # Click first result
    first_result = page.locator("div.group.cursor-pointer").first
    if first_result.count() > 0:
        print("Clicking first result...")
        first_result.click()
        time.sleep(3)
        print("Taking screenshot...")
        page.screenshot(path=".jules/verification/hero_image_ca.png")
    else:
        print("No California found. Trying Ireland...")
        page.fill("input[placeholder='Find an ancestor...']", "Ireland")
        time.sleep(2)
        first_result = page.locator("div.group.cursor-pointer").first
        if first_result.count() > 0:
            first_result.click()
            time.sleep(3)
            page.screenshot(path=".jules/verification/hero_image_ie.png")
        else:
            print("No Ireland found. Trying Scotland...")
            page.fill("input[placeholder='Find an ancestor...']", "Scotland")
            time.sleep(2)
            first_result = page.locator("div.group.cursor-pointer").first
            if first_result.count() > 0:
                first_result.click()
                time.sleep(3)
                page.screenshot(path=".jules/verification/hero_image_sc.png")
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
