
from playwright.sync_api import sync_playwright, expect
import time

def verify_immersive_profile_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:4000/?id=1")

            # Dismiss the relationship modal if it appears
            try:
                skip_button = page.get_by_text("I'm not related / Skip for now")
                if skip_button.is_visible(timeout=5000):
                    skip_button.click()
                    time.sleep(1) # Wait for fade out
            except Exception as e:
                print("Modal not found or error dismissing:", e)

            # Wait for profile
            profile_container = page.locator('.fixed.inset-0.z-50')
            expect(profile_container).to_be_visible(timeout=10000)

            # Verify Layout
            left_col_header = page.locator('h1').filter(has_text="William E. Dodge")
            expect(left_col_header).to_be_visible()

            map_container = page.locator('.leaflet-container')
            expect(map_container).to_be_visible()

            print("Taking layout screenshot...")
            page.screenshot(path="verification/immersive_profile_clean.png")

            # Scroll down
            # Use a more generic selector that works for both responsive classes (w-full lg:w-[45%])
            scroll_container = page.locator('.overflow-y-auto.custom-scrollbar.bg-white')
            expect(scroll_container).to_be_visible()
            scroll_container.evaluate("element => element.scrollTop = 800")
            time.sleep(2)
            page.screenshot(path="verification/immersive_profile_scrolled_clean.png")

            print("Verification complete.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_immersive_profile_layout()
