import json
from playwright.sync_api import sync_playwright

def verify_timeline():
    # Find a person with life events
    person_name = "William Earl Dodge, Sr."
    try:
        with open('kinship-app/src/family_data.json') as f:
            data = json.load(f)
            for p in data:
                # Look for someone with actual life events in story
                if p.get('story', {}).get('life_events') and len(p['story']['life_events']) > 0:
                    person_name = p['name']
                    print(f"Found person with events: {person_name}")
                    # Print one event to know what to look for
                    print(f"Event example: {p['story']['life_events'][0]}")
                    break
    except Exception as e:
        print(f"Could not load data: {e}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173/")
        page.wait_for_selector(".group.p-4")

        print(f"Clicking on: {person_name}")
        page.locator(f"text={person_name}").first.click()

        page.wait_for_selector(".timeline-event")
        page.wait_for_timeout(2000)

        # Scroll container
        # The container is the one with class 'custom-scrollbar'
        # Let's find the timeline events
        events = page.locator(".timeline-event").all()
        print(f"Found {len(events)} timeline events.")

        for i, event in enumerate(events):
            text = event.inner_text().replace('\n', ' | ')
            classes = event.get_attribute("class")

            # Check opacity style
            # We need to see if it has 'opacity-100' or 'opacity-60'
            # Note: The class string contains these tailwind classes.

            is_personal = "Personal" in text or "PERSONAL" in text # Badge text
            # Or check the computed style if possible, but class check is easier given the code change.
            # In my code:
            # Personal -> opacity-100
            # Context -> opacity-60

            # Let's verify via class names
            # But wait, my code logic for isPersonal uses region === "Personal".
            # The badge for Personal is "PERSONAL".

            print(f"[{i}] Text: {text}")
            print(f"    Classes: {classes}")

            # Check computed style for opacity
            opacity = event.evaluate("el => getComputedStyle(el).opacity")
            print(f"    Computed Opacity: {opacity}")

        # Scroll to the timeline section to take a screenshot
        # We can try to scroll to the middle of the timeline
        if len(events) > 0:
            events[len(events)//2].scroll_into_view_if_needed()

        page.wait_for_timeout(1000)
        page.screenshot(path=".jules/verification/timeline_verification_details.png")

        browser.close()

if __name__ == "__main__":
    verify_timeline()
