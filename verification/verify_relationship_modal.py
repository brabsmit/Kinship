from playwright.sync_api import sync_playwright, expect
import time

def verify_modal(page):
    print("Navigating to app...")
    page.goto("http://localhost:4000")

    # Wait for modal
    print("Waiting for 'Who are you related to?' modal...")
    page.wait_for_selector("text=Who are you related to?", timeout=10000)

    # Take screenshot of Step 1
    print("Taking screenshot of Step 1...")
    page.screenshot(path="verification/modal_step1.png")

    # Check if there are candidates (should be 10)
    # The list items are buttons with names.
    # Let's count buttons inside the modal content.
    buttons = page.locator("text=Born").all()
    print(f"Found {len(buttons)} candidates.")

    # Select the first candidate
    print("Selecting first candidate...")
    # Click the first button that contains "Born" (which implies a candidate row)
    page.locator("text=Born").first.click()

    # Wait for Step 2
    print("Waiting for Step 2 'How are you related?'...")
    page.wait_for_selector("text=How are you related?", timeout=5000)

    # Take screenshot of Step 2
    print("Taking screenshot of Step 2...")
    page.screenshot(path="verification/modal_step2.png")

    # Verify options
    print("Verifying options...")
    expect(page.locator("text=This is my Father")).to_be_visible()
    expect(page.locator("text=This is my Mother")).to_be_visible()
    expect(page.locator("text=This is my Uncle")).to_be_visible()

    # Select "This is my Father"
    print("Selecting 'This is my Father'...")
    page.locator("text=This is my Father").click()

    # Verify modal closes (user logged in)
    print("Verifying modal closes...")
    page.wait_for_selector("text=Who are you related to?", state="hidden", timeout=5000)

    # Check if the relationship badge appears in the profile (if a profile is selected or we navigate to one)
    # The app might not select the ancestor automatically unless we clicked one.
    # But let's verify localStorage logic indirectly by checking UI state if possible.
    # We can check if "Log Out" button appeared (it's always there but maybe changed state? No, it resets identity).

    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_modal(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
