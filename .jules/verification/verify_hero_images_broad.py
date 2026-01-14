from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app on port 4000...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    # Dismiss Relationship Selector
    print("Dismissing modal...")
    guest_btn = page.get_by_text("Guest / Researcher")
    if guest_btn.count() > 0:
        guest_btn.click()
        time.sleep(1)
    else:
        buttons = page.locator("div.grid button")
        if buttons.count() > 0:
            buttons.first.click()
            time.sleep(1)
    time.sleep(2)

    # Just click the first person in the list (Default list view)
    print("Clicking first person in list...")
    first_person = page.locator("div.group.cursor-pointer").first
    if first_person.count() > 0:
        first_person.click()
        time.sleep(3)
        print("Taking screenshot of whatever person this is...")
        page.screenshot(path=".jules/verification/hero_image_generic.png")

        # Try to find what location they have
        # The hero image is the top image.
    else:
        print("List is empty?")

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
