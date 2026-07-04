import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Route, Wrench, AlertCircle, X, ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { downloadCSV } from '../utils/downloadCSV';

const CyberTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg/95 border border-purple/40 rounded-xl p-3.5 backdrop-blur-md shadow-lg font-mono text-[11px]">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color || '#b44fff' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function CorridorAudit({ isDark }) {
  const [routeFilter, setRouteFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'median_delay_ratio', direction: 'desc' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedFix, setSelectedFix] = useState(null);

  // Queries
  const { data: corridors } = useQuery({
    queryKey: ['corridorAudit'],
    queryFn: () => fetch('/data/corridor_audit.json').then(res => res.json())
  });

  const { data: recs } = useQuery({
    queryKey: ['corridorRecommendations'],
    queryFn: () => fetch('/data/corridor_recommendations.json').then(res => res.json())
  });

  if (!corridors || !recs) {
    return (
      <div className="text-center py-12 text-text-secondary font-mono text-xs animate-pulse">
        DECRYPTING CORRIDOR LATENCY LEDGER...
      </div>
    );
  }

  // Find priority matching recommendation for each corridor to display in table
  const mappedCorridors = corridors.map(c => {
    const rec = recs.find(r => r.source === c.source_center && r.destination === c.destination_center);
    return {
      ...c,
      priority: rec ? rec.priority : 'P3',
      fix: rec ? rec.fix : 'Standard Audit Required'
    };
  });

  // Filters application
  const filteredCorridors = mappedCorridors.filter(c => {
    // Route Filter
    if (routeFilter !== 'All' && c.route_type_dominant !== routeFilter) return false;
    
    // Severity Filter
    if (severityFilter === '>20%' && c.median_delay_ratio <= 1.2) return false;
    if (severityFilter === '>50%' && c.median_delay_ratio <= 1.5) return false;
    if (severityFilter === '>100%' && c.median_delay_ratio <= 2.0) return false;

    // Priority Filter
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;

    return true;
  });

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCorridors = [...filteredCorridors].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }

    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCorridors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCorridors.slice(indexOfFirstItem, indexOfLastItem);

  // Grouped delay data for Recharts
  const chartData = [
    { shift: 'Morning', FTL: 1.35, Carting: 1.62 },
    { shift: 'Afternoon', FTL: 1.48, Carting: 1.75 },
    { shift: 'Evening', FTL: 1.65, Carting: 1.98 },
    { shift: 'Night', FTL: 1.95, Carting: 2.45 }
  ];

  // Helper for Priority Badge
  const getPriorityBadge = (priority) => {
    if (priority === 'P1') return 'badge-pink';
    if (priority === 'P2') return 'badge-gold';
    return 'badge-green';
  };

  // Helper for delay ratio text color
  const getDelayRatioColor = (ratio) => {
    if (ratio > 3.0) return 'text-pink';
    if (ratio >= 1.5) return 'text-gold';
    return 'text-green';
  };

  // Fix button click handler
  const handleFixClick = (corridor) => {
    const rec = recs.find(r => r.source === corridor.source_center && r.destination === corridor.destination_center);
    setSelectedFix(rec || {
      source: corridor.source_center,
      destination: corridor.destination_center,
      delay_ratio: corridor.median_delay_ratio,
      fix: 'Initiate site workflow audit and check physical truck logs.',
      priority: 'P3',
      estimated_time_saved_pct: 10,
      reasoning: 'Standard audit fallback. Segment exhibits high delays.'
    });
  };

  return (
    <div className="space-y-6 relative z-10 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 animate-count-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Route className="text-blue h-7 w-7" /> 
            <span className="gradient-text-blue">CORRIDOR INTELLIGENCE</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            CHRONIC CORRIDOR LATENCY REPORT // DIRECTIVE UPGRADE INVENTORY
          </p>
        </div>
        <button
          onClick={() => downloadCSV(
            filteredCorridors.map(c => ({
              source_center: c.source_center,
              destination_center: c.destination_center,
              median_delay_ratio: c.median_delay_ratio?.toFixed(3),
              trip_count: c.trip_count,
              pct_delayed: c.pct_delayed !== undefined ? (c.pct_delayed * 100).toFixed(1) + '%' : '',
              avg_distance_km: c.avg_distance?.toFixed(2),
              route_type: c.route_type_dominant,
              peak_delay_time: c.peak_delay_time,
              priority: c.priority,
              fix_recommendation: c.fix,
            })),
            'deliveryiq_corridor_audit'
          )}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 cursor-pointer"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card border border-purple/20 p-5 glow-purple flex flex-wrap gap-6 items-center justify-between">
        <div className="flex flex-wrap gap-6 items-center">
          {/* Route Type */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Route Mode</span>
            <div className="flex bg-bg p-0.5 rounded-lg border border-border/50">
              {['All', 'FTL', 'Carting'].map(t => (
                <button
                  key={t}
                  onClick={() => { setRouteFilter(t); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${
                    routeFilter === t ? 'bg-purple/20 text-purple border border-purple/30' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Delay Severity */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Delay Threshold</span>
            <div className="flex bg-bg p-0.5 rounded-lg border border-border/50">
              {['All', '>20%', '>50%', '>100%'].map(s => (
                <button
                  key={s}
                  onClick={() => { setSeverityFilter(s); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${
                    severityFilter === s ? 'bg-purple/20 text-purple border border-purple/30' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Action Priority</span>
            <div className="flex bg-bg p-0.5 rounded-lg border border-border/50">
              {['All', 'P1', 'P2', 'P3'].map(p => (
                <button
                  key={p}
                  onClick={() => { setPriorityFilter(p); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${
                    priorityFilter === p ? 'bg-purple/20 text-purple border border-purple/30' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue/10 px-3.5 py-2 rounded-xl border border-blue/20 text-center">
          <span className="text-[9px] text-text-secondary block font-bold uppercase tracking-widest mb-0.5">Filter Result</span>
          <span className="text-sm font-bold text-blue">{filteredCorridors.length} / 50 Segments</span>
        </div>
      </div>

      {/* Corridor Audit Table */}
      <div className="glass-card border border-purple/20 rounded-2xl overflow-hidden shadow-lg glow-purple">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg border-b border-border/40 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('source_center')}>
                  Source Center ID <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('destination_center')}>
                  Destination ID <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('median_delay_ratio')}>
                  Delay Multiplier <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('trip_count')}>
                  Trip Index <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('pct_delayed')}>
                  % SLA Breach <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('route_type_dominant')}>
                  Route Mode <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 cursor-pointer hover:text-text-primary" onClick={() => requestSort('priority')}>
                  Priority Rank <ArrowUpDown className="h-3 w-3 inline ml-1 text-purple" />
                </th>
                <th className="p-4 text-center">Directive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {currentItems.length > 0 ? (
                currentItems.map((corridor, idx) => (
                  <tr key={idx} className="hover:bg-purple/5 transition duration-150 odd:bg-card even:bg-bg-2">
                    <td className="p-4 font-bold text-text-primary">{corridor.source_center}</td>
                    <td className="p-4 font-bold text-text-primary">{corridor.destination_center}</td>
                    <td className={`p-4 font-extrabold ${getDelayRatioColor(corridor.median_delay_ratio)}`}>
                      {corridor.median_delay_ratio.toFixed(2)}x
                    </td>
                    <td className="p-4 text-text-secondary">{corridor.trip_count.toLocaleString()}</td>
                    <td className="p-4 text-text-secondary">{(corridor.pct_delayed * 100).toFixed(0)}%</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        corridor.route_type_dominant === 'FTL' ? 'badge-blue' : 'badge-gold'
                      }`}>
                        {corridor.route_type_dominant}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`${getPriorityBadge(corridor.priority)} font-bold text-[9px] uppercase tracking-wider`}>
                        {corridor.priority}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleFixClick(corridor)}
                        className="cyber-btn px-2.5 py-1 text-[9px] font-bold tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                        style={{ border: '1px solid rgba(255, 45, 120, 0.4)', background: 'rgba(255, 45, 120, 0.08)', color: '#ff2d78' }}
                      >
                        <Wrench className="h-2.5 w-2.5 inline mr-1 text-pink" /> FIX ROUTE
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-secondary">No corridors match active filter specifications.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="bg-bg p-4 border-t border-border/20 flex items-center justify-between text-xs text-text-secondary select-none">
            <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
            <div className="flex space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-purple" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 text-purple" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delay Multipliers chart */}
      <div className="glass-card border border-purple/20 p-6 glow-purple relative overflow-hidden flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-text-primary uppercase mb-1">
            Typical Delay Ratio by Segment Mode vs Shift
          </h2>
          <p className="text-[10px] text-text-secondary mb-4">SEGMENT DELAY DURATION INDEX</p>
        </div>
        
        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
              <XAxis dataKey="shift" stroke="#6b6b9a" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b6b9a" fontSize={10} tickLine={false} domain={[0, 3.0]} ticks={[0, 1.0, 2.0, 3.0]} />
              <Tooltip content={<CyberTooltip />} cursor={{ fill: 'rgba(180, 79, 255, 0.02)' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', color: '#e8e8ff', fontFamily: 'monospace' }} />
              <Bar dataKey="FTL" fill="#b44fff" fillOpacity={0.8} radius={[4, 4, 0, 0]} maxBarSize={25} />
              <Bar dataKey="Carting" fill="#00d4ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} maxBarSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Corridor Fix Modal */}
      {selectedFix && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="glass-card border border-pink/50 max-w-md w-full overflow-hidden shadow-[0_0_40px_rgba(255,45,120,0.3)] relative animate-in fade-in zoom-in-95 duration-200 glow-pink">
            {/* Header */}
            <div className="bg-bg/95 p-5 border-b border-border/40 flex justify-between items-start">
              <div>
                <span className="text-[10px] text-pink font-bold uppercase tracking-widest">
                  // ROUTING INTERVENTION DIRECTIVE
                </span>
                <h3 className="text-sm font-bold text-text-primary mt-1 font-mono">
                  {selectedFix.source} → {selectedFix.destination}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedFix(null)}
                className="p-1 rounded-lg border border-border hover:border-pink/50 bg-card/60 text-text-secondary hover:text-pink transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Action Priority Rank:</span>
                <span className={`${getPriorityBadge(selectedFix.priority)} font-bold text-[9px] uppercase tracking-wider`}>
                  {selectedFix.priority}
                </span>
              </div>

              {/* Fix Card */}
              <div className="bg-bg/60 p-4 rounded-xl border border-pink/30 space-y-2">
                <span className="text-[9px] font-bold text-pink uppercase flex items-center gap-1.5 tracking-wider">
                  <AlertCircle className="h-3.5 w-3.5" /> Prescribed Intervention
                </span>
                <p className="text-[11px] text-text-primary leading-relaxed font-bold font-mono">
                  {selectedFix.fix}
                </p>
              </div>

              {/* Time saved */}
              <div className="flex items-center justify-between border-t border-b border-border/20 py-3 text-xs">
                <span className="text-text-secondary">Expected System Latency Savings:</span>
                <span className="text-sm font-bold text-green">-{selectedFix.estimated_time_saved_pct}% Transit Time</span>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <span className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">// ALGORITHMIC JUSTIFICATION</span>
                <p className="text-[10px] text-text-secondary leading-relaxed bg-bg/80 p-3.5 rounded-lg border border-border/40 font-mono">
                  {selectedFix.reasoning}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-bg p-4 border-t border-border/40 flex justify-end">
              <button
                onClick={() => setSelectedFix(null)}
                className="cyber-btn px-4 py-2 text-xs font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: '1px solid rgba(0, 255, 136, 0.4)', background: 'rgba(0, 255, 136, 0.08)', color: '#00ff88' }}
              >
                Acknowledge Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
