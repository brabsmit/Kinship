from playwright.sync_api import sync_playwright, expect
import time

def verify_hitlist():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions to avoid notification popups or other potential issues
        context = browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 41.7658, 'longitude': -72.6734}
        )
        page = context.new_page()

        # 1. Navigate to the app (adjust port if needed, assuming 5173 based on Vite)
        page.goto("http://localhost:5173")

        # 2. Skip the relationship modal if it appears
        # Look for the 'Skip for now' button
        try:
            skip_button = page.get_by_text("I'm not related / Skip for now")
            if skip_button.is_visible(timeout=5000):
                skip_button.click()
        except:
            print("Modal might not have appeared or was already handled.")

        # 3. Verify Hitlist Button exists and Click it
        # The button has text "Hitlist"
        hitlist_btn = page.get_by_role("button", name="Hitlist")
        expect(hitlist_btn).to_be_visible()
        hitlist_btn.click()

        # 4. Verify Hitlist Panel is visible
        # Header "Research Hitlist"
        # Playwright standard locator is get_by_role("heading", name="...")
        expect(page.get_by_role("heading", name="Research Hitlist")).to_be_visible()

        # 5. Verify Content
        # We expect at least one item from the JSON we generated (top 10)
        # Let's check for the text "Detected Issues"
        expect(page.get_by_text("Detected Issues").first).to_be_visible()

        # Check for AI Recommendations
        expect(page.get_by_text("AI Recommendations").first).to_be_visible()

        # 6. Take Screenshot
        page.screenshot(path="verification_hitlist.png")
        print("Screenshot saved to verification_hitlist.png")

        browser.close()

if __name__ == "__main__":
    verify_hitlist()
