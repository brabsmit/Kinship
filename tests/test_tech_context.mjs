import { getTechnologyContext } from './kinship-app/src/utils/technologyContext.js';

console.log("Testing Technology Context Logic...");

const testCases = [
    { born: 1800, died: 1860, label: "Died 1860" },
    { born: 1850, died: 1920, label: "Died 1920" }
];

testCases.forEach(tc => {
    console.log(`\n--- ${tc.label} ---`);
    const result = getTechnologyContext(tc.born, tc.died);
    console.log("Narrative:", result.narrative);
    console.log("Missing:", result.missing.map(m => m.name).join(', '));
    console.log("Witnessed:", result.witnessed.map(w => w.name).join(', '));
});
