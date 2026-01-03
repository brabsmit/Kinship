
import familyData from './family_data.json';
import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import { BookOpen, Search, X, MapPin, User, Clock, Anchor, Info, Users, ChevronRight, ChevronDown, ChevronLeft, Network, List as ListIcon, Lightbulb, Sparkles, Heart, GraduationCap, Flame, Shield, Globe, Flag, Tag, LogOut, Link, Hammer, Scroll, Brain, Loader2, CheckSquare, AlertTriangle, Trophy, Compass, Ship, Crown, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeroImage, ASSETS } from './utils/assetMapper';
import RelationshipSelector from './RelationshipSelector';
import HitlistPanel from './components/HitlistPanel';
import OutliersDashboard from './components/OutliersDashboard';
import FilterMenu from './components/FilterMenu';
import { fetchResearchSuggestions } from './services/aiReasoning';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CurrencyTooltip from './components/CurrencyTooltip';
import GenerationalHandshake from './components/GenerationalHandshake';
import CircleOfFriends from './components/CircleOfFriends';
import { HISTORICAL_LOCATIONS, REGION_COORDINATES } from './utils/historicalLocations';
import historyData from './history_data.json';
import { calculateDistance } from './utils/geo';

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
    "Religious Leader": { icon: <BookOpen size={12} />, color: "bg-sky-100 text-sky-700 border-sky-200" },
    "Westward Pioneer": { icon: <Compass size={12} />, color: "bg-orange-100 text-orange-700 border-orange-200" },
    "default": { icon: <Tag size={12} />, color: "bg-gray-50 text-gray-600 border-gray-200" }
};

const NARRATIVE_THREADS = [
    { id: "atlantic_crossers", title: "The Atlantic Crossers", description: "The generation that braved the ocean to establish a new life in America.", keywords: ["Immigrant", "Emigrant", "Arrived in", "Came to America"], color: "bg-teal-700 text-white border-teal-900", hex: "#0F766E", icon: <Ship size={14} /> },
    { id: "westward_pioneers", title: "The Westward Pioneers", description: "Ancestors who left the established East Coast to settle the expanding frontier.", keywords: ["Westward Pioneer", "Ohio", "Michigan", "Illinois", "California", "Oregon"], color: "bg-orange-700 text-white border-orange-900", hex: "#C2410C", icon: <Compass size={14} /> },
    { id: "pilgrims", title: "The Mayflower Pilgrims", description: "The brave souls who crossed the Atlantic on the Mayflower in 1620 to establish Plymouth Colony.", keywords: ["Mayflower", "Pilgrim", "1620", "Plymouth"], color: "bg-[#8B4513] text-white border-[#5D2E0C]", hex: "#8B4513", icon: <Anchor size={14} /> },
    { id: "witches", title: "Salem Witch Trials", description: "Those involved in the hysteria of the Salem Witch Trials of 1692, as accused or accusers.", keywords: ["Salem", "Witch", "1692", "Accused"], color: "bg-purple-700 text-white border-purple-900", hex: "#7E22CE", icon: <Flame size={14} /> },
    { id: "founders", title: "Town Founders", description: "Early settlers who established and incorporated the foundational towns of New England.", keywords: ["Founder", "Settler", "Established", "Incorporated", "First Settler"], color: "bg-emerald-700 text-white border-emerald-900", hex: "#047857", icon: <Flag size={14} /> },
    { id: "revolution", title: "The Patriots", description: "Soldiers and supporters who fought for American Independence during the Revolutionary War.", keywords: ["Revolutionary War", "1776", "Independence", "Continental Army"], color: "bg-blue-800 text-white border-blue-950", hex: "#1E40AF", icon: <Shield size={14} /> },
    { id: "industrialists", title: "The Industrialists", description: "Innovators and laborers who drove the manufacturing boom of the 19th century.", keywords: ["Factory", "Mill", "Industry", "Inventor", "Manufacturing", "Railroad"], color: "bg-slate-700 text-white border-slate-900", hex: "#334155", icon: <Hammer size={14} /> },
    { id: "quakers", title: "The Quakers", description: "Members of the Society of Friends who sought religious freedom and simplicity.", keywords: ["Quaker", "Society of Friends", "Persecuted"], color: "bg-amber-700 text-white border-amber-900", hex: "#B45309", icon: <Scroll size={14} /> },
    { id: "victorian_era", title: "The Victorian Era", description: "Ancestors who lived during the reign of Queen Victoria (1837-1901).", keywords: [], dateRange: { start: 1837, end: 1901 }, color: "bg-fuchsia-800 text-white border-fuchsia-950", hex: "#86198F", icon: <Crown size={14} /> },
    { id: "pandemic_survivors", title: "The Pandemic Survivors", description: "Ancestors who lived through the 1918 Flu Pandemic or earlier plagues.", keywords: ["Spanish Flu", "Plague", "Yellow Fever", "Cholera", "Smallpox", "Pandemic"], dateRange: { start: 1918, end: 1919 }, color: "bg-stone-600 text-white border-stone-800", hex: "#57534E", icon: <Activity size={14} /> }
];

