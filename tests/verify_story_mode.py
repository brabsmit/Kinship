
from playwright.sync_api import sync_playwright

def verify_story_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app
            page.goto("http://localhost:5173")

            # Wait for title
            page.wait_for_selector("text=Ancestry")
            print("Page loaded")

            # 1. Switch to Graph Mode
            # Button is in segmented control. Looking for text "Graph".
            graph_button = page.get_by_role("button", name="Graph")
            graph_button.click()
            print("Switched to Graph Mode")

            # Wait for graph nodes (they have class 'react-flow__node')
            page.wait_for_selector(".react-flow__node", timeout=5000)

            # Take screenshot of default Graph View
            page.screenshot(path="verification_graph_default.png")
            print("Screenshot: verification_graph_default.png")

            # 2. Toggle Story Mode
            # Button has Book icon. It has title "Toggle Story Mode".
            story_mode_btn = page.locator('button[title="Toggle Story Mode"]')
            story_mode_btn.click()
            print("Toggled Story Mode ON")

            # Give time for transition
            page.wait_for_timeout(1000)

            # Take screenshot of Story Mode
            page.screenshot(path="verification_graph_story_mode.png")
            print("Screenshot: verification_graph_story_mode.png")

            # 3. Search for "Hoadley" (has stories)
            search_input = page.locator('input[placeholder="Find an ancestor..."]')
            search_input.fill("Hoadley")
            print("Searched for 'Hoadley'")

            # Give time for filtering transition
            page.wait_for_timeout(1000)

            # Take screenshot of Search + Story Mode
            page.screenshot(path="verification_graph_story_search.png")
            print("Screenshot: verification_graph_story_search.png")

            # 4. Search for "Unknown" (likely no story, or random string)
            search_input.fill("XyzAbc")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification_graph_no_match.png")
            print("Screenshot: verification_graph_no_match.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_story_mode()
