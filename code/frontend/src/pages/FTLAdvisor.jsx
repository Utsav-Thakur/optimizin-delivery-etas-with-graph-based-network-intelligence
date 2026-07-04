import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Truck, ChevronDown, ChevronUp, Compass, Download } from 'lucide-react';
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

export default function FTLAdvisor({ isDark }) {
  const [distance, setDistance] = useState('Short (<50km)');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [riskTier, setRiskTier] = useState('Low');
  const [expandWhy, setExpandWhy] = useState(false);

  // Fetch rules lookup table
  const { data: rules } = useQuery({
    queryKey: ['ftlAdvisorRules'],
    queryFn: () => fetch('/data/ftl_advisor_rules.json').then(res => res.json())
  });

  // Find matching rule
  const matchedRule = rules
    ? rules.find(r => 
        r.distance_band === distance && 
        r.time_of_day === timeOfDay && 
        r.betweenness_tier === riskTier
      )
    : null;

  // Recharts delay comparison by distance band
  const lineData = [
    { name: 'Short (<50km)', FTL: 1.62, Carting: 1.28 },
    { name: 'Medium (50-200km)', FTL: 1.74, Carting: 1.65 },
    { name: 'Long (>200km)', FTL: 1.83, Carting: 2.14 }
  ];

  const getDecisionGlow = () => {
    if (!matchedRule) return 'glow-purple border-purple/30';
    return matchedRule.recommended_route === 'FTL' ? 'glow-blue border-blue/40' : 'glow-pink border-pink/40';
  };

  return (
    <div className="space-y-6 relative z-10 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 animate-count-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="text-gold h-7 w-7" /> 
            <span className="gradient-text-pink">ROUTE INTELLIGENCE ENGINE</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Powered by Embedded XGBoost · Zero API Calls · Instant Decisions
          </p>
        </div>
        {rules && (
          <button
            onClick={() => downloadCSV(
              rules.map(r => ({
                distance_band: r.distance_band,
                time_of_day: r.time_of_day,
                betweenness_tier: r.betweenness_tier,
                recommended_route: r.recommended_route,
                confidence_pct: r.confidence !== undefined ? (r.confidence * 100).toFixed(1) + '%' : '',
                avg_delay_ratio: r.avg_delay_ratio?.toFixed(3),
                trip_count: r.trip_count,
                reasoning: r.reasoning ?? '',
              })),
              'deliveryiq_ftl_decision_rules'
            )}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 cursor-pointer"
            style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}
          >
            <Download className="h-3.5 w-3.5" /> Export Rules CSV
          </button>
        )}
      </div>

      {/* Selectors Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left selectors & results */}
        <div className="glass-card border border-purple/20 p-6 lg:col-span-2 space-y-6 glow-purple">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">// PARAMETER WEIGHT COEFFICIENTS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Distance Band */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Distance Band</span>
              <div className="flex flex-col bg-bg p-1.5 rounded-xl border border-border/50 space-y-1.5">
                {['Short (<50km)', 'Medium (50-200km)', 'Long (>200km)'].map(d => {
                  const isActive = distance === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDistance(d)}
                      className={`px-3 py-2 rounded-lg text-left text-[10px] font-bold transition border border-transparent ${
                        isActive 
                          ? 'border-purple/40 bg-purple/15 text-purple glow-purple' 
                          : 'text-text-secondary hover:text-text-primary bg-bg/50'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time of Day */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Time of Day Shift</span>
              <div className="flex flex-col bg-bg p-1.5 rounded-xl border border-border/50 space-y-1.5">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map(t => {
                  const isActive = timeOfDay === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTimeOfDay(t)}
                      className={`px-3 py-2 rounded-lg text-left text-[10px] font-bold transition border border-transparent ${
                        isActive 
                          ? 'border-blue/40 bg-blue/15 text-blue glow-blue' 
                          : 'text-text-secondary hover:text-text-primary bg-bg/50'
                      }`}
                    >
                      {t.toUpperCase()} SHIFT
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hub Risk Tier */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Source Congestion</span>
              <div className="flex flex-col bg-bg p-1.5 rounded-xl border border-border/50 space-y-1.5">
                {['Low', 'Medium', 'High'].map(r => {
                  const isActive = riskTier === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRiskTier(r)}
                      className={`px-3 py-2 rounded-lg text-left text-[10px] font-bold transition border border-transparent ${
                        isActive 
                          ? 'border-pink/40 bg-pink/15 text-pink glow-pink' 
                          : 'text-text-secondary hover:text-text-primary bg-bg/50'
                      }`}
                    >
                      {r.toUpperCase()} RISK
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Model Output Card */}
          {matchedRule ? (
            <div className={`glass-card p-6 border relative overflow-hidden transition-all duration-300 ${getDecisionGlow()}`}>
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/25 pb-4 mb-4">
                <div>
                  <span className="text-[8px] text-text-secondary block uppercase font-bold tracking-widest">
                    // MODE DIRECTIVE REC
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-block px-4 py-2 text-xl font-black rounded-xl bg-bg border border-border tracking-widest text-transparent bg-clip-text gradient-text-cyber uppercase">
                      {matchedRule.recommended_route}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-text-secondary block uppercase font-bold tracking-widest">
                    EXPECTED SEGMENT LATENCY
                  </span>
                  <span className="text-lg font-extrabold text-gold tracking-tight block mt-1">
                    {matchedRule.expected_delay_ratio.toFixed(2)}x OSRM
                  </span>
                </div>
              </div>

              {/* Confidence progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                  <span>ML CLASSIFIER CONFIDENCE</span>
                  <span className="text-green font-extrabold">{(matchedRule.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-bg rounded-full overflow-hidden border border-border/50">
                  <div 
                    className="h-full bg-green rounded-full transition-all duration-700 glow-green"
                    style={{ width: `${matchedRule.confidence * 100}%`, boxShadow: '0 0 8px #00ff88' }}
                  />
                </div>
              </div>

              {/* Reasoning */}
              <div className="text-xs text-text-secondary pt-4">
                <span className="text-[9px] font-bold text-text-primary uppercase tracking-widest block mb-2">
                  // LOGISTICS CORE DECISION STREAM
                </span>
                <p className="leading-relaxed bg-bg/80 p-4 rounded-xl border border-border/40 text-[11px] text-text-primary font-mono whitespace-pre-line leading-relaxed">
                  {matchedRule.reasoning_text}
                </p>
              </div>

              {/* Expandable Explanation */}
              <div className="pt-3">
                <button
                  onClick={() => setExpandWhy(!expandWhy)}
                  className="flex items-center gap-1 text-[10px] text-blue font-bold hover:underline tracking-wider cursor-pointer"
                >
                  {expandWhy ? (
                    <>HIDE CORE SHIFT TRADEOFF LOGS <ChevronUp className="h-3.5 w-3.5" /></>
                  ) : (
                    <>EXPAND CORE SHIFT TRADEOFF LOGS <ChevronDown className="h-3.5 w-3.5" /></>
                  )}
                </button>
                {expandWhy && (
                  <div className="mt-3 text-[10px] text-text-secondary leading-relaxed bg-blue/5 p-4 rounded-xl border border-blue/20 space-y-2.5">
                    <p>
                      <b className="text-blue">XGBoost Feature Split Trace:</b> Long-distance segments (&gt;200km) have higher fixed loading costs but bypass local sorting hops. FTL shows superior speed on highway systems.
                    </p>
                    <p>
                      On short-haul corridors, FTL vehicles accumulate delay during hub consolidation waits. Carting operates on fluid continuous loops, minimizing delays under 50km.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-text-secondary font-mono text-xs animate-pulse">
              RESOLVING SYSTEM WEIGHT PARAMS...
            </div>
          )}
        </div>

        {/* Right Info Panels */}
        <div className="space-y-6">
          <div className="glass-card border border-purple/20 p-5 glow-purple relative overflow-hidden">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-1.5 border-b border-border/20 pb-2 mb-3">
              <Compass className="h-4 w-4 text-blue animate-spin" style={{ animationDuration: '10s' }} /> Mode Delay Crossover
            </h3>
            <div className="h-44 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b6b9a" fontSize={8} tickLine={false} />
                  <YAxis stroke="#6b6b9a" fontSize={9} tickLine={false} domain={[1.0, 2.5]} ticks={[1.0, 1.5, 2.0, 2.5]} />
                  <Tooltip content={<CyberTooltip />} />
                  <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: '9px', color: '#e8e8ff', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="FTL" stroke="#00d4ff" strokeWidth={2.5} activeDot={{ r: 5 }} dot={{ fill: '#00d4ff', r: 3 }} />
                  <Line type="monotone" dataKey="Carting" stroke="#ff2d78" strokeWidth={2.5} activeDot={{ r: 5 }} dot={{ fill: '#ff2d78', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-text-secondary leading-relaxed mt-2 text-center">
              * Notice delay curves crossing. FTL flatlines over long-haul bands while Carting spikes beyond 200km.
            </p>
          </div>

          <div className="glass-card border border-purple/20 p-5 glow-purple">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border/20 pb-2 mb-3">
              // TIME-COST TRADEOFF MATRIX
            </h3>
            <div className="overflow-x-auto text-[10px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-text-secondary font-bold">
                    <th className="pb-2 tracking-wider">Distance Band</th>
                    <th className="pb-2 tracking-wider">FTL Efficiency</th>
                    <th className="pb-2 tracking-wider">Carting Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-text-secondary font-mono">
                  <tr>
                    <td className="py-2.5 text-text-primary font-bold">Short (&lt;50km)</td>
                    <td className="py-2.5">Low (consolidation)</td>
                    <td className="py-2.5 text-green">High (continuous)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-text-primary font-bold">Medium (50-200)</td>
                    <td className="py-2.5">Medium (balanced)</td>
                    <td className="py-2.5">Medium (incremental)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-text-primary font-bold">Long (&gt;200km)</td>
                    <td className="py-2.5 text-green">High (express speed)</td>
                    <td className="py-2.5 text-pink font-bold">Low (driver fatigue)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
