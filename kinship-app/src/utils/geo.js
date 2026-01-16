// Haversine formula to calculate distance between two points in miles
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 3958.8; // Radius of Earth in miles

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const detectRegion = (locationString) => {
    if (!locationString) return "Global";
    const loc = locationString.toLowerCase();

    // USA
    if (loc.includes("usa") || loc.includes("united states") ||
        loc.includes("ct") || loc.includes("connecticut") ||
        loc.includes("ma") || loc.includes("massachusetts") ||
        loc.includes("ny") || loc.includes("new york") ||
        loc.includes("nj") || loc.includes("new jersey") ||
        loc.includes("pa") || loc.includes("pennsylvania") ||
        loc.includes("va") || loc.includes("virginia")) {
        return "USA";
    }

    // UK
    if (loc.includes("uk") || loc.includes("united kingdom") ||
        loc.includes("england") || loc.includes("britain") ||
        loc.includes("london") || loc.includes("scotland") ||
        loc.includes("wales")) {
        return "UK";
    }

    return "Global";
};
