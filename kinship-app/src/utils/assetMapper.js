// src/utils/assetMapper.js
import wikimediaCache from '../wikimedia_cache.json' with { type: "json" };
import paperTexture from '../assets/paper-texture.jpg';

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
    norfolk_map_1610: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/A_Mapp_of_ye_County_of_Norfolk_with_its_Hundreds_%28BM_1864%2C1114.38%29.jpg/1280px-A_Mapp_of_ye_County_of_Norfolk_with_its_Hundreds_%28BM_1864%2C1114.38%29.jpg",
        alt: "A Mapp of ye County of Norfolk (John Speed/Wenceslaus Hollar, 1670)",
        caption: "The County of Norfolk & East Anglia (17th Century)",
        style: { filter: "sepia(25%) contrast(100%)" }
    },

    // New England
    new_england_1600: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Map_of_New_England_by_Captain_John_Smith_%281616%29.jpg/1024px-Map_of_New_England_by_Captain_John_Smith_%281616%29.jpg",
        alt: "Captain John Smith's Map of New England (1616)",
        caption: "Early Settlement of New England",
        style: { filter: "sepia(20%)" }
    },
    ne_map_1634: {
        src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Southern_New_England_in_1634.jpg",
        alt: "William Wood's Map of New England (1634)",
        caption: "The Southern Part of New England (1634)",
        style: { filter: "sepia(25%) contrast(110%)" }
    },
    puritan_life: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/George-Henry-Boughton-Pilgrims-Going-To-Church.jpg/1280px-George-Henry-Boughton-Pilgrims-Going-To-Church.jpg",
        alt: "Pilgrims Going to Church by George Henry Boughton",
        caption: "Life in the Early Colonies",
        style: { filter: "sepia(15%) contrast(100%)" }
    },
    new_england_pilgrims: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/George-Henry-Boughton-Pilgrims-Going-To-Church.jpg/1280px-George-Henry-Boughton-Pilgrims-Going-To-Church.jpg",
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

    // New Jersey
    nj_1777: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/The_province_of_New_Jersey%2C_divided_into_East_and_West%2C_commonly_called_the_Jerseys_LOC_74692505.jpg/1024px-The_province_of_New_Jersey%2C_divided_into_East_and_West%2C_commonly_called_the_Jerseys_LOC_74692505.jpg",
        alt: "The Province of New Jersey (Faden, 1777)",
        caption: "The Province of New Jersey (1777)",
        style: { filter: "sepia(20%) contrast(105%)" }
    },

    // Rhode Island
    ri_1814: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/1814_Carey_Map_of_Rhode_Island_-_Geographicus_-_RhodeIsland-carey-1814.jpg/1024px-1814_Carey_Map_of_Rhode_Island_-_Geographicus_-_RhodeIsland-carey-1814.jpg",
        alt: "Carey's Map of Rhode Island (1814)",
        caption: "Rhode Island (19th Century)",
        style: { filter: "sepia(20%) contrast(105%)" }
    },

    // Northern New England (NH, VT)
    nh_1796: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/1796_Greenleaf_Map_of_New_Hampshire_-_Geographicus_-_NewHampshire-greenleaf-1796.jpg/1024px-1796_Greenleaf_Map_of_New_Hampshire_-_Geographicus_-_NewHampshire-greenleaf-1796.jpg",
        alt: "Greenleaf Map of New Hampshire (1796)",
        caption: "Northern New England (1796)",
        style: { filter: "sepia(20%) contrast(105%)" }
    },

    // New York / NYC
    ny_1800: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Bird%27s_Eye_Panorama_of_Manhattan_%26_New_York_City_1873.jpg/1024px-Bird%27s_Eye_Panorama_of_Manhattan_%26_New_York_City_1873.jpg",
        alt: "Bird's Eye View of New York City (1873)",
        caption: "The Bustling Metropolis of the 19th Century",
        style: { filter: "sepia(10%)" }
    },
    long_island_1686: {
        src: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Long_Island_1686.jpg",
        alt: "Map of Long Island (1686)",
        caption: "Colonial Long Island & Oyster Bay",
        style: { filter: "sepia(20%) contrast(110%)" }
    },

    // Virginia / Jamestown
    va_smith_1612: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Adventures_of_Captain_John_Smith_in_Virginia_1624.jpg/1024px-Adventures_of_Captain_John_Smith_in_Virginia_1624.jpg",
        alt: "Captain John Smith's Map of Virginia (1624)",
        caption: "The Virginia Colony",
        style: { filter: "sepia(25%) contrast(110%)" }
    },

    // Pennsylvania
    pa_holme_1687: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Fac-simile_of_Holmes-map_of_the_province_of_Pennsylvania_-_with_the_names_of_the_original_purchasers_from_William_Penn%2C_begun_in_1681._LOC_88695890.jpg/1024px-Fac-simile_of_Holmes-map_of_the_province_of_Pennsylvania_-_with_the_names_of_the_original_purchasers_from_William_Penn%2C_begun_in_1681._LOC_88695890.jpg",
        alt: "Thomas Holme's Map of Pennsylvania (1687)",
        caption: "William Penn's Province (1687)",
        style: { filter: "sepia(15%) contrast(105%)" }
    },

    // Midwest / Westward Pioneer
    ohio_1804: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Map_of_Ohio_1804.jpg/1024px-Map_of_Ohio_1804.jpg",
        alt: "Map of Ohio (1804)",
        caption: "The Ohio Frontier (1804)",
        style: { filter: "sepia(25%) contrast(105%)" }
    },
    michigan_1831: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/1831_Burr_Map_of_Michigan_-_Geographicus_-_Michigan-burr-1831.jpg/1024px-1831_Burr_Map_of_Michigan_-_Geographicus_-_Michigan-burr-1831.jpg",
        alt: "Burr Map of Michigan (1831)",
        caption: "The Michigan Territory (1831)",
        style: { filter: "sepia(20%) contrast(105%)" }
    },
    illinois_1818: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/1818_Melish_Map_of_Illinois_-_Geographicus_-_Illinois-melish-1818.jpg/1024px-1818_Melish_Map_of_Illinois_-_Geographicus_-_Illinois-melish-1818.jpg",
        alt: "Melish Map of Illinois (1818)",
        caption: "Early Illinois (1818)",
        style: { filter: "sepia(20%) contrast(105%)" }
    },

    // Industrial Era (Lowell, MA)
    industrial_19th: {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/1876_bird%27s_eye_view_of_Lowell%2C_Massachusetts%3B_colored.jpg/1024px-1876_bird%27s_eye_view_of_Lowell%2C_Massachusetts%3B_colored.jpg",
        alt: "Bird's Eye View of Lowell, Massachusetts (1876)",
        caption: "The Industrial Revolution",
        style: { filter: "sepia(20%) contrast(100%)" }
    },

    // Fallback
    generic_antique: {
        src: paperTexture,
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

    // Industrial Era Cities (1840-1920)
    // Specific Mill Towns or broad Industrial keywords
    const industrialCities = ["lowell", "lawrence", "manchester, nh", "pittsburgh", "fall river", "holyoke"];
    if (industrialCities.some(city => loc.includes(city)) && y >= 1820 && y < 1920) {
        return ASSETS.industrial_19th;
    }
    // Broad "Mass" or "PA" logic for 19th century industrial vibe?
    // Maybe stick to specific cities to avoid over-generalizing rural PA.

    // Pennsylvania (Colonial / Quaker)
    if ((loc.includes("pennsylvania") || loc.includes(" pa") || loc.includes("philadelphia")) && y < 1800) {
        return ASSETS.pa_holme_1687;
    }

    // New Jersey (Colonial / Early Statehood)
    if ((loc.includes("new jersey") || loc.includes(" nj") || loc.includes("englewood") || loc.includes("newark")) && y < 1850) {
        return ASSETS.nj_1777;
    }

    // Virginia (Colonial)
    if ((loc.includes("virginia") || loc.includes(" va") || loc.includes("jamestown")) && y < 1750) {
        return ASSETS.va_smith_1612;
    }

    // Connecticut Colonial (1700-1800)
    // Map "Norwich" < 1800 specifically to CT Colony if not New Haven
    if ((loc.includes("ct") || loc.includes("connecticut") || loc.includes("hartford")) && y >= 1700 && y < 1800) {
        return ASSETS.ct_1700;
    }
    // Norwich Logic:
    if (loc.includes("norwich") && loc.includes("ct")) {
        if (y >= 1700) return ASSETS.ct_1700;
        return ASSETS.puritan_life; // Early settlers
    }

    // New Haven Colonial (1638-1750)
    if (loc.includes("new haven") && y >= 1638 && y < 1750) {
        return ASSETS.new_haven_1641;
    }

    // Rhode Island (General)
    if ((loc.includes("rhode island") || loc.includes(" ri") || loc.includes("providence")) && y < 1900) {
        return ASSETS.ri_1814;
    }

    // Northern New England (NH, VT, ME)
    if ((loc.includes("new hampshire") || loc.includes(" nh") || loc.includes("vermont") || loc.includes(" vt") || loc.includes("maine") || loc.includes(" me"))) {
         // Use NH map as representative for Northern NE before 1850
         if (y < 1850) return ASSETS.nh_1796;
    }

    // Long Island / Oyster Bay Colonial (< 1800)
    if ((loc.includes("oyster bay") || loc.includes("long island") || loc.includes("hempstead") || loc.includes("jamaica") || loc.includes("southold")) && y < 1800) {
        return ASSETS.long_island_1686;
    }

    // Midwest / Westward Expansion
    if ((loc.includes("ohio") || loc.includes(" oh")) && y < 1850) {
        return ASSETS.ohio_1804;
    }
    if ((loc.includes("michigan") || loc.includes(" mi")) && y < 1850) {
        return ASSETS.michigan_1831;
    }
    if ((loc.includes("illinois") || loc.includes(" il")) && y < 1850) {
        return ASSETS.illinois_1818;
    }

    // East Anglia (Norfolk, Suffolk, Essex, Norwich England)
    if ((loc.includes("norfolk") || loc.includes("suffolk") || loc.includes("essex") || (loc.includes("norwich") && !loc.includes("ct"))) && (loc.includes("england") || loc.includes("uk"))) {
        // Use East Anglia map for 1600s/1700s
        if (y < 1750) return ASSETS.norfolk_map_1610;
    }

    // Massachusetts / CT Early Settlers (1620-1700)
    // Priority: This captures the "Puritan Life" vibe for key towns before falling back to maps.
    const settlementTowns = ["watertown", "sudbury", "ipswich", "windsor", "hartford", "wethersfield", "roxbury", "dorchester", "salem", "duxbury", "scituate", "dedham", "hingham", "weymouth", "cambridge", "charlestown", "boston"];
    if (settlementTowns.some(town => loc.includes(town)) && y >= 1620 && y < 1700) {
        return ASSETS.puritan_life;
    }

    // London Pre-Fire (< 1666)
    if (loc.includes("london") && y < 1666) {
        return ASSETS.london_visscher;
    }

    // Boston < 1750 (Fallback for Boston if outside Puritan range, e.g. 1700-1750)
    if (loc.includes("boston") && y < 1750 && y > 1630) {
        return ASSETS.boston_old;
    }

    // New England Pilgrim Era (General)
    if ((loc === "new england" || loc.includes("plymouth") || loc.includes("massachusetts") || loc.includes("ma")) && y >= 1620 && y < 1700) {
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

    // New York / NYC (1800-1900)
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
        if (y < 1700 && y > 1620) return ASSETS.ne_map_1634;
        return ASSETS.ne_map_1634; // Default regional
    }

    // UK / England
    if (loc.includes("england") || loc.includes("uk") || loc.includes("britain") || loc.includes("london")) {
        if (y < 1650) return ASSETS.england_countryside;
        return ASSETS.england_1600;
    }

    // 4. Default Fallback
    return ASSETS.generic_antique;
};
