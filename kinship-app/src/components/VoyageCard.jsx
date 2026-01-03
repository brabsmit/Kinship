import React from 'react';
import { Ship, Anchor, MapPin, Calendar, Wind } from 'lucide-react';
import { ASSETS } from '../utils/assetMapper';

const VoyageCard = ({ voyage }) => {
  if (!voyage) return null;

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
                <span className="font-bold block leading-tight">{voyage.departure}</span>
             </div>
             <div className="text-right pl-2">
                <span className="block text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Arrival</span>
                <span className="font-bold block leading-tight">{voyage.arrival}</span>
             </div>
        </div>

        <div className="flex justify-between items-center border-t-2 border-[#3e3221] pt-2">
             <div className="flex items-center gap-2">
                <Calendar size={14} />
                <div className="text-lg font-bold">{voyage.year !== "Unknown" ? voyage.year : ""}</div>
             </div>
             <div className="px-2 py-1 border border-[#3e3221] rounded text-xs font-bold uppercase tracking-widest bg-[#eaddcf]">
                {voyage.class || "Passenger"}
             </div>
        </div>
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
