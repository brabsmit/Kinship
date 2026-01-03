
import React from 'react';
import { Clock, User } from 'lucide-react';

const HandshakeCard = ({ person, relative }) => {
    // Determine overall timeline range for this pair
    const pBorn = parseInt(person.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const pDied = parseInt(person.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);
    const rBorn = parseInt(relative.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const rDied = parseInt(relative.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

    const minYear = Math.min(pBorn, rBorn);
    const maxYear = Math.max(pDied, rDied);
    const range = maxYear - minYear;

    const getLeft = (year) => ((year - minYear) / range) * 100;
    const getWidth = (start, end) => ((end - start) / range) * 100;

    // Overlap highlight
    const overlapStart = Math.max(pBorn, rBorn);
    const overlapEnd = Math.min(pDied, rDied);
    const overlapWidth = getWidth(overlapStart, overlapEnd);
    const overlapLeft = getLeft(overlapStart);

    // Narrative
    let narrative = "";
    if (relative.relationType.includes("Grandparent") || relative.relationType.includes("Ancestor")) {
        // Person is Descendant (e.g. Grandson)
        // "You were 8 years old when your Grandfather passed away."
        narrative = `${person.name.split(' ')[0]} was ${relative.overlap} years old when his ${relative.label.toLowerCase()} ${relative.name.split(' ')[0]} died.`;
    } else {
        // Person is Ancestor (e.g. Grandfather)
        // "William lived long enough to see his grandson turn 8."
        narrative = `${person.name.split(' ')[0]} lived long enough to see his ${relative.label.toLowerCase()} turn ${relative.overlap}.`;
    }

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2">
                         <span className="text-xs font-bold uppercase tracking-widest text-[#E67E22]">
                            {relative.label}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                            {relative.overlap} Year Overlap
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm mt-1">
                        {relative.name}
                    </h3>
                </div>
            </div>

            {/* Timeline Viz */}
            <div className="relative h-16 w-full mb-3">
                {/* Person Bar */}
                <div
                    className="absolute top-0 h-4 bg-gray-800 rounded-sm opacity-80"
                    style={{ left: `${getLeft(pBorn)}%`, width: `${getWidth(pBorn, pDied)}%` }}
                ></div>
                <div
                    className="absolute top-0 text-[10px] text-gray-500 font-mono -mt-4 whitespace-nowrap"
                    style={{ left: `${getLeft(pBorn)}%` }}
                >
                    {pBorn}
                </div>

                {/* Relative Bar */}
                <div
                    className="absolute top-6 h-4 bg-[#E67E22] rounded-sm opacity-80"
                    style={{ left: `${getLeft(rBorn)}%`, width: `${getWidth(rBorn, rDied)}%` }}
                ></div>
                 <div
                    className="absolute top-6 text-[10px] text-gray-500 font-mono mt-4 whitespace-nowrap"
                    style={{ left: `${getLeft(rBorn)}%` }}
                >
                    {rBorn}
                </div>

                {/* Overlap Highlight */}
                <div
                    className="absolute top-0 h-10 bg-stripes-white opacity-20 border-x border-white"
                    style={{ left: `${overlapLeft}%`, width: `${overlapWidth}%` }}
                ></div>

                 {/* Connection Line at Overlap End (Death of first person) */}
                 <div
                    className="absolute top-0 bottom-0 w-px bg-red-400 dashed opacity-50"
                    style={{ left: `${getLeft(overlapEnd)}%` }}
                ></div>
                <div
                    className="absolute -bottom-2 text-[10px] font-bold text-red-400 -translate-x-1/2 bg-gray-50 px-1"
                     style={{ left: `${getLeft(overlapEnd)}%` }}
                >
                    {overlapEnd}
                </div>
            </div>

            <p className="text-sm text-gray-600 italic leading-relaxed">
                "{narrative}"
            </p>
        </div>
    );
};

const GenerationalHandshake = ({ person, familyData }) => {
    const personId = String(person.id);
    const personBorn = parseInt(person.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const personDied = parseInt(person.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

    if (!personBorn || !personDied) return null;

    const relevantRelatives = familyData.filter(relative => {
        const relId = String(relative.id);
        if (relId === personId) return false;
        if (relId.includes('_c')) return false; // Skip derived records

        const relBorn = parseInt(relative.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
        const relDied = parseInt(relative.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

        if (!relBorn || !relDied) return false;

        // Determine Lineage Relationship
        const isAncestor = relId.startsWith(personId + '.');
        const isDescendant = personId.startsWith(relId + '.');

        if (!isAncestor && !isDescendant) return false;

        const pGen = personId.split('.').length;
        const rGen = relId.split('.').length;
        const genDiff = Math.abs(rGen - pGen);

        if (genDiff < 2) return false; // Skip parents/children

        // Overlap Check
        const overlapStart = Math.max(personBorn, relBorn);
        const overlapEnd = Math.min(personDied, relDied);
        const overlap = overlapEnd - overlapStart;

        if (overlap <= 0) return false;

        relative.overlap = overlap;
        relative.overlapStart = overlapStart;
        relative.overlapEnd = overlapEnd;
        relative.genDiff = genDiff;
        relative.isAncestor = isAncestor; // relative is Ancestor of person?
        // Wait, Ancestor ID is LONGER.
        // So if relId starts with personId. Relative is Ancestor.
        // YES.

        if (isAncestor) {
             // Relative is Ancestor (Longer ID). Person is Child.
             // Person: 1. Relative: 1.1.1 (GP).
             // Relative is Grandparent.
             if (genDiff === 2) relative.label = "Grandchild"; // NO. Relative is Descendant if Longer?
             // Memory: "Longer ID (e.g., '1.1') represents the parent/ancestor of the shorter ID (e.g., '1')."
             // If Relative is Longer: Relative is Ancestor.
             // So Relative is GP.
             // WAIT.
             // If Relative is 1.1.1 (Longer). Person is 1 (Shorter).
             // Relative is Ancestor of Person.
             // So Relative is Grandfather.
             // Person is Grandson.
             // Correct.
             if (genDiff === 2) relative.label = "Grandparent";
             else if (genDiff === 3) relative.label = "Great-Grandparent";
             else relative.label = `${genDiff-2}th Great-Grandparent`;
             relative.relationType = "Ancestor";
        } else {
             // Relative is Descendant (Shorter ID). Person is Ancestor.
             // Person: 1.1.1. Relative: 1.
             if (genDiff === 2) relative.label = "Grandchild";
             else if (genDiff === 3) relative.label = "Great-Grandchild";
             else relative.label = `${genDiff-2}th Great-Grandchild`;
             relative.relationType = "Descendant";
        }

        return true;
    }).map(rel => ({...rel})); // Clone to avoid mutating original

    if (relevantRelatives.length === 0) return null;

    // Sort: prioritize highest generation gap, then longest overlap
    relevantRelatives.sort((a, b) => {
        if (b.genDiff !== a.genDiff) return b.genDiff - a.genDiff;
        return b.overlap - a.overlap;
    });

    const topMatches = relevantRelatives.slice(0, 3);

    return (
        <div className="bg-white rounded-xl p-0 mb-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-gray-200 flex-1"></div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={14} strokeWidth={1.5} /> Generational Handshake
                </h2>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="space-y-6">
                {topMatches.map(rel => (
                     <HandshakeCard key={rel.id} person={person} relative={rel} />
                ))}
            </div>
        </div>
    );
};

export default GenerationalHandshake;
