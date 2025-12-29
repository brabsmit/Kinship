import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Fetches research suggestions for a given ancestor profile.
 * Uses Google Gemini API if available, otherwise falls back to deterministic logic.
 *
 * @param {Object} profileData - The ancestor profile object from family_data.json
 * @returns {Promise<Array<string>>} - A list of research suggestions strings.
 */
export async function fetchResearchSuggestions(profileData) {
    if (!profileData || !profileData.id) {
        return getDeterministicSuggestions(profileData);
    }

    // Check Cache
    const cacheKey = `gemini_cache_${profileData.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            // Optional: Check timestamp for expiration (e.g., 7 days)
            // For now, infinite cache is fine to "cut down on usage"
            if (data.suggestions && Array.isArray(data.suggestions)) {
                console.log(`[AI Cache] Hit for ${profileData.name}`);
                return data.suggestions;
            }
        } catch (e) {
            console.warn("Invalid cache data, clearing", e);
            localStorage.removeItem(cacheKey);
        }
    }

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
Do not include any markdown formatting or explanations outside the JSON. The source of the provided data
is a word document put together by a family member. If you see references to 'Paragraph #1960', that is the source
of the data you are looking at.
`;

    try {
        // Use a proxy URL if we are running in the browser to avoid CORS/Origin issues
        // with the API key when accessing from a non-localhost origin.
        const isBrowser = typeof window !== 'undefined';
        const baseUrl = isBrowser
            ? `${window.location.origin}/google-ai`
            : undefined; // Default for server-side/other

        const ai = new GoogleGenAI({
            apiKey: API_KEY,
            baseURL: baseUrl,
        });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
        });

        // Handle response.text whether it is a function (standard SDK) or a property (observed behavior)
        const candidate = typeof response.text === 'function' ? response.text() : response.text;

        if (!candidate) {
            throw new Error("No content returned from Gemini");
        }

        // Clean up markdown code blocks if present (Gemini often wraps JSON in ```json ... ```)
        const jsonString = candidate.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        const parsed = JSON.parse(jsonString);

        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            // Save to Cache
            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    suggestions: parsed.suggestions
                }));
            } catch (e) {
                console.warn("Failed to save to localStorage", e);
            }

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
    if (!profile) return [];

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
