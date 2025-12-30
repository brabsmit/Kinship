// src/utils/assetMapper.js
import wikimediaCache from '../wikimedia_cache.json' with { type: "json" };

export const ASSETS = {
    // UK / England
    england_1600: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/The_Kingdome_of_Great_Britaine_and_Ireland_-_Performed_by_John_Speede_%3B_Graved_by_I._Hondius_-_btv1b53225465b_%282_of_3%29.jpg/1024px-The_Kingdome_of_Great_Britaine_and_Ireland_-_Performed_by_John_Speede_%3B_Graved_by_I._Hondius_-_btv1b53225465b_%282_of_3%29.jpg",
        alt: "John Speed's Map of Great Britain (1610)",
        caption: "The World of 17th Century England",
        style: { filter: "sepia(30%) contrast(110%)" }
    },
    england_countryside: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Wenceslaus_Hollar_-_Albury_House%2C_Surrey_%28State_1%29.jpg/1280px-Wenceslaus_Hollar_-_Albury_House%2C_Surrey_%28State_1%29.jpg",
        alt: "Engraving of English Countryside (Wenceslaus Hollar, 1645)",
        caption: "The English Countryside (17th Century)",
        style: { filter: "sepia(40%) contrast(95%)" }
    },
    london_visscher: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Panorama_of_London_by_Claes_Van_Visscher%2C_1616.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616.jpg",
        alt: "Visscher's Panorama of London (1616)",
        caption: "London Before the Great Fire (1616)",
        style: { filter: "sepia(20%) contrast(105%)" }
    },

    // New England
    new_england_1600: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Map_of_New_England_by_Captain_John_Smith_%281616%29.jpg/1024px-Map_of_New_England_by_Captain_John_Smith_%281616%29.jpg",
        alt: "Captain John Smith's Map of New England (1616)",
        caption: "Early Settlement of New England",
        style: { filter: "sepia(20%)" }
    },
    ne_map_1634: {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Southern_New_England_in_1634.jpg",
        alt: "William Wood's Map of New England (1634)",
        caption: "The Southern Part of New England (1634)",
        style: { filter: "sepia(25%) contrast(110%)" }
    },
    puritan_life: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/George-Henry-Boughton-Pilgrims-Going-To-Church.jpg/1280px-George-Henry-Boughton-Pilgrims-Going-To-Church.jpg",
        alt: "Pilgrims Going to Church by George Henry Boughton",
        caption: "Life in the Early Colonies",
        style: { filter: "sepia(15%) contrast(100%)" }
    },
    new_england_pilgrims: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/George-Henry-Boughton-Pilgrims-Going-To-Church.jpg/1280px-George-Henry-Boughton-Pilgrims-Going-To-Church.jpg",
        alt: "Pilgrims Going to Church (Boughton)",
        caption: "The Pilgrim Experience",
        style: { filter: "sepia(15%)" }
    },
    boston_old: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Bonner_Map_of_Boston_1722.jpg/1024px-Bonner_Map_of_Boston_1722.jpg",
        alt: "Bonner Map of Boston (1722)",
        caption: "Colonial Boston",
        style: { filter: "sepia(25%) contrast(105%)" }
    },

    // Connecticut
    new_haven_1641: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Atwater1881_p10_Map_New_Haven_in_1641.jpg/1024px-Atwater1881_p10_Map_New_Haven_in_1641.jpg",
        alt: "Map of New Haven in 1641",
        caption: "The Nine Squares of New Haven (1641)",
        style: { filter: "sepia(30%) contrast(110%)" }
    },
    ct_1700: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Plan_of_the_Colony_of_Connecticut,_Moses_Park,_1766.jpg/1024px-Plan_of_the_Colony_of_Connecticut,_Moses_Park,_1766.jpg",
        alt: "Map of the Colony of Connecticut (1766)",
        caption: "The Connecticut Colony Era",
        style: { filter: "contrast(105%)" }
    },

    // New York / NYC
    ny_1800: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Bird%27s_Eye_Panorama_of_Manhattan_%26_New_York_City_1873.jpg/1024px-Bird%27s_Eye_Panorama_of_Manhattan_%26_New_York_City_1873.jpg",
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

    // 1. Special Overrides (Muse Logic for known cache gaps or quality issues)

    // New Haven Colonial (1638-1750)
    if (loc.includes("new haven") && y >= 1638 && y < 1750) {
        return ASSETS.new_haven_1641;
    }

    // London Pre-Fire (< 1666)
    if ((loc.includes("london") || loc === "england") && y < 1666) {
        return ASSETS.london_visscher;
    }

    // Boston < 1750
    if (loc.includes("boston") && y < 1750 && y > 1630) {
        return ASSETS.boston_old;
    }

    // Massachusetts / CT Early Settlers (1620-1660)
    // Towns: Watertown, Sudbury, Ipswich, Windsor, Hartford, Wethersfield
    // Use "Puritan Life" engraving for a more immersive feel than a map
    const settlementTowns = ["watertown", "sudbury", "ipswich", "windsor", "hartford", "wethersfield", "roxbury", "dorchester"];
    if (settlementTowns.some(town => loc.includes(town)) && y >= 1620 && y < 1660) {
        return ASSETS.puritan_life;
    }

    // New England Pilgrim Era (General)
    if ((loc === "new england" || loc.includes("plymouth") || loc.includes("massachusetts")) && y >= 1620 && y < 1650) {
        return ASSETS.ne_map_1634;
    }

    // England Pre-1650 (General Countryside)
    if ((loc === "england" || loc === "uk" || loc.includes("britain")) && y < 1650) {
        return ASSETS.england_countryside;
    }

    // 2. Cache Lookup (Standard Priority)
    if (location) {
        let century = "historical";
        if (y > 0) {
             const c = Math.floor((y - 1) / 100) + 1;
             century = `${c}th century`;
        }

        const specificKey = `${location}|${century}`;
        if (wikimediaCache[specificKey]) return wikimediaCache[specificKey];

        const historicalKey = `${location}|historical`;
        if (wikimediaCache[historicalKey]) return wikimediaCache[historicalKey];
    }

    // 3. Fallback Logic (If not in cache)

    // New York
    if (loc.includes("ny") || loc.includes("new york") || loc.includes("manhattan") || loc.includes("brooklyn")) {
        if (y >= 1800) return ASSETS.ny_1800;
        return ASSETS.ne_map_1634; // Fallback to regional map
    }

    // Connecticut
    if (loc.includes("ct") || loc.includes("connecticut") || loc.includes("hartford") || loc.includes("new haven")) {
        if (y >= 1700) return ASSETS.ct_1700;
        return ASSETS.ne_map_1634;
    }

    // Massachusetts / New England (Broader catch)
    if (loc.includes("ma") || loc.includes("massachusetts") || loc.includes("boston") || loc.includes("new england") || loc.includes("rhode island") || loc.includes("ri")) {
        return ASSETS.ne_map_1634;
    }

    // UK / England
    if (loc.includes("england") || loc.includes("uk") || loc.includes("britain") || loc.includes("london")) {
        if (y < 1650) return ASSETS.england_countryside;
        return ASSETS.england_1600;
    }

    // 4. Default Fallback
    return ASSETS.generic_antique;
};
