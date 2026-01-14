from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app on port 4000...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    # Handle Modal Forcefully
    # Find the modal container and hide it via JS or find the button better.

    # Try finding the "Guest / Researcher" text again, maybe wait longer?
    print("Waiting for modal content...")
    page.wait_for_selector("text=Guest / Researcher", timeout=5000)

    print("Clicking Guest button...")
    page.click("text=Guest / Researcher")
    time.sleep(2)

    # Now try to click a profile
    print("Clicking a profile...")
    first_person = page.locator("div.group.cursor-pointer").first
    if first_person.count() > 0:
        first_person.click()
        time.sleep(3)
        print("Taking screenshot...")
        page.screenshot(path=".jules/verification/hero_image_generic.png")
    else:
        print("No profiles found.")

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
