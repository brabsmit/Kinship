
from playwright.sync_api import sync_playwright

def verify_graph_view():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming default Vite port 5173)
        page.goto("http://localhost:5173")

        # Wait for the app to load
        page.wait_for_selector("text=Ancestry")

        # Click the Graph View toggle button (title="Graph View")
        page.click('button[title="Graph View"]')

        # Wait for the graph to render (look for nodes)
        # ReactFlow nodes usually have class 'react-flow__node'
        page.wait_for_selector(".react-flow__node")

        # Take a screenshot of the graph view
        page.screenshot(path="verification/graph_view.png")

        print("Graph view verification screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_graph_view()
