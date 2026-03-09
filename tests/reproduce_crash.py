from playwright.sync_api import sync_playwright, expect
import time

def reproduce_crash():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console errors
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:5173")

            # 2. Skip the relationship modal
            try:
                skip_button = page.get_by_text("I'm not related / Skip for now")
                if skip_button.is_visible(timeout=5000):
                    skip_button.click()
            except:
                print("Modal might not have appeared.")

            # 3. Open Hitlist
            page.get_by_role("button", name="Hitlist").click()

            # Wait for hitlist to load
            expect(page.get_by_role("heading", name="Research Hitlist")).to_be_visible()

            # 4. Click "View Profile" on the first item
            # The button text is "View Profile"
            view_btn = page.get_by_role("button", name="View Profile").first
            if view_btn.is_visible():
                print("Clicking View Profile...")
                view_btn.click()
            else:
                print("View Profile button not found!")
                exit(1)

            # 5. Check for crash or successful load
            # If it crashed, we expect an error in `errors` list.
            # If it succeeded, we expect to see the ImmersiveProfile content, e.g., "Life & Times"

            # Give it a moment to react
            time.sleep(2)

            if errors:
                print("ERRORS FOUND:")
                for e in errors:
                    print(f"- {e}")

                # Specifically check for the reported error
                if any("Cannot read properties of undefined (reading 'born_date')" in e for e in errors):
                    print("reproduction_success: True")
                else:
                    print("reproduction_success: False (different error)")
            else:
                 # Check if profile is visible
                 if page.get_by_text("Life & Times").is_visible():
                     print("Profile opened successfully. No crash.")
                 else:
                     print("Profile did not open, but no console error caught (or it was handled silently).")

        except Exception as e:
            print(f"Test failed with exception: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    reproduce_crash()
