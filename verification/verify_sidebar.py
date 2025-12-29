from playwright.sync_api import sync_playwright, expect
import time

def verify_sidebar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # 1. Load the page
            page.goto("http://localhost:5173")

            # Dismiss initial modal
            try:
                # Try explicit text match for the skip button
                page.get_by_text("I'm not related / Skip for now").click(timeout=3000)
            except:
                print("Modal button not found or already dismissed.")

            time.sleep(2) # Wait for animation

            # 2. Screenshot 1: Default List View Sidebar
            page.screenshot(path="verification_sidebar_list.png")
            print("Screenshot taken: verification_sidebar_list.png")

            # 3. Open Filter Menu
            page.get_by_title("Filter Settings").click()
            time.sleep(1)
            page.screenshot(path="verification_filter_menu.png")
            print("Screenshot taken: verification_filter_menu.png")

            # 4. Enable Story Mode from Menu
            page.locator("text=Story Mode").click()
            time.sleep(0.5)
            page.screenshot(path="verification_story_mode_on.png")
            print("Screenshot taken: verification_story_mode_on.png")

            # Close menu by clicking X
            page.get_by_role("button").filter(has_text="View Settings").locator("button").last.click() # This is brittle, let's use the icon or click outside
            # Or just click coordinates or use the close button in menu
            # The close button in FilterMenu has X icon and is in the header.
            # Let's try clicking outside
            page.mouse.click(500, 500)
            time.sleep(1)

            # 5. Switch to Graph View
            page.get_by_title("Graph View").click()
            time.sleep(2)
            page.screenshot(path="verification_sidebar_graph.png")
            print("Screenshot taken: verification_sidebar_graph.png")

            # 6. Open Filter Menu in Graph View (Check Branch Selector)
            page.get_by_title("Filter Settings").click()
            time.sleep(1)
            page.screenshot(path="verification_filter_menu_graph.png")
            print("Screenshot taken: verification_filter_menu_graph.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_sidebar()
