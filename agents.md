Project: Kinship Chronicles - The "Theater of History"

1. The Mission

The goal of this project is to transform a static genealogy database into an immersive, narrative-driven experience. We are not building a spreadsheet viewer; we are building a "Theater of History."

Core Philosophy: * Data into Information: Dates and names are just data. Information is context. (e.g., "He was 12 years old when the Civil War started.")

Narrative First: The UI prioritizes reading stories (biographies) over scanning charts.

Relational Context: The app should always answer, "How is this person related to me?"

2. Architecture Overview

A. The Data Pipeline (Python)

We do not use a traditional database. The "Source of Truth" is a structured Word Document (GENEALOGY DSD Paternal Ancestry.docx).

Script: genealogy_pipeline.py

Logic: 1.  Scans the doc for Generation Headers (e.g., "GENERATION I: PARENTS") to group ancestors.
2.  Extracts entities based on the {ID} pattern (e.g., {1.1.2}).
3.  Parses "Born:", "Died:", and "NOTES:" fields using Regex.
4.  Captures source tags [source: 1234] for academic citation.

Output: Generates family_data.json, which acts as the frontend's database.

B. The Frontend (React + Tailwind)

File: src/App.jsx

Framework: React (Vite), Tailwind CSS, Lucide Icons.

State Management: Local state (no Redux required yet).

Key Components:

App: Manages the Master-Detail layout and generation grouping.

ImmersiveProfile: The "book-like" view for a specific ancestor.

TimelineEvent: Renders historical context.

FamilyMemberLink: Handles parent/child navigation logic.

3. Current Feature Set (Implemented)

Generation Grouping: The sidebar list is partitioned by generation (e.g., "Generation V: Great-Great-Grandparents") using sticky headers.

Historical Context Engine: A logic layer that cross-references birth/death dates with a hardcoded list of historical events (HISTORY_EVENTS) to generate a timeline automatically.

Relationship Calculator: Algorithmically determines relationship labels (e.g., "3rd Great-Grandparent") based on ID string length relative to a fixed "Reader Generation."

Narrative Styling: Typography designed for long-form reading (Serif fonts, blockquotes).

Family Navigation: Basic linking between parents and children based on ID patterns (e.g., 1.1 is the parent of 1.1.2).

4. The Roadmap (Your Orders)

Phase 1: Richer Data Parsing

Refine Vital Stats: The current Regex for born/died is simple. Improve it to separate Date from Location cleanly so we can map them.

Spouse Linking: Currently, we link Parents/Children. We need to parse spouse names from the notes or ID adjacency to link husbands and wives.

Phase 2: Visualizations

Map Integration: The ImmersiveProfile has a placeholder for a map. Implement react-leaflet or mapbox to plot Birth/Death locations.

Interactive Tree: Re-integrate ReactFlow (from earlier prototypes) as a "Graph View" alternative to the "List View."

Phase 3: Context Expansion

Expanded History DB: The HISTORY_EVENTS array is small. Expand it to include 50+ major events (social, political, technological).

Location Awareness: Filter historical events by location. (e.g., Don't show "California Gold Rush" for an ancestor who lived and died in England).

5. File Structure Reference

genealogy_pipeline_v6.py: Main Data Generator. Run this to update JSON.

src/App.jsx: Main Application Code. Contains all UI logic.

family_data.json: The Data. (Generated, do not edit manually).

GENEALOGY DSD Paternal Ancestry.docx: Source Material.