import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

interface PropertyMatchScoreProps {
  score?: number;
  reasons?: string[];
  unmatched?: string[];
  compact?: boolean;
}

export const PropertyMatchScore: React.FC<PropertyMatchScoreProps> = ({
  score = 85,
  reasons = [],
  unmatched = [],
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Score coloring
  let badgeColor = 'bg-emerald-500 text-white';
  let pillBg = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  let starRating = '★★★★★';

  if (score < 60) {
    badgeColor = 'bg-amber-500 text-white';
    pillBg = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    starRating = '★★★☆☆';
  } else if (score < 80) {
    badgeColor = 'bg-blue-600 text-white';
    pillBg = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    starRating = '★★★★☆';
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold ${pillBg}`}>
        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span>{score}% Match</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3 shadow-xs">
      <div 
        onClick={() => setShowDetails(prev => !prev)}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${badgeColor}`}>
            {score}%
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Property Intelligence Match</span>
              <span className="text-amber-500 text-xs">{starRating}</span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Computed based on your location, budget, & amenity preferences
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="p-1 rounded text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Structured Explainable Rationale */}
      {(showDetails || reasons.length > 0) && (
        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}

          {unmatched && unmatched.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
