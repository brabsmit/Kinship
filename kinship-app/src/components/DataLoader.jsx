import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { setWikimediaCache } from '../utils/assetMapper';

const BASE_URL = import.meta.env.BASE_URL;

const fetchJSON = async (filename) => {
  const response = await fetch(`${BASE_URL}data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status}`);
  }
  return response.json();
};

const mergeShipCache = (familyDataRaw, shipCacheRaw) => {
  return familyDataRaw.map(p => {
    if (p.story && p.story.voyages) {
      const enrichedVoyages = p.story.voyages.map(v => {
        if (!v.specs && v.ship_name && shipCacheRaw[v.ship_name]) {
          return { ...v, specs: shipCacheRaw[v.ship_name] };
        }
        return v;
      });
      return { ...p, story: { ...p.story, voyages: enrichedVoyages } };
    }
    return p;
  });
};

const DataLoader = ({ children }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [familyDataRaw, shipCacheRaw, historyData, hitlistData, wikimediaCache] =
          await Promise.all([
            fetchJSON('family_data.json'),
            fetchJSON('ship_cache.json'),
            fetchJSON('history_data.json'),
            fetchJSON('hitlist_data.json'),
            fetchJSON('wikimedia_cache.json'),
          ]);

        const familyData = mergeShipCache(familyDataRaw, shipCacheRaw);
        setWikimediaCache(wikimediaCache);
        setData({ familyData, historyData, hitlistData });
      } catch (err) {
        console.error('Data loading failed:', err);
        setError(err.message);
      }
    };

    loadAll();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-serif">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-display text-stone-800 mb-4">
            Unable to Load Data
          </h1>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-serif">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-700 mx-auto mb-4" />
          <h1 className="text-xl font-display text-stone-700">
            Loading Family Chronicles...
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Preparing genealogy data
          </p>
        </div>
      </div>
    );
  }

  return children(data);
};

export default DataLoader;
