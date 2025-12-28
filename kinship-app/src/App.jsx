
import familyData from './family_data.json';
import React, { useState, useMemo } from 'react';
import { BookOpen, Search, X, MapPin, User, Clock, Anchor, Info, Users, ChevronRight, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- CONSTANTS & HELPERS ---

const LOCATION_COORDINATES = {
    "Hartford, CT": [41.7658, -72.6734],
    "Manhattan, NY": [40.7831, -73.9712],
    "New York, NY": [40.7128, -74.0060],
    "New York City": [40.7128, -74.0060],
    "Waterbury, CT": [41.5582, -73.0515],
    "New Haven, CT": [41.3083, -72.9279],
    "Englewood, NJ": [40.8929, -73.9726],
    "Oyster Bay, Long Island, NY": [40.8653, -73.5324],
    "Oyster Bay, NY": [40.8653, -73.5324],
    "Newburgh, NY": [41.5032, -74.0104],
    "Boston, MA": [42.3601, -71.0589],
    "Norwich, CT": [41.5243, -72.0759],
    "Simsbury, CT": [41.8759, -72.8012],
    "Simsbury CT": [41.8759, -72.8012],
    "Middletown, CT": [41.5623, -72.6506],
    "Branford, CT": [41.2795, -72.8151],
    "Stratford, CT": [41.1845, -73.1332],
    "Ipswich, MA": [42.6792, -70.8412],
    "Watertown, MA": [42.3709, -71.1828],
    "Brooklyn, CT": [41.7884, -71.9495],
    "Killingly, CT": [41.8537, -71.8795],
    "Hampton, CT": [41.7834, -72.0531],
    "East Haddam, CT": [41.4587, -72.4626],
    "Windsor, CT": [41.8519, -72.6437],
    "West Hartford, CT": [41.7621, -72.7420],
    "Wethersfield, CT": [41.7145, -72.6579],
    "Westbury, Long Island, NY": [40.7557, -73.5876],
    "Westbury, NY": [40.7557, -73.5876],
    "Colchester, CT": [41.5734, -72.3331],
    "New London, CT": [41.3557, -72.0995],
    "Waltham, MA": [42.3765, -71.2356],
    "Worcester, MA": [42.2626, -71.8023],
    "Salem, MA": [42.5195, -70.8967],
    "Medford, MA": [42.4184, -71.1062],
    "Woburn, MA": [42.4793, -71.1523],
    "England": [52.3555, -1.1743],
    "London, England": [51.5074, -0.1278],
    "Athens, PA": [41.9529, -76.5163],
    "Coeymans, NY": [42.4776, -73.7946],
    "Coxsackie, NY": [42.3601, -73.8068],
    "Shelton, Fairfield County, CT": [41.3165, -73.0932],
    "Milford, CT": [41.2307, -73.0640],
    "Trumbull, CT": [41.2562, -73.1909],
    "Derby, CT": [41.3207, -73.0890],
    "Sunderland, MA": [42.4695, -72.5795],
    "Conway, MA": [42.5106, -72.6976],
    "Bridport, Dorset, England": [50.7337, -2.7563],
    "Dorset, England": [50.7483, -2.3452],
    "Great Limber, Lincolnshire, England": [53.5656, -0.2874],
    "Lincolnshire, England": [53.2285, -0.5478],
    "Somerset, England": [51.0109, -3.1029],
    "Taunton, MA": [41.9001, -71.0898],
    "Essex, England": [51.7670, 0.4664],
    "Cambridge, MA": [42.3736, -71.1097],
    "Hingham, MA": [42.2417, -70.8898],
    "Marshfield, Plymouth Colony, MA": [42.0917, -70.7056],
    "Roxbury, MA": [42.3152, -71.0914],
    "Dedham, MA": [42.2436, -71.1699]
};

const getCoordinates = (locationName) => {
    if (!locationName) return null;
    return LOCATION_COORDINATES[locationName] || null;
};

const createMarkerIcon = (color) => L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
               <circle cx="12" cy="10" r="3" fill="white"></circle>
             </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

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

const getLifeEvents = (bornDate, diedDate) => {
    const born = parseInt(bornDate?.match(/\d{4}/)?.[0] || 0);
    const died = parseInt(diedDate?.match(/\d{4}/)?.[0] || 0);
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

const KeyLocationsMap = ({ bornLoc, diedLoc }) => {
    const bornCoords = getCoordinates(bornLoc);
    const diedCoords = getCoordinates(diedLoc);

    const missingLocations = [];
    if (bornLoc && bornLoc !== "Unknown" && !bornCoords) missingLocations.push(bornLoc);
    if (diedLoc && diedLoc !== "Unknown" && !diedCoords) missingLocations.push(diedLoc);

    // Default View: Center of New England (approx Hartford/Springfield area)
    const defaultPosition = [41.7658, -72.6734];
    const defaultZoom = 7;

    let center = defaultPosition;
    let zoom = defaultZoom;
    const markers = [];
    let polyline = null;

    if (bornCoords && diedCoords) {
        markers.push({ pos: bornCoords, type: 'Birth', color: '#3B82F6', loc: bornLoc }); // Blue
        if (bornLoc !== diedLoc) {
            markers.push({ pos: diedCoords, type: 'Death', color: '#EF4444', loc: diedLoc }); // Red
            polyline = [bornCoords, diedCoords];
        }
        // Simple center logic (midpoint)
        center = [(bornCoords[0] + diedCoords[0]) / 2, (bornCoords[1] + diedCoords[1]) / 2];
        zoom = 8;
    } else if (bornCoords) {
        markers.push({ pos: bornCoords, type: 'Birth', color: '#3B82F6', loc: bornLoc });
        center = bornCoords;
        zoom = 9;
    } else if (diedCoords) {
        markers.push({ pos: diedCoords, type: 'Death', color: '#EF4444', loc: diedLoc });
        center = diedCoords;
        zoom = 9;
    }

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((m, i) => (
                    <Marker key={i} position={m.pos} icon={createMarkerIcon(m.color)}>
                        <Popup>
                            <strong>{m.type} Location</strong><br />
                            {m.loc}
                        </Popup>
                    </Marker>
                ))}
                {polyline && <Polyline positions={polyline} color="#2C3E50" dashArray="5, 10" />}
            </MapContainer>
            {missingLocations.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs text-red-600 z-[1000] border border-red-100 text-center animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-bold">Note:</span> Could not locate coordinates for: {missingLocations.join(", ")}
                </div>
            )}
        </div>
    );
};

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

    const bornYear = parseInt(item.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const diedYear = parseInt(item.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);
    const events = getLifeEvents(item.vital_stats.born_date, item.vital_stats.died_date);
    const relationship = calculateRelationship(item.id);
    const family = getFamilyLinks(item, familyData);

    const bornLoc = item.vital_stats.born_location || "Unknown";
    const diedLoc = item.vital_stats.died_location || "Unknown";

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
                    {item.vital_stats.born_date} — {item.vital_stats.died_date}
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

                        {/* --- MAP SECTION --- */}
                        <div>
                             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <MapPin size={16} /> Key Locations
                            </h2>
                            <KeyLocationsMap bornLoc={bornLoc} diedLoc={diedLoc} />
                        </div>

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
                                        {item.vital_stats.born_date?.match(/\d{4}/)?.[0] || 'Unknown'}
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
