
import familyData from './family_data.json';
import React, { useState, useMemo } from 'react';
import { BookOpen, Search, X, MapPin, User, Clock, Anchor, Info, Users, ChevronRight, ChevronDown } from 'lucide-react';

// --- 1. HISTORICAL CONTEXT ENGINE ---
const HISTORY_EVENTS = [
    { year: 1607, label: "Jamestown Founded", type: "era" },
    { year: 1620, label: "Mayflower Arrives", type: "era" },
    { year: 1692, label: "Salem Witch Trials", type: "event" },
    { year: 1776, label: "Declaration of Independence", type: "war" },
    { year: 1789, label: "Washington becomes President", type: "politics" },
    { year: 1812, label: "War of 1812", type: "war" },
    { year: 1837, label: "Panic of 1837 (Financial Crisis)", type: "economy" },
    { year: 1848, label: "California Gold Rush", type: "era" },
    { year: 1861, label: "Civil War Begins", type: "war" },
    { year: 1865, label: "Lincoln Assassinated", type: "politics" },
    { year: 1879, label: "Lightbulb Invented", type: "tech" }
];

const getLifeEvents = (bornStr, diedStr) => {
    const born = parseInt(bornStr?.match(/\d{4}/)?.[0] || 0);
    const died = parseInt(diedStr?.match(/\d{4}/)?.[0] || 0);
    if (!born || !died) return [];
    return HISTORY_EVENTS.filter(e => e.year >= born && e.year <= died);
};

// --- 2. RELATIONSHIP CALCULATOR ---
const calculateRelationship = (ancestorId) => {
    // Dynamic fallback if generation label is missing, otherwise use logic
    const ancestorGen = ancestorId.split('.').length; 
    const readerGen = 6; 
    const diff = readerGen - ancestorGen;

    if (diff === 0) return "Same Generation (Cousin)";
    if (diff === 1) return "Parent / Aunt / Uncle";
    if (diff === 2) return "Grandparent";
    if (diff === 3) return "Great-Grandparent";
    if (diff >= 4) return `${diff}th Great-Grandparent`;
    if (diff < 0) return "Descendant";
    return "Relative";
};

// --- 3. FAMILY LINKING LOGIC ---
const getFamilyLinks = (person, allData) => {
    // 1. Use Explicit Relations if available (Pre-computed in Pipeline)
    if (person.relations) {
        const parents = (person.relations.parents || []).map(id => allData.find(p => p.id === id)).filter(Boolean);
        const children = (person.relations.children || []).map(id => allData.find(p => p.id === id)).filter(Boolean);
        const spouses = (person.relations.spouses || []).map(id => allData.find(p => p.id === id)).filter(Boolean);

        return { parents, children, spouses };
    }

    // 2. Fallback Logic (Legacy)
    const personId = person.id;
    const parentId = personId.includes('.') ? personId.substring(0, personId.lastIndexOf('.')) : null;
    const parent = allData.find(p => p.id === parentId);
    
    const children = allData.filter(p => {
        // Child ID should start with PersonID + '.' and have no more dots after that
        return p.id.startsWith(personId + '.') && p.id.split('.').length === personId.split('.').length + 1;
    });

    return { parents: parent ? [parent] : [], children, spouses: [] };
};

// --- COMPONENTS ---

