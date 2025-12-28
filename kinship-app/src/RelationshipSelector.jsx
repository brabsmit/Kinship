import React, { useState, useMemo } from 'react';
import { User, Check, ChevronRight, ArrowLeft } from 'lucide-react';

export default function RelationshipSelector({ data, onComplete }) {
    const [step, setStep] = useState(1);
    const [selectedPerson, setSelectedPerson] = useState(null);

    // Get latest born people
    const candidates = useMemo(() => {
        if (!data) return [];
        // Filter valid birth years and sort descending
        return data
            .filter(p => p.vital_stats && p.vital_stats.born_year_int)
            .sort((a, b) => b.vital_stats.born_year_int - a.vital_stats.born_year_int)
            .slice(0, 8); // Top 8 most recent
    }, [data]);

    const RELATION_OPTIONS = [
        { label: "I am this person", steps: 0 },
        { label: "Child", steps: 1 },
        { label: "Grandchild", steps: 2 },
        { label: "Great-Grandchild", steps: 3 },
        { label: "2nd Great-Grandchild", steps: 4 },
        { label: "3rd Great-Grandchild", steps: 5 },
        { label: "4th Great-Grandchild", steps: 6 },
    ];

    const handlePersonSelect = (person) => {
        setSelectedPerson(person);
        setStep(2);
    };

    const handleRelationSelect = (steps) => {
        onComplete({ anchorId: selectedPerson.id, stepsDown: steps });
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-display font-bold text-gray-900">
                        {step === 1 ? "Who are you related to?" : "How are you related?"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {step === 1
                            ? "Select a relative to establish your connection to the tree."
                            : `Defining your relationship to ${selectedPerson?.name}.`
                        }
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">

                    {step === 1 && (
                        <div className="space-y-2">
                            {candidates.map(person => (
                                <button
                                    key={person.id}
                                    onClick={() => handlePersonSelect(person)}
                                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-serif font-bold group-hover:bg-white group-hover:text-orange-500 transition-colors">
                                        {person.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-orange-900">{person.name}</div>
                                        <div className="text-xs text-gray-500">
                                            Born {person.vital_stats.born_year_int} • {person.vital_stats.born_location}
                                        </div>
                                    </div>
                                    <ChevronRight className="ml-auto text-gray-300 group-hover:text-orange-300" size={18} />
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-2">
                            {RELATION_OPTIONS.map(option => (
                                <button
                                    key={option.steps}
                                    onClick={() => handleRelationSelect(option.steps)}
                                    className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group flex items-center justify-between"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-orange-900">
                                        {option.label}
                                    </span>
                                    {option.steps === 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">It's me!</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 2 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to list
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
