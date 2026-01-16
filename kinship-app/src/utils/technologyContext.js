import INVENTIONS from '../inventions.json' with { type: 'json' };

export const getTechnologyContext = (bornYear, diedYear) => {
    if (!diedYear) return null;

    const missing = [];
    const witnessed = [];

    INVENTIONS.forEach(inv => {
        if (diedYear < inv.year) {
            missing.push(inv);
        } else if (bornYear < inv.year && diedYear >= inv.year) {
            witnessed.push(inv);
        }
    });

    // Generate Narrative
    let narrative = "";
    if (diedYear < 1800) {
        narrative = "Lived in a pre-industrial world powered by wind, water, and muscle.";
    } else if (diedYear <= 1860) {
        // Prompt says "If they died in 1860: ... Lived their entire life by candlelight and horsepower."
        // My test returned "Unprecedented change" because 1860 didn't hit my < 1860 check strictly, or fell through.
        // Actually, 1860 matches "diedYear < 1860" as false. It should be <= 1860 or < 1865.
        // Let's adjust logic.
        narrative = "Lived their entire life by candlelight and horsepower.";
    } else if (witnessed.some(i => i.id === 'electricity') || witnessed.some(i => i.id === 'automobiles')) {
        narrative = "Witnessed the rapid industrialization of society, including the transition from horses to machines.";
    } else if (bornYear > 1900 && diedYear < 1950) {
         narrative = "Lived during the rise of modern mass media and mechanized warfare.";
    } else {
        narrative = "Lived through an era of unprecedented technological change.";
    }

    // Override specifically for the prompt example "Witnessed the transition from horse carriages to automobiles" if applicable
    const hasCars = witnessed.some(i => i.id === 'automobiles');

    if (diedYear >= 1910 && diedYear <= 1930 && hasCars) {
         narrative = "Witnessed the transition from horse carriages to automobiles.";
    }

    return { missing, witnessed, narrative };
};
