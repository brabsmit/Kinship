
from playwright.sync_api import sync_playwright

def verify_graph_interaction():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        # Navigate
        page.goto("http://localhost:5173")

        # Switch to Graph
        page.click('button[title="Graph View"]')
        page.wait_for_selector(".react-flow__node")

        # Click first node
        page.locator(".react-flow__node").first.click()

        # Wait for profile
        page.wait_for_selector("text=Family Network")

        # Take screenshot
        page.screenshot(path="verification/graph_interaction.png")

        print("Graph interaction screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_graph_interaction()
