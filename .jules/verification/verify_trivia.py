from playwright.sync_api import sync_playwright, expect
import time

def verify_trivia_widget():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming default vite port 5173)
        try:
            page.goto("http://localhost:5173", timeout=30000)

            # Wait for the app to load
            page.wait_for_selector("text=Ancestry", timeout=10000)

            # 1. Verify Trivia Widget is present
            # Look for "DID YOU KNOW?" text
            trivia_header = page.get_by_text("Did You Know?")
            expect(trivia_header).to_be_visible()

            print("Trivia Widget header found.")

            # Take a screenshot of the initial state (List View)
            page.screenshot(path=".jules/verification/trivia_list_view.png")
            print("Screenshot taken: trivia_list_view.png")

            # 2. Switch to Graph View
            # Click on "Graph" button
            graph_button = page.get_by_role("button", name="Graph")
            graph_button.click()

            # Wait for Graph view to load
            # Check for branch buttons which appear in graph view
            page.wait_for_selector("text=1. Dodge")

            # Verify Trivia Widget is still present
            expect(trivia_header).to_be_visible()
            print("Trivia Widget visible in Graph View.")

            # Take a screenshot of Graph View
            page.screenshot(path=".jules/verification/trivia_graph_view.png")
            print("Screenshot taken: trivia_graph_view.png")

            # 3. Change Branch and see if it updates
            # Current branch is 1 (Dodge). Let's click 2 (Phelps).
            phelps_button = page.get_by_role("button", name="2. Phelps")
            phelps_button.click()

            # Wait a moment for potential update (widget uses useEffect on data change)
            time.sleep(1)

            # Capture the text of the trivia widget to see if it makes sense
            # (We can't easily assert *change* because it's random, but we can verify text content)
            widget_content = page.locator(".bg-gradient-to-br").inner_text()
            print(f"Trivia Content for Phelps Branch:\n{widget_content}")

            # Take a screenshot of Updated Branch
            page.screenshot(path=".jules/verification/trivia_phelps_branch.png")
            print("Screenshot taken: trivia_phelps_branch.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            # Take failure screenshot
            page.screenshot(path=".jules/verification/failure.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_trivia_widget()
