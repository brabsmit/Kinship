import React from 'react';
import { Ship, Anchor, MapPin, Calendar, Wind, ExternalLink, Hammer, User, Ruler, Users, Info } from 'lucide-react';
import { ASSETS } from '../utils/assetMapper';
import { detectRegion } from '../utils/geo';

const getVoyageContext = (voyage, profile = null) => {
    // Prefer server-side context if available and valid
    if (voyage.context && voyage.context.duration !== "Unknown") {
        return {
            duration: voyage.context.duration,
            conditions: voyage.context.conditions,
            context: voyage.context.era_label,
            isEstimated: voyage.context.is_estimated
        };
    }

    // Client-side inference fallback (legacy support)
    let year = voyage.year;
    let departure = voyage.departure;
    let arrival = voyage.arrival;

    // 1. Normalize explicit voyage inputs
    let y = parseInt(year, 10);
    let dep = (departure || "").toLowerCase();
    let arr = (arrival || "").toLowerCase();
    let isEstimated = false;

    // 2. Inference Logic (if details missing)
    if (profile && profile.vital_stats) {
        let bornLoc = (profile.vital_stats.born_location || "").toLowerCase();
        let diedLoc = (profile.vital_stats.died_location || "").toLowerCase();

        // Fallback: Attempt to extract location from date string if location is Unknown
        // (Handles cases where pipeline failed to split "Date, Location")
        if ((!bornLoc || bornLoc === "unknown") && profile.vital_stats.born_date) {
             const parts = profile.vital_stats.born_date.split(',');
             if (parts.length > 1) bornLoc = parts.slice(1).join(',').trim().toLowerCase();
        }
        if ((!diedLoc || diedLoc === "unknown") && profile.vital_stats.died_date) {
             const parts = profile.vital_stats.died_date.split(',');
             if (parts.length > 1) diedLoc = parts.slice(1).join(',').trim().toLowerCase();
        }

        const bornYear = parseInt(profile.vital_stats.born_year_int || profile.vital_stats.born_date?.match(/\d{4}/)?.[0] || 0);
        const diedYear = parseInt(profile.vital_stats.died_year_int || profile.vital_stats.died_date?.match(/\d{4}/)?.[0] || 0);

        // Infer Departure from Birth Location if missing
        if ((!dep || dep === "unknown") && bornLoc && bornLoc !== "unknown") {
            dep = bornLoc;
        }

        // Infer Arrival from Death Location if missing
        if ((!arr || arr === "unknown") && diedLoc && diedLoc !== "unknown") {
            arr = diedLoc;
        }

        // Infer Year if missing
        // Strategy: If migration, it happened between birth and death.
        // If we know it's a migration (different regions), estimate "Mid-Life" or "Migration Era"
        if ((!y || isNaN(y)) && bornYear > 0) {
             // If we have a departure/arrival mismatch (e.g. UK -> USA), assume migration.
             const regionDep = detectRegion(dep);
             const regionArr = detectRegion(arr);

             if (regionDep !== "Global" && regionArr !== "Global" && regionDep !== regionArr) {
                 // It's a migration.
                 // Heuristic: If died in new land, they moved sometime.
                 // Let's approximate to "Mid-19th Century" etc based on lifespan.
                 y = Math.floor((bornYear + (diedYear || bornYear + 60)) / 2);
                 isEstimated = true;
             }
        }
    }

    // Helper for route detection
    const isUK = dep.includes("england") || dep.includes("uk") || dep.includes("britain") || dep.includes("london") || dep.includes("liverpool") || dep.includes("plymouth") || dep.includes("bristol") || dep.includes("southampton") || dep.includes("hertfordshire") || dep.includes("suffolk") || dep.includes("essex") || dep.includes("kent");
    const isUS = arr.includes("america") || arr.includes("usa") || arr.includes("united states") || arr.includes("mass") || arr.includes("connecticut") || arr.includes("new york") || arr.includes("virginia") || arr.includes("boston") || arr.includes("salem") || arr.includes("hartford") || arr.includes("new england") || arr.includes("ohio") || arr.includes("michigan") || arr.includes("pennsylvania");

    // Default return if we still don't have a year
    if (!y || isNaN(y)) return null;

    // Trans-Atlantic Route (UK/Europe -> US)
    // Note: If inferred, y is a number.
    if (isUK && isUS) {
        if (y < 1700) {
             return {
                 duration: "6-12 weeks",
                 conditions: "Extremely hazardous. Scurvy common. High mortality rate (20%).",
                 context: "The Early Colonial Era",
                 isEstimated
             };
        } else if (y < 1800) {
             return {
                 duration: "8-10 weeks",
                 conditions: "Crowded steerage, limited fresh water, disease outbreaks.",
                 context: "The Colonial Expansion",
                 isEstimated
             };
        } else if (y < 1860) {
             return {
                 duration: "4-6 weeks",
                 conditions: "Improved navigation, but 'coffin ships' common during famines.",
                 context: "The Age of Sail",
                 isEstimated
             };
        } else {
             return {
                 duration: "10-14 days",
                 conditions: "Steamships provided faster, safer passage, though steerage remained cramped.",
                 context: "The Steam Age",
                 isEstimated
             };
        }
    }

    return null; // No context available for this route/year
};

