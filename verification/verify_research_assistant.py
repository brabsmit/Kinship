from playwright.sync_api import sync_playwright, expect
import time

def verify_research_assistant():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        print("Navigating to app...")
        page.goto("http://localhost:4000/?id=1")

        # Dismiss initial modal
        try:
            skip_button = page.get_by_role("button", name="I'm not related / Skip for now")
            if skip_button.is_visible(timeout=5000):
                skip_button.click()
        except:
            pass

        expect(page.get_by_text("William Earl Dodge, Sr.", exact=False).first).to_be_visible(timeout=10000)

        # Scroll to Research Assistant
        research_heading = page.get_by_text("Research Assistant")
        research_heading.scroll_into_view_if_needed()

        # Click "Analyze Profile" button
        analyze_btn = page.get_by_role("button", name="Analyze Profile")
        if analyze_btn.is_visible():
            analyze_btn.click()

            # Login
            page.fill("input[placeholder='Enter username']", "admin")
            page.fill("input[placeholder='Enter password']", "kinship")
            page.get_by_role("button", name="Unlock", exact=True).click()
            print("Logged in")

            # Use a more robust selector
            try:
                # Try finding by role heading
                expect(page.get_by_role("heading", name="Suggested Research Steps")).to_be_visible(timeout=10000)
                print("Suggestions visible (heading found)")
            except:
                print("Heading not found, checking page source...")
                if page.get_by_text("Analyzing Records...").is_visible():
                    print("Stuck on Analyzing Records...")
                else:
                    print("Analyzing gone, but no suggestions?")

            # Take screenshot - RELATIVE PATH
            page.screenshot(path="verification/research_assistant.png", full_page=False)
            print("Screenshot saved to verification/research_assistant.png")

        else:
            print("Analyze button not found")

        browser.close()

if __name__ == "__main__":
    verify_research_assistant()
