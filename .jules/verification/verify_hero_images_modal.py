from playwright.sync_api import sync_playwright
import time
import os

def test_hero_images(page):
    print("Navigating to app on port 4000...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    # Handle Modal (RelationshipSelector)
    # The error said: <div class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">…</div> intercepts pointer events
    # This is likely the RelationshipSelector modal.
    # We need to click "I'm Just Browsing" or select a relationship.

    print("Handling modal...")
    # Look for a button inside the modal.
    # The RelationshipSelector usually has buttons like "Self", "Father", etc. or a skip button?
    # Let's try to find any button in the modal and click it, or find "I'm just browsing" if it exists.
    # Or just select "Guest" / "Visitor"?

    # Let's try to click "Dodge" branch button if it's the selector?
    # Or maybe just click anywhere outside? No, it's a modal.

    # Let's inspect the page content to find the button.
    # But blindly, let's try to find a button with text "Browsing" or "Guest".

    # Actually, the RelationshipSelector.jsx code might show what's there.
    # But let's assume there is a button to close it or proceed.
    # Let's try to click the first button in the modal.

    modal = page.locator("div.fixed.z-\[60\]")
    if modal.is_visible():
        print("Modal visible. Attempting to dismiss...")
        # Try to find a button to proceed.
        # Often "Skip" or "Guest".
        # Let's try to click the first button found in the modal.
        button = modal.locator("button").first
        if button.count() > 0:
            print(f"Clicking button: {button.inner_text()}")
            button.click()
            time.sleep(2)

    # Now try searching for "California"
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
            print("No Ireland found.")

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
