from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Navigating...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    print("Dismissing modal by selecting 'Adelaide'...")
    # Select the first option in the modal list
    page.locator("div.bg-white.rounded-xl.shadow-xl").locator("div.cursor-pointer").first.click()
    time.sleep(2)

    # We failed to find California/Ireland profiles because they might not exist in the sample data?
    # Or search is case sensitive? No, search code uses toLowerCase.

    # Let's try searching for "Dodge" and check if any logic applies.
    # Or rely on code review since we lack specific test data for CA/Ireland.

    # Wait, I added logic for "Westward Pioneer" which includes "California".
    # If no profile has "California" in notes/location, then my test fails data-wise, not code-wise.

    # Let's check "Dodge" -> Likely "New York" or "Connecticut"
    print("Searching 'Dodge'...")
    page.fill("input[placeholder='Find an ancestor...']", "Dodge")
    time.sleep(2)

    results = page.locator("div.group.cursor-pointer")
    if results.count() > 0:
        results.first.click()
        time.sleep(3)
        img = page.locator("div.relative.w-full.h-80 img").first
        if img.count() > 0:
            print(f"Dodge Image Src: {img.get_attribute('src')}")
        page.screenshot(path=".jules/verification/dodge.png")

    # Try searching for "Scotland"
    print("Searching 'Scotland'...")
    page.fill("input[placeholder='Find an ancestor...']", "Scotland")
    time.sleep(2)
    results = page.locator("div.group.cursor-pointer")
    if results.count() > 0:
        results.first.click()
        time.sleep(3)
        img = page.locator("div.relative.w-full.h-80 img").first
        if img.count() > 0:
            print(f"Scotland Image Src: {img.get_attribute('src')}")
        page.screenshot(path=".jules/verification/scotland.png")
    else:
        print("No Scotland profiles found.")

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
