export const RESEARCH_SOURCES = {
    // --- MILITARY ---
    "M804": {
        label: "NARA M804 (Rev War Pensions)",
        url: "https://www.fold3.com/publication/467/revolutionary-war-pensions",
        description: "Revolutionary War Pension and Bounty-Land Warrant Application Files"
    },
    "Civil War": {
        label: "Fold3 Civil War Collection",
        url: "https://www.fold3.com/browse/251/civil-war-collection",
        description: "Service records, pensions, and photos from the US Civil War"
    },
    "War of 1812": {
        label: "Fold3 War of 1812",
        url: "https://www.fold3.com/publication/761/war-of-1812-pension-files",
        description: "Pension Application Files"
    },

    // --- CENSUS ---
    "Census": {
        label: "FamilySearch Census Records",
        url: "https://www.familysearch.org/search/collection/list?keywords=census",
        description: "US Federal and State Census records"
    },
    "1790 Census": {
        label: "1790 US Census",
        url: "https://www.familysearch.org/search/collection/1515908",
        description: "First Census of the United States"
    },
    "1850 Census": {
        label: "1850 US Census",
        url: "https://www.familysearch.org/search/collection/1401638",
        description: "First census to list all family members by name"
    },

    // --- VITAL RECORDS ---
    "FindAGrave": {
        label: "Find A Grave",
        url: "https://www.findagrave.com/search",
        description: "Burial and cemetery records"
    },
    "CT Vital": {
        label: "Connecticut Vital Records (Barbour)",
        url: "https://www.ancestry.com/search/collections/1062/",
        description: "The Barbour Collection of Connecticut Town Vital Records"
    },
    "MA Vital": {
        label: "Massachusetts Vital Records (Tan Books)",
        url: "https://ma-vitalrecords.org/",
        description: "Vital Records of Massachusetts Towns to 1850"
    },

    // --- IMMIGRATION ---
    "Great Migration": {
        label: "Great Migration Project",
        url: "https://www.americanancestors.org/browse/publications/great-migration-study-project",
        description: "authoritative accounts of immigrants to New England (1620-1640)"
    },
    "Passenger List": {
        label: "Ellis Island & Castle Garden",
        url: "https://heritage.statueofliberty.org/",
        description: "Passenger arrival records"
    },

    // --- NEWSPAPERS ---
    "Obituary": {
        label: "Newspapers.com",
        url: "https://www.newspapers.com/",
        description: "Historical newspapers search"
    },
    "Probate": {
        label: "FamilySearch Wills & Probate",
        url: "https://www.familysearch.org/search/collection/list?keywords=probate",
        description: "Wills, guardianships, and estate files"
    }
};

/**
 * Scans text for research source keywords and returns matching objects.
 * Prioritizes specific matches (e.g. "1790 Census") over generic ones (e.g. "Census").
 * @param {string} text - The text to scan.
 * @returns {Array} - Array of matching source objects.
 */
export function findSources(text) {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    const matchedKeys = [];

    // Find all matching keys
    for (const key of Object.keys(RESEARCH_SOURCES)) {
        if (lowerText.includes(key.toLowerCase())) {
            matchedKeys.push(key);
        }
    }

    // Filter out keys that are substrings of other matched keys
    // e.g. if "1790 Census" is found, drop "Census"
    const finalKeys = matchedKeys.filter(key => {
        return !matchedKeys.some(otherKey =>
            otherKey !== key && otherKey.toLowerCase().includes(key.toLowerCase())
        );
    });

    return finalKeys.map(key => RESEARCH_SOURCES[key]);
}
