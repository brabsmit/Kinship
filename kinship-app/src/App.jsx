
import familyData from './family_data.json';
import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { BookOpen, Search, X, MapPin, User, Clock, Anchor, Info, Users, ChevronRight, ChevronDown, Network, List as ListIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeroImage } from './utils/assetMapper';

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

const BRANCHES = {
    1: "Dodge",
    2: "Phelps",
    3: "Hoadley",
    4: "Hotchkiss",
    5: "Parish",
    6: "Harris",
    7: "Wainwright",
    8: "Coolidge"
};

const LOCATION_COORDINATES = {
    "Hartford, CT": [41.7658, -72.6734],
    "Manhattan, NY": [40.7831, -73.9712],
    "New York, NY": [40.7128, -74.0060],
    "New York City": [40.7128, -74.0060],
    "New York": [40.7128, -74.0060],
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
const HISTORY_DB = [
    { year: 1603, label: "Queen Elizabeth I dies", region: "UK", type: "political" },
    { year: 1605, label: "Gunpowder Plot", region: "UK", type: "political" },
    { year: 1607, label: "Jamestown Founded", region: "USA", type: "era" },
    { year: 1611, label: "King James Bible Published", region: "UK", type: "culture" },
    { year: 1616, label: "Shakespeare dies", region: "UK", type: "culture" },
    { year: 1620, label: "Mayflower Arrives", region: "USA", type: "era" },
    { year: 1625, label: "Charles I becomes King", region: "UK", type: "political" },
    { year: 1630, label: "Boston Founded", region: "USA", type: "era" },
    { year: 1636, label: "Harvard College Founded", region: "USA", type: "education" },
    { year: 1642, label: "English Civil War Begins", region: "UK", type: "war" },
    { year: 1649, label: "Charles I Executed", region: "UK", type: "political" },
    { year: 1660, label: "The Restoration", region: "UK", type: "political" },
    { year: 1664, label: "New Amsterdam becomes New York", region: "USA", type: "political" },
    { year: 1665, label: "Great Plague of London", region: "UK", type: "health" },
    { year: 1666, label: "Great Fire of London", region: "UK", type: "disaster" },
    { year: 1675, label: "King Philip's War", region: "USA", type: "war" },
    { year: 1688, label: "Glorious Revolution", region: "UK", type: "political" },
    { year: 1692, label: "Salem Witch Trials", region: "USA", type: "event" },
    { year: 1707, label: "Act of Union (Great Britain)", region: "UK", type: "political" },
    { year: 1714, label: "George I becomes King", region: "UK", type: "political" },
    { year: 1754, label: "French and Indian War Begins", region: "USA", type: "war" },
    { year: 1760, label: "Industrial Revolution Begins", region: "UK", type: "economy" },
    { year: 1765, label: "Stamp Act", region: "USA", type: "political" },
    { year: 1770, label: "Boston Massacre", region: "USA", type: "event" },
    { year: 1773, label: "Boston Tea Party", region: "USA", type: "event" },
    { year: 1775, label: "Revolutionary War Begins", region: "USA", type: "war" },
    { year: 1776, label: "Declaration of Independence", region: "USA", type: "political" },
    { year: 1781, label: "Battle of Yorktown", region: "USA", type: "war" },
    { year: 1787, label: "US Constitution Signed", region: "USA", type: "political" },
    { year: 1789, label: "Washington becomes President", region: "USA", type: "politics" },
    { year: 1789, label: "French Revolution Begins", region: "Europe", type: "political" },
    { year: 1793, label: "Cotton Gin Invented", region: "USA", type: "tech" },
    { year: 1801, label: "United Kingdom formed", region: "UK", type: "political" },
    { year: 1803, label: "Louisiana Purchase", region: "USA", type: "politics" },
    { year: 1804, label: "Napoleon becomes Emperor", region: "Global", type: "political" },
    { year: 1805, label: "Battle of Trafalgar", region: "UK", type: "war" },
    { year: 1812, label: "War of 1812", region: "USA", type: "war" },
    { year: 1815, label: "Battle of Waterloo", region: "Global", type: "war" },
    { year: 1825, label: "Erie Canal Opens", region: "USA", type: "economy" },
    { year: 1830, label: "Liverpool and Manchester Railway", region: "UK", type: "tech" },
    { year: 1837, label: "Queen Victoria Crowned", region: "UK", type: "political" },
    { year: 1837, label: "Panic of 1837", region: "USA", type: "economy" },
    { year: 1845, label: "Irish Potato Famine", region: "Global", type: "disaster" },
    { year: 1848, label: "California Gold Rush", region: "USA", type: "era" },
    { year: 1851, label: "The Great Exhibition", region: "UK", type: "culture" },
    { year: 1854, label: "Crimean War", region: "Global", type: "war" },
    { year: 1859, label: "On the Origin of Species", region: "Global", type: "science" },
    { year: 1861, label: "Civil War Begins", region: "USA", type: "war" },
    { year: 1863, label: "Emancipation Proclamation", region: "USA", type: "politics" },
    { year: 1865, label: "Lincoln Assassinated", region: "USA", type: "politics" },
    { year: 1869, label: "Transcontinental Railroad", region: "USA", type: "tech" },
    { year: 1876, label: "Telephone Invented", region: "USA", type: "tech" },
    { year: 1879, label: "Lightbulb Invented", region: "USA", type: "tech" },
    { year: 1888, label: "Jack the Ripper Murders", region: "UK", type: "event" },
    { year: 1893, label: "Panic of 1893", region: "USA", type: "economy" }
];

const detectRegion = (locationString) => {
    if (!locationString) return "Global";
    const loc = locationString.toLowerCase();

    // USA
    if (loc.includes("usa") || loc.includes("united states") ||
        loc.includes("ct") || loc.includes("connecticut") ||
        loc.includes("ma") || loc.includes("massachusetts") ||
        loc.includes("ny") || loc.includes("new york") ||
        loc.includes("nj") || loc.includes("new jersey") ||
        loc.includes("pa") || loc.includes("pennsylvania") ||
        loc.includes("va") || loc.includes("virginia")) {
        return "USA";
    }

    // UK
    if (loc.includes("uk") || loc.includes("united kingdom") ||
        loc.includes("england") || loc.includes("britain") ||
        loc.includes("london") || loc.includes("scotland") ||
        loc.includes("wales")) {
        return "UK";
    }

    return "Global";
};

const getLifeEvents = (bornDate, diedDate, bornLoc, diedLoc) => {
    const born = parseInt(bornDate?.match(/\d{4}/)?.[0] || 0);
    const died = parseInt(diedDate?.match(/\d{4}/)?.[0] || 0);
    if (!born || !died) return [];

    // Determine Ancestor's Region
    // Priority: Birth Location -> Death Location
    const region = detectRegion(bornLoc) !== "Global" ? detectRegion(bornLoc) : detectRegion(diedLoc);

    return HISTORY_DB.filter(e => {
        const inTime = e.year >= born && e.year <= died;
        const matchesRegion = e.region === "Global" || e.region === region;
        return inTime && matchesRegion;
    });
};

const getPersonalLifeEvents = (lifeEvents, born, died) => {
    if (!lifeEvents || lifeEvents.length === 0) return [];

    return lifeEvents.filter(e => {
        // Only include if it has a year and is within range (optional, sometimes events might be slightly out of range due to estimations)
        // But let's trust the extraction for now or be lenient.
        // Actually, if we extracted it from the story, it belongs to the person.
        return e.year && e.year > 0;
    }).map(e => ({
        ...e,
        region: "Personal", // Or "Personal"
        type: e.type || "personal"
    }));
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

// --- GRAPH HELPERS ---
const nodeWidth = 200;
const nodeHeight = 60;

const buildGenealogyGraph = (data, searchText = '', storyMode = false) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50 });

  const nodes = [];
  const edges = [];
  const processedEdges = new Set();

  data.forEach((person) => {
    const bornYear = person.vital_stats.born_date?.match(/\d{4}/)?.[0] || '????';
    const hasStory = !!person.story?.notes;
    const isMatch = !searchText || person.name.toLowerCase().includes(searchText.toLowerCase());

    // Visual Logic
    let opacity = 1;
    let border = '1px solid #ddd';
    let boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

    // Dimming logic
    // If search is active and not a match -> Dim
    // If story mode is active, NO search is active, and not a story -> Dim
    // (If search is active, we prioritize search results visibility even if they don't have a story)
    if (searchText && !isMatch) {
        opacity = 0.2;
    } else if (storyMode && !hasStory && !searchText) {
        opacity = 0.2;
    }

    // Highlighting logic (Story Mode)
    if (storyMode && hasStory) {
        border = '2px solid #F59E0B'; // Gold
        boxShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
    }

    dagreGraph.setNode(person.id, { width: nodeWidth, height: nodeHeight });
    nodes.push({
      id: person.id,
      data: { label: person.name, year: bornYear, hasStory },
      type: 'default', // Using default for now, can be custom
      position: { x: 0, y: 0 }, // Placeholder
      style: {
        background: '#fff',
        border,
        borderRadius: '8px',
        padding: '10px',
        textAlign: 'center',
        width: nodeWidth,
        boxShadow,
        opacity,
        transition: 'all 0.3s ease'
      },
    });

    // We override the default label in node display, but here we set data
    // ReactFlow default node expects 'label' in data to render text.
    nodes[nodes.length - 1].data.label = (
        <div className="relative">
            {hasStory && (
                <div className="absolute -top-3 -right-3 bg-[#F59E0B] text-white p-1 rounded-full shadow-sm z-10" title="Has Story">
                    <BookOpen size={10} fill="white" />
                </div>
            )}
            <div className="font-bold text-sm text-gray-800 truncate">{person.name}</div>
            <div className="text-xs text-gray-500">b. {bornYear}</div>
        </div>
    );

    const links = getFamilyLinks(person, data);

    // Parent -> Child
    links.children.forEach(child => {
        const edgeId = `${person.id}-${child.id}`;
        if (!processedEdges.has(edgeId)) {
            dagreGraph.setEdge(person.id, child.id);
            edges.push({
                id: edgeId,
                source: person.id,
                target: child.id,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#2C3E50' }
            });
            processedEdges.add(edgeId);
        }
    });

    // Spouses
    links.spouses.forEach(spouse => {
        const [s, t] = [person.id, spouse.id].sort();
        const edgeId = `spouse-${s}-${t}`;
        if (!processedEdges.has(edgeId)) {
             edges.push({
                id: edgeId,
                source: person.id,
                target: spouse.id,
                type: 'straight',
                style: { strokeDasharray: '5,5', stroke: '#E67E22' },
                animated: false,
            });
            processedEdges.add(edgeId);
        }
    });
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const GraphView = ({ data, onNodeClick, searchText, storyMode }) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => buildGenealogyGraph(data, searchText, storyMode), [data, searchText, storyMode]);

    // We need to update nodes when props change, but useNodesState manages internal state too.
    // So we use useEffect to sync.
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    React.useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => {
                    const person = data.find(p => p.id === node.id);
                    if (person) onNodeClick(person);
                }}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
                <MiniMap style={{ height: 120 }} zoomable pannable />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

