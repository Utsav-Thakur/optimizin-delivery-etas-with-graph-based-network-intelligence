import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, Sparkles, TrendingDown, Layers } from 'lucide-react';

const CyberTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg/95 border border-purple/40 rounded-xl p-3.5 backdrop-blur-md shadow-lg font-mono text-[11px]">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold animate-pulse" style={{ color: p.color || '#b44fff' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function ETAModel({ isDark }) {
  // Load data
  const { data: benchmark } = useQuery({
    queryKey: ['modelBenchmark'],
    queryFn: () => fetch('/data/model_benchmark.json').then(res => res.json())
  });

  const { data: importance } = useQuery({
    queryKey: ['featureImportance'],
    queryFn: () => fetch('/data/feature_importance.json').then(res => res.json())
  });

  if (!benchmark || !importance) {
    return (
      <div className="text-center py-12 text-text-secondary font-mono text-xs animate-pulse">
        DECRYPTING MODEL BENCHMARK LOGS...
      </div>
    );
  }

  // Prep Recharts data for metrics
  const maeData = Object.entries(benchmark).map(([name, m]) => ({
    name: name.replace(' baseline', '').replace(' pipeline', ''),
    MAE: m.MAE,
    isGraph: name.includes('Graph')
  }));

  const accData = Object.entries(benchmark).map(([name, m]) => ({
    name: name.replace(' baseline', '').replace(' pipeline', ''),
    accuracy: m['Within 15%'],
    isGraph: name.includes('Graph')
  }));

  // List of topological graph features
  const graphFeatureList = [
    'betweenness_centrality_source', 'betweenness_centrality_dest',
    'in_degree_source', 'out_degree_dest',
    'avg_delay_ratio_source', 'avg_delay_ratio_dest',
    'pct_sla_breach_source', 'pct_sla_breach_dest',
    'corridor_median_delay_ratio', 'corridor_trip_count'
  ];

  const impData = Object.entries(importance).map(([feature, val]) => {
    return {
      feature: feature.replace('_encoded', '').replace(/_/g, ' '),
      raw_name: feature,
      value: val,
      isGraph: graphFeatureList.includes(feature)
    };
  }).sort((a, b) => b.value - a.value).slice(0, 15);

  return (
    <div className="space-y-6 relative z-10 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 animate-count-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="text-purple h-7 w-7" /> 
            <span className="gradient-text-purple">MODEL BENCHMARK</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            NETWORKX-ENRICHED XGBOOST PIPELINE VS BASELINE REGRESSION MATRIX
          </p>
        </div>
      </div>

      {/* Model Benchmark Table & Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="glass-card border border-purple/20 rounded-2xl overflow-hidden lg:col-span-8 shadow-lg glow-purple">
          <div className="p-4 border-b border-border/40 bg-bg-2/60 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple" />
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">// REGRESSION MODEL BENCHMARKS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg/40 border-b border-border/40 text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                  <th className="p-4">Model Pipeline</th>
                  <th className="p-4 text-gold">MAE (Mins)</th>
                  <th className="p-4 text-gold">RMSE (Mins)</th>
                  <th className="p-4 text-green">Accuracy (Within 15%)</th>
                  <th className="p-4 text-blue text-right">Graph Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {Object.entries(benchmark).map(([name, metrics], idx) => {
                  const isGraph = name.includes('Graph');
                  return (
                    <tr 
                      key={idx} 
                      className={`transition duration-200 ${
                        isGraph 
                          ? 'bg-purple/10 border-l-4 border-l-purple font-semibold text-transparent bg-clip-text' 
                          : 'odd:bg-card even:bg-bg-2'
                      }`}
                      style={isGraph ? { boxShadow: '0 0 20px rgba(180, 79, 255, 0.15) inset' } : {}}
                    >
                      <td className="p-4 font-bold text-text-primary">{name}</td>
                      <td className="p-4 font-bold text-gold">{metrics.MAE.toFixed(4)}</td>
                      <td className="p-4 text-text-secondary">{metrics.RMSE.toFixed(4)}</td>
                      <td className="p-4 font-bold text-green">{metrics['Within 15%'].toFixed(2)}%</td>
                      <td className="p-4 font-bold text-right">
                        {isGraph ? (
                          <span className="flex items-center justify-end gap-1 text-blue">
                            <Sparkles className="h-3.5 w-3.5 text-blue animate-pulse" /> {metrics['Graph Advantage']}
                          </span>
                        ) : (
                          <span className="text-text-secondary">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advantage Callout */}
        <div className="glass-card border border-blue/40 p-6 rounded-2xl lg:col-span-4 flex flex-col justify-between shadow-lg glow-blue">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <span className="p-1.5 rounded-lg bg-blue/15 text-blue">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </span>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">// GRAPH VALUE METRIC</h3>
            </div>
            
            <div className="space-y-1">
              <span className="text-4xl font-extrabold text-blue gradient-text-cyber">+14.43%</span>
              <span className="text-[9px] text-text-secondary block font-bold uppercase tracking-widest mt-1">Relative MAE Decrease</span>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed bg-bg/50 p-3 rounded-lg border border-border/40">
              Enriching XGBoost with network metrics (betweenness centralities, corridor delays) maps physical congestion profiles prior to path computation, dropping system MAE from <b className="text-text-primary">14.73</b> to <b className="text-blue">12.61 minutes</b>.
            </p>
          </div>
          
          <div className="border-t border-border/20 pt-4 mt-6 flex items-center gap-2 text-[9px] text-text-secondary">
            <TrendingDown className="h-4 w-4 text-green" />
            <span>Optimal routing weights calibrated to model pipeline output.</span>
          </div>
        </div>
      </div>

      {/* Model Comparisons side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MAE Comparison Chart */}
        <div className="glass-card border border-purple/20 p-6 glow-purple relative overflow-hidden flex flex-col justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 border-b border-border/20 pb-2">
            // Model MAE Index (Lower is Better)
          </h3>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyberMaeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b44fff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
                <XAxis dataKey="name" stroke="#6b6b9a" fontSize={9} tickLine={false} />
                <YAxis stroke="#6b6b9a" fontSize={9} tickLine={false} domain={[0, 20]} />
                <Tooltip content={<CyberTooltip />} cursor={{ fill: 'rgba(180, 79, 255, 0.02)' }} />
                <Bar dataKey="MAE" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {maeData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.isGraph ? 'url(#cyberMaeGrad)' : '#1a1a3a'} 
                      stroke={entry.isGraph ? '#b44fff' : '#6b6b9a'} 
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Within-15% Accuracy Chart */}
        <div className="glass-card border border-purple/20 p-6 glow-purple relative overflow-hidden flex flex-col justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 border-b border-border/20 pb-2">
            // Predictions Within 15% of Actual (Higher is Better)
          </h3>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyberAccGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
                <XAxis dataKey="name" stroke="#6b6b9a" fontSize={9} tickLine={false} />
                <YAxis stroke="#6b6b9a" fontSize={9} tickLine={false} domain={[0, 35]} />
                <Tooltip content={<CyberTooltip />} cursor={{ fill: 'rgba(180, 79, 255, 0.02)' }} />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {accData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.isGraph ? 'url(#cyberAccGrad)' : '#1a1a3a'} 
                      stroke={entry.isGraph ? '#00ff88' : '#6b6b9a'} 
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="glass-card border border-purple/20 p-6 glow-purple relative overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-border/20 pb-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            // Feature Importances (XGBoost Gini Split Metrics)
          </h3>
          <div className="flex items-center gap-4 text-[9px] text-text-secondary font-bold font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-purple shadow-[0_0_6px_#b44fff]"></span>
              <span>Network Graph Weights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-blue shadow-[0_0_6px_#00d4ff]"></span>
              <span>Baseline Vectors</span>
            </div>
          </div>
        </div>

        <div className="h-80 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impData} layout="vertical" margin={{ top: 0, right: 10, left: 50, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" horizontal={false} />
              <XAxis type="number" stroke="#6b6b9a" fontSize={9} />
              <YAxis dataKey="feature" type="category" stroke="#6b6b9a" fontSize={9} width={130} tickLine={false} />
              <Tooltip content={<CyberTooltip />} cursor={{ fill: 'rgba(180, 79, 255, 0.02)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={12}>
                {impData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isGraph ? '#b44fff' : '#00d4ff'} 
                    fillOpacity={0.8}
                    stroke={entry.isGraph ? '#b44fff' : '#00d4ff'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-text-secondary mt-3 text-center leading-relaxed">
          * Notice that <b className="text-purple uppercase">corridor_median_delay_ratio</b> (extracted from the network graph) dominates the split criteria in ETA predictions.
        </p>
      </div>
    </div>
  );
}
