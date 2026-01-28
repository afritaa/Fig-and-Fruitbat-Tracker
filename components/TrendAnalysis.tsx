
import React from 'react';
import { Observation, LocationData, FruitingPrediction } from '../types.ts';

interface TrendAnalysisProps {
  observations: Observation[];
  location: LocationData | null;
  onAnalyze: () => void;
  analysisText: string | null;
  prediction: FruitingPrediction | null;
  sources: any[];
  loading: boolean;
  error?: string | null;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ 
  observations, 
  onAnalyze, 
  analysisText, 
  sources, 
  loading,
  error
}) => {
  const isDataInsufficient = observations.length < 3;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🌱</span> Site Ecosystem Report
          </h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Weather-Synced Phenology</p>
        </div>
        {!loading && (analysisText || error) && (
           <button
           onClick={onAnalyze}
           className="p-2 rounded-xl bg-slate-50 text-indigo-600 border border-slate-200 hover:bg-indigo-50 transition-colors"
           title="Re-run analysis"
         >
           🔄
         </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl mb-6">
          <p className="text-rose-800 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>⚠️</span> Configuration Error
          </p>
          <p className="text-rose-600 text-sm font-medium leading-relaxed">
            {error}
          </p>
          <p className="text-rose-400 text-[10px] font-bold mt-2 uppercase tracking-tighter">
            Tip: Ensure your API_KEY is set in Netlify Environment Variables.
          </p>
        </div>
      )}

      {isDataInsufficient && !error && (
        <div className="bg-slate-50 p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-500 font-bold text-sm">
            AI analysis requires 3+ observations to establish a baseline.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-16 space-y-5">
          <div className="w-12 h-12 border-[5px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-slate-900 font-black text-sm uppercase tracking-tighter">Syncing Local BOM Data...</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1">Comparing rainfall and heatwaves in your suburb</p>
          </div>
        </div>
      )}

      {analysisText && !loading && !error && (
        <div className="space-y-6">
          <div className="prose prose-sm max-w-none text-slate-600 font-medium leading-relaxed">
            {analysisText.split('\n').map((line, i) => {
              if (line.startsWith('#')) {
                  const level = line.match(/^#+/)?.[0].length || 1;
                  const classes = level === 1 
                    ? "text-lg font-black text-slate-900 mt-6 mb-3" 
                    : "text-md font-bold text-slate-800 mt-5 mb-2";
                  return <div key={i} className={classes}>{line.replace(/#/g, '').trim()}</div>;
              }
              if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 mb-2">{line.substring(1).trim()}</li>;
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="mb-3">{line}</p>;
            })}
          </div>

          {sources.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Scientific Grounding</h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((chunk, i) => (
                  chunk.web && (
                    <a 
                      key={i} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white text-slate-600 font-bold transition-all"
                    >
                      🔗 {chunk.web.title || 'Source'}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!analysisText && !loading && !isDataInsufficient && !error && (
        <div className="text-center py-16 bg-indigo-50/20 rounded-2xl border border-indigo-100/50">
          <div className="text-5xl mb-4">🌍</div>
          <h4 className="text-slate-900 font-black text-lg">Report Ready</h4>
          <button
            onClick={onAnalyze}
            className="mt-6 px-8 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-xs uppercase tracking-widest"
          >
            Launch Report
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;
