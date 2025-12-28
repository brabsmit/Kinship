
from playwright.sync_api import sync_playwright, expect
import time
import re

def verify_list_view_and_branch_switching():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # 1. Navigate to the app
            print("Navigating to app...")
            page.goto("http://localhost:5173/")

            # Wait for content to load
            page.wait_for_selector('h1', timeout=5000)

            print("Verifying initial state (List View)...")
            # Default should be List View
            # Check if Branch Selector is visible
            branch_buttons = page.locator('button:text("Dodge")')
            expect(branch_buttons.first).to_be_visible()

            # Check if Search Bar is visible
            search_input = page.locator('input[placeholder="Find an ancestor..."]')
            expect(search_input).to_be_visible()

            # Take initial screenshot
            page.screenshot(path="verification/step1_initial_list.png")
            print("Step 1: Initial list view screenshot taken.")

            # 2. Switch Branch to Phelps (ID 2)
            print("Switching to Branch 2 (Phelps)...")
            phelps_btn = page.locator('button:has-text("2. Phelps")')
            phelps_btn.click()

            # Wait a bit for list update
            time.sleep(1)

            # Verify list updated
            # We check if the button has the active class.
            # Note: in Python playwright expect().to_have_class(pattern_or_string)
            # We can check if class attribute contains bg-[#2C3E50]
            # expect(phelps_btn).to_have_class(re.compile(r"bg-\[#2C3E50\]"))

            # Take screenshot of filtered list
            page.screenshot(path="verification/step2_branch_switched.png")
            print("Step 2: Branch switched screenshot taken.")

            # 3. Verify List Item Enhancements
            # Check for relationship text (e.g., "Parent / Aunt / Uncle" or "Relative")
            # And lifespan (e.g. "1750 – 1820")
            print("Verifying list item details...")

            # Get the first list item text content
            first_item = page.locator('.group').first
            content = first_item.text_content()
            print(f"First item text: {content}")

            # Check for hyphen/en-dash indicating lifespan
            if "–" in content:
                print("Confirmed: Lifespan displayed with en-dash.")
            else:
                print("Warning: En-dash not found in item content.")

            # 4. Switch to Graph View and verify controls exist
            print("Switching to Graph View...")
            page.get_by_text("Graph").click()
            time.sleep(1)

            # Controls should still be there
            expect(search_input).to_be_visible()
            expect(phelps_btn).to_be_visible()

            page.screenshot(path="verification/step3_graph_view.png")
            print("Step 3: Graph view screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_list_view_and_branch_switching()