// --- COMPONENTS ---

const KeyLocationsMap = ({ bornLoc, diedLoc, lifeEvents = [] }) => {
    const bornCoords = getCoordinates(bornLoc);
    const diedCoords = getCoordinates(diedLoc);

    const missingLocations = [];
    if (bornLoc && bornLoc !== "Unknown" && !bornCoords) missingLocations.push(bornLoc);
    if (diedLoc && diedLoc !== "Unknown" && !diedCoords) missingLocations.push(diedLoc);

    // Process Life Events
    const eventMarkers = lifeEvents
        .filter(e => e.location && e.location !== "Unknown")
        .map(e => {
            const coords = getCoordinates(e.location);
            if (!coords) {
                if (!missingLocations.includes(e.location)) missingLocations.push(e.location);
                return null;
            }
            return { pos: coords, type: e.year + " Event", color: '#10B981', loc: e.location, label: e.label }; // Green
        })
        .filter(Boolean);

    // Default View: Center of New England (approx Hartford/Springfield area)
    const defaultPosition = [41.7658, -72.6734];
    const defaultZoom = 7;

    let center = defaultPosition;
    let zoom = defaultZoom;
    const markers = [];
    let polyline = null;

    // Collect all points to determine center/bounds (naive)
    const allPoints = [];

    if (bornCoords) {
        markers.push({ pos: bornCoords, type: 'Birth', color: '#3B82F6', loc: bornLoc }); // Blue
        allPoints.push(bornCoords);
    }

    // Add event markers
    eventMarkers.forEach(m => {
        markers.push(m);
        allPoints.push(m.pos);
    });

    if (diedCoords) {
        if (!bornCoords || bornLoc !== diedLoc) {
             markers.push({ pos: diedCoords, type: 'Death', color: '#EF4444', loc: diedLoc }); // Red
             allPoints.push(diedCoords);
        }
    }

    if (bornCoords && diedCoords && bornLoc !== diedLoc) {
        polyline = [bornCoords, ...eventMarkers.map(m => m.pos), diedCoords];
        // Sort by time? Ideally. But events might not be in path order if we just list them.
        // For now, let's just keep the simple born -> died line or skip it if we have events,
        // because the path is complex.
        // Let's keep the born-died line only if no intermediate events, or maybe just line them all up?
        // Simple: Just line from Born -> Died for "Lifespan".
        polyline = [bornCoords, diedCoords];
    }

    if (allPoints.length > 0) {
        // Simple centroid
        const avgLat = allPoints.reduce((sum, p) => sum + p[0], 0) / allPoints.length;
        const avgLng = allPoints.reduce((sum, p) => sum + p[1], 0) / allPoints.length;
        center = [avgLat, avgLng];

        // Adjust zoom based on spread? (Mock logic)
        zoom = 8;
        if (allPoints.length > 2) zoom = 7;
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
                            {m.label && <><br/><span className="text-xs text-gray-500">{m.label}</span></>}
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

const TimelineEvent = ({ event, age }) => {
    const isGlobal = event.region === "Global" || event.region === "Europe"; // Europe is semi-global context here

    return (
        <div className={`timeline-event flex items-center gap-4 mb-6 transition-opacity group ${isGlobal ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}>
            <div className="w-16 text-right font-mono text-sm text-gray-500">{event.year}</div>
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 transition-colors ${isGlobal ? 'bg-gray-300' : 'bg-[#E67E22]'}`}></div>
            <div className={`flex-1 p-3 rounded-lg border text-sm transition-all ${isGlobal ? 'bg-gray-50 border-gray-100 text-gray-600' : 'bg-white border-[#E67E22]/30 text-gray-800 shadow-sm'}`}>
                <div className="flex justify-between items-start">
                    <span className={`font-bold ${isGlobal ? 'text-gray-700' : 'text-gray-900'}`}>{event.label}</span>
                    {event.region !== "Global" && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2">
                            {event.region}
                        </span>
                    )}
                </div>
                <span className="block text-xs text-gray-400 uppercase tracking-wider mt-1">
                    Ancestor was approx {age} years old
                </span>
            </div>
        </div>
    );
};

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

const HeroImage = ({ location, year }) => {
    const asset = getHeroImage(location, year);

    return (
        <div className="relative w-full h-48 md:h-64 overflow-hidden mb-[-2rem] z-0">
            {/* Gradient Overlay to blend with header */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50] to-transparent opacity-100 z-10"></div>

            <img
                src={asset.src}
                alt={asset.alt}
                className="w-full h-full object-cover"
                style={asset.style}
                onError={(e) => { e.target.style.display = 'none'; }}
            />

            <div className="absolute bottom-10 right-4 z-20 text-white/40 text-[10px] uppercase tracking-widest font-mono text-right max-w-xs drop-shadow-md">
                {asset.caption}
            </div>
        </div>
    );
};

const ImmersiveProfile = ({ item, onClose, onNavigate }) => {
    if (!item) return null;

    const bornYear = parseInt(item.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const diedYear = parseInt(item.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

    const bornLoc = item.vital_stats.born_location || "Unknown";
    const diedLoc = item.vital_stats.died_location || "Unknown";

    // Pass locations to getLifeEvents for region filtering
    const historyEvents = getLifeEvents(item.vital_stats.born_date, item.vital_stats.died_date, bornLoc, diedLoc);
    const personalEvents = getPersonalLifeEvents(item.story.life_events, bornYear, diedYear);

    // Merge and sort
    const events = [...historyEvents, ...personalEvents].sort((a, b) => a.year - b.year);

    const relationship = calculateRelationship(item.id);
    const family = getFamilyLinks(item, familyData);

    return (
        <div className="h-full bg-[#F9F5F0] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden shadow-2xl">
            {/* HERO IMAGE */}
            <HeroImage location={bornLoc} year={bornYear} />

            {/* --- HEADER --- */}
            <div className="bg-[#2C3E50] p-8 text-white relative flex-shrink-0 z-20 bg-transparent -mt-8 pt-0">
                <button onClick={onClose} className="absolute top-0 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
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
                            <KeyLocationsMap bornLoc={bornLoc} diedLoc={diedLoc} lifeEvents={personalEvents} />
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'graph'
  const [storyMode, setStoryMode] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('1');

  const filteredGraphData = useMemo(() => {
    return familyData.filter(p => p.id.startsWith(selectedBranchId));
  }, [selectedBranchId]);

  // Group data by Generation
  const groupedData = useMemo(() => {
    const groups = {};
    const filtered = familyData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesStory = !storyMode || (item.story?.notes);
        return matchesSearch && matchesStory;
    });
    
    filtered.forEach(item => {
        const gen = item.generation || "Other Relatives";
        if (!groups[gen]) groups[gen] = [];
        groups[gen].push(item);
    });

    return groups;
  }, [searchText, storyMode]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* --- LEFT NAVIGATION --- */}
      <div className={`
        flex flex-col border-r border-gray-200 bg-white h-full z-10 transition-all duration-300
        ${selectedAncestor ? 'hidden md:flex' : 'w-full'}
        ${viewMode === 'graph'
            ? 'md:flex-1 max-w-full' // Graph Mode: takes available space (flex-1), but max-w-full
            : 'md:w-[350px] shrink-0' // List Mode: fixed width
        }
      `}>
        {/* Header with Title and Controls */}
        <div className="p-4 border-b border-gray-100 bg-white z-20 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-[#2C3E50] tracking-tight font-serif flex items-center gap-2">
                <User size={24} className="text-[#E67E22]" /> Ancestry
              </h1>

              {/* View Mode Segmented Control */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                 <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <ListIcon size={14} /> List
                 </button>
                 <button
                    onClick={() => setViewMode('graph')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${viewMode === 'graph' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <Network size={14} /> Graph
                 </button>
              </div>
            </div>

            {/* Search or Branch Filter Row */}
            {viewMode === 'graph' ? (
                <div className="flex gap-2 items-center">
                    <div className="flex-1 overflow-x-auto pb-1 -mb-1 custom-scrollbar flex gap-2">
                        {Object.entries(BRANCHES).map(([id, name]) => (
                            <button
                                key={id}
                                onClick={() => setSelectedBranchId(id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${
                                    selectedBranchId === id
                                    ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                {id}. {name}
                            </button>
                        ))}
                    </div>
                     <button
                        onClick={() => setStoryMode(!storyMode)}
                        className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider h-full
                            ${storyMode
                                ? 'bg-[#FFF8E1] border-[#F59E0B] text-[#F59E0B] shadow-sm'
                                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                            }
                        `}
                        title="Toggle Story Mode"
                    >
                        <BookOpen size={16} className={storyMode ? "fill-[#F59E0B]" : ""} />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200 focus-within:border-[#E67E22] transition-colors">
                        <Search size={16} className="text-gray-400" />
                        <input
                        type="text"
                        className="ml-2 flex-1 bg-transparent outline-none text-sm"
                        placeholder="Find an ancestor..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setStoryMode(!storyMode)}
                        className={`px-3 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                            ${storyMode
                                ? 'bg-[#FFF8E1] border-[#F59E0B] text-[#F59E0B] shadow-sm'
                                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                            }
                        `}
                        title="Toggle Story Mode"
                    >
                        <BookOpen size={16} className={storyMode ? "fill-[#F59E0B]" : ""} />
                    </button>
                </div>
            )}
        </div>

        {viewMode === 'list' ? (
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
                                        <div className="flex items-center gap-2">
                                            {item.story?.notes && (
                                                <BookOpen size={12} className={selectedAncestor?.id === item.id ? "text-[#E67E22]" : "text-[#F59E0B]"} />
                                            )}
                                            <h3 className={`font-bold text-sm ${selectedAncestor?.id === item.id ? 'text-white' : 'text-gray-800'}`}>
                                                {item.name}
                                            </h3>
                                        </div>
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
        ) : (
            <div className="flex-1 overflow-hidden relative border-t border-gray-100">
                <GraphView
                    data={filteredGraphData}
                    searchText={searchText}
                    storyMode={storyMode}
                    onNodeClick={(person) => {
                        setSelectedAncestor(person);
                    }}
                />
            </div>
        )}
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className={`
        bg-[#F9F5F0] relative transition-all duration-300
        ${selectedAncestor
            ? 'flex-1 block'
            : (viewMode === 'graph' ? 'hidden' : 'flex-1 hidden md:block')
        }
      `}>
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
