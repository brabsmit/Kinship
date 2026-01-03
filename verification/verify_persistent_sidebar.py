
from playwright.sync_api import sync_playwright, expect
import time

def verify_persistent_sidebar(page):
    # 1. Navigate to the app
    print("Navigating to http://localhost:4000...")
    page.goto("http://localhost:4000")

    # 2. Dismiss initial modal
    print("Dismissing initial modal...")
    page.get_by_role("button", name="I'm not related / Skip for now").click()

    # 3. Verify Sidebar exists (initial List View)
    print("Verifying sidebar in List View...")
    sidebar = page.locator(".border-r.border-gray-200")
    expect(sidebar).to_be_visible()

    # Check for specific sidebar content (e.g., Generation groups)
    # Using "GENERATION" as partial match
    expect(page.get_by_text("GENERATION", exact=False).first).to_be_visible()

    page.screenshot(path="verification/01_list_view.png")

    # 4. Switch to Graph View
    print("Switching to Graph View...")
    graph_button = page.get_by_title("Graph View")
    graph_button.click()

    # Wait for graph to load (ReactFlow takes a moment)
    time.sleep(2)

    # 5. Verify Sidebar STILL exists
    print("Verifying sidebar persists in Graph View...")
    expect(sidebar).to_be_visible()
    # Content should still be the list
    expect(page.get_by_text("GENERATION", exact=False).first).to_be_visible()

    # 6. Verify Graph exists in Main Content
    print("Verifying Graph View in Main Content...")
    expect(page.locator(".react-flow")).to_be_visible()

    page.screenshot(path="verification/02_graph_view_persistent_sidebar.png")

    # 7. Select an Ancestor (e.g., first one in list)
    print("Selecting an ancestor from the sidebar...")

    search_input = page.get_by_placeholder("Find an ancestor...")
    search_input.fill("Dodge")
    time.sleep(1)

    # Click first result in sidebar
    # We look for a result item.
    # Use a specific name we know exists: "William Earl Dodge"
    first_result = page.locator("text=William Earl Dodge").first
    first_result.click()

    # 8. Verify ImmersiveProfile opens
    print("Verifying ImmersiveProfile opens...")
    profile_title = page.locator("h1", has_text="William Earl Dodge")
    expect(profile_title).to_be_visible()

    # 9. Verify Sidebar is STILL visible (Desktop)
    print("Verifying Sidebar is still visible with Profile open...")
    # We need to ensure viewport is large enough (default 1280x720)
    expect(sidebar).to_be_visible()

    page.screenshot(path="verification/03_profile_with_sidebar.png")

    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to large desktop to ensure persistent sidebar logic triggers (hidden lg:flex)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        try:
            verify_persistent_sidebar(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
            raise e
        finally:
            browser.close()