const TimelineEvent = ({ event, age }) => (
    <div className="flex items-center gap-4 mb-6 opacity-75 hover:opacity-100 transition-opacity group">
        <div className="w-16 text-right font-mono text-sm text-gray-500">{event.year}</div>
        <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow-sm z-10 group-hover:bg-[#E67E22] transition-colors"></div>
        <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 group-hover:bg-white group-hover:shadow-md transition-all">
            <span className="font-bold text-gray-900">{event.label}</span>
            <span className="block text-xs text-gray-500 uppercase tracking-wider mt-1">
                Ancestor was approx {age} years old
            </span>
        </div>
    </div>
);

const FamilyMemberLink = ({ member, role, onClick }) => (
    <div 
        onClick={() => onClick(member)}
        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#E67E22] hover:shadow-md transition-all"
    >
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
            {member.name.charAt(0)}
        </div>
        <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">{role}</div>
            <div className="font-medium text-gray-800 text-sm truncate max-w-[120px]">{member.name}</div>
        </div>
        <ChevronRight size={16} className="text-gray-300 ml-auto" />
    </div>
);

const ImmersiveProfile = ({ item, onClose, onNavigate }) => {
    if (!item) return null;

    const bornYear = parseInt(item.vital_stats.born?.match(/\d{4}/)?.[0] || 0);
    const diedYear = parseInt(item.vital_stats.died?.match(/\d{4}/)?.[0] || 0);
    const events = getLifeEvents(item.vital_stats.born, item.vital_stats.died);
    const relationship = calculateRelationship(item.id);
    const family = getFamilyLinks(item, familyData);

    const bornLoc = item.vital_stats.born?.split(',').slice(1).join(',').trim() || "Unknown";
    const diedLoc = item.vital_stats.died?.split(',').slice(1).join(',').trim() || "Unknown";

    return (
        <div className="h-full bg-[#F9F5F0] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden shadow-2xl">
            {/* --- HEADER --- */}
            <div className="bg-[#2C3E50] p-8 text-white relative flex-shrink-0">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-2 text-[#E67E22] font-mono text-xs uppercase tracking-[0.2em] mb-4">
                    <Anchor size={14} />
                    <span>{relationship}</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 leading-tight">
                    {item.name}
                </h1>
                <p className="text-white/60 font-mono text-sm">
                    {item.vital_stats.born} — {item.vital_stats.died}
                </p>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COL */}
                    <div className="lg:col-span-2 space-y-12">
                        {item.story?.notes && (
                            <div>
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <BookOpen size={16} /> The Story
                                </h2>
                                <div className="bg-white p-8 rounded-none border-l-4 border-[#E67E22] shadow-sm">
                                    <p className="text-xl text-gray-800 leading-relaxed font-serif first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:font-bold first-letter:text-[#2C3E50]">
                                        {item.story.notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {bornYear > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Clock size={16} /> Historical Context
                                </h2>
                                <div className="relative border-l-2 border-gray-200 ml-[3.25rem] space-y-0">
                                    <div className="flex items-center gap-4 mb-8 -ml-[3.25rem]">
                                        <div className="w-16 text-right font-bold text-[#2C3E50]">{bornYear}</div>
                                        <div className="w-4 h-4 rounded-full bg-[#2C3E50] border-4 border-[#F9F5F0] shadow-md z-10"></div>
                                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="font-bold text-[#2C3E50]">Born</div>
                                            <div className="text-xs text-gray-500">{bornLoc}</div>
                                        </div>
                                    </div>
                                    {events.map((e, i) => <TimelineEvent key={i} event={e} age={e.year - bornYear} />)}
                                    <div className="flex items-center gap-4 mt-8 -ml-[3.25rem]">
                                        <div className="w-16 text-right font-bold text-[#2C3E50]">{diedYear}</div>
                                        <div className="w-4 h-4 rounded-full bg-[#2C3E50] border-4 border-[#F9F5F0] shadow-md z-10"></div>
                                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="font-bold text-[#2C3E50]">Died</div>
                                            <div className="text-xs text-gray-500">{diedLoc}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users size={16} /> Family Network
                            </h2>
                            <div className="flex flex-col gap-3">
                                {family.parents.map(p => (
                                    <FamilyMemberLink key={p.id} member={p} role="Parent" onClick={onNavigate} />
                                ))}

                                {family.spouses.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <div className="text-xs font-bold text-gray-300 uppercase tracking-widest pl-1">Spouses</div>
                                        {family.spouses.map(spouse => <FamilyMemberLink key={spouse.id} member={spouse} role="Spouse" onClick={onNavigate} />)}
                                    </div>
                                )}

                                {family.children.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <div className="text-xs font-bold text-gray-300 uppercase tracking-widest pl-1">Children</div>
                                        {family.children.map(child => <FamilyMemberLink key={child.id} member={child} role="Child" onClick={onNavigate} />)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Record Details</div>
                             <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between"><span>ID:</span><span className="font-mono">{item.id}</span></div>
                                <div className="flex justify-between"><span>Source:</span><span className="font-mono truncate max-w-[150px]">{item.metadata.location_in_doc}</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [selectedAncestor, setSelectedAncestor] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Group data by Generation
  const groupedData = useMemo(() => {
    const groups = {};
    const filtered = familyData.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
    
    filtered.forEach(item => {
        const gen = item.generation || "Other Relatives";
        if (!groups[gen]) groups[gen] = [];
        groups[gen].push(item);
    });

    // Sort keys to maintain order (Gen I, II, III...) if possible, or just alphabetic for now
    // In a real app, we'd use a sorting key.
    return groups;
  }, [searchText]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* --- LEFT NAVIGATION --- */}
      <div className={`
        flex flex-col border-r border-gray-200 bg-white h-full z-10
        ${selectedAncestor ? 'hidden md:flex md:w-[350px] shrink-0' : 'w-full md:w-[350px] shrink-0'}
      `}>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#2C3E50] tracking-tight font-serif flex items-center gap-2">
            <User size={24} className="text-[#E67E22]" /> Ancestry
          </h1>
        </div>

        <div className="p-4">
            <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200 focus-within:border-[#E67E22] transition-colors">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text"
                  className="ml-3 flex-1 bg-transparent outline-none text-sm"
                  placeholder="Find an ancestor..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {Object.entries(groupedData).map(([generation, items]) => (
                <div key={generation} className="mb-2">
                    {/* Sticky Header for Generation */}
                    <div className="sticky top-0 bg-gray-100/95 backdrop-blur-sm px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-y border-gray-200 shadow-sm z-10 flex items-center justify-between">
                        {generation}
                        <span className="bg-gray-200 text-gray-600 px-1.5 rounded text-[10px]">{items.length}</span>
                    </div>
                    
                    <div className="px-4 py-2">
                        {items.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => setSelectedAncestor(item)}
                                className={`
                                    group p-4 mb-2 rounded-lg cursor-pointer border transition-all
                                    ${selectedAncestor?.id === item.id 
                                        ? 'bg-[#2C3E50] border-[#2C3E50] text-white shadow-md' 
                                        : 'bg-white border-gray-100 hover:border-[#E67E22] hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-sm ${selectedAncestor?.id === item.id ? 'text-white' : 'text-gray-800'}`}>
                                        {item.name}
                                    </h3>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                        selectedAncestor?.id === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {item.vital_stats.born?.match(/\d{4}/)?.[0] || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="flex-1 bg-[#F9F5F0] relative">
          {selectedAncestor ? (
             <ImmersiveProfile 
                item={selectedAncestor} 
                onClose={() => setSelectedAncestor(null)} 
                onNavigate={setSelectedAncestor}
             />
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                 <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                     <Info size={48} className="text-gray-400" />
                 </div>
                 <h2 className="text-2xl font-serif text-gray-800 mb-2">Select an Ancestor</h2>
                 <p className="max-w-md text-center text-gray-500 px-6">
                    Discover their stories, see the world through their eyes, and understand how they connect to you.
                 </p>
             </div>
          )}
      </div>

    </div>
  );
}