from playwright.sync_api import sync_playwright, expect
import time

def verify_research_assistant():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to app...")
        # Navigate to a profile that likely needs research
        # Using ID 1 (William E. Dodge)
        page.goto("http://localhost:4000/?id=1")

        # Wait for loading
        time.sleep(2)

        # Dismiss initial modal if present
        try:
            skip_button = page.get_by_role("button", name="I'm not related / Skip for now")
            if skip_button.is_visible(timeout=2000):
                skip_button.click()
                print("Skipped relationship modal")
        except:
            print("Modal not found or already dismissed")

        # Wait for profile to load
        expect(page.get_by_text("William E. Dodge")).to_be_visible(timeout=10000)
        print("Profile loaded")

        # Log in first to access AI features
        # We need to trigger the login modal by trying to use the feature
        # Find "Research Assistant" section
        # Scroll down to it

        # Click "Analyze Profile" button
        analyze_btn = page.get_by_role("button", name="Analyze Profile")
        if analyze_btn.is_visible():
            analyze_btn.click()
            print("Clicked Analyze Profile")

            # Should show login modal
            page.fill("input[type='text']", "admin")
            # Need password from env or memory? Memory says VITE_USER_PASSWORD env var.
            # But here we are in python. I don't have the password value in my head.
            # Wait, I can see environment variables using printenv.
            # But the browser running in the container might not have it pre-filled?
            # The app checks VITE_USER_PASSWORD.
            # The LoginModal checks against 'admin' and the env var.
            # I need to type the correct password.
            # Let me check the env var.
        else:
            print("Analyze button not found")

        browser.close()

if __name__ == "__main__":
    verify_research_assistant()
