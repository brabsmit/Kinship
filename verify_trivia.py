from playwright.sync_api import sync_playwright

def verify_trivia():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for data to load
        page.wait_for_timeout(2000)

        # 1. Verify Global Widget hides in List View (Default)
        print("Checking List View...")
        # Check if TriviaWidget is NOT visible (it shouldn't be in DOM in List View based on logic)
        # TriviaWidget has text "DID YOU KNOW?"
        if page.get_by_text("DID YOU KNOW?").is_visible():
             print("FAIL: Global Trivia Widget visible in List View")
        else:
             print("PASS: Global Trivia Widget hidden in List View")

        # 2. Switch to Graph View
        print("Switching to Graph View...")
        page.get_by_role("button", name="Graph").click()
        page.wait_for_timeout(1000)

        # 3. Verify Global Widget appears in Graph View
        if page.get_by_text("DID YOU KNOW?").first.is_visible():
             print("PASS: Global Trivia Widget visible in Graph View")
        else:
             print("FAIL: Global Trivia Widget NOT visible in Graph View")

        # 4. Select an Ancestor to open Profile
        print("Selecting an ancestor...")
        # Click a node. In Graph view, nodes have text. Let's try to click one.
        # We might need to search or just click a node element.
        # Nodes have class 'react-flow__node'
        # Let's try to click the first node found
        page.locator(".react-flow__node").first.click()
        page.wait_for_timeout(1000)

        # 5. Verify Profile Trivia
        print("Verifying Profile Trivia...")
        # Profile Trivia has text "DID YOU KNOW?" as well, but inside the profile panel.
        # It's distinguished by being in the profile container.
        # Let's look for specific trivia content or the header.

        # The profile trivia header: "DID YOU KNOW?" with a Sparkles icon.
        # Since we have multiple "DID YOU KNOW?" now (one global, one profile), we need to be specific.
        # The global one is likely still there if we didn't hide it when profile is open?
        # Actually, in the code:
        # {viewMode === 'graph' && ... <TriviaWidget ... />}
        # The Right Panel covers the screen or is side-by-side?
        # In the code: `selectedAncestor ? 'hidden md:flex' : 'w-full'` for Left Nav.
        # Right Panel: `selectedAncestor ? 'flex-1 block' : ...`

        # Take a screenshot of the profile view
        page.screenshot(path="profile_trivia.png")
        print("Screenshot saved to profile_trivia.png")

        browser.close()

if __name__ == "__main__":
    verify_trivia()
