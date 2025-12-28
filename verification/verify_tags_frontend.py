from playwright.sync_api import sync_playwright
import time

def verify_tags():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate
        page.goto("http://localhost:5173")
        time.sleep(5)

        # Bypass modal
        page.evaluate("localStorage.setItem('userRelation', JSON.stringify({anchorId: '1', stepsDown: 0}))")
        page.reload()
        time.sleep(3)

        # Screenshot the main list view
        page.screenshot(path="verification/list_view_tags.png")

        # Search for "Mary Stuart Earl Dodge"
        search_input = page.locator("input[placeholder='Find an ancestor...']")
        search_input.fill("Mary Stuart Earl Dodge")
        time.sleep(2)

        # Click the item
        item = page.locator("h3", has_text="Mary Stuart Earl Dodge").first
        if item.is_visible():
            item.click(force=True)
            time.sleep(2)

            # Now in Immersive Profile
            page.screenshot(path="verification/profile_tags.png")

            if page.locator("text=War Veteran").count() > 0:
                print("Found 'War Veteran' tag in profile")
            else:
                print("Did not find 'War Veteran' tag in profile")

            # Reload to reset state instead of struggling to close
            page.reload()
            time.sleep(3)

        # Filter Test
        tag_btn = page.locator("button").filter(has_text="War Veteran").first
        if tag_btn.count() > 0:
            tag_btn.click(force=True)
            time.sleep(2)
            page.screenshot(path="verification/filtered_view_war_veteran.png")
            print("Clicked War Veteran filter")

            if page.locator("h3", has_text="Mary Stuart Earl Dodge").is_visible():
                print("Mary visible in filtered list")

            if not page.locator("h3", has_text="William Earl Dodge, Sr.").is_visible():
                print("William hidden in filtered list")

        browser.close()

if __name__ == "__main__":
    verify_tags()
