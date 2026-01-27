
import React, { useRef, useState, useEffect } from 'react';
import { Observation } from '../types';

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
    const nativeDate = new Date(cleanDate);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate.toISOString().split('T')[0];
    }
    return null;
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    const importedData: Omit<Observation, 'id'>[] = [];
    const firstLine = lines[0]?.toLowerCase() || '';
    const startIdx = (firstLine.includes('date') || firstLine.includes('fruit') || firstLine.includes('bat')) ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
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
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = parseCSV(event.target?.result as string);
      if (data.length > 0) {
        onDataImported(data);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert("Could not find valid data. Ensure format is: Col A: Date (DD/MM/YY), Col B: Fruit, Col C: Bats.");
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleSheetsImport = async () => {
    if (!gsLink.includes('docs.google.com/spreadsheets')) {
      alert("Please enter a valid Google Sheets URL.");
      return;
    }
    setLoading(true);
    try {
      const sheetIdMatch = gsLink.match(/\/d\/([^/]+)/);
      if (!sheetIdMatch) throw new Error("Could not extract Sheet ID");
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error("Failed to fetch sheet.");
      const text = await response.text();
      const data = parseCSV(text);
      if (data.length > 0) {
        onDataImported(data);
        setGsLink('');
      } else {
        alert("No valid data found in the spreadsheet.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="text-xl">📊</span> Bulk Import
        </h3>
        <span className={`text-slate-400 transition-transform duration-300 ${isMinimized ? '' : 'rotate-180'}`}>
          ▼
        </span>
      </div>

      {!isMinimized && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <div className="flex border-b border-slate-100 px-6">
            <button 
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'google' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Google Sheets
            </button>
            <button 
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'file' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              CSV
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'file' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processFile(file);
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm font-medium text-slate-700">Drop your CSV here</p>
                <p className="text-xs text-slate-400 mt-1">Col A: Date (DD/MM/YY) | Col B: Fruit | Col C: Bats</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              </div>
            ) : (
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Paste Google Sheets Share Link..."
                  value={gsLink}
                  onChange={(e) => setGsLink(e.target.value)}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleGoogleSheetsImport}
                  disabled={loading || !gsLink}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {loading ? 'Fetching...' : 'Connect & Import'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetUpload;
