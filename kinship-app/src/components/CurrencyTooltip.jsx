
import React, { useState } from 'react';
import { calculatePurchasingPower, calculateLaborValue, formatCurrency } from '../utils/economics';

const CurrencyTooltip = ({ originalText, amount, currency, year }) => {
    const [isHovered, setIsHovered] = useState(false);

    const purchasingPower = calculatePurchasingPower(amount, year, currency);
    const laborValue = calculateLaborValue(amount, year, currency);

    const formattedPP = formatCurrency(purchasingPower, currency);
    const formattedLV = formatCurrency(laborValue, currency);

    return (
        <span
            className="relative inline-block cursor-help border-b border-dashed border-gray-400 group text-gray-900 font-medium"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {originalText}

            {/* Tooltip */}
            {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1 uppercase tracking-widest text-[10px]">
                        Economic Context ({year})
                    </div>
                    <div className="space-y-2 mt-2">
                        <div>
                            <span className="block text-emerald-400 font-bold text-sm">{formattedPP}</span>
                            <span className="text-gray-400 block text-[10px]">Purchasing Power Parity</span>
                        </div>
                        <div>
                            <span className="block text-amber-400 font-bold text-sm">{formattedLV}</span>
                            <span className="text-gray-400 block text-[10px]">Labor Value (Prestige Equivalent)</span>
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </span>
    );
};

export default CurrencyTooltip;
