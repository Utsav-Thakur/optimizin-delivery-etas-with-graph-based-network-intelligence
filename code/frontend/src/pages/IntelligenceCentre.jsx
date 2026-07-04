import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, DollarSign, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';

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

export default function IntelligenceCentre({ isDark }) {
  const { data: intel } = useQuery({
    queryKey: ['networkIntelligence'],
    queryFn: () => fetch('/data/network_intelligence.json').then(res => res.json())
  });

  // Gauge animation angle
  const [gaugeAngle, setGaugeAngle] = useState(-90); // starts left
  const [revenueCount, setRevenueCount] = useState(0);

  useEffect(() => {
    if (intel) {
      // Map 0-100 score to -90 to +90 degrees rotation
      const score = intel.network_health_score || 68.4;
      const angle = (score / 100) * 180 - 90;
      const timer = setTimeout(() => {
        setGaugeAngle(angle);
      }, 300);

      // Revenue counter
      let start = 0;
      const end = intel.revenue_at_risk_estimate || 6734500;
      const duration = 1200;
      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setRevenueCount(start + easeProgress * (end - start));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setRevenueCount(end);
        }
      };
      requestAnimationFrame(animate);

      return () => clearTimeout(timer);
    }
  }, [intel]);

  // Hourly delay distribution
  const hourlyData = [
    { hour: '12 AM', delay: 2.10 },
    { hour: '2 AM', delay: 2.25 },
    { hour: '4 AM', delay: 2.40 },
    { hour: '6 AM', delay: 1.45 },
    { hour: '8 AM', delay: 1.25 },
    { hour: '10 AM', delay: 1.15 },
    { hour: '12 PM', delay: 1.30 },
    { hour: '2 PM', delay: 1.55 },
    { hour: '4 PM', delay: 1.70 },
    { hour: '6 PM', delay: 1.85 },
    { hour: '8 PM', delay: 1.98 },
    { hour: '10 PM', delay: 2.05 }
  ];

  return (
    <div className="space-y-6 relative z-10 font-mono">
      {/* Header */}
      <div className="flex flex-col border-b border-border/40 pb-4 animate-count-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="text-purple h-7 w-7 animate-pulse" /> 
          <span className="gradient-text-cyber">AI INTELLIGENCE CENTRE</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pre-Computed · Zero API · Rule-Based + ML Hybrid Engine
        </p>
      </div>

      {/* Semicircle Gauge & Revenue at Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Health Semicircle Gauge */}
        <div className="glass-card border border-purple/20 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-lg glow-purple">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest self-start">// NETWORK HEALTH INDEX</h3>
          
          <div className="relative h-32 w-64 mt-4 select-none">
            {/* SVG Semicircle Dial */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff2d78" /> {/* pink */}
                  <stop offset="50%" stopColor="#ffd700" /> {/* gold */}
                  <stop offset="100%" stopColor="#00ff88" /> {/* green */}
                </linearGradient>
              </defs>
              {/* Semicircle Track */}
              <path 
                d="M20,90 A80,80 0 0,1 180,90" 
                fill="none" 
                stroke="#1a1a3a" 
                strokeWidth="14" 
                strokeLinecap="round"
              />
              {/* Semicircle Gradient Gauge Fill */}
              <path 
                d="M20,90 A80,80 0 0,1 180,90" 
                fill="none" 
                stroke="url(#gaugeGradient)" 
                strokeWidth="14" 
                strokeLinecap="round"
              />
            </svg>

            {/* Needle */}
            <div 
              className="absolute bottom-2.5 left-1/2 w-1.5 h-20 bg-text-primary origin-bottom -translate-x-1/2 rounded-full needle-transition"
              style={{ 
                transform: `translateX(-50%) rotate(${gaugeAngle}deg)`,
                transformOrigin: '50% 100%',
                boxShadow: '0 0 10px #b44fff'
              }}
            />
            {/* Center Pivot Pin */}
            <div className="absolute bottom-1.5 left-1/2 h-4 w-4 rounded-full bg-bg border-2 border-purple -translate-x-1/2 glow-purple" />
          </div>

          <div className="text-center mt-3">
            <span className="text-3xl font-extrabold text-transparent bg-clip-text gradient-text-cyber select-none">
              {intel ? intel.network_health_score.toFixed(1) : '68.4'}%
            </span>
            <span className="text-[9px] text-text-secondary block font-bold uppercase tracking-widest mt-1">
              Active SLA Compliance Coefficient
            </span>
          </div>
        </div>

        {/* Revenue at Risk Card */}
        <div className="glass-card border border-pink/40 p-6 flex flex-col justify-between shadow-lg glow-pink">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-border/20 pb-3">
              <span className="text-[10px] font-bold text-pink uppercase tracking-widest block">
                // SYSTEM REVENUE AT RISK
              </span>
              <span className="p-1.5 bg-pink/10 text-pink rounded-lg border border-pink/30 glow-pink">
                <DollarSign className="h-5 w-5" />
              </span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold text-pink tracking-wider glow-pink">
                ₹{Math.round(revenueCount).toLocaleString()}
              </h2>
              <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-widest">
                Monthly delay-induced contract penalty leakages
              </span>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed bg-bg/50 p-3 rounded-lg border border-border/40">
              Calculated dynamically from transit SLAs. Delay factors exceeding 1.20x trigger automatic penalties on FTL contract terms. Node optimization recovers this deficit.
            </p>
          </div>
          
          <div className="border-t border-border/20 pt-4 mt-6 flex items-center gap-2 text-[9px] text-text-secondary">
            <AlertTriangle className="h-4 w-4 text-pink animate-pulse" />
            <span>High latency mitigation recommended for top 5 structural segments.</span>
          </div>
        </div>
      </div>

      {/* Quick Wins & Structural Risks lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Wins */}
        <div className="glass-card border border-green/20 p-5 glow-green space-y-4">
          <h3 className="text-xs font-bold text-green uppercase tracking-widest flex items-center gap-2 border-b border-border/20 pb-3">
            <span className="h-2 w-2 rounded-full bg-green pulse-dot" /> Top 5 Quick Wins Interventions
          </h3>
          
          <div className="divide-y divide-border/20 text-xs">
            {intel && intel.quick_wins ? (
              intel.quick_wins.map((win, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center gap-4 hover:bg-green/5 transition px-2 rounded-lg">
                  <div className="space-y-1">
                    <span className="font-bold text-text-primary text-xs">{win.source} → {win.destination}</span>
                    <span className="text-[10px] text-text-secondary block">{win.fix}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-green/10 text-green font-bold text-[9px] block border border-green/20">
                      -{win.estimated_time_saved_pct}% Time
                    </span>
                    <span className="text-[10px] text-gold font-bold block mt-1">{win.delay_ratio.toFixed(2)}x</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-text-secondary">LOADING DEVIATION DIRECTIVES...</div>
            )}
          </div>
        </div>

        {/* Structural Risks List */}
        <div className="glass-card border border-pink/20 p-5 glow-pink space-y-4">
          <h3 className="text-xs font-bold text-pink uppercase tracking-widest flex items-center gap-2 border-b border-border/20 pb-3">
            <span className="h-2 w-2 rounded-full bg-pink pulse-dot" /> Structural Network Dependency Risks
          </h3>

          <div className="divide-y divide-border/20 text-xs">
            {intel && intel.structural_risks ? (
              intel.structural_risks.map((risk, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center gap-4 hover:bg-pink/5 transition px-2 rounded-lg">
                  <div className="space-y-1">
                    <span className="font-bold text-text-primary text-xs">{risk.name.split(' (')[0]}</span>
                    <span className="text-[10px] text-text-secondary block">Betweenness: {risk.betweenness.toFixed(4)}</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink/10 text-pink font-bold text-[9px] block border border-pink/20">
                      {(risk.pct_sla_breach*100).toFixed(0)}% SLA Breach
                    </span>
                    <span className="text-[10px] text-text-secondary block mt-1">Trips: {Math.round(risk.outbound_trip_count).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-text-secondary">LOADING STRUCTURAL ANOMALIES...</div>
            )}
          </div>
        </div>
      </div>

      {/* Delay by Hour Chart */}
      <div className="glass-card border border-purple/20 p-6 glow-purple relative overflow-hidden flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-1">
            // Outbound Delay Intensity by Hour of Departure
          </h3>
          <p className="text-[10px] text-text-secondary mb-4">SEGMENT DELAY MULTIPLIER SPECTRUM</p>
        </div>
        
        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b44fff" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
              <XAxis dataKey="hour" stroke="#6b6b9a" fontSize={9} tickLine={false} />
              <YAxis stroke="#6b6b9a" fontSize={9} tickLine={false} domain={[1.0, 2.5]} ticks={[1.0, 1.5, 2.0, 2.5]} />
              <Tooltip content={<CyberTooltip />} />
              <ReferenceLine x="8 AM" stroke="#00ff88" strokeDasharray="3 3" label={{ value: 'Best dispatch window', fill: '#00ff88', fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="delay" stroke="#b44fff" strokeWidth={2.5} fill="url(#cyberAreaGrad)" dot={{ stroke: '#00d4ff', strokeWidth: 2, r: 3, fill: '#050508' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-text-secondary mt-3 text-center">
          * Outbound operations optimization targets the <b className="text-green uppercase">6 AM – 12 PM dispatch slot</b> to capture lowest delay ratio.
        </p>
      </div>
    </div>
  );
}
