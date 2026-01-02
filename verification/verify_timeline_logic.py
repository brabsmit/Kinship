from playwright.sync_api import sync_playwright, expect
import time

def verify_timeline(page):
    print("Navigating to app...")
    page.goto("http://localhost:4000")

    # Wait for loading
    page.wait_for_timeout(2000)

    # Dismiss initial modal if present
    try:
        skip_button = page.get_by_role("button", name="I'm not related / Skip for now")
        if skip_button.is_visible():
            skip_button.click()
            print("Dismissed initial modal")
    except:
        pass

    page.wait_for_timeout(1000)

    # Select a US ancestor (e.g. from Dodge branch)
    print("Selecting a US ancestor...")

    # Search for "William Earl Dodge, Sr." to be exact
    page.get_by_placeholder("Find an ancestor...").fill("William Earl Dodge")
    page.wait_for_timeout(2000) # Wait for search results

    # Click on the result
    # It might be "William Earl Dodge, Sr."
    try:
        page.get_by_text("William Earl Dodge, Sr.").first.click()
    except:
        print("Could not find exact text, trying partial match in list")
        # Just click the first visible list item that contains "Dodge"
        page.locator("div").filter(has_text="William Earl Dodge").first.click()

    print("Opened profile")
    page.wait_for_timeout(2000)

    # Check text content
    content = page.content()

    # William Earl Dodge, Sr. (1805-1883)
    # California Gold Rush (1848) - Distance NY to CA > 2000 miles -> Should be SUPPRESSED
    # Civil War Begins (1861) - Global (in my manual data) -> Should be SHOWN (or at least present)
    # Erie Canal Opens (1825) - NY -> Should be SHOWN

    if "Erie Canal Opens" in content:
        print("SUCCESS: Erie Canal Opens found (Local event).")
    else:
        print("WARNING: Erie Canal Opens NOT found.")

    if "California Gold Rush" not in content:
        print("SUCCESS: California Gold Rush SUPPRESSED (Distance > 500 miles).")
    else:
        print("FAILURE: California Gold Rush SHOWN (Distance logic failed?).")

    page.screenshot(path="verification/timeline_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_timeline(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
