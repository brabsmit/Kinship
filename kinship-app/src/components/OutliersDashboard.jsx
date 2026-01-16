import React, { useMemo } from 'react';
import { Trophy, Users, Baby, Clock, ArrowRight, User } from 'lucide-react';

const OutliersDashboard = ({ data, onSelectProfile }) => {

    const records = useMemo(() => {
        if (!data) return { centenarians: [], largeFamilies: [], youngParents: [] };

        const centenarians = [];
        const largeFamilies = [];
        const youngParents = [];

        data.forEach(person => {
            const bornYear = parseInt(person.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
            const diedYear = parseInt(person.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

            // 1. Centenarians
            if (bornYear && diedYear && diedYear > bornYear) {
                const age = diedYear - bornYear;
                if (age > 90) {
                    centenarians.push({ ...person, age });
                }
            }

            // Find Children (using ID based logic as fallback if relations missing, similar to App.jsx)
            let children = [];
            if (person.relations && person.relations.children) {
                children = person.relations.children.map(id => data.find(p => p.id === id)).filter(Boolean);
            } else {
                const personId = String(person.id);
                children = data.filter(p => {
                    const pId = String(p.id);
                    return pId.startsWith(personId + '.') && pId.split('.').length === personId.split('.').length + 1;
                });
            }

            // 2. Large Families
            const childrenCount = children.length;
            if (childrenCount >= 10) {
                largeFamilies.push({ ...person, childrenCount });
            }

            // 3. Young Parents
            if (bornYear && childrenCount > 0) {
                let earliestChildYear = 9999;
                let hasValidChildYear = false;

                children.forEach(child => {
                    const cYear = parseInt(child.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
                    if (cYear > 0 && cYear < earliestChildYear) {
                        earliestChildYear = cYear;
                        hasValidChildYear = true;
                    }
                });

                if (hasValidChildYear) {
                    const ageAtFirstChild = earliestChildYear - bornYear;
                    // Sanity check: parents usually older than 10
                    if (ageAtFirstChild < 18 && ageAtFirstChild > 10) {
                        youngParents.push({ ...person, ageAtFirstChild, firstChildYear: earliestChildYear });
                    }
                }
            }
        });

        // Sort and Slice
        centenarians.sort((a, b) => b.age - a.age);
        largeFamilies.sort((a, b) => b.childrenCount - a.childrenCount);
        youngParents.sort((a, b) => a.ageAtFirstChild - b.ageAtFirstChild);

        return {
            centenarians: centenarians.slice(0, 3), // Top 3
            largeFamilies, // All of them
            youngParents // All of them
        };
    }, [data]);

    return (
        <div className="h-full overflow-y-auto bg-stone-50 p-6 font-serif">
            <div className="max-w-4xl mx-auto space-y-12">

                <header className="border-b border-stone-300 pb-4">
                    <h1 className="text-3xl font-display text-stone-800 mb-2 flex items-center gap-3">
                        <Trophy className="text-[#E67E22]" size={32} />
                        The Outliers
                    </h1>
                    <p className="text-stone-600 italic">
                        Statistical superlatives and family records.
                    </p>
                </header>

                {/* 1. The Centenarians */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">The Centenarians</h2>
                            <p className="text-sm text-gray-500">Ancestors who lived past 90.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {records.centenarians.map((person, idx) => (
                            <div key={person.id} className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute -right-4 -top-4 text-9xl font-display font-bold text-amber-50 opacity-50 z-0">
                                    {person.age}
                                </div>

                                <div className="relative z-10">
                                    <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
                                        Rank #{idx + 1}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{person.name}</h3>
                                    <div className="text-3xl font-display font-bold text-amber-600 mb-2">
                                        {person.age} <span className="text-sm font-sans text-gray-400 font-normal">years old</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4">
                                        {person.vital_stats.born_date?.match(/\d{4}/)?.[0]} – {person.vital_stats.died_date?.match(/\d{4}/)?.[0]}
                                    </div>

                                    <button
                                        onClick={() => onSelectProfile(person.id)}
                                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-amber-600 transition-colors"
                                    >
                                        View Profile <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {records.centenarians.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-gray-400 italic">No centenarians found in the current data.</div>
                        )}
                    </div>
                </section>

                {/* 2. The Large Families */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">The Large Families</h2>
                            <p className="text-sm text-gray-500">Ancestors with 10+ children.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {records.largeFamilies.map((person) => (
                            <div key={person.id} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-0.5">{person.name}</h3>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {person.vital_stats.born_date?.match(/\d{4}/)?.[0] || '?'}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                                        <Baby size={12} /> {person.childrenCount} Children
                                    </div>
                                </div>
                                <button
                                    onClick={() => onSelectProfile(person.id)}
                                    className="text-gray-300 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                        {records.largeFamilies.length === 0 && (
                            <div className="text-gray-400 italic">No large families found.</div>
                        )}
                    </div>
                </section>

                {/* 3. The Young Parents */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg text-green-700">
                            <Baby size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">The Young Parents</h2>
                            <p className="text-sm text-gray-500">Ancestors who started families before age 18.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {records.youngParents.map((person) => (
                            <div key={person.id} className="bg-white p-4 rounded-lg border border-green-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                                    {person.ageAtFirstChild}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-sm">{person.name}</h3>
                                    <p className="text-xs text-gray-500">
                                        First child born in {person.firstChildYear} (Parent born {person.vital_stats.born_date?.match(/\d{4}/)?.[0]})
                                    </p>
                                </div>
                                <button
                                    onClick={() => onSelectProfile(person.id)}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                                >
                                    View
                                </button>
                            </div>
                        ))}
                        {records.youngParents.length === 0 && (
                            <div className="text-gray-400 italic">No records found for parents under 18.</div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default OutliersDashboard;
