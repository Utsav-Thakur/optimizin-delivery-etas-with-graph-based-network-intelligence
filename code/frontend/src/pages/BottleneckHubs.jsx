import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, X, ShieldAlert, TrendingUp, HelpCircle, Download } from 'lucide-react';
import { downloadCSV } from '../utils/downloadCSV';

const CyberTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg/95 border border-purple/40 rounded-xl p-3.5 backdrop-blur-md shadow-lg">
      <p className="text-[10px] text-text-secondary font-mono mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold font-mono" style={{ color: p.color || '#b44fff' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function BottleneckHubs({ isDark }) {
  const [filterTier, setFilterTier] = useState('All');
  const [selectedHub, setSelectedHub] = useState(null);

  // Fetch data
  const { data: hubs } = useQuery({
    queryKey: ['bottleneckHubs'],
    queryFn: () => fetch('/data/bottleneck_hubs.json').then(res => res.json())
  });

  const { data: insights } = useQuery({
    queryKey: ['hubInsights'],
    queryFn: () => fetch('/data/hub_insights.json').then(res => res.json())
  });

  if (!hubs) {
    return (
      <div className="text-center py-12 text-text-secondary font-mono text-xs animate-pulse">
        DECRYPTING HUB INFRASTRUCTURE DATABASE...
      </div>
    );
  }

  // Add risk tier tag based on composite_score
  const processedHubs = hubs.map((hub) => {
    const score = hub.composite_score * 1000; // scale composite score nicely for UI display
    let tier = 'Medium';
    if (score > 10) tier = 'Critical';
    else if (score > 1) tier = 'High';
    return {
      ...hub,
      display_score: Math.min(100, Math.round(score * 4.5 + 10)), // scale 0-100 gauge nicely
      tier
    };
  });

  const filteredHubs = processedHubs.filter(h => filterTier === 'All' || h.tier === filterTier);

  // Data for Recharts top 20 composite score
  const chartData = processedHubs.map(h => ({
    name: h.name.split(' (')[0],
    score: h.display_score,
    tier: h.tier
  })).sort((a,b) => b.score - a.score);

  // Get color for risk tier
  const getTierColor = (tier) => {
    if (tier === 'Critical') return '#ff2d78'; // pink
    if (tier === 'High') return '#ffd700'; // gold
    return '#b44fff'; // purple
  };

  // Find AI Insight for selected hub
  const activeInsight = selectedHub && insights 
    ? insights.find(i => i.hub_id === selectedHub.node) 
    : null;

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-mono">
            <AlertTriangle className="text-pink h-7 w-7 animate-pulse" /> 
            <span className="gradient-text-pink">CRITICAL HUB ANALYSIS</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-mono">
            VULNERABILITY RANKING SCHEMA // PATH BETWEENNESS CENTRALITY × ACTUAL SLA BREACH RATES
          </p>
        </div>
        <button
          onClick={() => downloadCSV(
            filteredHubs.map(h => ({
              composite_rank: h.composite_rank ?? '',
              betweenness_rank: h.betweenness_rank ?? '',
              name: h.name,
              state: h.state,
              node_id: h.node,
              risk_tier: h.tier,
              betweenness: h.betweenness?.toFixed(4),
              sla_breach_pct: h.pct_sla_breach !== undefined ? (h.pct_sla_breach * 100).toFixed(1) + '%' : '',
              avg_delay_ratio: h.avg_delay_ratio !== undefined ? h.avg_delay_ratio.toFixed(2) + 'x' : '',
              outbound_trips: h.outbound_trip_count,
              ftl_share_pct: h.pct_ftl !== undefined ? (h.pct_ftl * 100).toFixed(1) + '%' : '',
              dominant_route_type: h.dominant_route_type,
              peak_time: h.peak_time_of_day,
              in_degree: h.in_degree,
              out_degree: h.out_degree,
              clustering: h.clustering?.toFixed(4),
              composite_score: h.composite_score?.toFixed(4),
            })),
            `deliveryiq_bottleneck_hubs_${filterTier.toLowerCase().replace(/\s+/g, '_')}`
          )}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 cursor-pointer print:hidden"
          style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78' }}
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex justify-between items-center gap-4 flex-wrap bg-card border border-border/40 p-3 rounded-xl">
        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium'].map((tier) => {
            const isActive = filterTier === tier;
            const btnColor = tier === 'Critical' ? 'pink' : tier === 'High' ? 'gold' : tier === 'Medium' ? 'blue' : 'purple';
            return (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`cyber-btn px-3 py-1.5 text-xs font-mono tracking-wider ${
                  isActive 
                    ? `border-${btnColor} bg-${btnColor}/20 text-${btnColor} glow-${btnColor}` 
                    : 'border-border/60 hover:border-purple/40 text-text-secondary bg-bg/40'
                }`}
              >
                {tier.toUpperCase()} HUBS
              </button>
            );
          })}
        </div>
        <span className="text-xs text-text-secondary font-mono tracking-wide">
          FILTERED: <span className="text-purple font-bold">{filteredHubs.length}</span> TARGET FACILITIES
        </span>
      </div>

      {/* Grid of Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredHubs.map((hub, idx) => {
          const color = getTierColor(hub.tier);
          const badgeClass = hub.tier === 'Critical' ? 'badge-critical' : hub.tier === 'High' ? 'badge-high' : 'badge-medium';
          const glowColor = hub.tier === 'Critical' ? 'glow-pink' : hub.tier === 'High' ? 'glow-pink' : 'glow-purple'; // wrap glows nicely
          
          return (
            <div
              key={idx}
              onClick={() => setSelectedHub(hub)}
              className={`glass-card p-5 cursor-pointer flex flex-col justify-between hover-lift border-t-2 relative overflow-hidden ${glowColor}`}
              style={{ 
                borderTopColor: color,
                animation: 'countUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
                animationDelay: `${idx * 50}ms`
              }}
            >
              <div className="absolute top-1 right-2 opacity-5 text-4xl font-extrabold font-mono select-none">
                #{idx + 1}
              </div>

              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-text-secondary font-mono">NODE ID: {hub.node}</span>
                <span className={`${badgeClass} font-mono text-[9px] uppercase tracking-wider`}>
                  {hub.tier}
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary truncate font-mono mt-1">
                {hub.name.split(' (')[0]}
              </h3>
              <p className="text-[10px] text-text-secondary mb-4 font-mono">STATE REGION: {hub.state}</p>

              {/* Gauge Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-text-secondary font-bold font-mono">
                  <span>RISK COEFFICIENT</span>
                  <span style={{ color, filter: `drop-shadow(0 0 3px ${color})` }}>{hub.display_score}/100</span>
                </div>
                <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden border border-border/60">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${hub.display_score}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                  />
                </div>
              </div>

              {/* Card Footer Trend */}
              <div className="flex justify-between items-center mt-4 border-t border-border/20 pt-2.5 text-[9px] text-text-secondary font-mono">
                <span>Trips: <b className="text-text-primary">{Math.round(hub.outbound_trip_count).toLocaleString()}</b></span>
                <span className="flex items-center text-pink animate-pulse font-bold">
                  Worsening <TrendingUp className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Centrality Risk Ranking Chart */}
      <div className="glass-card border border-purple/20 p-6 glow-purple relative overflow-hidden flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-text-primary uppercase mb-1 font-mono">
            Top Hubs Composite Risk Score Hierarchy
          </h2>
          <p className="text-[10px] text-text-secondary font-mono mb-4">CRITICAL GATEWAY CENTRALITY WEIGHT INDEX</p>
        </div>
        
        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" horizontal={false} />
              <XAxis type="number" stroke="#6b6b9a" fontSize={10} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#6b6b9a" fontSize={9} width={120} tickLine={false} />
              <Tooltip content={<CyberTooltip />} cursor={{ fill: 'rgba(180, 79, 255, 0.03)' }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={15}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTierColor(entry.tier)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side Slide-out Details Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-bg/95 border-l border-purple/30 glow-purple shadow-[0_0_50px_rgba(180,79,255,0.25)] z-50 p-6 space-y-6 overflow-y-auto transition-transform duration-300 transform ${
          selectedHub ? 'translate-x-0' : 'translate-x-full'
        } scanlines`}
      >
        {selectedHub && (
          <>
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
              <div>
                <span className="text-[10px] text-blue font-bold uppercase tracking-widest font-mono">
                  // BOTTLENECK PROFILE SCHEMA
                </span>
                <h2 className="text-base font-bold text-text-primary mt-1 font-mono tracking-wider">
                  {selectedHub.name.split(' (')[0]}
                </h2>
                <p className="text-[10px] text-text-secondary font-mono mt-0.5">
                  State: {selectedHub.state} | Node ID: {selectedHub.node}
                </p>
              </div>
              <button 
                onClick={() => setSelectedHub(null)}
                className="p-1 rounded-lg border border-border hover:border-purple/50 bg-card/60 text-text-secondary hover:text-text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Hub Metrics */}
            <div className="space-y-3 font-mono">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">// OPERATIONAL METRICS</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[9px] text-text-secondary block uppercase font-bold">Betweenness Centrality</span>
                  <span className="text-xs font-bold text-text-primary">{selectedHub.betweenness.toFixed(4)}</span>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[9px] text-text-secondary block uppercase font-bold">Outbound SLA Breach</span>
                  <span className="text-xs font-bold text-pink">{(selectedHub.pct_sla_breach * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[9px] text-text-secondary block uppercase font-bold">In-Degree Routes</span>
                  <span className="text-xs font-bold text-text-primary">{selectedHub.in_degree}</span>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[9px] text-text-secondary block uppercase font-bold">Out-Degree Routes</span>
                  <span className="text-xs font-bold text-text-primary">{selectedHub.out_degree}</span>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[9px] text-text-secondary block uppercase font-bold">Average Delay Ratio</span>
                  <span className="text-xs font-bold text-gold">{selectedHub.avg_delay_ratio.toFixed(2)}x OSRM</span>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[9px] text-text-secondary block uppercase font-bold">Busiest Shift Peak</span>
                  <span className="text-xs font-bold text-purple">{selectedHub.peak_time_of_day}</span>
                </div>
              </div>
            </div>

            {/* Embedded AI Insight Panel */}
            <div className="bg-card border border-gold/30 p-5 rounded-xl space-y-4 font-mono">
              <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-1.5 border-b border-border/20 pb-2">
                <ShieldAlert className="h-4 w-4" /> AI Capacity Advisor
              </h3>
              {activeInsight ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-[10px]">INTERVENTION DIRECTIVE:</span>
                    <span className="px-2 py-0.5 font-bold rounded bg-blue/10 text-blue capitalize text-[10px]">
                      {activeInsight.intervention_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-text-primary leading-relaxed bg-bg p-3.5 rounded-lg border border-border/40">
                    "{activeInsight.insight_text}"
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-green/10 p-3 rounded-lg border border-green/20">
                      <span className="text-[8px] text-text-secondary block uppercase font-semibold mb-0.5">SLA IMPROVEMENT</span>
                      <span className="text-sm font-bold text-green">+{activeInsight.delay_reduction_pct}%</span>
                    </div>
                    <div className="bg-green/10 p-3 rounded-lg border border-green/20">
                      <span className="text-[8px] text-text-secondary block uppercase font-semibold mb-0.5">TRIPS RECOVERED</span>
                      <span className="text-sm font-bold text-green">{activeInsight.trips_recovered_monthly}/mo</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-secondary">GENERATING CAPACITY RECONSTRUCTION MODEL...</p>
              )}
            </div>

            {/* Reasoning breakdown */}
            {activeInsight && (
              <div className="space-y-3 font-mono">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">// DECISION CORE LOG</h3>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-card p-2.5 rounded-lg border border-border/40 flex justify-between">
                    <span className="text-text-secondary">Centrality Percentile:</span>
                    <span className="font-bold text-text-primary">#{activeInsight.reasoning.betweenness_percentile}</span>
                  </div>
                  <div className="bg-card p-2.5 rounded-lg border border-border/40 flex justify-between">
                    <span className="text-text-secondary">Breach Risk Ratio:</span>
                    <span className="font-bold text-text-primary">{(activeInsight.reasoning.sla_breach_pct*100).toFixed(0)}%</span>
                  </div>
                  <div className="bg-card p-2.5 rounded-lg border border-border/40 flex justify-between">
                    <span className="text-text-secondary">Inbound/Outbound:</span>
                    <span className="font-bold text-text-primary">{activeInsight.reasoning.in_out_ratio.toFixed(2)}</span>
                  </div>
                  <div className="bg-card p-2.5 rounded-lg border border-border/40 flex justify-between">
                    <span className="text-text-secondary">Peak Traffic Load:</span>
                    <span className="font-bold text-text-primary">{activeInsight.reasoning.busiest_time}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Backdrop overlay for Drawer */}
      {selectedHub && (
        <div 
          onClick={() => setSelectedHub(null)}
          className="fixed inset-0 bg-black/75 z-40 transition-opacity duration-300 backdrop-blur-xs"
        />
      )}
    </div>
  );
}
