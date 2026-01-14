from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Navigating...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    # Click absolute position to clear modal if possible, or reload?
    # No, modal blocks everything.

    # Try clicking the text "Adelaide"
    print("Clicking text 'Adelaide'...")
    try:
        page.get_by_text("Adelaide").first.click(timeout=5000)
    except:
        print("Failed to click Adelaide.")
        # Try generic button
        page.locator("button").first.click()

    time.sleep(2)

    # Search for "Dodge"
    print("Searching Dodge...")
    page.fill("input[placeholder='Find an ancestor...']", "Dodge")
    time.sleep(2)

    # Click first result
    first = page.locator("div.group.cursor-pointer").first
    if first.count() > 0:
        first.click()
        time.sleep(3)
        page.screenshot(path=".jules/verification/dodge_result.png")
    else:
        print("No results.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
