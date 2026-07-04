import React from 'react';
import { Info, Cpu, Database, Network } from 'lucide-react';

export default function About({ isDark }) {
  const techBadges = [
    { name: 'Python', type: 'pink' },
    { name: 'NetworkX', type: 'purple' },
    { name: 'XGBoost', type: 'gold' },
    { name: 'Folium', type: 'blue' },
    { name: 'React', type: 'green' },
    { name: 'Recharts', type: 'purple' },
    { name: 'Tailwind CSS', type: 'blue' },
    { name: 'Vite', type: 'pink' }
  ];

  return (
    <div className="space-y-8 relative z-10 font-mono">
      {/* Full Hero Section */}
      <div className="relative p-6 md:p-10 rounded-2xl overflow-hidden border border-purple/20 glow-purple bg-gradient-to-r from-purple/5 via-blue/5 to-pink/5 scanlines">
        <div className="relative z-10 space-y-3">
          <span className="badge-purple font-mono uppercase tracking-widest text-[9px]">
            ARCHITECTURAL SCHEMATICS // ONLINE
          </span>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tighter uppercase leading-none">
            <span className="gradient-text-cyber select-none">ABOUT DELIVERYIQ</span>
          </h1>
          <p className="text-xs text-text-secondary font-mono tracking-widest uppercase">
            DELHIVERY SYSTEM PIPELINE CORE CONSOLE PROTOCOL
          </p>
        </div>
      </div>

      {/* Intro Panel */}
      <div className="glass-card border border-purple/20 p-6 glow-purple">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border/40 pb-2 mb-4">
          // SYSTEM OVERVIEW
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed font-mono">
          DeliveryIQ is a complete, offline-capable logistics network intelligence system built for Delhivery. By leveraging advanced Python network modeling (NetworkX) and gradient-boosted machine learning classifiers (XGBoost), the system maps critical bottlenecks, evaluates routing efficiency, predicts segment transit times, and delivers tactical decision interventions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-border/20 pt-4 mt-6 text-[10px]">
          <div>
            <span className="text-text-secondary block font-bold uppercase mb-1">Segments Audited</span>
            <span className="text-sm font-extrabold text-blue">144,867</span>
          </div>
          <div>
            <span className="text-text-secondary block font-bold uppercase mb-1">Hub Facilities</span>
            <span className="text-sm font-extrabold text-purple">1,508</span>
          </div>
          <div>
            <span className="text-text-secondary block font-bold uppercase mb-1">Corridors Mapped</span>
            <span className="text-sm font-extrabold text-pink">2,783</span>
          </div>
          <div>
            <span className="text-text-secondary block font-bold uppercase mb-1">ETA Model MAE</span>
            <span className="text-sm font-extrabold text-green">+14.4% Gain</span>
          </div>
        </div>
      </div>

      {/* Embedded AI architecture */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">// HOW EMBEDDED AI WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="glass-card border border-purple/40 p-5 space-y-4 glow-purple">
            <div className="p-2 bg-purple/10 text-purple rounded-xl border border-purple/20 inline-block glow-purple">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
              1. Pre-Computed Pipeline
            </h3>
            <p className="text-[10px] text-text-secondary leading-relaxed leading-relaxed font-mono">
              Model training and graph extraction are run in Python as a background pipeline, saving scaler transformations and XGBoost weights. The predictions and topological metrics are then exported as compact JSON matrices, enabling immediate web rendering with zero database or API roundtrips.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card border border-blue/40 p-5 space-y-4 glow-blue">
            <div className="p-2 bg-blue/10 text-blue rounded-xl border border-blue/20 inline-block glow-blue">
              <Network className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
              2. Topological Scoring
            </h3>
            <p className="text-[10px] text-text-secondary leading-relaxed leading-relaxed font-mono">
              Delhivery hubs are modeled as directed nodes in a DiGraph. Betweenness Centrality calculations identify facilities that act as critical single points of failure. Centrality scores are then cross-referenced with historic SLA breach rates to compile composite risk hierarchies.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card border border-pink/40 p-5 space-y-4 glow-pink">
            <div className="p-2 bg-pink/10 text-pink rounded-xl border border-pink/20 inline-block glow-pink">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
              3. FTL Advisor Matrix
            </h3>
            <p className="text-[10px] text-text-secondary leading-relaxed leading-relaxed font-mono">
              An XGBoost classifier is trained on features such as distances, departure times, and hub centrality scores to differentiate routing efficiencies. The resulting decision boundaries are compiled into a 36-entry rules lookup matrix for instant recommendations on the client.
            </p>
          </div>

        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card border border-purple/20 p-5 glow-purple">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border/20 pb-2 mb-4">
          // INTEGRATED CORE DEPENDENCY BADGES
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {techBadges.map((t, idx) => (
            <span 
              key={idx} 
              className={`px-3 py-1.5 bg-bg/50 border rounded-lg text-[10px] font-bold uppercase tracking-wider badge-${t.type}`}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Author Section */}
      <div className="glass-card border border-gold/40 p-6 glow-pink flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <h2 className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">// ENGINEER IN CHARGE</h2>
          <h3 className="text-lg font-extrabold gradient-text-pink tracking-wider">UTSAV KUMAR THAKUR</h3>
          <p className="text-[10px] text-text-primary font-bold uppercase">Lead Data Engineer & Solutions Architect</p>
        </div>
        
        {/* Social Links */}
        <div className="flex flex-col sm:flex-row gap-3 text-[10px]">
          <a 
            href="https://github.com/Utsav-Thakur" 
            target="_blank" 
            rel="noreferrer"
            className="cyber-btn px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:scale-[1.02] transition"
            style={{ border: '1px solid rgba(0, 212, 255, 0.4)', background: 'rgba(0, 212, 255, 0.08)', color: '#00d4ff' }}
          >
            <svg className="h-4 w-4 fill-current inline mr-1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/utsav-thakur-2b01871b7" 
            target="_blank" 
            rel="noreferrer"
            className="cyber-btn px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:scale-[1.02] transition"
            style={{ border: '1px solid rgba(180, 79, 255, 0.4)', background: 'rgba(180, 79, 255, 0.08)', color: '#b44fff' }}
          >
            <svg className="h-4 w-4 fill-current inline mr-1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
