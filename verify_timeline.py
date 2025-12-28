from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Subscribe to console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        try:
            page.goto("http://localhost:5173")
            # Wait for sidebar
            page.wait_for_selector('text=Ancestry', timeout=5000)

            # Search for William Earl Dodge, Sr.
            print("Searching for ancestor...")
            page.fill('input[placeholder="Find an ancestor..."]', "William Earl Dodge, Sr.")
            page.wait_for_timeout(1000)

            # Click the first result
            print("Clicking result...")
            page.click('text=William Earl Dodge, Sr.')

            # Wait for Historical Context header
            page.wait_for_selector('text=Life & Times', timeout=5000)
            print("Profile loaded.")

            # Scroll to the bottom
            page.evaluate("""
                const container = document.querySelector('.custom-scrollbar');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            """)
            page.wait_for_timeout(2000)

            # Check for timeline events
            events = page.locator(".timeline-event")
            count = events.count()
            print(f"Found {count} timeline events.")

            if count > 0:
                print("\nEvent Details:")
                for i in range(count):
                    event = events.nth(i)
                    text = event.inner_text().replace('\n', ' | ')

                    # check for the presence of opacity class or bold class
                    class_attr = event.get_attribute("class")

                    # We can also check computed style if classes are dynamic tailwind classes
                    opacity = event.evaluate("el => getComputedStyle(el).opacity")
                    font_weight = event.evaluate("el => getComputedStyle(el.querySelector('.font-medium') || el).fontWeight") # .font-medium is usually 500

                    print(f"[{i}] Text: {text}")
                    print(f"    Classes: {class_attr}")
                    print(f"    Computed Opacity: {opacity}")

            # Take a specific screenshot of the timeline area
            # We use nth(1) because the first custom-scrollbar is likely the list view on the left
            page.locator(".custom-scrollbar").nth(1).screenshot(path="verification/timeline_area.png")
            print("\nScreenshot saved to verification/timeline_area.png")

        except Exception as e:
            print(f"Error: {e}")

        browser.close()

if __name__ == "__main__":
    run()
