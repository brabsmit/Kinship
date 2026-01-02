import React from 'react';
import { Users, Eye, Handshake, HeartHandshake, UserPlus, Info } from 'lucide-react';

const ROLE_ICONS = {
    "Witness": <Eye size={16} />,
    "Neighbor": <UserPlus size={16} />,
    "Partner": <Handshake size={16} />,
    "Business Partner": <Handshake size={16} />,
    "Associate": <Users size={16} />,
    "Friend": <HeartHandshake size={16} />,
    "default": <Users size={16} />
};

export default function CircleOfFriends({ associates }) {
    if (!associates || associates.length === 0) return null;

    // Sort by count (desc) then role
    const sorted = [...associates].sort((a, b) => (b.count || 0) - (a.count || 0));

    return (
        <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-gray-200 flex-1"></div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users size={14} strokeWidth={1.5} /> Circle of Friends
                </h2>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sorted.map((person, idx) => {
                    const icon = ROLE_ICONS[person.role] || ROLE_ICONS[person.context] || ROLE_ICONS.default;
                    const count = person.count || 1;

                    return (
                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100 group-hover:bg-indigo-100 transition-colors shrink-0">
                                    {icon}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
                                        {person.name}
                                    </h4>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5 truncate">
                                        {person.role} {person.context && <span className="text-gray-400 normal-case tracking-normal">• {person.context}</span>}
                                    </div>

                                    {count > 1 && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                            <Info size={10} />
                                            Appears in {count} records
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
