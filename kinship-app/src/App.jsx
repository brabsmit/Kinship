
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
import { BookOpen, Search, X, MapPin, User, Clock, Anchor, Info, Users, ChevronRight, ChevronDown, ChevronLeft, Network, List as ListIcon, Lightbulb, Sparkles, Heart, GraduationCap, Flame, Shield, Globe, Flag, Tag, LogOut, Link, Hammer, Scroll, Brain, Loader2, CheckSquare } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeroImage, ASSETS } from './utils/assetMapper';
import RelationshipSelector from './RelationshipSelector';
import { fetchResearchSuggestions } from './services/aiReasoning';

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

const TAG_CONFIG = {
    "Immigrant": { icon: <Globe size={12} />, color: "bg-blue-100 text-blue-700 border-blue-200" },
    "War Veteran": { icon: <Shield size={12} />, color: "bg-red-100 text-red-700 border-red-200" },
    "Mayflower": { icon: <Anchor size={12} />, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    "Founder": { icon: <Flag size={12} />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "Salem Witch Trials": { icon: <Flame size={12} />, color: "bg-purple-100 text-purple-700 border-purple-200" },
    "University Educated": { icon: <GraduationCap size={12} />, color: "bg-amber-100 text-amber-700 border-amber-200" },
    "Quaker": { icon: <User size={12} />, color: "bg-gray-100 text-gray-700 border-gray-200" },
    "default": { icon: <Tag size={12} />, color: "bg-gray-50 text-gray-600 border-gray-200" }
};

const NARRATIVE_THREADS = [
    { id: "pilgrims", title: "The Mayflower Pilgrims", description: "The brave souls who crossed the Atlantic on the Mayflower in 1620 to establish Plymouth Colony.", keywords: ["Mayflower", "Pilgrim", "1620", "Plymouth"], color: "bg-[#8B4513] text-white border-[#5D2E0C]", hex: "#8B4513", icon: <Anchor size={14} /> },
    { id: "witches", title: "Salem Witch Trials", description: "Those involved in the hysteria of the Salem Witch Trials of 1692, as accused or accusers.", keywords: ["Salem", "Witch", "1692", "Accused"], color: "bg-purple-700 text-white border-purple-900", hex: "#7E22CE", icon: <Flame size={14} /> },
    { id: "founders", title: "Town Founders", description: "Early settlers who established and incorporated the foundational towns of New England.", keywords: ["Founder", "Settler", "Established", "Incorporated", "First Settler"], color: "bg-emerald-700 text-white border-emerald-900", hex: "#047857", icon: <Flag size={14} /> },
    { id: "revolution", title: "The Patriots", description: "Soldiers and supporters who fought for American Independence during the Revolutionary War.", keywords: ["Revolutionary War", "1776", "Independence", "Continental Army"], color: "bg-blue-800 text-white border-blue-950", hex: "#1E40AF", icon: <Shield size={14} /> },
    { id: "industrialists", title: "The Industrialists", description: "Innovators and laborers who drove the manufacturing boom of the 19th century.", keywords: ["Factory", "Mill", "Industry", "Inventor", "Manufacturing", "Railroad"], color: "bg-slate-700 text-white border-slate-900", hex: "#334155", icon: <Hammer size={14} /> },
    { id: "quakers", title: "The Quakers", description: "Members of the Society of Friends who sought religious freedom and simplicity.", keywords: ["Quaker", "Society of Friends", "Persecuted"], color: "bg-amber-700 text-white border-amber-900", hex: "#B45309", icon: <Scroll size={14} /> }
];

const detectThreads = (person) => {
    const notes = (person.story?.notes || "").toLowerCase();
    const tags = (person.story?.tags || []).map(t => t.toLowerCase());

    return NARRATIVE_THREADS.filter(thread => {
        return thread.keywords.some(k =>
            notes.includes(k.toLowerCase()) || tags.includes(k.toLowerCase())
        );
    });
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

const generateTrivia = (data, branchName) => {
    if (!data || data.length === 0) return [];

    const stats = [];

    // 1. Longest Life
    let maxAge = 0;
    let oldestPerson = null;
    let validAges = 0;
    let totalAge = 0;

    data.forEach(p => {
        const born = parseInt(p.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
        const died = parseInt(p.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

        if (born && died && died > born) {
            const age = died - born;
            validAges++;
            totalAge += age;
            if (age > maxAge) {
                maxAge = age;
                oldestPerson = p;
            }
        }
    });

    if (oldestPerson) {
        stats.push({
            icon: <Clock size={16} strokeWidth={1.5} />,
            text: `${oldestPerson.name} lived to be ${maxAge} years old, the longest in this branch.`
        });
    }

    // Average Lifespan
    if (validAges > 0) {
        const avgAge = Math.round(totalAge / validAges);
        stats.push({
             icon: <Users size={16} strokeWidth={1.5} />,
             text: `In the ${branchName} Branch, the average lifespan was ${avgAge} years.`
        });
    }

    // 2. Most Common Name
    const nameCounts = {};
    data.forEach(p => {
        const firstName = p.name.split(' ')[0];
        if (firstName) {
            nameCounts[firstName] = (nameCounts[firstName] || 0) + 1;
        }
    });

    let mostCommonName = '';
    let maxCount = 0;
    Object.entries(nameCounts).forEach(([name, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommonName = name;
        }
    });

    if (mostCommonName && maxCount > 1) {
        stats.push({
            icon: <User size={16} strokeWidth={1.5} />,
            text: `The name "${mostCommonName}" appears ${maxCount} times in this branch.`
        });
    }

    // 3. Oldest Generation (Earliest Birth Year)
    let minBorn = 9999;
    let earliestPerson = null;
    data.forEach(p => {
         const born = parseInt(p.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
         if (born && born < minBorn) {
             minBorn = born;
             earliestPerson = p;
         }
    });

    if (earliestPerson) {
         stats.push({
            icon: <Anchor size={16} strokeWidth={1.5} />,
            text: `The earliest recorded ancestor here is ${earliestPerson.name}, born in ${minBorn}.`
        });
    }

    // 4. Immigrant Count
    let immigrantCount = 0;
    data.forEach(p => {
        const bornLoc = p.vital_stats.born_location || "";
        const diedLoc = p.vital_stats.died_location || "";
        const notes = p.story?.notes || "";

        const isImmigrantNote = notes.toLowerCase().includes("immigrant");

        const regionBorn = detectRegion(bornLoc);
        const regionDied = detectRegion(diedLoc);

        // Check migration (e.g., UK -> USA)
        // Ensure both regions are valid (not Global/Unknown) and different
        const isMigration = (regionBorn !== "Global" && regionDied !== "Global" && regionBorn !== regionDied);

        if (isImmigrantNote || isMigration) {
            immigrantCount++;
        }
    });

    if (immigrantCount > 0) {
        stats.push({
            icon: <MapPin size={16} strokeWidth={1.5} />,
            text: `${immigrantCount} ancestors in this branch were immigrants or migrated between major regions.`
        });
    }

    // 5. War Veterans (Lived through major wars between ages 18-40)
    let veteranCount = 0;
    const warEvents = HISTORY_DB.filter(e => e.type === 'war');

    data.forEach(p => {
        const born = parseInt(p.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
        const died = parseInt(p.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

        if (born && died) {
            // Check if they were "fighting age" (approx 18-40) during any war
            const wasFightingAge = warEvents.some(w => {
                const ageAtWarStart = w.year - born;
                return ageAtWarStart >= 18 && ageAtWarStart <= 40;
            });
            if (wasFightingAge) veteranCount++;
        }
    });

    if (veteranCount > 5) { // Threshold to make it interesting
         stats.push({
            icon: <BookOpen size={16} strokeWidth={1.5} />,
            text: `${veteranCount} ancestors in this branch lived through major conflicts during their prime years.`
        });
    }

    return stats;
};

const generateProfileTrivia = (person, allData) => {
    const facts = [];
    const born = parseInt(person.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const died = parseInt(person.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);
    const bornLoc = person.vital_stats.born_location || "";

    // 1. Age Context
    if (born && died) {
        const age = died - born;
        if (age < 50) facts.push({
             text: `Died young at ${age}, which was common for the time.`,
             icon: <Clock size={16} />
        });
        else if (age > 80) facts.push({
             text: `Lived to ${age}, surpassing the average life expectancy of the era.`,
             icon: <Clock size={16} />
        });
    }

    // 2. Historical Context
    // Find an event they were alive for (around 20 years old)
    if (born) {
        const age20 = born + 20;
        const eventAt20 = HISTORY_DB.find(e => Math.abs(e.year - age20) <= 2 && e.region !== 'Global');
        if (eventAt20) {
            facts.push({
                text: `Was around 20 years old when the ${eventAt20.label}.`,
                icon: <BookOpen size={16} />
            });
        }
    }

    // 3. Name Context
    if (person.name) {
        const firstName = person.name.split(' ')[0];
        const sameName = allData.filter(p => p.name.startsWith(firstName) && p.id !== person.id);
        if (sameName.length > 1) {
             facts.push({
                text: `Shares the name "${firstName}" with ${sameName.length} other relatives in this record.`,
                icon: <User size={16} />
             });
        }
    }

    // 4. Location Context
    if (bornLoc.includes("CT")) {
         facts.push({
            text: "Born in Connecticut, a central hub for this family branch.",
            icon: <MapPin size={16} />
         });
    } else if (bornLoc.includes("England")) {
         facts.push({
            text: "Born in England, marking the origins of this line.",
            icon: <Anchor size={16} />
         });
    }

    return facts;
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
const calculateRelationship = (ancestorId, userRelation) => {
    if (!userRelation || userRelation.isGuest) return "Relative";

    const { anchorId, stepsDown } = userRelation;

    // Logic:
    // 1. Determine "Generation Index" of Anchor.
    //    DATASET CONVENTION: ID length correlates with AGE (Older = Longer ID).
    //    Example: '1' (Child, born 1805) -> '1.1' (Parent, born 1774).
    //    Therefore: Higher Gen Index = Older Generation.

    // 2. Determine User's Generation Index.
    //    User is 'stepsDown' generations *below* (younger than) the anchor.
    //    Since Younger = Lower Index, we SUBTRACT stepsDown.
    //    User Gen Index = AnchorGenIndex - stepsDown.

    const anchorGenIndex = String(anchorId).split('.').length;
    const userGenIndex = anchorGenIndex - stepsDown;

    // 3. Determine Target Ancestor's Generation Index.
    const ancestorGenIndex = String(ancestorId).split('.').length;

    // 4. Calculate Difference (Generations between User and Ancestor)
    //    Diff = AncestorGenIndex - UserGenIndex
    //    Positive Diff = Ancestor is Older (Higher Index)
    const diff = ancestorGenIndex - userGenIndex;

    if (diff === 0) return "Same Generation";
    if (diff === 1) return "Parent / Aunt / Uncle";
    if (diff === 2) return "Grandparent";
    if (diff === 3) return "Great-Grandparent";
    if (diff === 4) return "2nd Great-Grandparent";
    if (diff === 5) return "3rd Great-Grandparent";
    if (diff >= 6) return `${diff-2}th Great-Grandparent`;

    if (diff === -1) return "Child";
    if (diff === -2) return "Grandchild";
    if (diff <= -3) return "Descendant";

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

const buildGenealogyGraph = (data, searchText = '', storyMode = false, selectedThreadId = null) => {
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

    const personThreads = detectThreads(person);
    const isInThread = selectedThreadId ? personThreads.some(t => t.id === selectedThreadId) : false;

    // Visual Logic
    let opacity = 1;
    let border = '1px solid #ddd';
    let boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

    // Dimming logic
    // If search is active and not a match -> Dim
    // If story mode is active, NO search is active, and not a story -> Dim
    // If thread is selected and not in thread -> Dim
    if (searchText && !isMatch) {
        opacity = 0.2;
    } else if (selectedThreadId && !isInThread) {
        opacity = 0.2;
    } else if (storyMode && !hasStory && !searchText && !selectedThreadId) {
        opacity = 0.2;
    }

    // Highlighting logic (Story Mode)
    if (storyMode && hasStory) {
        border = '2px solid #F59E0B'; // Gold
        boxShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
    }

    // Highlighting logic (Thread Mode)
    if (selectedThreadId && isInThread) {
        const thread = NARRATIVE_THREADS.find(t => t.id === selectedThreadId);
        if (thread) {
            border = `2px solid ${thread.hex}`;
            boxShadow = `0 0 15px ${thread.hex}40`;
        }
    }

    dagreGraph.setNode(String(person.id), { width: nodeWidth, height: nodeHeight });
    nodes.push({
      id: String(person.id),
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
    const tags = person.story?.tags || [];
    nodes[nodes.length - 1].data.label = (
        <div className="relative">
            {hasStory && (
                <div className="absolute -top-3 -right-3 bg-[#F59E0B] text-white p-1 rounded-full shadow-sm z-10" title="Has Story">
                    <BookOpen size={10} fill="white" />
                </div>
            )}
            <div className="font-bold text-sm text-gray-800 truncate">{person.name}</div>
            <div className="text-xs text-gray-500">b. {bornYear}</div>
            {tags.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                    {tags.slice(0, 3).map(tag => {
                        const conf = TAG_CONFIG[tag] || TAG_CONFIG.default;
                        return (
                            <span key={tag} className={`p-0.5 rounded-full ${conf.color}`} title={tag}>
                                {React.cloneElement(conf.icon, { size: 8 })}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const links = getFamilyLinks(person, data);

    // Parent -> Child
    links.children.forEach(child => {
        const edgeId = `${String(person.id)}-${String(child.id)}`;
        if (!processedEdges.has(edgeId)) {
            const childThreads = detectThreads(child);
            const childInThread = selectedThreadId ? childThreads.some(t => t.id === selectedThreadId) : false;
            const isThreadEdge = selectedThreadId && isInThread && childInThread;
            const threadColor = selectedThreadId ? NARRATIVE_THREADS.find(t => t.id === selectedThreadId)?.hex : null;

            dagreGraph.setEdge(String(person.id), String(child.id));
            edges.push({
                id: edgeId,
                source: String(person.id),
                target: String(child.id),
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, color: isThreadEdge ? threadColor : '#2C3E50' },
                style: {
                    stroke: isThreadEdge ? threadColor : '#2C3E50',
                    strokeWidth: isThreadEdge ? 3 : 1,
                    opacity: selectedThreadId && !isThreadEdge ? 0.2 : 1
                },
                animated: isThreadEdge
            });
            processedEdges.add(edgeId);
        }
    });

    // Spouses
    links.spouses.forEach(spouse => {
        const [s, t] = [String(person.id), String(spouse.id)].sort();
        const edgeId = `spouse-${s}-${t}`;
        if (!processedEdges.has(edgeId)) {
             edges.push({
                id: edgeId,
                source: String(person.id),
                target: String(spouse.id),
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

const GraphView = ({ data, onNodeClick, searchText, storyMode, selectedThreadId }) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => buildGenealogyGraph(data, searchText, storyMode, selectedThreadId), [data, searchText, storyMode, selectedThreadId]);

    // We need to update nodes when props change, but useNodesState manages internal state too.
    // So we use useEffect to sync.
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    React.useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full bg-gray-50 relative">
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

const ProfileTrivia = ({ person, familyData }) => {
    const triviaItems = useMemo(() => generateProfileTrivia(person, familyData), [person, familyData]);

    if (triviaItems.length === 0) return null;

    // Just show the first relevant one for now, or maybe map them?
    // Let's show one primary interesting fact to keep it clean, or a small list.
    // The design requests a "Did you know" section.

    return (
        <div className="mb-12 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100/50">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-orange-200 flex-1"></div>
                <h2 className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles size={14} strokeWidth={1.5} /> Did You Know?
                </h2>
                <div className="h-px bg-orange-200 flex-1"></div>
            </div>

            <div className="grid gap-3">
                {triviaItems.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 text-orange-400 shrink-0 bg-white p-1.5 rounded-full shadow-sm">
                            {item.icon}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {item.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENTS ---

const GenerationGroup = ({ generation, items, selectedAncestor, onSelect, userRelation, searchText }) => {
    const [isOpen, setIsOpen] = useState(true);

    React.useEffect(() => {
        if (searchText) setIsOpen(true);
    }, [searchText]);

    return (
        <div className="mb-0 border-b border-gray-100 last:border-0">
            {/* Sticky Header for Generation */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="sticky top-0 bg-gray-50/95 backdrop-blur-sm px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-y border-gray-200 shadow-sm z-10 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {generation}
                </div>
                <span className="bg-gray-200 text-gray-600 px-1.5 rounded text-[10px]">{items.length}</span>
            </div>

            {isOpen && (
                <div className="bg-white">
                    {items.map(item => {
                        const born = item.vital_stats.born_date?.match(/\d{4}/)?.[0] || '?';
                        const died = item.vital_stats.died_date?.match(/\d{4}/)?.[0] || '?';
                        const relation = calculateRelationship(item.id, userRelation);
                        const isSelected = selectedAncestor?.id === item.id;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className={`
                                    group py-3 pr-4 cursor-pointer transition-all border-b border-gray-50 last:border-0 border-l-4
                                    ${isSelected
                                        ? 'bg-blue-50 border-l-[#2C3E50] pl-3'
                                        : 'bg-white hover:bg-gray-50 border-l-transparent pl-3'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {item.story?.notes && (
                                            <BookOpen size={12} className={`shrink-0 ${isSelected ? "text-[#E67E22]" : "text-[#F59E0B]"}`} />
                                        )}
                                        <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                            {item.name}
                                        </h3>
                                    </div>
                                    <div className={`text-xs font-mono shrink-0 ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {born} – {died}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-1">
                                     <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                        isSelected ? 'text-blue-400' : 'text-gray-400'
                                    }`}>
                                        {relation}
                                    </span>

                                    {/* List Item Tags */}
                                    {item.story.tags && item.story.tags.length > 0 && (
                                        <div className="flex gap-1">
                                            {item.story.tags.map(tag => {
                                                const conf = TAG_CONFIG[tag] || TAG_CONFIG.default;
                                                return (
                                                    <span key={tag} className={`p-0.5 rounded-full ${conf.color} border-none`} title={tag}>
                                                        {React.cloneElement(conf.icon, { size: 8 })}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const TriviaWidget = ({ data, branchName }) => {
    const triviaItems = useMemo(() => generateTrivia(data, branchName), [data, branchName]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Effect to cycle random fact when branch changes (data changes)
    React.useEffect(() => {
        if (triviaItems.length > 0) {
            // Pick a random index
            const randomIndex = Math.floor(Math.random() * triviaItems.length);
            setCurrentIndex(randomIndex);
        }
    }, [triviaItems]);

    if (triviaItems.length === 0) return null;

    const currentItem = triviaItems[currentIndex];

    return (
        <div className="mx-4 mb-4 mt-2 bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] p-4 rounded-xl border border-[#F59E0B]/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Lightbulb size={48} className="text-[#F59E0B]" />
            </div>

            <div className="flex items-start gap-3 relative z-10">
                <div className="bg-white/80 p-2 rounded-full text-[#F59E0B] shadow-sm">
                    {currentItem.icon || <Sparkles size={16} />}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest mb-1 flex items-center gap-1">
                        Did You Know?
                    </div>
                    <p className="text-xs text-[#78350F] font-medium leading-relaxed">
                        {currentItem.text}
                    </p>
                </div>
            </div>
        </div>
    );
};

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
        </div>
    );
};

const TimelineEvent = ({ event, age, isFirst }) => {
    const isPersonal = event.region === "Personal";

    return (
        <div className="timeline-event group flex gap-6 relative">
             {/* Line */}
             <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-gray-200 group-last:bottom-auto group-last:h-6"></div>

             {/* Year */}
             <div className="w-16 pt-1 text-right font-mono text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
                 {event.year}
             </div>

             {/* Dot */}
             <div className={`
                relative z-10 w-4 h-4 mt-2 rounded-full border-2 transition-all
                ${isPersonal
                    ? 'bg-[#E67E22] border-[#F9F5F0] scale-110 shadow-sm group-hover:scale-125'
                    : 'bg-gray-300 border-[#F9F5F0] group-hover:bg-gray-400'
                }
             `}></div>

             {/* Content */}
             <div className="flex-1 pb-8">
                 <div className={`
                    text-sm transition-colors
                    ${isPersonal ? 'font-bold text-gray-900' : 'text-gray-500'}
                 `}>
                     {event.label}
                 </div>

                 <div className="flex items-center gap-2 mt-1">
                    {/* Age Badge */}
                    {age >= 0 && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                            Age {age}
                        </span>
                    )}

                    {/* Context Badge */}
                    {!isPersonal && event.region !== "Global" && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 rounded">
                            {event.region}
                        </span>
                    )}
                 </div>
             </div>
        </div>
    );
};

const FamilyMemberLink = ({ member, role, onClick }) => (
    <div 
        onClick={() => onClick(member)}
        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg cursor-pointer hover:border-[#E67E22] hover:shadow-md transition-all group"
    >
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-serif font-bold group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
            {member.name.charAt(0)}
        </div>
        <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">{role}</div>
            <div className="font-display font-bold text-gray-800 group-hover:text-[#E67E22] transition-colors">{member.name}</div>
        </div>
        <ChevronRight size={16} className="text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
    </div>
);

const HeroImage = ({ location, year, heroImage }) => {
    // Priority: heroImage prop > getHeroImage logic
    const asset = heroImage || getHeroImage(location, year);
    const [imgSrc, setImgSrc] = useState(asset.src);
    const [hasError, setHasError] = useState(false);

    React.useEffect(() => {
        setImgSrc(asset.src);
        setHasError(false);
    }, [asset.src]);

    const handleError = (e) => {
        if (imgSrc === ASSETS.generic_antique.src) {
            e.target.style.display = 'none';
            return;
        }
        setImgSrc(ASSETS.generic_antique.src);
        setHasError(true);
    };

    return (
        <div className="relative w-full h-80 md:h-96 overflow-hidden">
            {/* Gradient Overlay for Texture Blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-transparent to-black/30 z-10"></div>

            <img
                src={imgSrc}
                alt={asset.alt}
                className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply"
                style={asset.style}
                onError={handleError}
            />

             <div className="absolute bottom-4 right-4 z-20 text-black/20 text-[10px] uppercase tracking-widest font-mono text-right max-w-xs">
                {hasError ? ASSETS.generic_antique.caption : asset.caption}
            </div>
        </div>
    );
};

const StatItem = ({ label, value, icon }) => (
    <div className="flex flex-col items-center justify-center text-center px-4">
        <div className="text-gray-400 mb-2">{icon}</div>
        <div className="text-sm font-bold text-gray-800 font-display">{value}</div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
);

const EpicList = ({ threads, onSelect }) => {
    return (
        <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
            {threads.map(thread => (
                <div
                    key={thread.id}
                    onClick={() => onSelect(thread.id)}
                    className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#E67E22] hover:shadow-md transition-all group relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 p-2 opacity-5 ${thread.color.split(' ')[0]} bg-clip-text text-transparent`}>
                        {React.cloneElement(thread.icon, { size: 64 })}
                    </div>

                    <div className="flex items-start gap-3 relative z-10">
                        <div className={`p-2 rounded-full ${thread.color} border-none`}>
                            {React.cloneElement(thread.icon, { size: 16 })}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">{thread.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                {thread.description}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#E67E22] group-hover:gap-2 transition-all">
                        Explore Epic <ChevronRight size={12} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ThreadTimeline = ({ thread, members, onBack, onSelectMember }) => {
    // Sort members by birth year
    const sortedMembers = [...members].sort((a, b) => {
        const aYear = parseInt(a.vital_stats.born_date?.match(/\d{4}/)?.[0] || 9999);
        const bYear = parseInt(b.vital_stats.born_date?.match(/\d{4}/)?.[0] || 9999);
        return aYear - bYear;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className={`p-4 ${thread.color.replace('text-white', 'bg-opacity-10')} border-b border-gray-100`}>
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 mb-3"
                >
                    <ChevronLeft size={12} /> Back to Epics
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${thread.color}`}>
                        {React.cloneElement(thread.icon, { size: 18 })}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 font-display leading-tight">
                        {thread.title}
                    </h2>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed pl-1">
                    {thread.description}
                </p>
            </div>

            {/* Timeline List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                 {/* Vertical Line */}
                 <div className="absolute left-7 top-4 bottom-4 w-px bg-gray-200"></div>

                 {sortedMembers.map((member, idx) => {
                     const born = member.vital_stats.born_date?.match(/\d{4}/)?.[0] || '?';
                     const died = member.vital_stats.died_date?.match(/\d{4}/)?.[0] || '?';

                     return (
                        <div key={member.id} className="relative pl-8 pb-8 group last:pb-0">
                            {/* Dot */}
                            <div className={`absolute left-[0.3rem] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${thread.hex ? '' : 'bg-gray-400'}`} style={{ backgroundColor: thread.hex }}></div>

                            <div
                                onClick={() => onSelectMember(member)}
                                className="bg-white border border-gray-100 rounded-lg p-3 cursor-pointer hover:border-[#E67E22] hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-sm text-gray-800 group-hover:text-[#E67E22] transition-colors">
                                        {member.name}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-400">{born}</span>
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-2">
                                    {member.story.notes || "No specific notes available."}
                                </div>
                            </div>
                        </div>
                     );
                 })}
            </div>
        </div>
    );
};

const ImmersiveProfile = ({ item, familyData, onClose, onNavigate, userRelation, onSelectThread }) => {
    if (!item) return null;

    const [researchSuggestions, setResearchSuggestions] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    React.useEffect(() => {
        setResearchSuggestions(null);
        setIsAnalyzing(false);
    }, [item]);

    const handleAnalyzeProfile = async () => {
        setIsAnalyzing(true);
        try {
            const suggestions = await fetchResearchSuggestions(item);
            setResearchSuggestions(suggestions);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const bornYear = parseInt(item.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
    const diedYear = parseInt(item.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

    const bornLoc = item.vital_stats.born_location || "Unknown";
    const diedLoc = item.vital_stats.died_location || "Unknown";

    // Pass locations to getLifeEvents for region filtering
    const historyEvents = getLifeEvents(item.vital_stats.born_date, item.vital_stats.died_date, bornLoc, diedLoc);
    const personalEvents = getPersonalLifeEvents(item.story.life_events, bornYear, diedYear);

    // Merge and sort
    const events = [...historyEvents, ...personalEvents].sort((a, b) => a.year - b.year);

    const relationship = calculateRelationship(item.id, userRelation);
    const family = getFamilyLinks(item, familyData);

    const relatedConnections = (item.related_links || []).map(link => {
        const target = familyData.find(p => p.id === link.target_id);
        return target ? { target, link } : null;
    }).filter(Boolean);

    // Stats for the bar
    const childrenCount = family.children.length;
    const spousesCount = family.spouses.length;

    return (
        <div className="h-full bg-texture-paper flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden shadow-2xl relative">

            {/* Sticky Close / Nav Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 shadow-sm pointer-events-auto flex items-center gap-2">
                    <Anchor size={12} className="text-[#E67E22]" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{relationship}</span>
                 </div>
                 <button onClick={onClose} className="pointer-events-auto p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm border border-gray-100 transition-all">
                    <X size={20} strokeWidth={1.5} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* HERO HEADER */}
                <div className="relative">
                    <HeroImage location={bornLoc} year={bornYear} heroImage={item.hero_image} />
                    
                    <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 pt-24 bg-gradient-to-t from-[#fdfbf7] to-transparent z-20 flex flex-col items-center text-center">
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-4 drop-shadow-sm leading-tight">
                            {item.name}
                        </h1>
                        <div className="flex items-center gap-4 text-gray-500 font-mono text-sm uppercase tracking-widest">
                            <span>{bornYear || '?'}</span>
                            <span className="w-8 h-px bg-gray-300"></span>
                            <span>{diedYear || '?'}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT CONTAINER */}
                <div className="max-w-3xl mx-auto px-6 pb-24">

                    {/* STATS BAR */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-gray-200/60 mb-8 bg-white/50 rounded-xl mx-4">
                        <StatItem label="Born" value={bornLoc} icon={<User size={18} strokeWidth={1.5} />} />
                        <StatItem label="Died" value={diedLoc} icon={<Heart size={18} strokeWidth={1.5} />} />
                        <StatItem label="Spouse" value={spousesCount > 0 ? spousesCount : "—"} icon={<Users size={18} strokeWidth={1.5} />} />
                        <StatItem label="Children" value={childrenCount > 0 ? childrenCount : "—"} icon={<Users size={18} strokeWidth={1.5} />} />
                    </div>

                    {/* TAGS & THREADS */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12 px-4">
                        {item.story.tags && item.story.tags.map(tag => {
                            const conf = TAG_CONFIG[tag] || TAG_CONFIG.default;
                            return (
                                <div key={tag} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${conf.color}`}>
                                    {conf.icon}
                                    {tag}
                                </div>
                            );
                        })}

                        {/* Narrative Thread Badges */}
                        {detectThreads(item).map(thread => (
                            <button
                                key={thread.id}
                                onClick={() => {
                                    if (onSelectThread) {
                                        onSelectThread(thread.id);
                                        // View mode switching is handled in App.jsx but we can hint it here or ensure logic flow
                                        // The prop is called onSelectThread, which sets state in App
                                    }
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-transform ${thread.color}`}
                                title={`View "${thread.title}" Epic`}
                            >
                                {thread.icon}
                                Part of the {thread.title} Epic
                            </button>
                        ))}
                    </div>

                    {/* PROFILE TRIVIA */}
                    <ProfileTrivia person={item} familyData={familyData} />

                    {/* STORY / BIO */}
                    {item.story?.notes && (
                        <div className="mb-16">
                            <p className="text-lg md:text-xl font-body-serif text-gray-800 leading-loose first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-0.5rem] first-letter:text-[#2C3E50]">
                                {item.story.notes}
                            </p>
                        </div>
                    )}

                    {/* UNIFIED TIMELINE */}
                    {bornYear > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={14} strokeWidth={1.5} /> Life & Times
                                </h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="pl-4 md:pl-8">
                                <TimelineEvent event={{ year: bornYear, label: `Born in ${bornLoc}`, region: "Personal" }} age={0} />
                                {events.map((e, i) => <TimelineEvent key={i} event={e} age={e.year - bornYear} />)}
                                <TimelineEvent event={{ year: diedYear, label: `Died in ${diedLoc}`, region: "Personal" }} age={diedYear - bornYear} />
                            </div>
                        </div>
                    )}

                    {/* LOCATIONS MAP */}
                    <div className="mb-16">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin size={14} strokeWidth={1.5} /> Journey
                            </h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <KeyLocationsMap bornLoc={bornLoc} diedLoc={diedLoc} lifeEvents={personalEvents} />
                    </div>

                    {/* FAMILY CONNECTIONS */}
                    <div>
                         <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Network size={14} strokeWidth={1.5} /> Connections
                            </h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {family.parents.map(p => (
                                <FamilyMemberLink key={p.id} member={p} role="Parent" onClick={onNavigate} />
                            ))}
                            {family.spouses.map(spouse => (
                                <FamilyMemberLink key={spouse.id} member={spouse} role="Spouse" onClick={onNavigate} />
                            ))}
                            {family.children.map(child => (
                                <FamilyMemberLink key={child.id} member={child} role="Child" onClick={onNavigate} />
                            ))}
                        </div>
                    </div>

                    {/* STORY CONNECTIONS */}
                    {relatedConnections.length > 0 && (
                        <div className="mt-16">
                             <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Link size={14} strokeWidth={1.5} /> Story Connections
                                </h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {relatedConnections.map(({ target, link }, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => onNavigate(target)}
                                        className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-lg cursor-pointer hover:border-[#E67E22] hover:shadow-md transition-all group"
                                    >
                                         <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50/50 border border-orange-100 flex items-center justify-center text-orange-400 font-serif font-bold group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                            <Link size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">{link.relation_type}</div>
                                            <div className="font-display font-bold text-gray-800 group-hover:text-[#E67E22] transition-colors mb-1">{target.name}</div>
                                            {link.source_text && (
                                                <div className="text-xs text-gray-500 italic border-l-2 border-orange-100 pl-2 leading-relaxed">
                                                    "{link.source_text}"
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 mt-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RESEARCH ASSISTANT */}
                    <div className="mt-16">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Brain size={14} strokeWidth={1.5} /> Research Assistant
                            </h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {!researchSuggestions && !isAnalyzing && (
                            <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl text-center">
                                <div className="bg-blue-50 p-3 rounded-full mb-4">
                                    <Brain size={24} className="text-blue-500" />
                                </div>
                                <h3 className="font-display font-bold text-gray-800 mb-2">Uncover Missing Details</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                                    Use AI to analyze this profile and find actionable next steps for your research.
                                </p>
                                <button
                                    onClick={handleAnalyzeProfile}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <Sparkles size={14} /> Analyze Profile
                                </button>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-xl">
                                <div className="animate-spin text-blue-500 mb-4">
                                    <Loader2 size={24} />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analyzing Records...</p>
                            </div>
                        )}

                        {researchSuggestions && (
                            <div className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                                     <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                                        <Sparkles size={14} className="text-blue-500" /> Suggested Research Steps
                                     </h3>
                                     <button onClick={() => setResearchSuggestions(null)} className="text-blue-400 hover:text-blue-600">
                                        <X size={14} />
                                     </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {researchSuggestions.map((suggestion, idx) => (
                                        <div key={idx} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                                            <div className="mt-0.5 text-blue-400 shrink-0">
                                                <CheckSquare size={16} />
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* META FOOTER */}
                     <div className="mt-16 pt-8 border-t border-gray-200/50 text-center">
                         <div className="inline-flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                            <span>ID: {item.id}</span>
                            <span>•</span>
                            <span>Src: {item.metadata.location_in_doc}</span>
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
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedLineage, setSelectedLineage] = useState('Paternal');

  // Sidebar Resizing State
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing) {
      // Limit min/max width
      const newWidth = Math.max(300, Math.min(mouseMoveEvent.clientX, 800));
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // New State for User Relationship
  const [userRelation, setUserRelation] = useState(() => {
    const saved = localStorage.getItem('userRelation');
    return saved ? JSON.parse(saved) : null;
  });

  const handleRelationComplete = (relation) => {
    setUserRelation(relation);
    localStorage.setItem('userRelation', JSON.stringify(relation));
  };

  const filteredGraphData = useMemo(() => {
    return familyData.filter(p => {
        // Lineage Filter: Default to 'Paternal' if field is missing (legacy data)
        const pLineage = p.lineage || 'Paternal';
        const matchesLineage = pLineage === selectedLineage;

        const matchesBranch = String(p.id).startsWith(String(selectedBranchId));
        const matchesTag = !selectedTag || (p.story.tags && p.story.tags.includes(selectedTag));
        return matchesLineage && matchesBranch && matchesTag;
    });
  }, [selectedBranchId, selectedTag, selectedLineage]);

  // Group data by Generation
  const groupedData = useMemo(() => {
    const groups = {};
    const filtered = filteredGraphData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesStory = !storyMode || (item.story?.notes);

        // Filter by Epic/Thread if selected (List View Logic: Filter strictly)
        const threadMatches = !selectedThreadId || detectThreads(item).some(t => t.id === selectedThreadId);

        return matchesSearch && matchesStory && threadMatches;
    });
    
    filtered.forEach(item => {
        const gen = item.generation || "Other Relatives";
        if (!groups[gen]) groups[gen] = [];
        groups[gen].push(item);
    });

    return groups;
  }, [searchText, storyMode, filteredGraphData]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* Relationship Modal */}
      {!userRelation && (
          <RelationshipSelector data={familyData} onComplete={handleRelationComplete} />
      )}

      {/* --- LEFT NAVIGATION --- */}
      <div
        className={`
            relative flex flex-col border-r border-gray-200 bg-white h-full z-10
            ${!isResizing ? 'transition-all duration-300' : ''}
            ${selectedAncestor ? 'hidden md:flex' : 'w-full'}
            ${viewMode === 'graph'
                ? 'md:flex-1 max-w-full' // Graph Mode: takes available space (flex-1), but max-w-full
                : 'shrink-0' // List Mode: dynamic width
            }
        `}
        style={viewMode === 'list' ? { width: sidebarWidth } : {}}
      >
        {/* Resize Handle */}
        {viewMode === 'list' && (
            <div
                className="absolute top-0 bottom-0 right-0 w-1.5 cursor-col-resize z-50 hover:bg-blue-400/50 active:bg-blue-600 transition-colors"
                onMouseDown={startResizing}
                title="Drag to resize sidebar"
            />
        )}
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
                 <button
                    onClick={() => setViewMode('threads')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${viewMode === 'threads' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <BookOpen size={14} /> Epics
                 </button>
              </div>
            </div>

            {/* Unified Controls: Branch Filter & Search */}
            <div className="flex flex-col gap-3">
                {/* Lineage Selector */}
                <div className="flex gap-2">
                    {['Paternal', 'Maternal'].map(lin => (
                        <button
                            key={lin}
                            onClick={() => setSelectedLineage(lin)}
                            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                                selectedLineage === lin
                                ? (lin === 'Paternal' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-[#D946EF] text-[#D946EF]')
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {lin} Lineage
                        </button>
                    ))}
                </div>

                {/* Branch Selector (Horizontal Scroll) */}
                <div className="w-full overflow-x-auto pb-1 -mb-1 custom-scrollbar flex gap-2">
                    {Object.entries(BRANCHES).map(([id, name]) => (
                        <button
                            key={id}
                            onClick={() => setSelectedBranchId(id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${
                                selectedBranchId === id
                                ? (selectedLineage === 'Paternal' ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm' : 'bg-[#831843] text-white border-[#831843] shadow-sm')
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            {id}. {name}
                        </button>
                    ))}
                </div>

                {/* Search & Options Row */}
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

                     <button
                        onClick={() => {
                            setUserRelation(null);
                            localStorage.removeItem('userRelation');
                        }}
                        className="px-3 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center justify-center"
                        title="Reset Identity / Session"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                {/* Tag Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${
                            !selectedTag
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        All
                    </button>
                    {Object.keys(TAG_CONFIG).filter(t => t !== 'default').map(tag => {
                         const conf = TAG_CONFIG[tag];
                         const isActive = selectedTag === tag;
                         return (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(isActive ? null : tag)}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all flex items-center gap-1 ${
                                    isActive
                                    ? conf.color + ' ring-1 ring-offset-1'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {conf.icon} {tag}
                            </button>
                         );
                    })}
                </div>

                {/* Narrative Epics Selector (Available in both modes) */}
                <div className="flex flex-col gap-1 mt-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Narrative Epics</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        <button
                            onClick={() => setSelectedThreadId(null)}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all flex items-center gap-1 ${
                                !selectedThreadId
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <X size={10} /> None
                        </button>
                        {NARRATIVE_THREADS.map(thread => {
                            const isActive = selectedThreadId === thread.id;
                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => setSelectedThreadId(isActive ? null : thread.id)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all flex items-center gap-1 ${
                                        isActive
                                        ? thread.color + ' ring-1 ring-offset-1'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {thread.icon} {thread.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        {/* TRIVIA WIDGET */}
        {viewMode === 'graph' && (
            <TriviaWidget data={filteredGraphData} branchName={BRANCHES[selectedBranchId]} />
        )}

        {viewMode === 'list' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {Object.entries(groupedData).map(([generation, items]) => (
                    <GenerationGroup
                        key={generation}
                        generation={generation}
                        items={items}
                        selectedAncestor={selectedAncestor}
                        onSelect={setSelectedAncestor}
                        userRelation={userRelation}
                        searchText={searchText}
                    />
                ))}
            </div>
        )}

        {viewMode === 'graph' && (
            <div className="flex-1 overflow-hidden relative border-t border-gray-100">
                <GraphView
                    data={filteredGraphData}
                    searchText={searchText}
                    storyMode={storyMode}
                    selectedThreadId={selectedThreadId}
                    onNodeClick={(person) => {
                        setSelectedAncestor(person);
                    }}
                />
            </div>
        )}

        {viewMode === 'threads' && (
             <div className="flex-1 overflow-hidden relative border-t border-gray-100 bg-[#FAFAF9]">
                 {selectedThreadId ? (
                     <ThreadTimeline
                        thread={NARRATIVE_THREADS.find(t => t.id === selectedThreadId)}
                        members={familyData.filter(p => detectThreads(p).some(t => t.id === selectedThreadId))}
                        onBack={() => setSelectedThreadId(null)}
                        onSelectMember={setSelectedAncestor}
                     />
                 ) : (
                     <EpicList
                        threads={NARRATIVE_THREADS}
                        onSelect={(id) => setSelectedThreadId(id)}
                     />
                 )}
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
                familyData={familyData}
                onClose={() => setSelectedAncestor(null)} 
                onNavigate={setSelectedAncestor}
                userRelation={userRelation}
                onSelectThread={(threadId) => {
                    setSelectedThreadId(threadId);
                    setViewMode('threads'); // Switch to Threads view to see the timeline
                }}
             />
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                 <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                     <Info size={48} className="text-gray-400" />
                 </div>
                 <h2 className="text-2xl font-serif text-gray-800 mb-2">Select an Ancestor</h2>
             </div>
          )}
      </div>

    </div>
  );
}
