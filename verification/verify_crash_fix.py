from playwright.sync_api import sync_playwright, expect
import time

def verify_and_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:5173")

            # 2. Skip the relationship modal
            try:
                skip_button = page.get_by_text("I'm not related / Skip for now")
                if skip_button.is_visible(timeout=5000):
                    skip_button.click()
            except:
                print("Modal might not have appeared.")

            # 3. Open Hitlist
            page.get_by_role("button", name="Hitlist").click()

            # Wait for hitlist to load
            expect(page.get_by_role("heading", name="Research Hitlist")).to_be_visible()

            # 4. Click "View Profile" on the first item
            print("Clicking View Profile...")
            page.get_by_role("button", name="View Profile").first.click()

            # 5. Check if profile is visible
            # We look for "Life & Times" or the name of the person (but name is dynamic)
            # "Research Assistant" is also unique to the profile view
            expect(page.get_by_text("Research Assistant")).to_be_visible()

            # 6. Take Screenshot
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Test failed with exception: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_and_screenshot()
