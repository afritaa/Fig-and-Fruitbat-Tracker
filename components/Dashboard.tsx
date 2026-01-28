
import React, { useMemo, useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { Observation, CorrelationHighlight } from '../types.ts';
import { format, parseISO, getYear, isValid, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

interface DashboardProps {
  observations: Observation[];
  highlights?: CorrelationHighlight[];
}

const Dashboard: React.FC<DashboardProps> = ({ observations, highlights = [] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
    return () => clearTimeout(timer);
  }, []);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsFromObs = observations.map(o => {
      const d = parseISO(o.date);
      return isValid(d) ? getYear(d) : null;
    }).filter((y): y is number => y !== null);
    
    const years = Array.from(new Set([currentYear, ...yearsFromObs]));
    return years.sort((a, b) => b - a);
  }, [observations]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const domain = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1)).getTime();
    const end = endOfYear(new Date(selectedYear, 11, 31)).getTime();
    return [start, end];
  }, [selectedYear]);

  const monthTicks = useMemo(() => {
    const months = eachMonthOfInterval({
      start: new Date(selectedYear, 0, 1),
      end: new Date(selectedYear, 11, 31)
    });
    return months.map(m => m.getTime());
  }, [selectedYear]);

  const yearData = useMemo(() => {
    const data = observations
      .filter(o => {
        const d = parseISO(o.date);
        return isValid(d) && getYear(d) === selectedYear;
      })
      .map(o => ({
        ...o,
        timestamp: parseISO(o.date).getTime(),
        bats: Number(o.bats) || 0,
        figsDropped: Number(o.figsDropped) || 0,
        temp: o.temp !== undefined ? Number(o.temp) : null,
        rainfall: o.rainfall !== undefined ? Number(o.rainfall) : null,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (data.length === 0) {
      return [
        { timestamp: domain[0], bats: null, figsDropped: null, temp: null, rainfall: null },
        { timestamp: domain[1], bats: null, figsDropped: null, temp: null, rainfall: null },
      ];
    }
    return data;
  }, [observations, selectedYear, domain]);

  const handleYearChange = (dir: 'prev' | 'next') => {
    const idx = availableYears.indexOf(selectedYear);
    if (dir === 'prev' && idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]);
    if (dir === 'next' && idx > 0) setSelectedYear(availableYears[idx - 1]);
  };

  if (!mounted) {
    return (
      <div className="h-[400px] w-full bg-slate-50 border border-slate-100 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Initializing...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-2xl text-indigo-600">⚡</span> Phenology Matrix ({selectedYear})
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Environmental Correlation Chart</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleYearChange('prev')} 
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30"
            disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
          >
            ←
          </button>
          <span className="text-sm font-black text-slate-900 min-w-[3rem] text-center">{selectedYear}</span>
          <button 
            onClick={() => handleYearChange('next')} 
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30"
            disabled={availableYears.indexOf(selectedYear) === 0}
          >
            →
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={yearData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={domain}
              ticks={monthTicks}
              tickFormatter={(t) => format(t, 'MMM')}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight="bold"
            />
            <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
            <Tooltip 
              labelFormatter={(t) => format(t, 'MMM d, yyyy')}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            
            {highlights.map((h, i) => {
              const start = parseISO(h.startDate).getTime();
              const end = parseISO(h.endDate).getTime();
              if (isNaN(start) || isNaN(end)) return null;
              return (
                <ReferenceArea 
                  key={i}
                  x1={start} 
                  x2={end} 
                  fill={h.type === 'positive' ? '#ecfdf5' : '#fff1f2'} 
                  fillOpacity={0.5} 
                />
              );
            })}

            <Line 
              name="Bats (%)" 
              type="monotone" 
              dataKey="bats" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }} 
              connectNulls
            />
            <Line 
              name="Figs (%)" 
              type="monotone" 
              dataKey="figsDropped" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line 
              name="Temp (°C)" 
              type="monotone" 
              dataKey="temp" 
              stroke="#ef4444" 
              strokeWidth={1.5} 
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
