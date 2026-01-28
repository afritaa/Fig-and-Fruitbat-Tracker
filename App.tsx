
import React, { useState, useEffect, useRef } from 'react';
import { Observation, LocationData, FruitingPrediction, CorrelationHighlight } from './types.ts';
import ObservationForm from './components/ObservationForm.tsx';
import TrendAnalysis from './components/TrendAnalysis.tsx';
import SpreadsheetUpload from './components/SpreadsheetUpload.tsx';
import EditObservationModal from './components/EditObservationModal.tsx';
import FruitingPredictor from './components/FruitingPredictor.tsx';
import HeadlineBanner from './components/HeadlineBanner.tsx';
import Dashboard from './components/Dashboard.tsx';
import { analyzeTrends } from './services/geminiService.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'observation' | 'analysis'>('observation');
  const [observations, setObservations] = useState<Observation[]>([]);
  
  const [location, setLocation] = useState<LocationData | null>({
    suburb: 'Woombye',
    state: 'QLD',
    postcode: '4559',
    isManual: true
  });
  
  const [locationLoading, setLocationLoading] = useState(false);
  const [editingObs, setEditingObs] = useState<Observation | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [isLogExpanded, setIsLogExpanded] = useState(true);
  
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<FruitingPrediction | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationHighlight[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [suburb, setSuburb] = useState('Woombye');
  const [state, setState] = useState('QLD');
  const [postcode, setPostcode] = useState('4559');

  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fig_observations');
    if (saved) setObservations(JSON.parse(saved));
    
    const savedLoc = localStorage.getItem('fig_location');
    if (savedLoc) {
      const parsedLoc = JSON.parse(savedLoc);
      setLocation(parsedLoc);
      if (parsedLoc.isManual) {
        setSuburb(parsedLoc.suburb || 'Woombye');
        setState(parsedLoc.state || 'QLD');
        setPostcode(parsedLoc.postcode || '4559');
      }
    }

    const savedPrediction = localStorage.getItem('fig_prediction');
    if (savedPrediction) setPrediction(JSON.parse(savedPrediction));
  }, []);

  useEffect(() => {
    if (activeTab === 'observation' && isLogExpanded && logContainerRef.current) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          const todayElement = document.getElementById(`log-item-${todayStr}`);
          if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      });
    }
  }, [isLogExpanded, activeTab]);

  useEffect(() => {
    if (observations.length >= 3 && location) {
      if (analysisTimer.current) clearTimeout(analysisTimer.current);
      analysisTimer.current = setTimeout(() => {
        handleRunAnalysis();
      }, 5000); 
    }
    return () => {
      if (analysisTimer.current) clearTimeout(analysisTimer.current);
    };
  }, [observations.length, location]);

  const saveToStorage = (data: Observation[]) => {
    localStorage.setItem('fig_observations', JSON.stringify(data));
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeTrends(observations, location);
      setAnalysisText(result.text);
      setPrediction(result.prediction);
      setSources(result.sources);
      setCorrelations(result.correlations || []);
      
      if (result.prediction) {
        localStorage.setItem('fig_prediction', JSON.stringify(result.prediction));
      }

      if (result.weatherData && result.weatherData.length > 0) {
        setObservations(prev => {
          const updated = prev.map(obs => {
            const weather = result.weatherData?.find(w => w.date === obs.date);
            return weather ? { ...obs, temp: weather.temp, rainfall: weather.rainfall } : obs;
          });
          saveToStorage(updated);
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Analysis failed", err);
      setAnalysisError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddObservation = (obs: Omit<Observation, 'id'>) => {
    const existing = observations.find(o => o.date === obs.date);
    let updated;
    if (existing) {
      updated = observations.map(o => o.date === obs.date ? { ...o, ...obs } : o);
    } else {
      const newObs = { ...obs, id: Math.random().toString(36).substr(2, 9) } as Observation;
      updated = [newObs, ...observations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setObservations(updated);
    saveToStorage(updated);
  };

  const handleUpdateObservation = (id: string, updates: Partial<Observation>) => {
    const updated = observations.map(o => o.id === id ? { ...o, ...updates } : o);
    setObservations(updated);
    saveToStorage(updated);
    setEditingObs(null);
  };

  const handleBulkImport = (data: Omit<Observation, 'id'>[]) => {
    const newRecords = data.map(d => ({ ...d, id: Math.random().toString(36).substr(2, 9) }));
    setObservations(prev => {
      const importedDates = new Set(newRecords.map(r => r.date));
      const existingFiltered = prev.filter(p => !importedDates.has(p.date));
      const combined = [...newRecords, ...existingFiltered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveToStorage(combined);
      return combined;
    });
  };

  const requestGeolocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationData = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, isManual: false };
        setLocation(loc);
        localStorage.setItem('fig_location', JSON.stringify(loc));
        setLocationLoading(false);
        setShowLocationForm(false);
      },
      (err) => {
        setLocationLoading(false);
        alert("Location access denied.");
      }
    );
  };

  const saveManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const loc: LocationData = { suburb, state, postcode, isManual: true };
    setLocation(loc);
    localStorage.setItem('fig_location', JSON.stringify(loc));
    setShowLocationForm(false);
  };

  const deleteObservation = (id: string) => {
    if (window.confirm("Delete this entry?")) {
      const updated = observations.filter(o => o.id !== id);
      setObservations(updated);
      saveToStorage(updated);
    }
  };

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white text-lg shadow-lg shadow-indigo-100">🌳</div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Fig Monitor</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Bio-Log v2</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowLocationForm(!showLocationForm)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                location 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-indigo-600 text-white shadow-md'
              }`}
            >
              <span>📍</span>
              <span className="hidden sm:inline">{location ? (location.isManual ? suburb : 'GPS') : 'Loc'}</span>
            </button>

            {showLocationForm && (
              <div className="absolute right-0 top-12 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest">Site Location</h3>
                <button onClick={requestGeolocation} disabled={locationLoading} className="w-full mb-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-2">
                  {locationLoading ? 'Syncing...' : 'Use Current GPS'}
                </button>
                <form onSubmit={saveManualLocation} className="space-y-3">
                  <input type="text" placeholder="Suburb" value={suburb} onChange={e => setSuburb(e.target.value)} className="w-full p-2 text-xs border border-slate-100 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium" required />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={state} onChange={e => setState(e.target.value)} className="p-2 text-xs border border-slate-100 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="p-2 text-xs border border-slate-100 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold" maxLength={4} required />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-widest">Update Site</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      <HeadlineBanner observations={observations} prediction={prediction} />

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === 'observation' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ObservationForm onAdd={handleAddObservation} existingObservations={observations} />
            <SpreadsheetUpload onDataImported={handleBulkImport} />
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button 
                onClick={() => setIsLogExpanded(!isLogExpanded)}
                className="w-full p-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Observation Log</h3>
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-100">{observations.length}</span>
                </div>
                <span className={`text-slate-300 transition-transform duration-500 ${isLogExpanded ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {isLogExpanded && (
                <div className="px-5 pb-5">
                  <div ref={logContainerRef} className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {observations.length === 0 ? (
                      <p className="py-10 text-center text-slate-400 text-xs font-bold italic">No observations logged yet.</p>
                    ) : observations.map(obs => (
                      <div 
                        key={obs.id} 
                        id={`log-item-${obs.date}`}
                        className={`flex justify-between items-center p-3.5 rounded-xl border group transition-all duration-300 ${
                          obs.date === todayStr 
                            ? 'bg-indigo-50 border-indigo-200' 
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm">{obs.date}</p>
                          <div className="flex gap-2 text-[9px] mt-1.5 uppercase font-black">
                            <span className="text-purple-600">Bats: {obs.bats}%</span>
                            <span className="text-amber-600">Figs: {obs.figsDropped}%</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => setEditingObs(obs)} className="p-2 text-slate-400 hover:text-indigo-600">✏️</button>
                          <button onClick={() => deleteObservation(obs.id)} className="p-2 text-slate-400 hover:text-red-500">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <FruitingPredictor prediction={prediction} loading={isAnalyzing} />
            
            <Dashboard observations={observations} highlights={correlations} />

            <TrendAnalysis 
              observations={observations} 
              location={location} 
              onAnalyze={handleRunAnalysis}
              analysisText={analysisText}
              prediction={prediction}
              sources={sources}
              loading={isAnalyzing}
              error={analysisError}
            />
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 inset-x-0 z-50 px-4">
        <div className="max-w-xs mx-auto bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex p-1.5 gap-1.5">
          <button 
            onClick={() => setActiveTab('observation')}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
              activeTab === 'observation' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Log</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
              activeTab === 'analysis' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg">🔭</span>
            <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Report</span>
          </button>
        </div>
      </nav>

      {editingObs && <EditObservationModal observation={editingObs} onSave={handleUpdateObservation} onClose={() => setEditingObs(null)} />}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
