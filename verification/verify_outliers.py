
import os
from playwright.sync_api import sync_playwright, expect

def verify_outliers_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:4000")

            # Wait for app to load
            print("Waiting for app to load...")
            page.wait_for_selector('h1', timeout=60000)

            # Skip the initial modal if it appears (Identity selection)
            # The memory says "dismiss the initial 'Who are you related to?' modal by clicking the 'I'm not related / Skip for now' button."
            try:
                page.get_by_role("button", name="I'm not related / Skip for now").click(timeout=5000)
                print("Dismissed identity modal.")
            except:
                print("Identity modal not found or already dismissed.")

            # Click the "Outliers" button in the sidebar header
            # It has a Trophy icon and title "Outliers"
            print("Clicking Outliers view mode...")

            # The button has title="Outliers"
            outliers_btn = page.locator('button[title="Outliers"]')
            outliers_btn.click()

            # Wait for the Outliers Dashboard to appear
            print("Waiting for dashboard header...")
            expect(page.get_by_role("heading", name="The Outliers")).to_be_visible()

            # Check for sections
            expect(page.get_by_role("heading", name="The Centenarians")).to_be_visible()
            expect(page.get_by_role("heading", name="The Large Families")).to_be_visible()
            expect(page.get_by_role("heading", name="The Young Parents")).to_be_visible()

            # Take screenshot
            print("Taking screenshot...")
            screenshot_path = "verification/outliers_dashboard.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_outliers_dashboard()
