
import React from 'react';
import { FruitingPrediction } from '../types';

interface FruitingPredictorProps {
  prediction: FruitingPrediction | null;
  loading: boolean;
}

const FruitingPredictor: React.FC<FruitingPredictorProps> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg animate-pulse">
        <div className="h-4 w-32 bg-white/20 rounded mb-4"></div>
        <div className="h-8 w-64 bg-white/30 rounded mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-white/10 rounded-xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-white/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <span className="text-8xl">🍒</span>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-indigo-500/30 text-indigo-100 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-indigo-400/30">
            Phenology Forecast
          </span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
          <span className="text-xs font-bold text-indigo-200">Confidence: {prediction.confidence}%</span>
        </div>

        <div className="mb-6">
          <h2 className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1 opacity-80">Estimated Fruiting Window</h2>
          <div className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
            {prediction.window}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prediction.influencers && prediction.influencers.length > 0 ? (
            prediction.influencers.map((inf, i) => (
              <div key={i} className="bg-white/10 border border-white/10 p-4 rounded-xl hover:bg-white/15 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-100 tracking-wider">
                    {inf.label || 'Unknown Factor'}
                  </span>
                  <span className={`text-sm font-black ${
                    inf.impact === 'positive' ? 'text-emerald-400' : 
                    inf.impact === 'negative' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {inf.impact === 'positive' ? '↑' : inf.impact === 'negative' ? '↓' : '→'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-white font-medium">
                  {inf.description || 'No data provided by model.'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-indigo-300 text-xs italic opacity-60">
              Awaiting influencer data correlation...
            </div>
          )}
        </div>
        
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-xs text-indigo-100/90 font-medium leading-relaxed italic">
            "{prediction.reasoning}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default FruitingPredictor;
