import React from 'react';
import { User, Clock } from 'lucide-react';

const SoloChapter = ({ person, familyData }) => {
    // 1. Find Spouse(s)
    const spouseIds = person.relations?.spouses || [];
    if (spouseIds.length === 0) return null;

    const personDied = person.vital_stats?.died_year_int;
    if (!personDied) return null;

    let maxDiff = 0;
    let significantSpouse = null;

    spouseIds.forEach(id => {
        const spouse = familyData.find(p => String(p.id) === String(id));
        if (spouse && spouse.vital_stats?.died_year_int) {
            const spouseDied = spouse.vital_stats.died_year_int;
            // We are looking for the period the person lived *after* the spouse died.
            const diff = personDied - spouseDied;
            if (diff > maxDiff) {
                maxDiff = diff;
                significantSpouse = spouse;
            }
        }
    });

    // Threshold: User example is 32 years. "Decades" implies 10+.
    // Let's set it to 10 years to capture significant widowhood.
    if (maxDiff < 10 || !significantSpouse) return null;

    // 2. Determine Gender/Title
    const idStr = String(person.id);
    let title = "The Survivor's Era";
    let pronoun = "They";
    let iconBg = "bg-slate-700";
    let iconColor = "text-amber-400";
    let titleColor = "text-amber-500";

    // ID Convention Helper
    const isMale = (id) => id.endsWith('.1') || ['1', '3', '5', '7'].includes(id);
    const isFemale = (id) => id.endsWith('.2') || ['2', '4', '6', '8'].includes(id);

    if (isMale(idStr)) {
        title = "The Patriarch Era";
        pronoun = "He";
    } else if (isFemale(idStr)) {
        title = "The Matriarch Era";
        pronoun = "She";
        iconBg = "bg-rose-900";
        iconColor = "text-rose-200";
        titleColor = "text-rose-400";
    }

    // 3. Narrative Construction
    const spouseName = significantSpouse.name.split(' ')[0]; // First name
    const personName = person.name.split(' ')[0];

    const spouseDied = significantSpouse.vital_stats.died_year_int;
    const centuries = [1700, 1800, 1900, 2000];
    const crossedCentury = centuries.find(c => spouseDied < c && personDied >= c);

    let narrative = `${personName} survived ${spouseName} by ${maxDiff} years.`;

    if (crossedCentury) {
        narrative += ` ${pronoun} led the family through the turn of the ${getOrdinal(crossedCentury/100 + 1)} century alone.`;
    } else {
        narrative += ` ${pronoun} guided the family through this era alone.`;
    }

    return (
        <div className="bg-slate-800 text-slate-100 rounded-xl p-6 shadow-md border border-slate-700 mb-8 relative overflow-hidden group">
            {/* Background Decoration */}
             <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Clock size={140} />
            </div>

            <div className="flex items-start gap-5 relative z-10">
                <div className={`${iconBg} p-3 rounded-full ${iconColor} shadow-lg border border-white/10 shrink-0`}>
                    <User size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <div className={`text-xs font-bold ${titleColor} uppercase tracking-[0.2em] mb-2 flex items-center gap-2`}>
                        {title}
                    </div>
                    <p className="text-xl md:text-2xl font-serif text-slate-200 leading-relaxed">
                        "{narrative}"
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 font-mono uppercase tracking-wider">
                         <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Solo Chapter: {spouseDied} – {personDied}
                         </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default SoloChapter;
