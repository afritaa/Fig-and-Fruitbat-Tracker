
import React, { useRef, useState, useEffect } from 'react';
import { Observation } from '../types.ts';

interface SpreadsheetUploadProps {
  onDataImported: (data: Omit<Observation, 'id'>[]) => void;
  shouldMinimize?: boolean;
}

const SpreadsheetUpload: React.FC<SpreadsheetUploadProps> = ({ onDataImported, shouldMinimize }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'google'>('google');
  const [gsLink, setGsLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (shouldMinimize) setIsMinimized(true);
  }, [shouldMinimize]);

  const parseCustomDate = (dateStr: string): string | null => {
    const cleanDate = dateStr.trim();
    if (!cleanDate) return null;
    const parts = cleanDate.split(/[/-]/);
    if (parts.length === 3) {
      let [d, m, y] = parts;
      if (y.length === 2) y = '20' + y;
      const day = d.padStart(2, '0');
      const month = m.padStart(2, '0');
      const year = y;
      const iso = `${year}-${month}-${day}`;
      if (!isNaN(Date.parse(iso))) return iso;
    }
    return null;
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    const importedData: Omit<Observation, 'id'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');
      const dateStr = cols[0]?.trim();
      const fruitStr = cols[1]?.trim();
      const batStr = cols[2]?.trim();
      const parsedDate = dateStr ? parseCustomDate(dateStr) : null;
      if (parsedDate) {
        importedData.push({
          date: parsedDate,
          figsDropped: Math.min(100, Math.max(0, parseInt(fruitStr) || 0)),
          bats: Math.min(100, Math.max(0, parseInt(batStr) || 0)),
          leavesDropped: 0,
        });
      }
    }
    return importedData;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = parseCSV(event.target?.result as string);
        if (data.length > 0) onDataImported(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">📊 Bulk Import</h3>
        <span>{isMinimized ? '▼' : '▲'}</span>
      </div>
      {!isMinimized && (
        <div className="p-6 border-t border-slate-50">
          <input type="file" onChange={handleFileUpload} accept=".csv" className="w-full text-sm" />
        </div>
      )}
    </div>
  );
};

export default SpreadsheetUpload;
