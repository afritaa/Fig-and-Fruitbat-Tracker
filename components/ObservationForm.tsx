
import React, { useState, useEffect } from 'react';
import { Observation } from '../types.ts';

interface ObservationFormProps {
  onAdd: (obs: Omit<Observation, 'id'>) => void;
  existingObservations: Observation[];
}

const ObservationForm: React.FC<ObservationFormProps> = ({ onAdd, existingObservations }) => {
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString());
  const [bats, setBats] = useState(0);
  const [figsDropped, setFigsDropped] = useState(0);
  const [leavesDropped, setLeavesDropped] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const existing = existingObservations.find(o => o.date === date);
    if (existing) {
      setBats(existing.bats);
      setFigsDropped(existing.figsDropped);
      setLeavesDropped(existing.leavesDropped);
    } else {
      setBats(0);
      setFigsDropped(0);
      setLeavesDropped(0);
    }
  }, [date, existingObservations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ date, bats, figsDropped, leavesDropped });
  };

  const SliderField = ({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className={`text-sm font-bold px-2 py-0.5 rounded ${color}`}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">📝</span> Log Observation
        </h3>
        <span className={`text-slate-400 transition-transform duration-300 ${isMinimized ? '' : 'rotate-180'}`}>
          ▼
        </span>
      </div>
      
      {!isMinimized && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>

          <SliderField 
            label="Fruitbat Activity" 
            value={bats} 
            onChange={setBats} 
            color="bg-purple-100 text-purple-700"
          />
          
          <SliderField 
            label="Figs Dropped" 
            value={figsDropped} 
            onChange={setFigsDropped} 
            color="bg-amber-100 text-amber-700"
          />
          
          <SliderField 
            label="Leaves Dropped" 
            value={leavesDropped} 
            onChange={setLeavesDropped} 
            color="bg-emerald-100 text-emerald-700"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            {existingObservations.find(o => o.date === date) ? 'Update Entry' : 'Save Daily Entry'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ObservationForm;
