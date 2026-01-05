
import os
import sys
from playwright.sync_api import sync_playwright, expect

# Ensure we are in the root directory
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def verify_muse_assets(page):
    # Go to app
    page.goto("http://localhost:4000")

    # Wait for initial load
    page.wait_for_selector("text=Kinship", timeout=60000)

    # Dismiss modal if present
    try:
        page.get_by_role("button", name="I'm not related / Skip for now").click(timeout=5000)
    except:
        pass

    # 1. Search for a Profile in Plymouth/Early Settler era
    # "John Howland" is a classic Mayflower pilgrim if present, or we search for "Plymouth" in text?
    # Let's try searching for a common name that might be in Plymouth

    # Actually, we can just click on a node if we know one, or use the search bar.
    # Let's use search bar to find "William Dodge" (Ancestral Head) or similar.
    # But better to find a specific target.
    # Let's use the search bar to find "William" and pick one.

    page.get_by_placeholder("Find an ancestor...").fill("William")
    page.wait_for_timeout(2000) # Wait for list to filter

    # Click the first result
    page.locator(".group").first.click()

    # Wait for profile to open
    page.wait_for_selector("h1", timeout=5000)

    # Take screenshot of the Hero Image area
    # We want to see if it looks good (not generic paper if possible, or correct map)
    page.screenshot(path=".jules/verification/profile_view.png")
    print("Screenshot saved to .jules/verification/profile_view.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_muse_assets(page)
        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot on error
            page.screenshot(path=".jules/verification/error.png")
        finally:
            browser.close()