const VoyageCard = ({ voyage, profile }) => {
  if (!voyage) return null;

  const context = getVoyageContext(voyage, profile);

  // Display Helpers
  let displayDeparture = voyage.departure;
  let displayArrival = voyage.arrival;

  // Update display values if inferred
  if ((!displayDeparture || displayDeparture === "Unknown") && profile?.vital_stats) {
      const bornLoc = profile.vital_stats.born_location;
      // Fallback extract
      if ((!bornLoc || bornLoc === "Unknown") && profile.vital_stats.born_date && profile.vital_stats.born_date.includes(',')) {
           displayDeparture = profile.vital_stats.born_date.split(',').slice(1).join(',').trim() + "*";
      } else if (bornLoc && bornLoc !== "Unknown") {
           displayDeparture = bornLoc + "*";
      }
  }

  if ((!displayArrival || displayArrival === "Unknown") && profile?.vital_stats) {
      const diedLoc = profile.vital_stats.died_location;
      // Fallback extract
      if ((!diedLoc || diedLoc === "Unknown") && profile.vital_stats.died_date && profile.vital_stats.died_date.includes(',')) {
           displayArrival = profile.vital_stats.died_date.split(',').slice(1).join(',').trim() + "*";
      } else if (diedLoc && diedLoc !== "Unknown") {
           displayArrival = diedLoc + "*";
      }
  }

  return (
    <div className="relative w-full max-w-md mx-auto my-6 bg-[#f4e4bc] text-[#3e3221] font-serif border-2 border-[#3e3221] shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
      {/* Decorative corners or borders could go here */}
      <div className="border border-[#3e3221] m-1 p-4 border-dashed">
        <div className="text-center border-b-2 border-[#3e3221] pb-2 mb-4">
          <h3 className="uppercase tracking-widest text-xs font-bold mb-1 flex items-center justify-center gap-2">
            <Anchor size={12} /> Passage Ticket <Anchor size={12} />
          </h3>
          <div className="text-2xl font-bold font-display uppercase tracking-wider">{voyage.ship_name}</div>
          <div className="text-xs italic mt-1">{voyage.type !== "Unknown" ? voyage.type : "Vessel"}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
             <div className="border-r border-[#3e3221] pr-2">
                <span className="block text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Departure</span>
                <span className="font-bold block leading-tight truncate" title={displayDeparture && displayDeparture.includes('*') ? "Inferred from Birth/Death Data" : ""}>
                    {displayDeparture || "Unknown"}
                </span>
             </div>
             <div className="text-right pl-2">
                <span className="block text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Arrival</span>
                <span className="font-bold block leading-tight truncate" title={displayArrival && displayArrival.includes('*') ? "Inferred from Birth/Death Data" : ""}>
                    {displayArrival || "Unknown"}
                </span>
             </div>
        </div>

        {context && (
            <div className="mt-4 pt-2 border-t-2 border-[#3e3221] border-dashed text-center">
                <h4 className="text-[10px] uppercase font-bold opacity-60 mb-1 flex items-center justify-center gap-1">
                     <Wind size={10} /> {context.context} {context.isEstimated && <Info size={10} className="text-[#3e3221]/50" title="Context inferred from ancestor's lifespan and migration pattern." />}
                </h4>
                <div className="text-xs mb-2">
                    <span className="font-bold">Avg. Duration:</span> {context.duration}
                </div>
                <div className="text-xs italic opacity-90 px-4">
                     "{context.conditions}"
                </div>
            </div>
        )}

        {/* Shipmates Section */}
        {voyage.shipmates && voyage.shipmates.length > 0 && (
             <div className="mt-4 pt-2 border-t-2 border-[#3e3221] border-dashed text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#3e3221]" title={voyage.shipmates.map(m => m.name).join(", ")}>
                    <Users size={14} />
                    <span>
                        {voyage.shipmates.length} other ancestor{voyage.shipmates.length > 1 ? 's' : ''} also arrived on {voyage.ship_name}
                    </span>
                </div>
            </div>
        )}

        {/* Ship Specifications (Enriched Data) */}
        {voyage.specs && (
             <div className="mt-4 pt-2 border-t-2 border-[#3e3221] border-dashed">
                <h4 className="text-[10px] uppercase font-bold opacity-60 mb-2 flex items-center justify-center gap-1">
                     <Ship size={10} /> Vessel Specifications
                </h4>

                {voyage.specs.description && (
                     <div className="text-xs italic opacity-90 mb-3 px-2 text-center leading-relaxed">
                        "{voyage.specs.description}"
                     </div>
                )}

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] px-2">
                    {voyage.specs.year_built && voyage.specs.year_built !== "Unknown" && (
                        <div className="flex items-start gap-1.5">
                            <Hammer size={10} className="mt-0.5 opacity-60 shrink-0" />
                            <div>
                                <span className="opacity-70 block text-[9px] uppercase">Built</span>
                                <span className="font-bold leading-tight block">{voyage.specs.year_built}</span>
                            </div>
                        </div>
                    )}

                     {voyage.specs.location_built && voyage.specs.location_built !== "Unknown" && (
                        <div className="flex items-start gap-1.5 text-right justify-end">
                            <div className="flex-1">
                                <span className="opacity-70 block text-[9px] uppercase">Origin</span>
                                <span className="font-bold leading-tight block">{voyage.specs.location_built}</span>
                            </div>
                            <MapPin size={10} className="mt-0.5 opacity-60 shrink-0" />
                        </div>
                    )}

                    {voyage.specs.owner && voyage.specs.owner !== "Unknown" && (
                        <div className="col-span-2 flex items-start gap-1.5 border-t border-[#3e3221]/20 pt-1 mt-0.5">
                            <User size={10} className="mt-0.5 opacity-60 shrink-0" />
                            <div className="flex-1">
                                <span className="opacity-70 block text-[9px] uppercase">Owner</span>
                                <span className="font-bold leading-tight block">{voyage.specs.owner}</span>
                            </div>
                        </div>
                    )}

                    {/* Technical Stats Row 1 */}
                    {(voyage.specs.gross_tonnage !== "Unknown" || voyage.specs.masts !== "Unknown") && (
                        <div className="col-span-2 grid grid-cols-2 gap-3 border-t border-[#3e3221]/20 pt-1 mt-0.5">
                             {voyage.specs.gross_tonnage !== "Unknown" && (
                                <div className="flex items-center gap-1.5">
                                    <Anchor size={10} className="opacity-60 shrink-0" />
                                    <div>
                                        <span className="font-bold">{voyage.specs.gross_tonnage}</span>
                                    </div>
                                </div>
                             )}
                             {voyage.specs.masts !== "Unknown" && (
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="font-bold">{voyage.specs.masts} Masts</span>
                                    <Wind size={10} className="opacity-60 shrink-0" />
                                </div>
                             )}
                        </div>
                    )}

                     {/* Technical Stats Row 2 */}
                    {(voyage.specs.deck_length !== "Unknown" || voyage.specs.beam !== "Unknown") && (
                        <div className="col-span-2 grid grid-cols-2 gap-3 pt-0.5">
                             {voyage.specs.deck_length !== "Unknown" && (
                                <div className="flex items-center gap-1.5">
                                    <Ruler size={10} className="opacity-60 shrink-0" />
                                    <div>
                                        <span className="opacity-70 text-[9px] uppercase mr-1">L:</span>
                                        <span className="font-bold">{voyage.specs.deck_length}</span>
                                    </div>
                                </div>
                             )}
                             {voyage.specs.beam !== "Unknown" && (
                                <div className="flex items-center gap-1.5 justify-end">
                                     <span className="opacity-70 text-[9px] uppercase mr-1">Beam:</span>
                                    <span className="font-bold">{voyage.specs.beam}</span>
                                    <Ruler size={10} className="opacity-60 shrink-0 transform rotate-90" />
                                </div>
                             )}
                        </div>
                    )}

                </div>
             </div>
        )}

        <div className="flex justify-between items-center border-t-2 border-[#3e3221] pt-2 mt-4">
             <div className="flex items-center gap-2">
                <Calendar size={14} />
                <div className="text-lg font-bold">{voyage.year !== "Unknown" ? voyage.year : ""}</div>
             </div>
             <div className="px-2 py-1 border border-[#3e3221] rounded text-xs font-bold uppercase tracking-widest bg-[#eaddcf]">
                {voyage.class || "Passenger"}
             </div>
        </div>
      </div>

      <div className="text-center pb-2">
          <a href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(voyage.ship_name + " ship")}`}
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest border-b border-[#3e3221] border-opacity-50 hover:text-red-800 hover:border-red-800 transition-colors">
             <Ship size={10} /> View Ship History <ExternalLink size={8} />
          </a>
      </div>

      {/* Stamp Effect */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 border-4 border-red-800/40 rounded-full flex items-center justify-center transform -rotate-12 opacity-80 pointer-events-none mix-blend-multiply">
         <div className="w-14 h-14 border border-red-800/40 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-red-800/60 uppercase -rotate-12">Admitted</span>
         </div>
      </div>
    </div>
  );
};

export default VoyageCard;
