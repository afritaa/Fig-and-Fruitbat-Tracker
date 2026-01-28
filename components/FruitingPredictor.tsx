
import React from 'react';
import { FruitingPrediction } from '../types.ts';

interface FruitingPredictorProps {
  prediction: FruitingPrediction | null;
  loading: boolean;
}

const FruitingPredictor: React.FC<FruitingPredictorProps> = ({ prediction, loading }) => {
  if (loading) return <div className="bg-indigo-600 rounded-2xl p-6 h-32 animate-pulse" />;
  if (!prediction) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
      <h2 className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">Estimated Fruiting Window</h2>
      <div className="text-3xl font-black">{prediction.window}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {prediction.influencers?.map((inf, i) => (
          <div key={i} className="bg-white/10 p-4 rounded-xl">
            <div className="text-[10px] font-black uppercase text-indigo-200">{inf.label}</div>
            <p className="text-xs mt-1">{inf.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FruitingPredictor;