const detectThreads = (person) => {
    const notes = (person.story?.notes || "").toLowerCase();
    const tags = (person.story?.tags || []).map(t => t.toLowerCase());

    // Safe extraction of years
    let born = person.vital_stats?.born_year_int;
    let died = person.vital_stats?.died_year_int;

    if (!born) born = parseInt(person.vital_stats?.born_date?.match(/\d{4}/)?.[0] || 0);
    if (!died) died = parseInt(person.vital_stats?.died_date?.match(/\d{4}/)?.[0] || 0);

    return NARRATIVE_THREADS.filter(thread => {
        // Keyword Match
        const keywordMatch = thread.keywords && thread.keywords.some(k =>
            notes.includes(k.toLowerCase()) || tags.includes(k.toLowerCase())
        );

        // Date Range Match
        let dateMatch = false;
        if (thread.dateRange && born > 0 && died > 0) {
            // Alive during the range: Born before end AND Died after start
            dateMatch = (born <= thread.dateRange.end) && (died >= thread.dateRange.start);
        }

        return keywordMatch || dateMatch;
    });
};

const getCoordinates = (locationName, hierarchy = null, coords = null) => {
    // 1. Use Pre-Calculated Coords from Pipeline if available
    if (coords && coords.lat && coords.lng) {
        return { pos: [coords.lat, coords.lng], tier: coords.tier || 1, label: "Exact" };
    }

    if (!locationName) return { pos: null, tier: 4 };

    // Tier 2: Historical
    if (HISTORICAL_LOCATIONS[locationName]) {
        return { pos: HISTORICAL_LOCATIONS[locationName], tier: 2, label: "Historical" };
    }

    // Tier 3: Region/State Fallback
    // Check hierarchy if available
    if (hierarchy) {
        if (hierarchy.state && REGION_COORDINATES[hierarchy.state]) {
            return { pos: REGION_COORDINATES[hierarchy.state], tier: 3, label: "Region" };
        }
        if (hierarchy.country && REGION_COORDINATES[hierarchy.country]) {
            return { pos: REGION_COORDINATES[hierarchy.country], tier: 3, label: "Country" };
        }
    }

    // Fallback: Check parts of string
    const parts = locationName.split(',').map(s => s.trim());
    for (const part of parts) {
         if (REGION_COORDINATES[part]) {
             return { pos: REGION_COORDINATES[part], tier: 3, label: "Region" };
         }
    }

    return { pos: null, tier: 4, label: "Unknown" };
};

