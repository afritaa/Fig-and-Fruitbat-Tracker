
import React from 'react';
import { Observation, FruitingPrediction } from '../types';

interface HeadlineBannerProps {
  observations: Observation[];
  prediction: FruitingPrediction | null;
}

const HeadlineBanner: React.FC<HeadlineBannerProps> = ({ observations, prediction }) => {
  const getStatus = () => {
    if (observations.length === 0) {
      return { 
        type: 'empty', 
        text: "System Ready", 
        subtext: "Waiting for your first site observation...", 
        estLabel: "Status",
        estValue: "Offline" 
      };
    }
    
    const sorted = [...observations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    
    // Check if anything significant is in progress (Fruit drop > 15% or high bat activity)
    const isActive = latest.figsDropped > 15 || latest.bats > 40;

    if (isActive) {
      return {
        type: 'current',
        text: latest.figsDropped > 15 ? "Active Fruiting Period" : "High Foraging Activity",
        subtext: "Short-term resource peak detected for local ecosystem.",
        estLabel: "Estimated End",
        estValue: "In Progress"
      };
    }

    if (prediction) {
      return {
        type: 'next',
        text: "Next Major Event Window",
        subtext: `Based on local weather correlations: ${prediction.window}`,
        estLabel: "Est. Return",
        estValue: prediction.window
      };
    }

    return {
      type: 'idle',
      text: "Quiescent Growth Cycle",
      subtext: "No immediate peaks detected. Monitoring dormant trends.",
      estLabel: "Status",
      estValue: "Monitoring"
    };
  };

  const status = getStatus();

  return (
    <div className={`py-5 px-6 border-b transition-all duration-700 ${
      status.type === 'current' 
        ? 'bg-amber-50 border-amber-200' 
        : 'bg-indigo-50 border-indigo-200'
    }`}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full animate-ping absolute inset-0 ${
              status.type === 'current' ? 'bg-amber-500' : 'bg-indigo-500'
            }`} />
            <div className={`w-3.5 h-3.5 rounded-full relative shadow-sm border-2 border-white ${
              status.type === 'current' ? 'bg-amber-600' : 'bg-indigo-600'
            }`} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
              {status.text}
            </h2>
            <p className="text-[11px] text-slate-500 font-bold italic">{status.subtext}</p>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-white/50 shadow-sm min-w-[140px] text-center sm:text-right">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
            {status.estLabel}
          </span>
          <p className="text-sm font-black text-slate-800">
            {status.estValue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeadlineBanner;
