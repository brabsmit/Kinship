from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Wait for data to load
        page.wait_for_selector("text=David Hoadley, Jr.", timeout=10000)

        # Click on David Hoadley, Jr. to open the immersive profile
        page.click("text=David Hoadley, Jr.")

        # Wait for the profile to load (look for the "Life & Times" header)
        page.wait_for_selector("text=Life & Times", timeout=10000)

        # Scroll down to ensure timeline is visible (it might be below the fold)
        page.locator("text=Life & Times").scroll_into_view_if_needed()
        time.sleep(1)

        # Now find the "Died" event in the timeline
        # It should contain "his summer home to which he had retired" if our frontend change worked.
        # We look for the text specifically.
        try:
            # The text is inside parentheses in the label
            # label: `Died in ${diedLoc}${item.vital_stats.died_location_note ? ` (${item.vital_stats.died_location_note})` : ''}`,
            # So we look for "his summer home to which he had retired"

            # Use a more specific locator to verify it's in the timeline event
            # .timeline-event contains the text

            timeline_text = page.locator("text=his summer home to which he had retired")
            timeline_text.wait_for(state="visible", timeout=5000)
            timeline_text.scroll_into_view_if_needed()
            print("Found the subtitle text!")
        except Exception as e:
            print(f"Could not find the subtitle text: {e}")

        time.sleep(1)
        page.screenshot(path="verification/location_subtitle_verification_timeline.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
