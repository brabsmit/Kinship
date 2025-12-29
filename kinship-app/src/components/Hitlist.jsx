import React from 'react';
import { AlertTriangle, Lightbulb, User } from 'lucide-react';
import hitlistData from '../hitlist_data.json';

const Hitlist = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-600" />
        <h1 className="text-3xl font-serif text-slate-900">Research Hitlist</h1>
      </div>

      <p className="text-slate-600 mb-8 text-lg leading-relaxed">
        The following profiles have been identified as having significant data gaps or conflicting information.
        Prioritize these for further research to improve the overall quality of the genealogy.
      </p>

      <div className="space-y-6">
        {hitlistData.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold font-serif text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  {item.name}
                </h2>
                <div className="text-sm text-slate-500 mt-1 flex gap-4">
                  <span>ID: {item.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.lineage === 'Paternal' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                    {item.lineage}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Priority Score: {item.score}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Identified Issues</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-rose-700 text-sm bg-rose-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">AI Recommendations</h3>
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                  <ul className="space-y-3">
                    {item.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-700 text-sm leading-relaxed">
                        <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hitlist;
