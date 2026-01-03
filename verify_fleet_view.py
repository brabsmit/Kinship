
import os
from playwright.sync_api import sync_playwright

def verify_fleet_view():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions to allow geolocation if needed, though this is static map
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # 1. Navigate to the App
            print("Navigating to app...")
            page.goto("http://localhost:4000", wait_until="domcontentloaded")

            # Wait for any text that indicates app loaded
            page.get_by_text("Kinship").first.wait_for(timeout=10000)

            # 2. Dismiss Modal if present
            try:
                print("Dismissing modal...")
                # Try multiple possible selectors or just wait briefly
                skip_button = page.get_by_role("button", name="I'm not related / Skip for now")
                if skip_button.is_visible(timeout=3000):
                    skip_button.click()
            except Exception as e:
                print(f"Modal dismissal skipped or failed: {e}")

            # 3. Click the "Fleet" icon in sidebar
            print("Clicking Fleet icon...")
            # Use specific locator for the fleet button. I added title="The Fleet" in App.jsx.
            fleet_btn = page.locator('button[title="The Fleet"]')
            fleet_btn.wait_for(state="visible", timeout=10000)
            fleet_btn.click()

            # 4. Wait for Fleet View to load
            print("Waiting for Fleet View...")
            page.get_by_text("The Fleet", exact=False).first.wait_for(timeout=10000)

            # 5. Check for key elements
            print("Verifying elements...")
            # Migration Wave
            if page.get_by_text("Migration Wave").is_visible():
                print("Migration Wave found.")
            else:
                print("WARNING: Migration Wave not found")

            # Route Map
            if page.get_by_text("Voyage Routes").is_visible():
                print("Voyage Routes found.")
            else:
                 print("WARNING: Voyage Routes not found")

            # Inventory
            if page.get_by_text("The Inventory").is_visible():
                print("Inventory found.")
            else:
                 print("WARNING: Inventory not found")

            # 6. Screenshot
            print("Taking screenshot...")
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/fleet_view.png", full_page=True)
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="/home/jules/verification/fleet_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_fleet_view()
