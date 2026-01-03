from playwright.sync_api import sync_playwright, expect
import time

def verify_voyage_card():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see the sidebar and profile clearly
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:4000")

            # 2. Wait for loading
            # Dismiss "Who are you related to?" modal if present
            try:
                page.get_by_role("button", name="I'm not related / Skip for now").click(timeout=5000)
            except:
                pass

            # 3. Find the person with the voyage injected
            # "Deputy Governor Matthew Gilbert" (3.2.2.2.2.1.1) from my inject script
            # Type in search bar
            page.get_by_placeholder("Find an ancestor...").fill("Matthew Gilbert")

            # Click the result in the list
            # We look for the specific item in the list
            # The list items are in "GenerationGroup" components.
            # We can just click the text "Deputy Governor Matthew Gilbert"
            page.get_by_text("Deputy Governor Matthew Gilbert").click()

            # 4. Wait for Profile to open
            # We expect the Profile Name to appear in the main panel
            # Use h1 to avoid matching the list item h3
            expect(page.locator("h1", has_text="Deputy Governor Matthew Gilbert")).to_be_visible()

            # 5. Scroll down to Voyage Card
            # The card has "Passage Ticket" text
            ticket_locator = page.get_by_text("Passage Ticket")
            ticket_locator.scroll_into_view_if_needed()

            # Wait a bit for animations
            time.sleep(1)

            # 6. Verify Content
            expect(page.get_by_text("The Hector")).to_be_visible()
            expect(page.get_by_text("Greenock, Scotland")).to_be_visible()
            expect(page.get_by_text("Pictou, Nova Scotia")).to_be_visible()

            # 7. Take Screenshot
            page.screenshot(path="verification/voyage_card.png", full_page=False)
            print("Screenshot saved to verification/voyage_card.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_voyage_card()
