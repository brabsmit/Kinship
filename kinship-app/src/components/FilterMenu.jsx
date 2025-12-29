import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, BookOpen, X, Check, Tag } from 'lucide-react';

const FilterMenu = ({
    storyMode,
    setStoryMode,
    selectedBranchId,
    setSelectedBranchId,
    selectedLineage,
    setSelectedLineage,
    viewMode,
    branches,
    selectedTag,
    setSelectedTag,
    tagConfig,
    narrativeThreads,
    selectedThreadId,
    setSelectedThreadId
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const activeFilterCount = [
        storyMode,
        selectedTag,
        selectedThreadId
    ].filter(Boolean).length;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-center relative ${
                    isOpen || activeFilterCount > 0
                        ? 'bg-[#FFF8E1] border-[#F59E0B] text-[#F59E0B] shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
                title="Filter Settings"
            >
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <SlidersHorizontal size={14} /> View Settings
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">

                        {/* Story Mode Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${storyMode ? 'bg-[#FFF8E1] text-[#F59E0B]' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800 block">Story Mode</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Highlight Biographies</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setStoryMode(!storyMode)}
                                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                                    storyMode ? 'bg-[#F59E0B]' : 'bg-gray-200'
                                }`}
                            >
                                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${
                                    storyMode ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                            </button>
                        </div>

                         {/* Lineage Selector */}
                         <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Lineage
                            </label>
                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                {['Paternal', 'Maternal'].map(lin => (
                                    <button
                                        key={lin}
                                        onClick={() => setSelectedLineage(lin)}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                                            selectedLineage === lin
                                            ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                        }`}
                                    >
                                        {lin}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Branch Selector - Visible if Tree View (Graph) is active */}
                        {viewMode === 'graph' && (
                             <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Family Branch
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(branches).map(([id, name]) => (
                                        <button
                                            key={id}
                                            onClick={() => setSelectedBranchId(id)}
                                            className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-all border flex items-center gap-2 ${
                                                selectedBranchId === id
                                                ? (selectedLineage === 'Paternal' ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm' : 'bg-[#831843] text-white border-[#831843] shadow-sm')
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className={`flex items-center justify-center w-5 h-5 rounded text-[10px] ${selectedBranchId === id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                                {id}
                                            </span>
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tag Filters */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Filter by Tag
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        !selectedTag
                                        ? 'bg-gray-800 text-white border-gray-800'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    All
                                </button>
                                {tagConfig && Object.keys(tagConfig).filter(t => t !== 'default').map(tag => {
                                     const conf = tagConfig[tag];
                                     const isActive = selectedTag === tag;
                                     return (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(isActive ? null : tag)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
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
                        </div>

                        {/* Narrative Epics - Filter */}
                        {narrativeThreads && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Filter by Epic
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => setSelectedThreadId(null)}
                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-left flex items-center gap-2 ${
                                            !selectedThreadId
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <X size={12} /> Clear Epic Filter
                                    </button>
                                    {narrativeThreads.map(thread => {
                                        const isActive = selectedThreadId === thread.id;
                                        return (
                                            <button
                                                key={thread.id}
                                                onClick={() => setSelectedThreadId(isActive ? null : thread.id)}
                                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-left flex items-center gap-2 ${
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
                        )}

                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400">
                            Showing settings for {viewMode === 'graph' ? 'Graph' : 'List'} View
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
