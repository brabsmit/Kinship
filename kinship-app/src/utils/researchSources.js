export const RESEARCH_SOURCES = {
    // --- MILITARY ---
    "M804": {
        label: "NARA M804 (Rev War Pensions)",
        url: "https://www.fold3.com/publication/467/revolutionary-war-pensions",
        description: "Revolutionary War Pension and Bounty-Land Warrant Application Files"
    },
    "M881": {
        label: "NARA M881 (Rev War Service Records)",
        url: "https://www.fold3.com/publication/470/us-revolutionary-war-service-records-1775-1783",
        description: "Compiled service records of soldiers who served in the American Army during the Revolutionary War, 1775-1783"
    },
    "Civil War": {
        label: "Fold3 Civil War Collection",
        url: "https://www.fold3.com/browse/251/civil-war-collection",
        description: "Service records, pensions, and photos from the US Civil War"
    },
    "Civil War NPS": {
        label: "NPS Soldiers and Sailors",
        url: "https://www.nps.gov/civilwar/soldiers-and-sailors-database.htm",
        description: "Free database of Civil War servicemen (Union & Confederate)"
    },
    "War of 1812": {
        label: "Fold3 War of 1812",
        url: "https://www.fold3.com/publication/761/war-of-1812-pension-files",
        description: "Pension Application Files"
    },
    "WWI Draft": {
        label: "WWI Draft Registration",
        url: "https://www.familysearch.org/search/collection/1968530",
        description: "Draft cards for 24 million men (1917-1918)"
    },
    "DAR": {
        label: "DAR Genealogical Research System",
        url: "https://services.dar.org/public/dar_research/search/",
        description: "Revolutionary War Patriots and descendants"
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
    "1880 Census": {
        label: "1880 US Census",
        url: "https://www.familysearch.org/search/collection/1417683",
        description: "Lists relationship to head of household"
    },
    "1940 Census": {
        label: "1940 US Census",
        url: "https://www.familysearch.org/search/collection/2000219",
        description: "Includes respondents' residence in 1935"
    },
    "1950 Census": {
        label: "1950 US Census",
        url: "https://www.familysearch.org/search/collection/4464515",
        description: "Post-WWII era census"
    },

    // --- VITAL RECORDS ---
    "FindAGrave": {
        label: "Find A Grave",
        url: "https://www.findagrave.com/memorial/search",
        description: "Burial and cemetery records"
    },
    "BillionGraves": {
        label: "BillionGraves",
        url: "https://billiongraves.com/search",
        description: "GPS-tagged cemetery records"
    },
    "CT Vital": {
        label: "Connecticut Vital Records (Barbour)",
        url: "https://www.ancestry.com/search/collections/1062/",
        description: "The Barbour Collection of Connecticut Town Vital Records"
    },
    "MA Vital": {
        label: "Massachusetts Town Clerk Records",
        url: "https://www.familysearch.org/search/collection/2061550",
        description: "Vital and town records from local town clerks (1626-2001)"
    },
    "NJ Vital": {
        label: "New Jersey State Archives",
        url: "https://wwwnet-dos.state.nj.us/DOS_ArchivesDBPortal/index.aspx",
        description: "Searchable birth, marriage, and death records"
    },
    "NYC Vital": {
        label: "NYC Historical Vital Records",
        url: "https://a860-historicalvitalrecords.nyc.gov/",
        description: "Free digitized birth, marriage, and death certificates (NYC)"
    },
    "SSDI": {
        label: "Social Security Death Index",
        url: "https://www.familysearch.org/search/collection/1202535",
        description: "Death records for US residents (1962-2014)"
    },

    // --- LAND & PROPERTY ---
    "Land Deeds": {
        label: "Bureau of Land Management (GLO)",
        url: "https://glorecords.blm.gov/search/default.aspx",
        description: "Federal land patents and homestead records"
    },
    "Probate": {
        label: "FamilySearch Wills & Probate",
        url: "https://www.familysearch.org/search/collection/list?keywords=probate",
        description: "Wills, guardianships, and estate files"
    },

    // --- IMMIGRATION & MINORITY ---
    "Great Migration": {
        label: "Great Migration Project",
        url: "https://www.familysearch.org/en/search/catalog/2550739",
        description: "Authoritative accounts of immigrants to New England (1620-1640)"
    },
    "Passenger List": {
        label: "Ellis Island & Castle Garden",
        url: "https://heritage.statueofliberty.org/",
        description: "Passenger arrival records"
    },
    "Freedman's Bureau": {
        label: "Freedman's Bureau Records",
        url: "https://www.familysearch.org/search/collection/2721171",
        description: "Records of Freedmen, Refugees, and Abandoned Lands (1865-1872)"
    },

    // --- BOOKS & NEWSPAPERS ---
    "Obituary": {
        label: "Newspapers.com",
        url: "https://www.newspapers.com/",
        description: "Historical newspapers search"
    },
    "Chronicling America": {
        label: "Chronicling America (LOC)",
        url: "https://chroniclingamerica.loc.gov/",
        description: "Free historical American newspapers"
    },
    "Google Books": {
        label: "Google Books",
        url: "https://books.google.com/",
        description: "Search full-text digitized genealogies and local histories"
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
