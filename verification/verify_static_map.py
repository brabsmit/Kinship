from playwright.sync_api import sync_playwright, expect
import time
import os
import re

def verify_static_map():
    data_path = 'kinship-app/src/family_data.json'
    if not os.path.exists(data_path):
        print(f"ERROR: {data_path} does not exist!")
    else:
        print(f"SUCCESS: {data_path} found.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 2500})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:4000/?id=1")

        print("Waiting for potential modal...")
        try:
            page.wait_for_selector("text=Who are you related to?", timeout=5000)
            print("Modal found. Dismissing...")
            page.get_by_role("button").filter(has_text=re.compile("Skip|Guest|I'm not related", re.IGNORECASE)).click()
            print("Modal dismissed.")
        except Exception as e:
            print(f"Modal not found or dismissal failed: {e}")

        print("Waiting for profile content...")
        try:
            page.wait_for_selector("text=Life & Times", timeout=10000)
        except:
             print("Profile load timed out. Checking state...")
             if page.get_by_text("Select an Ancestor").is_visible():
                 print("App loaded but no ancestor selected (ID 1 might be invalid).")
             else:
                 print("App failed to load profile.")
                 page.screenshot(path="verification/debug_failed_load.png")
                 raise

        print("Checking layout structure...")
        key_locations_header = page.get_by_role("heading", name="Key Locations")
        expect(key_locations_header).to_be_visible()

        key_locations_header.scroll_into_view_if_needed()
        time.sleep(1)

        print("Taking screenshot...")
        page.screenshot(path="verification/static_map_revert_final.png")

        browser.close()

if __name__ == "__main__":
    verify_static_map()
