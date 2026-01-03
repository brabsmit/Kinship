import React from 'react';
import { Zap, Pill, Droplet, Car, Plane, Phone, Radio, Snowflake, Wifi, Tv, Monitor } from 'lucide-react';
import { getTechnologyContext } from '../utils/technologyContext';

const ICON_MAP = {
    Zap, Pill, Droplet, Car, Plane, Phone, Radio, Snowflake, Wifi, Tv, Monitor
};

const TechnologyContext = ({ bornYear, diedYear }) => {
    const context = getTechnologyContext(bornYear, diedYear);

    if (!context || !bornYear || !diedYear) return null;

    const { missing, witnessed, narrative } = context;

    // We primarily want to show "Negative Data" (missing)
    // But maybe limit to top 3-4 most impactful missing ones to avoid clutter?
    // Prioritize: Electricity, Plumbing, Antibiotics, Cars.

    const prioritize = ['electricity', 'antibiotics', 'plumbing', 'automobiles'];
    const displayedMissing = missing.filter(m => prioritize.includes(m.id)).slice(0, 3);

    // If they have everything (modern), maybe show nothing or "Modern Era"?
    // Or if displayedMissing is empty, show witnessed.
    if (displayedMissing.length === 0 && witnessed.length === 0) return null;

    return (
        <div className="bg-white rounded-xl p-0 mb-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-gray-200 flex-1"></div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap size={14} strokeWidth={1.5} /> The World They Knew
                </h2>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                <p className="text-center text-slate-600 font-serif italic mb-6">
                    "{narrative}"
                </p>

                {displayedMissing.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {displayedMissing.map(item => {
                            const Icon = ICON_MAP[item.iconName] || Zap;
                            return (
                                <div key={item.id} className="flex flex-col items-center text-center gap-2 group">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-gray-300 transition-colors">
                                            <Icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-slate-50">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        No {item.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                 {/* Optional: Show what they Witnessed if few missing? */}
                 {displayedMissing.length === 0 && witnessed.length > 0 && (
                     <div className="mt-4 text-center text-xs text-gray-400">
                        Witnessed the arrival of {witnessed.map(w => w.name).join(', ')}.
                     </div>
                 )}
            </div>
        </div>
    );
};

export default TechnologyContext;
