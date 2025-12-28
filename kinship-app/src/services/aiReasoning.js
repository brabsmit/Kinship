
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Fetches research suggestions for a given ancestor profile.
 * Uses Google Gemini API if available, otherwise falls back to deterministic logic.
 *
 * @param {Object} profileData - The ancestor profile object from family_data.json
 * @returns {Promise<Array<string>>} - A list of research suggestions strings.
 */
export async function fetchResearchSuggestions(profileData) {
    if (!API_KEY) {
        console.warn("VITE_GEMINI_API_KEY is not set. Using deterministic fallback.");
        return getDeterministicSuggestions(profileData);
    }

    const prompt = `
Act as a professional genealogist. Analyze this profile:
${JSON.stringify(profileData, null, 2)}

Identify missing vital stats and ambiguities in the notes (e.g., 'conflicting dates', 'family tradition').
Provide 3 specific, actionable research steps (e.g., 'Search 1850 US Census in Ohio').
Return the response strictly as a JSON object with a single key "suggestions" which is an array of strings.
Do not include any markdown formatting or explanations outside the JSON.
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Parse the response
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidate) {
            throw new Error("No content returned from Gemini");
        }

        // Clean up markdown code blocks if present (Gemini often wraps JSON in ```json ... ```)
        const jsonString = candidate.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        const parsed = JSON.parse(jsonString);

        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
        } else {
            throw new Error("Invalid JSON structure from Gemini");
        }

    } catch (error) {
        console.error("AI Analysis failed, falling back to local logic:", error);
        return getDeterministicSuggestions(profileData);
    }
}

/**
 * Deterministic fallback logic to generate research suggestions based on profile gaps.
 */
function getDeterministicSuggestions(profile) {
    const suggestions = [];
    const bornDate = profile.vital_stats?.born_date;
    const diedDate = profile.vital_stats?.died_date;
    const bornLoc = profile.vital_stats?.born_location;
    const diedLoc = profile.vital_stats?.died_location;
    const notes = profile.story?.notes || "";

    // 1. Missing Death Record
    if (!diedDate || diedDate === "Unknown" || !diedLoc || diedLoc === "Unknown") {
        suggestions.push(`Search Death Records for ${profile.name} (approx ${bornDate ? "after " + bornDate : "19th century"}).`);
    }

    // 2. Missing Birth Record
    if (!bornDate || bornDate === "Unknown" || !bornLoc || bornLoc === "Unknown") {
        suggestions.push(`Search Birth/Christening Records for ${profile.name}.`);
    }

    // 3. Census Logic (US specific heuristic)
    const bornYear = parseInt(bornDate?.match(/\d{4}/)?.[0] || 0);
    const diedYear = parseInt(diedDate?.match(/\d{4}/)?.[0] || 0);

    if (bornYear && diedYear) {
        // Check for 1850 Census (First to list all family members)
        if (bornYear < 1850 && diedYear > 1850) {
            suggestions.push(`Search 1850 US Census for ${profile.name} in ${bornLoc || diedLoc || "suspected region"}.`);
        }
        // Check for 1880 Census (relates to parents)
        if (bornYear < 1880 && diedYear > 1880) {
            suggestions.push(`Search 1880 US Census to confirm parents' birthplaces.`);
        }
    }

    // 4. Notes Ambiguity
    if (notes.toLowerCase().includes("tradition") || notes.toLowerCase().includes("said to be")) {
        suggestions.push("Verify family traditions mentioned in notes with primary source documents.");
    }

    // 5. Default generic
    if (suggestions.length === 0) {
        suggestions.push(`Check local historical society records in ${bornLoc || diedLoc || "associated locations"}.`);
        suggestions.push(`Search for ${profile.name} in land deeds and probate records.`);
        suggestions.push("Look for obituaries in local newspapers.");
    }

    return suggestions.slice(0, 3);
}
