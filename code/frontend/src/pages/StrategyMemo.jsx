import React from 'react';
import { FileText, Printer, ShieldAlert, Award, Calendar, DollarSign, Download } from 'lucide-react';
import { downloadCSV } from '../utils/downloadCSV';

export default function StrategyMemo({ isDark }) {
  const handlePrint = () => {
    window.print();
  };

  const topHubs = [
    { rank: 1, name: 'Gurgaon_Bilaspur_HB (Haryana)', betweenness: '0.0824', slaBreach: '79.2%', trips: '12,408', fix: 'Facility Upgrade', isCritical: true },
    { rank: 2, name: 'Bangalore_Nelamangala_H (Karnataka)', betweenness: '0.0614', slaBreach: '62.4%', trips: '9,812', fix: 'Load Balancer Corridor', isCritical: false },
    { rank: 3, name: 'Mumbai_Hub_HB (Maharashtra)', betweenness: '0.0482', slaBreach: '58.7%', trips: '8,420', fix: 'Facility Upgrade', isCritical: false },
    { rank: 4, name: 'Pune_HB (Maharashtra)', betweenness: '0.0415', slaBreach: '54.2%', trips: '7,150', fix: 'Route-Type Shift', isCritical: false },
    { rank: 5, name: 'Kolkata_HB (West Bengal)', betweenness: '0.0387', slaBreach: '51.8%', trips: '6,840', fix: 'Facility Upgrade', isCritical: false }
  ];

  return (
    <div className="space-y-6 relative z-10 font-mono">
      {/* Action Header - Excluded from Print */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-blue h-7 w-7" /> 
            <span className="gradient-text-purple">STRATEGY BRIEF</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            CLASSIFIED LOGISTICS PROTOCOL // PRINT READY EXECUTIVE STRATEGY
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => downloadCSV(
              topHubs.map(h => ({
                rank: h.rank,
                hub_name: h.name,
                betweenness_centrality: h.betweenness,
                sla_breach_pct: h.slaBreach,
                outbound_trips: h.trips,
                recommended_fix: h.fix,
                is_critical: h.isCritical ? 'Yes' : 'No',
              })),
              'deliveryiq_strategy_brief_hubs'
            )}
            className="flex items-center gap-1.5 cyber-btn px-4 py-2 text-xs font-bold tracking-widest hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: '1px solid rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.08)', color: '#00d4ff', boxShadow: '0 0 15px rgba(0,212,255,0.2)' }}
          >
            <Download className="h-4 w-4" /> EXPORT CSV
          </button>
          <button
            onClick={handlePrint}
            className="cyber-btn px-4 py-2 text-xs font-bold tracking-widest hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: '1px solid rgba(255, 215, 0, 0.4)', background: 'rgba(255, 215, 0, 0.08)', color: '#ffd700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }}
          >
            <Printer className="h-4 w-4 text-gold" /> EXPORT STRATEGY PDF
          </button>
        </div>
      </div>

      {/* Strategy Memo Paper Container */}
      <div className="glass-card border border-purple/20 p-8 space-y-8 max-w-4xl mx-auto shadow-[0_0_30px_rgba(180,79,255,0.15)] glow-purple print:border-0 print:bg-white print:text-black print:p-0 print:shadow-none scanlines">
        
        {/* Memo Header */}
        <div className="border-b border-border/40 pb-6 space-y-3 print:border-black">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h2 className="text-md font-black text-text-primary uppercase tracking-widest print:text-black">
              ⬡ DELHIVERY NETWORK INTELLIGENCE MATRIX
            </h2>
            <span className="badge-pink font-mono text-[9px] uppercase tracking-widest print:text-black font-bold">
              CLASSIFIED · NETWORK OPERATIONS INTELLIGENCE BRIEF
            </span>
          </div>
          
          <div className="h-[1px] bg-gradient-to-r from-purple via-blue to-pink opacity-40 my-3" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px] text-text-secondary print:text-black pt-1">
            <div><b className="text-text-primary print:text-black">TO:</b> Head of Network Operations, Delhivery Board</div>
            <div><b className="text-text-primary print:text-black">DATE:</b> July 2, 2026</div>
            <div><b className="text-text-primary print:text-black">FROM:</b> Utsav Kumar Thakur (Network IQ Group)</div>
            <div><b className="text-text-primary print:text-black">SUBJECT:</b> Delhivery Hub & Corridor Bottleneck Mitigation Strategy</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest print:text-black flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-blue print:text-black" /> 1. Executive Summary
          </h3>
          <div className="h-[1px] bg-border/20" />
          <p className="text-[11px] text-text-secondary print:text-black leading-relaxed">
            An end-to-end topological analysis of Delhivery's network (144,867 segments) reveals that <b className="text-text-primary print:text-black">83% of corridors</b> experience significant transit delays compared to standard OSRM models. Using graph theory metrics (Betweenness Centrality), we have identified that a small subset of 5 hubs handles a disproportionate amount of transit volume, leading to systemic SLA breaches. By implementing target capacity upgrades and route shifts, Delhivery can recover up to <b className="text-pink print:text-black">₹6.73M monthly penalty leakages</b> and improve SLA compliance by <b className="text-green print:text-black">23%</b>.
          </p>
        </div>

        {/* Top Critical Hubs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest print:text-black flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-pink print:text-black" /> 2. Core Bottleneck Hub Vulnerabilities
          </h3>
          <div className="h-[1px] bg-border/20" />
          <div className="overflow-x-auto border border-border/40 rounded-xl print:border-black bg-bg/50">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-bg-2 border-b border-border/40 text-text-secondary print:text-black font-bold uppercase tracking-wider">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Betweenness</th>
                  <th className="p-3 text-pink print:text-black">SLA Breach</th>
                  <th className="p-3">Trips/Mo</th>
                  <th className="p-3">Prescribed Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 print:divide-black">
                {topHubs.map((hub, idx) => (
                  <tr 
                    key={idx} 
                    className={`text-text-secondary print:text-black ${
                      hub.isCritical ? 'bg-pink/5 font-semibold' : ''
                    }`}
                    style={hub.isCritical ? { borderLeft: '3px solid #ff2d78', boxShadow: 'inset 4px 0 10px rgba(255, 45, 120, 0.05)' } : {}}
                  >
                    <td className="p-3 font-bold text-text-primary print:text-black">#{hub.rank}</td>
                    <td className="p-3 font-bold text-text-primary print:text-black">{hub.name.split(' (')[0]}</td>
                    <td className="p-3 font-mono">{hub.betweenness}</td>
                    <td className="p-3 font-bold text-pink print:text-black">{hub.slaBreach}</td>
                    <td className="p-3 text-text-primary print:text-black">{hub.trips}</td>
                    <td className="p-3 text-transparent bg-clip-text gradient-text-purple font-bold">{hub.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intervention Programs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest print:text-black flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-gold print:text-black" /> 3. Recommended Intervention Programs
          </h3>
          <div className="h-[1px] bg-border/20" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-2 border-purple bg-purple/5 p-4 rounded-r-xl print:border-black print:bg-white print:border">
              <span className="text-[10px] font-bold text-purple uppercase block mb-1.5 print:text-black">Capacity Upgrades</span>
              <p className="text-[10px] text-text-secondary print:text-black leading-relaxed">
                Expand sorting lanes and inbound gate capacities at Gurgaon and Mumbai hubs. This prevents incoming queues from holding vehicles outside facilities.
              </p>
            </div>

            <div className="border-l-2 border-blue bg-blue/5 p-4 rounded-r-xl print:border-black print:bg-white print:border">
              <span className="text-[10px] font-bold text-blue uppercase block mb-1.5 print:text-black">Route-Type Conversion</span>
              <p className="text-[10px] text-text-secondary print:text-black leading-relaxed">
                Shift corridors exceeding 200km from Carting to FTL. This utilizes highway speed-ups and reduces segment factors from 2.2x to 1.8x OSRM.
              </p>
            </div>

            <div className="border-l-2 border-gold bg-gold/5 p-4 rounded-r-xl print:border-black print:bg-white print:border">
              <span className="text-[10px] font-bold text-gold uppercase block mb-1.5 print:text-black">Load Balancers</span>
              <p className="text-[10px] text-text-secondary print:text-black leading-relaxed">
                Establish direct secondary routes bypassing Gurgaon Bilaspur for transit payloads destined for adjacent northern states.
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest print:text-black flex items-center gap-2">
            <DollarSign className="h-4.5 w-4.5 text-green print:text-black" /> 4. Financial & Operational Impact
          </h3>
          <div className="h-[1px] bg-border/20" />
          <p className="text-[11px] text-text-secondary print:text-black leading-relaxed">
            By executing these capacity and routing shifts:
          </p>
          <ul className="text-[11px] text-text-secondary print:text-black space-y-2 list-none">
            <li className="flex gap-2"><span className="text-green">»</span> <span><b className="text-text-primary print:text-black">Penalties Avoided:</b> Recover up to <b className="text-green">₹80.8K monthly</b> in direct SLA breach penalties across quick-win corridors.</span></li>
            <li className="flex gap-2"><span className="text-green">»</span> <span><b className="text-text-primary print:text-black">Fleet Optimization:</b> Reduce average transit time by <b className="text-green">12%</b>, unlocking vehicle availability for additional trips.</span></li>
            <li className="flex gap-2"><span className="text-green">»</span> <span><b className="text-text-primary print:text-black">ETA Accuracy Improvement:</b> Enhancing prediction accuracy to within 15% yields higher shipper trust and lower cancellation rates.</span></li>
          </ul>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest print:text-black">5. Implementation Timeline</h3>
          <div className="h-[1px] bg-border/20" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary print:text-black">
            <div className="glass-card border border-purple/20 p-4 rounded-xl print:border-black">
              <span className="font-bold text-purple block mb-2 tracking-wider">// IMMEDIATE (DAYS 1–30) ACTION ITEMS</span>
              <ul className="space-y-2.5 list-none text-[10px]">
                <li className="flex gap-1.5"><span className="text-purple">»</span> <span>Re-route P1 quick win corridors to alternative bypass hubs.</span></li>
                <li className="flex gap-1.5"><span className="text-purple">»</span> <span>Shift night dispatch times to morning (6 AM–12 PM) slots.</span></li>
                <li className="flex gap-1.5"><span className="text-purple">»</span> <span>Deploy FTL mode for long-haul routes exceeding 200km.</span></li>
              </ul>
            </div>
            <div className="glass-card border border-blue/20 p-4 rounded-xl print:border-black">
              <span className="font-bold text-blue block mb-2 tracking-wider">// STRATEGIC (DAYS 31–90) ACTION ITEMS</span>
              <ul className="space-y-2.5 list-none text-[10px]">
                <li className="flex gap-1.5"><span className="text-blue">»</span> <span>Begin physical terminal expansion project at Gurgaon Bilaspur hub.</span></li>
                <li className="flex gap-1.5"><span className="text-blue">»</span> <span>Roll out graph-enhanced ETA predictors across customer tracking portals.</span></li>
                <li className="flex gap-1.5"><span className="text-blue">»</span> <span>Audit long-term carrier contracts to lock in FTL pricing advantages.</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="border-t border-border/20 pt-6 mt-8 flex justify-between text-[10px] text-text-secondary print:text-black print:border-black">
          <div>
            <p className="font-bold text-text-primary print:text-black">Utsav Kumar Thakur</p>
            <p>Lead Network Architect, Delhivery Intelligence</p>
          </div>
          <div className="text-right">
            <p className="italic">Signed digitally</p>
            <p className="font-mono text-purple">REF: DEL-NET-2026-0702</p>
          </div>
        </div>

      </div>
    </div>
  );
}
