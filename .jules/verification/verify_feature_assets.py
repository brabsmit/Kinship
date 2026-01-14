from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Navigating...")
    page.goto("http://localhost:4000")
    time.sleep(5)

    print("Dismissing modal...")
    # Find modal by z-index class
    modal = page.locator('div[class*="z-[60]"]')
    if modal.count() > 0:
        # Click the first cursor-pointer item in the list
        item = modal.locator('div.cursor-pointer').first
        if item.count() > 0:
            print("Clicking first modal item...")
            item.click()
        else:
            print("Clicking 'Adelaide' fallback...")
            page.get_by_text("Adelaide").first.click()
        time.sleep(2)
    else:
        print("Modal not found (might differ in this build).")

    # TEST 1: California
    print("Searching 'California'...")
    page.fill("input[placeholder='Find an ancestor...']", "California")
    time.sleep(2)

    # Click first result
    results = page.locator("div.group.cursor-pointer")
    if results.count() > 0:
        results.first.click()
        time.sleep(3)

        # Verify Image
        img = page.locator("div.relative.w-full.h-80 img").first
        if img.count() > 0:
            src = img.get_attribute("src")
            print(f"California Image: {src}")

            if "1850_California" in src:
                print("VERIFIED: California map loaded.")
            else:
                print("FAILED: California map not loaded.")
        else:
            print("FAILED: No hero image element found.")

        page.screenshot(path=".jules/verification/california.png")
    else:
        print("No California profile found.")

    # TEST 2: Ireland
    print("Searching 'Ireland'...")
    page.fill("input[placeholder='Find an ancestor...']", "Ireland")
    time.sleep(2)

    results = page.locator("div.group.cursor-pointer")
    if results.count() > 0:
        results.first.click()
        time.sleep(3)

        img = page.locator("div.relative.w-full.h-80 img").first
        if img.count() > 0:
            src = img.get_attribute("src")
            print(f"Ireland Image: {src}")

            if "IRELAND" in src:
                print("VERIFIED: Ireland map loaded.")
            else:
                print("FAILED: Ireland map not loaded.")
        else:
            print("FAILED: No hero image element found.")

        page.screenshot(path=".jules/verification/ireland.png")
    else:
        print("No Ireland profile found.")

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