const createMarkerIcon = (color, tier) => {
    // Tier 3: Gray Circle (Small)
    if (tier === 3) {
         return L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="#9CA3AF" stroke="white" stroke-width="2">
                       <circle cx="12" cy="12" r="8"></circle>
                     </svg>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    }

    // Tier 2: Sepia Pin
    const finalColor = tier === 2 ? '#8B4513' : color;

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="${finalColor}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
               <circle cx="12" cy="10" r="3" fill="white"></circle>
             </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
};

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
    const warEvents = historyData.filter(e => e.type === 'war');

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
        const eventAt20 = historyData.find(e => Math.abs(e.year - age20) <= 2 && e.region !== 'Global');
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

    // 1. Determine Reference Location for Distance Calculation
    // Use Death Location primarily (as requested: "ancestor's death location"), fallback to Birth.
    const refLoc = diedLoc && diedLoc !== "Unknown" ? diedLoc : bornLoc;
    const refCoords = getCoordinates(refLoc);

    return historyData.filter(e => {
        // Temporal Filter
        const inTime = e.year >= born && e.year <= died;
        if (!inTime) return false;

        // Global Event Exception
        if (e.global) return true;

        // Radius of Relevance Filter
        if (e.lat && e.lon && refCoords.pos) {
            const distance = calculateDistance(refCoords.pos[0], refCoords.pos[1], e.lat, e.lon);
            if (distance !== null && distance <= 500) {
                return true;
            }
        }

        // Fallback: If event has no coords or ancestor has no coords,
        // use legacy Region Matching (e.g. USA vs UK) to catch generic region matches
        // But suppress if it has coords and distance check failed (implied by above logic flow)
        if (!e.lat || !e.lon || !refCoords.pos) {
             const region = detectRegion(bornLoc) !== "Global" ? detectRegion(bornLoc) : detectRegion(diedLoc);
             const matchesRegion = e.region === "Global" || e.region === region;
             return matchesRegion;
        }

        return false;
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

    const { anchorId, stepsDown, type } = userRelation;
    const targetId = String(ancestorId);
    const anchorStr = String(anchorId);

    // 1. Generation Difference
    const anchorGenIndex = anchorStr.split('.').length;
    const userGenIndex = anchorGenIndex - stepsDown;
    const targetGenIndex = targetId.split('.').length;
    const diff = targetGenIndex - userGenIndex;

    // 2. Direct Line Check (Target is Ancestor of Anchor)
    // Ancestors have IDs that start with the Descendant's ID (reversed d'Aboville)
    // and typically don't involve collateral suffixes like '_c' in the path relative to the descendant.
    // Ensure strict segment boundary to avoid matching "1" with "12".
    const targetIsAncestorOfAnchor = targetId === anchorStr || targetId.startsWith(anchorStr + '.');
    const suffix = targetId.slice(anchorStr.length);
    const isCollateralToAnchor = suffix.includes('_c');
    const anchorToTargetIsDirect = targetIsAncestorOfAnchor && !isCollateralToAnchor;

    // 3. Gender Detection
    const isMale = targetId.endsWith('.1');
    const isFemale = targetId.endsWith('.2');

    // 4. Logic Mapping

    // Case: Target IS the Anchor
    if (targetId === anchorStr) {
        if (type === 'self') return "You";
        if (type === 'father') return "Father";
        if (type === 'mother') return "Mother";
        if (type === 'uncle') return "Uncle";
        if (type === 'aunt') return "Aunt";
        if (type === 'grandfather') return "Grandfather";
        if (type === 'grandmother') return "Grandmother";
        if (type === 'great-uncle') return "Great Uncle";
        if (type === 'great-aunt') return "Great Aunt";
        if (type === 'great-grandfather') return "Great-Grandfather";
        if (type === 'great-grandmother') return "Great-Grandmother";
        return "Anchor";
    }

    if (diff === 0) return "Relative (Same Gen)";

    // If Target is a Direct Ancestor of the Anchor (e.g. Anchor's Parent/GP)
    // This implies they are also a Direct Ancestor of the User (User -> Anchor -> Target)
    // (Even if Anchor is Uncle, Uncle's Parent is User's Grandparent).
    if (anchorToTargetIsDirect) {
        if (diff === 1) return isMale ? "Father" : (isFemale ? "Mother" : "Parent");
        if (diff === 2) return isMale ? "Grandfather" : (isFemale ? "Grandmother" : "Grandparent");
        if (diff === 3) return isMale ? "Great-Grandfather" : (isFemale ? "Great-Grandmother" : "Great-Grandparent");
        if (diff >= 4) return `${diff-2}th Great-Grandparent`;
    }

    // If Target is Collateral to Anchor (e.g. Sibling of Anchor, Sibling of Anchor's Parent)
    if (diff === 1) return isMale ? "Uncle" : (isFemale ? "Aunt" : "Uncle/Aunt");
    if (diff === 2) return isMale ? "Great Uncle" : (isFemale ? "Great Aunt" : "Great Uncle/Aunt");
    if (diff === 3) return isMale ? "Great-Grand Uncle" : (isFemale ? "Great-Grand Aunt" : "Great-Grand Uncle/Aunt");

    // Descendants
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

    return (
        <div className="mb-12 bg-white/80 backdrop-blur-md rounded-xl p-6 border border-orange-100/50 shadow-sm">
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

const MapUpdater = ({ allPoints, focus, defaultCenter, defaultZoom }) => {
    const map = useMap();
    const prevCenterRef = React.useRef(null);

    React.useEffect(() => {
        // Handle Focus (Flight)
        if (focus && focus.center) {
            const newCenter = L.latLng(focus.center);
            let shouldMove = true;

            if (prevCenterRef.current) {
                const currentCenter = L.latLng(prevCenterRef.current);
                const distMeters = currentCenter.distanceTo(newCenter);
                const distMiles = distMeters / 1609.34; // Convert meters to miles

                // Threshold Rule: If distance < 50 miles AND point is visible, do not fly/pan.
                // This prevents "micro-jitters" but ensures off-screen points are still shown.
                if (distMiles < 50 && map.getBounds().contains(newCenter)) {
                    shouldMove = false;
                }
            }

            if (shouldMove) {
                map.flyTo(focus.center, focus.zoom, { duration: 2.0, easeLinearity: 0.25 });
                prevCenterRef.current = focus.center;
            }
        } else {
            // Default Bounds Logic (only if no focus)
             if (allPoints.length > 1) {
                 const bounds = L.latLngBounds(allPoints);
                 if (bounds.isValid()) {
                     map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
                 }
            } else if (allPoints.length === 1) {
                 map.setView(allPoints[0], 10);
            } else {
                 map.setView(defaultCenter, defaultZoom);
            }
        }
    }, [allPoints, focus, defaultCenter, defaultZoom, map]);

    return null;
};

const KeyLocationsMap = ({ bornLoc, diedLoc, bornHierarchy, diedHierarchy, lifeEvents = [], bornCoords, diedCoords, focus, className }) => {
    const bornData = getCoordinates(bornLoc, bornHierarchy, bornCoords);
    const diedData = getCoordinates(diedLoc, diedHierarchy, diedCoords);

    const missingLocations = [];
    if (bornLoc && bornLoc !== "Unknown" && !bornData.pos) missingLocations.push(bornLoc);
    if (diedLoc && diedLoc !== "Unknown" && !diedData.pos) missingLocations.push(diedLoc);

    // Process Life Events
    const eventMarkers = lifeEvents
        .filter(e => e.location && e.location !== "Unknown")
        .map(e => {
            const data = getCoordinates(e.location, null, e.coords);
            if (!data.pos) {
                if (!missingLocations.includes(e.location)) missingLocations.push(e.location);
                return null;
            }
            return {
                pos: data.pos,
                tier: data.tier,
                type: e.year + " Event",
                color: '#10B981',
                loc: e.location,
                label: e.label
            };
        })
        .filter(Boolean);

    // Default View: Center of New England
    const defaultPosition = [41.7658, -72.6734];
    const defaultZoom = 7;

    const markers = [];
    let polyline = null;

    const allPoints = [];

    if (bornData.pos) {
        markers.push({
            pos: bornData.pos,
            tier: bornData.tier,
            type: 'Birth',
            color: '#3B82F6',
            loc: bornLoc,
            tierLabel: bornData.label
        });
        allPoints.push(bornData.pos);
    }

    // Add event markers
    eventMarkers.forEach(m => {
        markers.push(m);
        allPoints.push(m.pos);
    });

    if (diedData.pos) {
        if (!bornData.pos || bornLoc !== diedLoc) {
             markers.push({
                 pos: diedData.pos,
                 tier: diedData.tier,
                 type: 'Death',
                 color: '#EF4444',
                 loc: diedLoc,
                 tierLabel: diedData.label
             });
             allPoints.push(diedData.pos);
        }
    }

    if (bornData.pos && diedData.pos && bornLoc !== diedLoc) {
        polyline = [bornData.pos, diedData.pos];
    }

    return (
        <div className={`rounded-xl overflow-hidden border border-gray-200 shadow-sm relative ${className || 'h-[400px] w-full'}`}>
            {/* Unknown Location Badge */}
            {missingLocations.length > 0 && (
                <div className="absolute top-2 right-2 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                     Location Unknown: {missingLocations[0]} {missingLocations.length > 1 ? `+${missingLocations.length-1}` : ''}
                </div>
            )}

            <MapContainer center={defaultPosition} zoom={defaultZoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <MapUpdater allPoints={allPoints} focus={focus} defaultCenter={defaultPosition} defaultZoom={defaultZoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((m, i) => (
                    <Marker key={i} position={m.pos} icon={createMarkerIcon(m.color, m.tier)}>
                        <Popup>
                            <strong>{m.type} Location</strong><br />
                            {m.loc}
                            {m.tier === 3 && (
                                <div className="mt-1 inline-block bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 rounded uppercase tracking-wider">
                                    Approximate Location
                                </div>
                            )}
                            {m.label && <><br/><span className="text-xs text-gray-500">{m.label}</span></>}
                        </Popup>
                    </Marker>
                ))}
                {polyline && <Polyline positions={polyline} color="#2C3E50" dashArray="5, 10" />}
            </MapContainer>
        </div>
    );
};

const TimelineEvent = ({ event, age, onVisible }) => {
    const isPersonal = event.region === "Personal";
    const ref = useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && onVisible) {
                    onVisible(event);
                }
            },
            { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [event, onVisible]);

    return (
        <div ref={ref} className="timeline-event group flex gap-6 relative">
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
    // Priority: Muse Logic (getHeroImage) > Pipeline Data (heroImage)
    // Muse's Philosophy: "A picture is worth a thousand data points."
    // We prioritize the frontend mapper because it contains the "Muse Overrides" for curated styles.
    // Since getHeroImage also checks the cache (which powers heroImage), this is safe.
    const asset = getHeroImage(location, year);
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
        <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-b-xl shadow-md">
            {/* Gradient Overlay for Texture Blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-transparent to-black/30 z-10"></div>

            <img
                src={imgSrc}
                alt={asset.alt}
                title={asset.caption}
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
    // Muse: Ensure the profile has a visual identity
    if (!item) return null;

    const [researchSuggestions, setResearchSuggestions] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { isAuthenticated } = useAuth();
    const [mapFocus, setMapFocus] = useState(null);

    React.useEffect(() => {
        setResearchSuggestions(null);
        setIsAnalyzing(false);
    }, [item]);

    const handleAnalyzeProfile = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

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

    // Helper: Parse text for currency
    const renderNoteWithCurrency = (text) => {
        if (!text) return null;

        // Regex for $ or £ followed by numbers OR "X pounds" / "X dollars"
        // Groups: 1=Symbol/Word, 2=Amount

        // We need a more complex regex loop to handle both cases or multiple regexes.
        // Let's iterate through matches of either pattern.

        // Pattern 1: $500 or £50
        // Pattern 2: 500 dollars or 50 pounds

        // Combined Regex:
        // ([$£])([\d,]+(?:\.\d{2})?)   -> Match 1: Symbol, Match 2: Amount
        // ([\d,]+(?:\.\d{2})?)\s+(dollars|pounds) -> Match 3: Amount, Match 4: Word

        const regex = /([$£])([\d,]+(?:\.\d{2})?)|([\d,]+(?:\.\d{2})?)\s+(dollars|pounds)/gi;

        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Push text before match
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            let symbol, amountStr, currencyCode;

            if (match[1]) {
                // Case: $500
                symbol = match[1];
                amountStr = match[2];
                currencyCode = symbol === '£' ? 'GBP' : 'USD';
            } else {
                // Case: 500 dollars
                amountStr = match[3];
                const word = match[4].toLowerCase();
                currencyCode = word === 'pounds' ? 'GBP' : 'USD';
                symbol = ''; // No prefix symbol
            }

            const originalText = match[0];
            const amount = parseFloat(amountStr.replace(/,/g, ''));

            // Determine Context Year
            // 1. Look for year in surrounding text (roughly 50 chars before/after)
            const contextStart = Math.max(0, match.index - 50);
            const contextEnd = Math.min(text.length, match.index + 50);
            const contextStr = text.substring(contextStart, contextEnd);
            const yearMatch = contextStr.match(/\b(1[6-9]\d{2}|20\d{2})\b/);

            let contextYear = yearMatch ? parseInt(yearMatch[0]) : null;

            // 2. Fallback: Died Year (often wills/probate) or Born + 30
            if (!contextYear) {
                if (diedYear > 0) contextYear = diedYear;
                else if (bornYear > 0) contextYear = bornYear + 30;
                else contextYear = 1900; // Total fallback
            }

            parts.push(
                <CurrencyTooltip
                    key={match.index}
                    originalText={originalText}
                    amount={amount}
                    currency={currencyCode}
                    year={contextYear}
                />
            );

            lastIndex = regex.lastIndex;
        }

        // Push remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    const bornLoc = item.vital_stats.born_location || "Unknown";
    const diedLoc = item.vital_stats.died_location || "Unknown";

    // Pass locations to getLifeEvents for region filtering
    const historyEvents = getLifeEvents(item.vital_stats.born_date, item.vital_stats.died_date, bornLoc, diedLoc);
    const personalEvents = getPersonalLifeEvents(item.story.life_events, bornYear, diedYear);

    const bornHierarchy = item.vital_stats.born_hierarchy;
    const diedHierarchy = item.vital_stats.died_hierarchy;

    // Get Coords
    const bornCoords = item.vital_stats.born_coords;
    const diedCoords = item.vital_stats.died_coords;

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

    // --- SCROLLYTELLING LOGIC ---
    // Initial Focus: Birth Location (or None)
    React.useEffect(() => {
        const bornData = getCoordinates(bornLoc, bornHierarchy, bornCoords);
        if (bornData.pos) {
            setMapFocus({ center: bornData.pos, zoom: 10 });
        } else {
            setMapFocus(null); // Will trigger default bounds fit
        }
    }, [item]);

    return (
        <div className="absolute inset-0 z-30 bg-[#F9F5F0] animate-in slide-in-from-right duration-500 overflow-y-auto custom-scrollbar">

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    handleAnalyzeProfile();
                }}
            />

            <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl relative flex flex-col">

                {/* Sticky Header */}
                 <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md p-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
                     <div className="flex items-center gap-2">
                         <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2">
                            <Anchor size={12} className="text-[#E67E22]" strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{relationship}</span>
                         </div>
                     </div>
                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition-all border border-transparent hover:border-gray-200">
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-8 space-y-8 pb-24">
                     {/* PROFILE CARD - Simplified for white background */}
                     <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                        <HeroImage location={bornLoc} year={bornYear} heroImage={item.hero_image} />

                        <div className="px-8 pb-8 pt-6 flex flex-col items-center text-center">
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2 leading-tight">
                                {item.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-500 font-mono text-sm uppercase tracking-widest mb-6">
                                <span>{bornYear || '?'}</span>
                                <span className="w-8 h-px bg-gray-300"></span>
                                <span>{diedYear || '?'}</span>
                            </div>

                            {/* TAGS & THREADS */}
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
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
                                        onClick={() => onSelectThread && onSelectThread(thread.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-transform ${thread.color}`}
                                        title={`View "${thread.title}" Epic`}
                                    >
                                        {thread.icon}
                                        Part of {thread.title} Epic
                                    </button>
                                ))}
                            </div>

                            {/* STATS BAR */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 w-full border-t border-gray-100">
                                <StatItem label="Born" value={bornLoc} icon={<User size={18} strokeWidth={1.5} />} />
                                <StatItem label="Died" value={diedLoc} icon={<Heart size={18} strokeWidth={1.5} />} />
                                <StatItem label="Spouse" value={spousesCount > 0 ? spousesCount : "—"} icon={<Users size={18} strokeWidth={1.5} />} />
                                <StatItem label="Children" value={childrenCount > 0 ? childrenCount : "—"} icon={<Users size={18} strokeWidth={1.5} />} />
                            </div>
                        </div>
                    </div>

                    {/* TRIVIA */}
                    <ProfileTrivia person={item} familyData={familyData} />

                    {/* GENERATIONAL HANDSHAKE */}
                    <GenerationalHandshake person={item} familyData={familyData} />

                    {/* STORY / BIO */}
                    {item.story?.notes && (
                        <div className="bg-white rounded-xl p-0">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BookOpen size={14} strokeWidth={1.5} /> Biography
                                </h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            <p className="text-lg md:text-xl font-body-serif text-gray-800 leading-loose first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-0.5rem] first-letter:text-[#2C3E50]">
                                {renderNoteWithCurrency(item.story.notes)}
                            </p>
                        </div>
                    )}

                    {/* UNIFIED TIMELINE */}
                    {bornYear > 0 && (
                        <div className="bg-white rounded-xl p-0">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={14} strokeWidth={1.5} /> Life & Times
                                </h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="pl-4 md:pl-8 border-l border-gray-100 ml-4">
                                <TimelineEvent
                                    event={{
                                        year: bornYear,
                                        label: `Born in ${bornLoc}${item.vital_stats.born_location_note ? ` (${item.vital_stats.born_location_note})` : ''}`,
                                        region: "Personal",
                                        location: bornLoc
                                    }}
                                    age={0}
                                />
                                {events.map((e, i) => (
                                    <TimelineEvent
                                        key={i}
                                        event={e}
                                        age={e.year - bornYear}
                                    />
                                ))}
                                <TimelineEvent
                                    event={{
                                        year: diedYear,
                                        label: `Died in ${diedLoc}${item.vital_stats.died_location_note ? ` (${item.vital_stats.died_location_note})` : ''}`,
                                        region: "Personal",
                                        location: diedLoc
                                    }}
                                    age={diedYear - bornYear}
                                />
                            </div>
                        </div>
                    )}

                    {/* KEY LOCATIONS MAP (Static) */}
                    <div className="bg-white rounded-xl p-0">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin size={14} strokeWidth={1.5} /> Key Locations
                            </h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <KeyLocationsMap
                            bornLoc={bornLoc}
                            diedLoc={diedLoc}
                            bornHierarchy={bornHierarchy}
                            diedHierarchy={diedHierarchy}
                            lifeEvents={personalEvents}
                            bornCoords={bornCoords}
                            diedCoords={diedCoords}
                            focus={mapFocus}
                            className="h-[400px] w-full rounded-xl shadow-inner bg-gray-50 border border-gray-200"
                        />
                    </div>

                    {/* FAMILY CONNECTIONS */}
                    <div className="bg-white rounded-xl p-0">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Network size={14} strokeWidth={1.5} /> Connections
                            </h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
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
                        <div className="bg-white rounded-xl p-0">
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
                    <div className="bg-white rounded-xl p-0">
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
                                            <div className="text-sm text-gray-700 leading-relaxed flex-1">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({node, ...props}) => <p {...props} className="mb-1 last:mb-0" />,
                                                        a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />,
                                                        ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside ml-2" />,
                                                        ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside ml-2" />
                                                    }}
                                                >
                                                    {suggestion.text || suggestion}
                                                </ReactMarkdown>

                                                {/* Actionable Source Links */}
                                                {suggestion.links && suggestion.links.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {suggestion.links.map((link, i) => (
                                                            <a
                                                                key={i}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-md transition-colors border border-blue-200"
                                                                title={link.description}
                                                            >
                                                                <Search size={10} />
                                                                {link.label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
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
  const [selectedAncestor, setSelectedAncestor] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
       return familyData.find(p => String(p.id) === id) || null;
    }
    return null;
  });

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentId = params.get('id');
    const stateId = selectedAncestor ? String(selectedAncestor.id) : null;

    if (currentId !== stateId) {
        const url = new URL(window.location);
        if (stateId) {
            url.searchParams.set('id', stateId);
        } else {
            url.searchParams.delete('id');
        }
        window.history.pushState({ id: stateId }, '', url.toString());
    }
  }, [selectedAncestor]);

  // Handle Back/Forward
  React.useEffect(() => {
    const handlePopState = (event) => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            const person = familyData.find(p => String(p.id) === id);
            setSelectedAncestor(person || null);
        } else {
            setSelectedAncestor(null);
        }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'graph', 'hitlist'
  const [storyMode, setStoryMode] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('1');
  const [selectedTags, setSelectedTags] = useState([]);
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
        const matchesTags = selectedTags.length === 0 || (p.story.tags && selectedTags.every(t => p.story.tags.includes(t)));
        return matchesLineage && matchesBranch && matchesTags;
    });
  }, [selectedBranchId, selectedTags, selectedLineage]);

  const filteredListData = useMemo(() => {
    return familyData.filter(p => {
        // Lineage and Branch Filtering are EXCLUDED for List View as per request
        const matchesTags = selectedTags.length === 0 || (p.story.tags && selectedTags.every(t => p.story.tags.includes(t)));
        return matchesTags;
    });
  }, [selectedTags]);

  // Group data by Generation
  const groupedData = useMemo(() => {
    const groups = {};
    const filtered = filteredListData.filter(item => {
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
  }, [searchText, storyMode, filteredListData, selectedThreadId]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* Relationship Modal */}
      {!userRelation && (
          <RelationshipSelector data={familyData} onComplete={handleRelationComplete} />
      )}

      {/* --- LEFT NAVIGATION (Persistent Sidebar) --- */}
      <div
        className={`
            relative flex flex-col border-r border-gray-200 bg-white h-full z-10 shrink-0
            ${!isResizing ? 'transition-all duration-300' : ''}
            ${selectedAncestor ? 'hidden lg:flex' : 'flex'}
        `}
        style={{ width: sidebarWidth }}
      >
        {/* Resize Handle (Always Active) */}
        <div
            className="absolute top-0 bottom-0 right-0 w-1.5 cursor-col-resize z-50 hover:bg-blue-400/50 active:bg-blue-600 transition-colors"
            onMouseDown={startResizing}
            title="Drag to resize sidebar"
        />
        {/* Header with Title and Controls */}
        <div className="p-4 border-b border-gray-100 bg-white z-20 space-y-4">
            {/* Top Row: Title + View Toggles + Logout */}
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-[#2C3E50] tracking-tight font-serif flex items-center gap-2">
                <User size={24} className="text-[#E67E22]" /> Kinship
              </h1>

              <div className="flex items-center gap-3">
                  {/* View Mode Segmented Control (Subtle) */}
                  <div className="flex bg-gray-100 p-0.5 rounded-lg">
                     <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="List View"
                     >
                        <ListIcon size={16} />
                     </button>
                     <button
                        onClick={() => setViewMode('graph')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'graph' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Graph View"
                     >
                        <Network size={16} />
                     </button>
                     <button
                        onClick={() => setViewMode('threads')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'threads' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Epics"
                     >
                        <BookOpen size={16} />
                     </button>
                     <button
                        onClick={() => setViewMode('hitlist')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'hitlist' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Hitlist"
                     >
                        <AlertTriangle size={16} />
                     </button>
                     <button
                        onClick={() => setViewMode('outliers')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'outliers' ? 'bg-white shadow-sm text-[#E67E22]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Outliers"
                     >
                        <Trophy size={16} />
                     </button>
                  </div>

                  <button
                        onClick={() => {
                            setUserRelation(null);
                            localStorage.removeItem('userRelation');
                        }}
                        className="p-1.5 rounded-lg text-gray-300 hover:bg-gray-50 hover:text-gray-600 transition-all"
                        title="Reset Identity / Log Out"
                    >
                        <LogOut size={16} />
                    </button>
              </div>
            </div>

            {/* Second Row: Search + Filter Menu (Consolidated) */}
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

                <FilterMenu
                    storyMode={storyMode}
                    setStoryMode={setStoryMode}
                    selectedBranchId={selectedBranchId}
                    setSelectedBranchId={setSelectedBranchId}
                    selectedLineage={selectedLineage}
                    setSelectedLineage={setSelectedLineage}
                    viewMode={viewMode}
                    branches={BRANCHES}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    tagConfig={TAG_CONFIG}
                    narrativeThreads={NARRATIVE_THREADS}
                    selectedThreadId={selectedThreadId}
                    setSelectedThreadId={setSelectedThreadId}
                />
            </div>
        </div>

        {/* TRIVIA WIDGET */}
        {viewMode === 'graph' && (
            <TriviaWidget data={filteredGraphData} branchName={BRANCHES[selectedBranchId]} />
        )}

        {/* LIST VIEW (Shows in 'list' AND 'graph' modes) */}
        {(viewMode === 'list' || viewMode === 'graph') && (
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

        {viewMode === 'hitlist' && (
             <div className="flex-1 overflow-y-auto relative border-t border-gray-100">
                 <HitlistPanel onSelectProfile={(id) => {
                     const person = familyData.find(p => String(p.id) === String(id));
                     if (person) setSelectedAncestor(person);
                 }} />
             </div>
        )}

        {viewMode === 'outliers' && (
             <div className="flex-1 overflow-y-auto relative border-t border-gray-100">
                 <OutliersDashboard
                    data={familyData}
                    onSelectProfile={(id) => {
                        const person = familyData.find(p => String(p.id) === String(id));
                        if (person) setSelectedAncestor(person);
                    }}
                 />
             </div>
        )}
      </div>

      {/* --- RIGHT PANEL (Main Content) --- */}
      <div className="flex-1 relative bg-[#F9F5F0] h-full overflow-hidden">

          {/* Graph View (Rendered in Main Content) */}
          {viewMode === 'graph' && (
             <div className="absolute inset-0 z-0">
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
             // Placeholder (Only if NOT graph mode)
             viewMode !== 'graph' && (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                     <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                         <Info size={48} className="text-gray-400" />
                     </div>
                     <h2 className="text-2xl font-serif text-gray-800 mb-2">Select an Ancestor</h2>
                 </div>
             )
          )}
      </div>

    </div>
  );
}
