import React, { useMemo, useState } from 'react';
import { Ship, Anchor, MapPin, Calendar, Wind, ExternalLink, Hammer, User, Ruler, Users, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { detectRegion } from '../utils/geo';
import VoyageCard from './VoyageCard';

// --- VISUALIZATION HELPERS ---

const generateTimelineData = (voyages) => {
    // Group by Year
    const yearCounts = {};
    let minYear = 1600;
    let maxYear = 1900;

    voyages.forEach(v => {
        const year = parseInt(v.year, 10);
        if (year && !isNaN(year) && year >= 1600 && year <= 1920) {
            yearCounts[year] = (yearCounts[year] || 0) + v.passengers.length;
            if (year < minYear) minYear = year;
            if (year > maxYear) maxYear = year;
        }
    });

    // Fill gaps for smooth rendering
    const data = [];
    for (let y = 1600; y <= 1920; y++) {
        data.push({ year: y, count: yearCounts[y] || 0 });
    }

    return { data, minYear, maxYear };
};

const MigrationWave = ({ timelineData }) => {
    // Simple SVG Visualization (Histogram)
    const height = 150;
    const width = 800; // Will scale via CSS
    const padding = 40;

    const maxCount = Math.max(...timelineData.data.map(d => d.count), 1);
    const yScale = (val) => (val / maxCount) * (height - padding * 2);

    // Clusters for annotation
    const clusters = [
        { start: 1620, end: 1640, label: "Puritan Migration" },
        { start: 1840, end: 1850, label: "Famine Era" },
        { start: 1775, end: 1783, label: "Revolutionary War Gap", isGap: true }
    ];

    const getX = (year) => {
        const totalYears = 1920 - 1600;
        const offset = year - 1600;
        return (offset / totalYears) * (width - padding * 2) + padding;
    };

    return (
        <div className="w-full overflow-x-auto custom-scrollbar pb-4">
             <div className="min-w-[800px] relative">
                <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                     {/* Axis Line */}
                     <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />

                     {/* Bars */}
                     {timelineData.data.map((d, i) => {
                         const barHeight = yScale(d.count);
                         if (barHeight === 0) return null;
                         const x = getX(d.year);
                         return (
                             <g key={d.year} className="group cursor-pointer">
                                <rect
                                    x={x}
                                    y={height - padding - barHeight}
                                    width={2}
                                    height={barHeight}
                                    fill="#2C3E50"
                                    className="hover:fill-[#E67E22] transition-colors"
                                />
                                <title>{d.year}: {d.count} Ancestors</title>
                             </g>
                         );
                     })}

                     {/* X-Axis Labels */}
                     {[1620, 1650, 1700, 1750, 1800, 1850, 1900].map(year => (
                         <text key={year} x={getX(year)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#999">
                             {year}
                         </text>
                     ))}

                     {/* Cluster Annotations */}
                     {clusters.map((c, i) => {
                         const x1 = getX(c.start);
                         const x2 = getX(c.end);
                         const w = x2 - x1;
                         const mid = x1 + w/2;

                         return (
                             <g key={i}>
                                 <rect
                                    x={x1}
                                    y={0}
                                    width={w}
                                    height={height - padding}
                                    fill={c.isGap ? "rgba(239, 68, 68, 0.05)" : "rgba(59, 130, 246, 0.05)"}
                                 />
                                 <text x={mid} y={15} textAnchor="middle" fontSize="9" fontWeight="bold" fill={c.isGap ? "#EF4444" : "#3B82F6"} opacity="0.7">
                                     {c.label}
                                 </text>
                             </g>
                         );
                     })}
                </svg>
             </div>
        </div>
    );
};

// --- MAP VISUALIZATION ---

const RouteMap = ({ voyages }) => {
    // Static SVG Map concept
    // We'll use a simplified Equirectangular projection approach for drawing arcs
    // on top of a static background image or just pure SVG representation.

    // Coordinates (Approximate)
    const PORTS = {
        "London": { x: 500, y: 150 }, // UK
        "Plymouth": { x: 490, y: 160 }, // UK
        "Liverpool": { x: 485, y: 140 }, // UK
        "Boston": { x: 280, y: 170 }, // MA
        "Salem": { x: 282, y: 168 }, // MA
        "New York": { x: 275, y: 180 }, // NY
        "Jamestown": { x: 270, y: 195 }, // VA
        "Unknown_UK": { x: 495, y: 150 },
        "Unknown_US": { x: 278, y: 175 } // Generic New England
    };

    // Aggregate Routes
    const routes = {};
    voyages.forEach(v => {
        let origin = v.departure || "Unknown";
        let dest = v.arrival || "Unknown";

        // Simplified Logic to map city strings to keys
        const getPortKey = (loc, isOrigin) => {
            const l = loc.toLowerCase();
            if (l.includes("london")) return "London";
            if (l.includes("plymouth")) return "Plymouth";
            if (l.includes("liverpool")) return "Liverpool";
            if (l.includes("boston")) return "Boston";
            if (l.includes("salem")) return "Salem";
            if (l.includes("new york")) return "New York";
            if (l.includes("virginia") || l.includes("jamestown")) return "Jamestown";

            // Region Fallbacks
            if (l.includes("england") || l.includes("uk")) return "Unknown_UK";
            if (l.includes("america") || l.includes("usa") || l.includes("mass") || l.includes("connecticut")) return "Unknown_US";

            return isOrigin ? "Unknown_UK" : "Unknown_US"; // Default Trans-Atlantic assumption
        };

        const k1 = getPortKey(origin, true);
        const k2 = getPortKey(dest, false);
        const routeKey = `${k1}-${k2}`;

        routes[routeKey] = (routes[routeKey] || 0) + v.passengers.length;
    });

    return (
        <div className="relative w-full h-[400px] bg-[#eef2f5] rounded-xl overflow-hidden border border-gray-200">
             {/* Abstract World Map Background (CSS or SVG) */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                 {/* Simple dots for continents could go here, for now just a gradient or static image placeholder */}
                 <svg width="100%" height="100%" viewBox="0 0 1000 500">
                     <path d="M480,120 Q520,100 550,150 T600,200" fill="none" stroke="#ccc" strokeWidth="20" /> {/* Europe rough shape */}
                     <path d="M200,100 Q250,150 280,300" fill="none" stroke="#ccc" strokeWidth="20" /> {/* America rough shape */}
                 </svg>
             </div>

             <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-display text-4xl font-bold uppercase tracking-widest pointer-events-none">
                 Atlantic Crossing
             </div>

             <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute inset-0">
                 {Object.entries(routes).map(([key, count], idx) => {
                     const [origin, dest] = key.split('-');
                     const p1 = PORTS[origin] || PORTS["Unknown_UK"];
                     const p2 = PORTS[dest] || PORTS["Unknown_US"];

                     // Draw Arc (Quadratic Bezier)
                     // Control point should be higher (lower y) to create arc
                     const midX = (p1.x + p2.x) / 2;
                     const midY = Math.min(p1.y, p2.y) - 50 - (Math.random() * 20); // Random variation for visual separation

                     const strokeWidth = Math.max(1, Math.min(count, 10)); // Scale width by count

                     return (
                         <g key={key}>
                             <path
                                d={`M${p1.x},${p1.y} Q${midX},${midY} ${p2.x},${p2.y}`}
                                fill="none"
                                stroke="#2C3E50"
                                strokeWidth={strokeWidth}
                                strokeOpacity="0.6"
                                strokeLinecap="round"
                             >
                                 <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" fill="freeze" />
                             </path>
                             <circle cx={p1.x} cy={p1.y} r={3} fill="#E67E22" />
                             <circle cx={p2.x} cy={p2.y} r={3} fill="#27AE60" />
                         </g>
                     );
                 })}
             </svg>

             {/* Legend Overlay */}
             <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-xs">
                 <div className="font-bold uppercase tracking-widest text-gray-500 mb-1">Route Volume</div>
                 <div className="flex items-center gap-2">
                     <div className="h-0.5 w-8 bg-gray-800 opacity-20"></div>
                     <span>1 Ancestor</span>
                 </div>
                 <div className="flex items-center gap-2 mt-1">
                     <div className="h-1.5 w-8 bg-gray-800 opacity-60"></div>
                     <span>5+ Ancestors</span>
                 </div>
             </div>
        </div>
    );
};

// --- SHIP CARD INVENTORY ---

const ShipManifestCard = ({ shipData, profile }) => {
    const [expanded, setExpanded] = useState(false);

    // Calculate Survival Rate (Simulated for now based on data presence)
    // In reality, we'd check death dates vs voyage date, but let's assume if they are in the tree, they survived to have kids (mostly).
    const count = shipData.passengers.length;

    // Reuse existing VoyageCard for the visual style but wrap it
    // We construct a representative voyage object for the card
    const representativeVoyage = {
        ship_name: shipData.shipName,
        year: shipData.year,
        departure: shipData.departure,
        arrival: shipData.arrival,
        type: shipData.type || "Ship",
        specs: shipData.specs // Assuming grouped data retains specs
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
             <div className="p-0 bg-[#f4e4bc]/20">
                 {/* We render the ticket style card */}
                 <div className="scale-90 origin-top">
                     <VoyageCard voyage={representativeVoyage} profile={profile} />
                 </div>
             </div>

             {/* Manifest Section */}
             <div className="bg-white border-t border-gray-100 p-4">
                 <div
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-between cursor-pointer group"
                 >
                     <div className="flex items-center gap-3">
                         <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
                             <Users size={16} />
                         </div>
                         <div>
                             <h4 className="font-bold text-sm text-gray-800">Passenger Manifest</h4>
                             <p className="text-xs text-gray-500">{count} Family Member{count > 1 ? 's' : ''}</p>
                         </div>
                     </div>
                     {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                 </div>

                 {expanded && (
                     <div className="mt-4 space-y-2 pl-11">
                         {shipData.passengers.map((p, idx) => (
                             <div key={idx} className="flex items-center justify-between text-sm group/row">
                                 <span className="font-medium text-gray-700 group-hover/row:text-blue-600 transition-colors">
                                     {p.name}
                                 </span>
                                 <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                     {p.relation || "Relative"}
                                 </span>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        </div>
    );
};

const TheFleet = ({ familyData, onSelectProfile }) => {

    // 1. Process Data
    const { shipGroups, timelineData } = useMemo(() => {
        const groups = {}; // Key: "ShipName|Year"
        const allVoyages = [];

        familyData.forEach(person => {
            if (person.story && person.story.voyages) {
                person.story.voyages.forEach(v => {
                    if (v.ship_name && v.ship_name !== "Unknown") {
                        const key = `${v.ship_name}|${v.year}`;
                        if (!groups[key]) {
                            groups[key] = {
                                shipName: v.ship_name,
                                year: v.year,
                                departure: v.departure,
                                arrival: v.arrival,
                                type: v.type,
                                specs: v.specs,
                                passengers: []
                            };
                        }
                        // Add passenger
                        groups[key].passengers.push({
                            id: person.id,
                            name: person.name,
                            relation: "Ancestor" // Could calculate specific relation
                        });

                        allVoyages.push({ ...v, passengers: groups[key].passengers });
                    }
                });
            }
        });

        return {
            shipGroups: Object.values(groups).sort((a, b) => parseInt(a.year) - parseInt(b.year)),
            timelineData: generateTimelineData(allVoyages)
        };
    }, [familyData]);

    return (
        <div className="h-full overflow-y-auto bg-[#F9F5F0] custom-scrollbar">
            {/* Header */}
            <div className="bg-[#2C3E50] text-white p-8 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                     <Anchor size={400} className="absolute -right-20 -bottom-20 rotate-12" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
                        <Ship size={32} className="text-[#E67E22]" /> The Fleet
                    </h1>
                    <p className="text-blue-200 text-lg max-w-2xl font-serif">
                        A theater of history showcasing the vessels that carried your ancestors across the divide between the Old World and the New.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 space-y-8 pb-20">

                {/* 1. Migration Wave (Timeline) */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <Users size={16} /> Migration Wave
                        </h2>
                        <div className="text-xs text-gray-400 italic">
                            Arrivals per Year (1600 - 1920)
                        </div>
                    </div>
                    <MigrationWave timelineData={timelineData} />
                </div>

                {/* 2. Route Map */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <MapPin size={16} /> Voyage Routes
                        </h2>
                    </div>
                    <RouteMap voyages={shipGroups} />
                </div>

                {/* 3. Ship Inventory */}
                <div>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <h2 className="text-lg font-display font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                            <Anchor size={20} className="text-[#E67E22]" /> The Inventory
                        </h2>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shipGroups.map((group, idx) => (
                            <ShipManifestCard key={idx} shipData={group} profile={null} />
                        ))}
                    </div>

                    {shipGroups.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <Ship size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-serif">No voyage records found in the current dataset.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TheFleet;
