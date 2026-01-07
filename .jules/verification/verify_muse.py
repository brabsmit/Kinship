from playwright.sync_api import sync_playwright, expect
import time

def verify_assets():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see the sidebar and main content
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        print("Navigating to App...")
        try:
            page.goto("http://localhost:4000", timeout=60000)
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Handle "Who are you?" modal if present
        # Click "I'm not related / Skip for now" button if it exists
        try:
            skip_button = page.get_by_text("I'm not related / Skip for now")
            if skip_button.is_visible(timeout=10000):
                skip_button.click()
                print("Skipped Identity Modal")
        except:
            print("No Identity Modal found or timed out")

        # Wait for app to load
        page.wait_for_selector("text=Kinship", timeout=30000)

        # 1. Verify New York State Asset (Upstate/Canal Era)
        # ID: 6 (Mary Ann Harris Parish, Newburgh, NY, 1801)
        print("Checking NY State Asset (ID 6)...")
        # Direct navigation via URL param
        page.goto("http://localhost:4000/?id=6")

        # INCREASE TIMEOUT and use a more generic selector if specific text fails
        try:
            page.wait_for_selector("text=Mary Ann Harris Parish", timeout=30000)
        except Exception as e:
            print(f"Failed to find profile name. {e}")
            page.screenshot(path=".jules/verification/debug_fail_id6.png")
            return

        hero_img = page.locator("div.rounded-xl.overflow-hidden.border.border-gray-100.bg-white > div.relative.w-full > img")

        if hero_img.count() > 0:
            src = hero_img.first.get_attribute("src")
            print(f"ID 6 Image Src: {src}")

            expected_src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/1827_Finley_Map_of_New_York_-_Geographicus_-_NY-finley-1827.jpg/1024px-1827_Finley_Map_of_New_York_-_Geographicus_-_NY-finley-1827.jpg"
            if src == expected_src:
                print("SUCCESS: Correct NY State map loaded.")
            else:
                print(f"FAILURE: Expected {expected_src}, got {src}")
        else:
            print("FAILURE: Hero image not found for ID 6")

        page.screenshot(path=".jules/verification/verify_ny_asset.png")

        # 2. Verify Plymouth/Puritan Asset
        # ID: 5 (Daniel Parish, Oyster Bay, 1796)
        print("Checking Long Island Asset (ID 5)...")
        page.goto("http://localhost:4000/?id=5")
        try:
             page.wait_for_selector("text=Daniel Parish", timeout=30000)
        except:
             print("Failed to find Daniel Parish")

        hero_img_5 = page.locator("div.rounded-xl.overflow-hidden.border.border-gray-100.bg-white > div.relative.w-full > img")
        if hero_img_5.count() > 0:
            src = hero_img_5.first.get_attribute("src")
            print(f"ID 5 Image Src: {src}")
            if "Long_Island_1686" in src:
                 print("SUCCESS: Long Island map loaded.")
            else:
                 print(f"Check: Got {src}")

        page.screenshot(path=".jules/verification/verify_li_asset.png")

        browser.close()

if __name__ == "__main__":
    verify_assets()
