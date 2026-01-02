
from playwright.sync_api import sync_playwright, expect
import time
import os

def run():
    print("Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with a larger viewport for better screenshots
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to app...")
        try:
            # Navigate to ID 3.2.1 (Jonathan Beecher) which has "12 pounds" in notes
            page.goto("http://localhost:4000/?id=3.2.1")

            # Wait for the app to load. "domcontentloaded" is safer than "networkidle" for SPAs sometimes
            page.wait_for_load_state("domcontentloaded")
            print("DOM loaded.")

            # Dismiss the initial modal "I'm not related / Skip for now"
            # It might appear if userRelation is not set
            try:
                skip_button = page.get_by_role("button", name="I'm not related / Skip for now")
                if skip_button.is_visible(timeout=3000):
                    skip_button.click()
                    print("Dismissed relationship modal.")
            except:
                print("No relationship modal found or already dismissed.")

            # Wait for the profile to load
            expect(page.get_by_text("Jonathan Beecher").first).to_be_visible(timeout=10000)
            print("Profile loaded.")

            print("Taking screenshot of profile...")
            if not os.path.exists("verification"):
                os.makedirs("verification")

            # Give it a moment to render content
            time.sleep(2)
            page.screenshot(path="verification/profile_view.png", full_page=True)

            currency_spans = page.locator("span.cursor-help")
            count = currency_spans.count()
            print(f"Found {count} currency tooltips.")

            if count > 0:
                # Hover over the first one
                first_currency = currency_spans.first
                print(f"Hovering over: {first_currency.inner_text()}")

                # Scroll into view
                first_currency.scroll_into_view_if_needed()

                # Force hover
                first_currency.hover(force=True)

                # Wait for tooltip animation
                time.sleep(1)

                # Screenshot tooltip
                page.screenshot(path="verification/currency_tooltip.png")
                print("Tooltip screenshot captured.")
            else:
                print("No currency tooltips found in this profile.")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
