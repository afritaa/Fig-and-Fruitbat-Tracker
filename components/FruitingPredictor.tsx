
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-white/10 rounded-xl"></div>
          <div className="h-24 bg-white/10 rounded-xl"></div>
          <div className="h-24 bg-white/10 rounded-xl"></div>
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
              <div key={i} className="bg-white/10 border border-white/20 p-4 rounded-xl hover:bg-white/15 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">
                    {inf.label || 'Unknown Factor'}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                    inf.impact === 'positive' ? 'bg-emerald-500 text-white' : 
                    inf.impact === 'negative' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {inf.impact === 'positive' ? '↑' : inf.impact === 'negative' ? '↓' : '→'}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-indigo-50 font-bold">
                  {inf.description || 'No data provided by model.'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-6 text-center text-indigo-300 text-xs italic bg-white/5 rounded-xl border border-white/5">
              Analyzing environmental influencers...
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex gap-3">
             <span className="text-2xl opacity-50">“</span>
             <p className="text-xs text-indigo-100/90 font-bold leading-relaxed italic">
               {prediction.reasoning}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FruitingPredictor;
