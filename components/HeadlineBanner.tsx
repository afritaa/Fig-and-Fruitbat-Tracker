
import React from 'react';
import { Observation, FruitingPrediction } from '../types.ts';

interface HeadlineBannerProps {
  observations: Observation[];
  prediction: FruitingPrediction | null;
}

const HeadlineBanner: React.FC<HeadlineBannerProps> = ({ observations, prediction }) => {
  const getStatus = () => {
    if (observations.length === 0) return { type: 'idle', text: "Ready to Log", subtext: "Awaiting site data." };
    const latest = [...observations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latest.figsDropped > 15) return { type: 'active', text: "Fruiting Peak", subtext: "Resource abundance detected." };
    return { type: 'monitor', text: "Monitoring Trends", subtext: "Analyzing local phenology." };
  };

  const status = getStatus();

  return (
    <div className="py-5 px-6 border-b bg-indigo-50 border-indigo-200">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 animate-pulse" />
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-none">{status.text}</h2>
          <p className="text-[11px] text-slate-500 font-bold mt-1">{status.subtext}</p>
        </div>
      </div>
    </div>
  );
};

export default HeadlineBanner;
