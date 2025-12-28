// src/utils/assetMapper.js

const ASSETS = {
    // UK / England
    england_1600: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Speed_Kingdom_of_Great_Britaine_and_Ireland_1610.jpg/1280px-Speed_Kingdom_of_Great_Britaine_and_Ireland_1610.jpg",
        alt: "John Speed's Map of Great Britain (1610)",
        caption: "The World of 17th Century England",
        style: { filter: "sepia(30%) contrast(110%)" }
    },

    // New England
    new_england_1600: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Map_of_New_England_by_Captain_John_Smith_%281616%29.jpg/1024px-Map_of_New_England_by_Captain_John_Smith_%281616%29.jpg",
        alt: "Captain John Smith's Map of New England (1616)",
        caption: "Early Settlement of New England",
        style: { filter: "sepia(20%)" }
    },

    // Connecticut
    ct_1700: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/1766_Park_Map_of_Connecticut_-_Geographicus_-_Connecticut-park-1766.jpg/1280px-1766_Park_Map_of_Connecticut_-_Geographicus_-_Connecticut-park-1766.jpg",
        alt: "Map of the Colony of Connecticut (1766)",
        caption: "The Connecticut Colony Era",
        style: { filter: "contrast(105%)" }
    },

    // New York / NYC
    ny_1800: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Bird%27s_Eye_Panorama_of_Manhattan_%26_New_York_City_1873.jpg/1920px-Bird%27s_Eye_Panorama_of_Manhattan_%26_New_York_City_1873.jpg",
        alt: "Bird's Eye View of New York City (1873)",
        caption: "The Bustling Metropolis of the 19th Century",
        style: { filter: "sepia(10%)" }
    },

    // Fallback
    generic_antique: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Old_Paper_%286950274296%29.jpg/1280px-Old_Paper_%286950274296%29.jpg",
        alt: "Antique Parchment Background",
        caption: "Historical Record",
        style: { opacity: 0.8 }
    }
};

/**
 * Selects an appropriate hero image based on location and year.
 * @param {string} location - The location string (e.g., "Hartford, CT")
 * @param {number} year - The relevant year (usually birth year)
 * @returns {object} Asset object { src, alt, caption, style }
 */
export const getHeroImage = (location, year) => {
    if (!location) return ASSETS.generic_antique;

    const loc = location.toLowerCase();
    const y = parseInt(year) || 0;

    // 1. New York Logic
    if (loc.includes("ny") || loc.includes("new york") || loc.includes("manhattan") || loc.includes("brooklyn")) {
        if (y >= 1800) return ASSETS.ny_1800;
        // Fallback for earlier NY could be New England map or Generic for now
        return ASSETS.new_england_1600;
    }

    // 2. Connecticut Logic
    if (loc.includes("ct") || loc.includes("connecticut") || loc.includes("hartford") || loc.includes("new haven")) {
        if (y >= 1700) return ASSETS.ct_1700;
        return ASSETS.new_england_1600;
    }

    // 3. Massachusetts / New England Logic
    if (loc.includes("ma") || loc.includes("massachusetts") || loc.includes("boston") || loc.includes("new england") || loc.includes("rhode island") || loc.includes("ri")) {
        return ASSETS.new_england_1600;
    }

    // 4. UK / England Logic
    if (loc.includes("england") || loc.includes("uk") || loc.includes("britain") || loc.includes("london")) {
        return ASSETS.england_1600;
    }

    // 5. Default Fallback
    return ASSETS.generic_antique;
};
