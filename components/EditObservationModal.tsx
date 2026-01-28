
import React, { useState } from 'react';
import { Observation } from '../types';

interface EditObservationModalProps {
  observation: Observation;
  onSave: (id: string, updates: Partial<Observation>) => void;
  onClose: () => void;
}

const EditObservationModal: React.FC<EditObservationModalProps> = ({ observation, onSave, onClose }) => {
  const [bats, setBats] = useState(observation.bats);
  const [figs, setFigs] = useState(observation.figsDropped);
  const [leaves, setLeaves] = useState(observation.leavesDropped);

  const SliderField = ({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Edit Log</h3>
              <p className="text-sm text-slate-500 font-medium">{observation.date}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">✕</button>
          </div>
          
          <div className="space-y-6 my-8">
            <SliderField label="Bats" value={bats} onChange={setBats} color="bg-purple-100 text-purple-700" />
            <SliderField label="Figs Dropped" value={figs} onChange={setFigs} color="bg-amber-100 text-amber-700" />
            <SliderField label="Leaves Dropped" value={leaves} onChange={setLeaves} color="bg-emerald-100 text-emerald-700" />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(observation.id, { bats, figsDropped: figs, leavesDropped: leaves })}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditObservationModal;
