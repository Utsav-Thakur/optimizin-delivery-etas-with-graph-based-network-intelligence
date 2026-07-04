import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe, Compass, Info, X, Activity, AlertTriangle,
  TrendingUp, Clock, Truck, ArrowRight, ShieldAlert, Download
} from 'lucide-react';
import { downloadCSV } from '../utils/downloadCSV';

// ─── Hub data with real coordinates ─────────────────────────────────────────
const TOP_HUBS = [
  {
    node: 'IND000000ACB', name: 'Gurgaon_Bilaspur_HB', state: 'Haryana',
    lat: 28.35, lng: 76.97,
    betweenness: 0.2332, clustering: 0.0265, in_degree: 45, out_degree: 49,
    avg_delay_ratio: 1.93, pct_ftl: 0.858, dominant_route_type: 'FTL',
    peak_time_of_day: 'Night', pct_sla_breach: 0.959,
    outbound_trip_count: 23347, composite_score: 0.2237,
    betweenness_rank: 1, composite_rank: 1,
  },
  {
    node: 'IND562132AAA', name: 'Bangalore_Nelmngla_H', state: 'Karnataka',
    lat: 13.06, lng: 77.54,
    betweenness: 0.1525, clustering: 0.0548, in_degree: 36, out_degree: 35,
    avg_delay_ratio: 1.80, pct_ftl: 0.815, dominant_route_type: 'FTL',
    peak_time_of_day: 'Afternoon', pct_sla_breach: 0.943,
    outbound_trip_count: 9975, composite_score: 0.1438,
    betweenness_rank: 2, composite_rank: 2,
  },
  {
    node: 'IND712311AAA', name: 'Kolkata_Dankuni_HB', state: 'West Bengal',
    lat: 22.62, lng: 88.30,
    betweenness: 0.0805, clustering: 0.0323, in_degree: 24, out_degree: 22,
    avg_delay_ratio: 2.40, pct_ftl: 0.879, dominant_route_type: 'FTL',
    peak_time_of_day: 'Morning', pct_sla_breach: 1.0,
    outbound_trip_count: 2612, composite_score: 0.0805,
    betweenness_rank: 3, composite_rank: 3,
  },
  {
    node: 'IND501359AAE', name: 'Hyderabad_Shamshbd_H', state: 'Telangana',
    lat: 17.23, lng: 78.43,
    betweenness: 0.0769, clustering: 0.0373, in_degree: 30, out_degree: 27,
    avg_delay_ratio: 2.01, pct_ftl: 0.849, dominant_route_type: 'FTL',
    peak_time_of_day: 'Evening', pct_sla_breach: 1.0,
    outbound_trip_count: 3340, composite_score: 0.0769,
    betweenness_rank: 4, composite_rank: 4,
  },
  {
    node: 'IND421302AAG', name: 'Bhiwandi_Mankoli_HB', state: 'Maharashtra',
    lat: 19.30, lng: 73.07,
    betweenness: 0.0531, clustering: 0.0591, in_degree: 29, out_degree: 29,
    avg_delay_ratio: 2.18, pct_ftl: 0.836, dominant_route_type: 'FTL',
    peak_time_of_day: 'Night', pct_sla_breach: 1.0,
    outbound_trip_count: 9088, composite_score: 0.0531,
    betweenness_rank: 5, composite_rank: 5,
  },
  {
    node: 'IND110037AAM', name: 'Delhi_Airport_H', state: 'Delhi',
    lat: 28.56, lng: 77.10,
    betweenness: 0.0473, clustering: 0.0435, in_degree: 21, out_degree: 24,
    avg_delay_ratio: 2.16, pct_ftl: 0.801, dominant_route_type: 'FTL',
    peak_time_of_day: 'Morning', pct_sla_breach: 1.0,
    outbound_trip_count: 2013, composite_score: 0.0473,
    betweenness_rank: 7, composite_rank: 6,
  },
  {
    node: 'IND160002AAC', name: 'Chandigarh_Mehmdpur_H', state: 'Punjab',
    lat: 30.73, lng: 76.81,
    betweenness: 0.0530, clustering: 0.0284, in_degree: 32, out_degree: 29,
    avg_delay_ratio: 1.89, pct_ftl: 0.846, dominant_route_type: 'FTL',
    peak_time_of_day: 'Evening', pct_sla_breach: 0.862,
    outbound_trip_count: 2450, composite_score: 0.0457,
    betweenness_rank: 6, composite_rank: 7,
  },
  {
    node: 'IND411033AAA', name: 'Pune_Tathawde_H', state: 'Maharashtra',
    lat: 18.62, lng: 73.77,
    betweenness: 0.0455, clustering: 0.0534, in_degree: 23, out_degree: 20,
    avg_delay_ratio: 1.98, pct_ftl: 0.913, dominant_route_type: 'FTL',
    peak_time_of_day: 'Morning', pct_sla_breach: 1.0,
    outbound_trip_count: 4061, composite_score: 0.0455,
    betweenness_rank: 9, composite_rank: 8,
  },
  {
    node: 'IND131028AAB', name: 'Sonipat_Kundli_H', state: 'Haryana',
    lat: 28.87, lng: 77.01,
    betweenness: 0.0472, clustering: 0.0344, in_degree: 20, out_degree: 20,
    avg_delay_ratio: 1.81, pct_ftl: 0.530, dominant_route_type: 'FTL',
    peak_time_of_day: 'Evening', pct_sla_breach: 0.95,
    outbound_trip_count: 1682, composite_score: 0.0449,
    betweenness_rank: 8, composite_rank: 9,
  },
  {
    node: 'IND302014AAA', name: 'Jaipur_Hub', state: 'Rajasthan',
    lat: 26.91, lng: 75.79,
    betweenness: 0.0428, clustering: 0.06, in_degree: 10, out_degree: 8,
    avg_delay_ratio: 1.85, pct_ftl: 1.0, dominant_route_type: 'FTL',
    peak_time_of_day: 'Night', pct_sla_breach: 1.0,
    outbound_trip_count: 791, composite_score: 0.0428,
    betweenness_rank: 11, composite_rank: 10,
  },
];

// Corridor connections between top hubs (TSP-style tour)
const CORRIDORS = [
  [0, 5], [5, 8], [8, 6], [6, 0], // North cluster
  [0, 9], [9, 7], [7, 4], [4, 1], // West to South
  [1, 3], [3, 2], [2, 5],         // East/South connections
  [4, 7], [1, 3],                 // Additional
];

function getTierColor(rank) {
  if (rank <= 2) return '#ff2d78';
  if (rank <= 5) return '#ffd700';
  return '#b44fff';
}

function getTierLabel(rank) {
  if (rank <= 2) return 'CRITICAL';
  if (rank <= 5) return 'HIGH';
  return 'ELEVATED';
}

// Helper to keep Leaflet map view synced
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom]);
  return null;
}

// ─── Hub Detail Panel ────────────────────────────────────────────────────────
function HubDetailPanel({ hub, onClose }) {
  if (!hub) return null;
  const tierColor = getTierColor(hub.composite_rank);
  const tierLabel = getTierLabel(hub.composite_rank);
  const slaBreachPct = (hub.pct_sla_breach * 100).toFixed(1);
  const ftlPct = (hub.pct_ftl * 100).toFixed(1);

  return (
    <div
      className="glass-card absolute right-4 top-4 z-[1000] w-[300px] overflow-hidden"
      style={{
        border: `1px solid ${tierColor}50`,
        boxShadow: `0 0 30px ${tierColor}25, 0 8px 40px rgba(0,0,0,0.6)`,
        animation: 'fadeUp 0.25s ease forwards',
      }}
    >
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div className="p-4 border-b border-border/30" style={{ background: `${tierColor}08` }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest"
                style={{ background: `${tierColor}20`, border: `1px solid ${tierColor}40`, color: tierColor }}
              >
                #{hub.composite_rank} · {tierLabel}
              </span>
            </div>
            <h3 className="text-sm font-bold text-text-primary leading-tight">{hub.name}</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">{hub.state} · {hub.node}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-border/50 hover:border-border text-text-secondary hover:text-text-primary transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="p-4 space-y-3">
        <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">// NETWORK METRICS</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Betweenness', value: hub.betweenness.toFixed(4), color: tierColor, icon: Activity },
            { label: 'SLA Breach', value: `${slaBreachPct}%`, color: '#ff2d78', icon: AlertTriangle },
            { label: 'Delay Ratio', value: `${hub.avg_delay_ratio.toFixed(2)}x`, color: '#ffd700', icon: TrendingUp },
            { label: 'FTL Share', value: `${ftlPct}%`, color: '#00ff88', icon: Truck },
            { label: 'In-Degree', value: hub.in_degree, color: '#00d4ff', icon: ArrowRight },
            { label: 'Out-Degree', value: hub.out_degree, color: '#00d4ff', icon: ArrowRight },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="bg-bg rounded-lg p-2.5 border border-border/40">
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="h-3 w-3" style={{ color: m.color }} />
                  <span className="text-[8px] text-text-secondary uppercase tracking-wider">{m.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}</span>
              </div>
            );
          })}
        </div>

        {/* Trip Stats */}
        <div className="border-t border-border/30 pt-3 space-y-2">
          <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">// OPERATIONAL DATA</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary">Outbound Trips/Mo</span>
            <span className="text-[11px] font-bold text-text-primary">{hub.outbound_trip_count.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary">Peak Dispatch Window</span>
            <span className="text-[11px] font-bold" style={{ color: '#ffd700' }}>{hub.peak_time_of_day}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary">Dominant Route Type</span>
            <span className="text-[11px] font-bold text-blue">{hub.dominant_route_type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary">Clustering Coeff.</span>
            <span className="text-[11px] font-bold text-purple">{hub.clustering.toFixed(4)}</span>
          </div>
        </div>

        {/* Composite Risk Bar */}
        <div className="border-t border-border/30 pt-3 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Composite Risk Score</span>
            <span className="text-[9px] font-bold" style={{ color: tierColor }}>{(hub.composite_score * 100).toFixed(2)}%</span>
          </div>
          <div className="h-1.5 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, hub.composite_score * 450)}%`,
                background: `linear-gradient(90deg, ${tierColor}, ${tierColor}88)`,
                boxShadow: `0 0 8px ${tierColor}60`,
              }}
            />
          </div>
        </div>

        {/* AI Recommendation */}
        <div
          className="rounded-xl p-3 text-[10px] leading-relaxed"
          style={{ background: `${tierColor}08`, border: `1px solid ${tierColor}25` }}
        >
          <p className="text-[8px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1" style={{ color: tierColor }}>
            <ShieldAlert className="h-3 w-3" /> AI RECOMMENDATION
          </p>
          <p className="text-text-secondary">
            {hub.composite_rank <= 2
              ? `PRIORITY ACTION: Expand sorting capacity & inbound gate throughput at ${hub.name}. Consider bypass corridor construction.`
              : hub.composite_rank <= 5
              ? `HIGH PRIORITY: Shift ${Math.round(hub.pct_sla_breach * 30)}% of night dispatches to morning window. Evaluate FTL conversion for 200km+ routes.`
              : `MONITOR: Hub shows elevated delay patterns during ${hub.peak_time_of_day.toLowerCase()} slots. Review carrier SLAs.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Iframe Maps (Full Network + Heatmap) ────────────────────────────────────
const IFRAME_MAPS = {
  N1000: {
    src: '/maps/tsp_tour_N1000.html',
    tour: 'TSP Tour — N=1000',
    distance: '60,415.00 km',
    status: 'Status-11',
    statusColor: '#ffd700',
    borderColor: '#00d4ff',
    stats: [
      { label: 'Total Facilities', value: '1,508', color: '#b44fff' },
      { label: 'Corridors Mapped', value: '2,847', color: '#00d4ff' },
      { label: 'Network Delay', value: '2.22x', color: '#ffd700' },
      { label: 'Tour Distance', value: '60,415 km', color: '#00d4ff' },
    ],
  },
  heatmap: {
    src: '/maps/corridor_delay_map.html',
    tour: 'Delay Concentration Map',
    distance: '144,867 segments',
    status: 'Weighted',
    statusColor: '#b44fff',
    borderColor: '#b44fff',
    stats: [
      { label: 'Hotspot Zones', value: '7', color: '#ff2d78' },
      { label: 'Max Delay Zone', value: '3.8x', color: '#ff2d78' },
      { label: 'Weighted Avg', value: '2.22x', color: '#ffd700' },
      { label: 'Segments', value: '144,867', color: '#b44fff' },
    ],
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NetworkMaps({ isDark = true }) {
  const [activeTab, setActiveTab] = useState('N10');
  const [selectedHub, setSelectedHub] = useState(null);
  // India's official composite boundary GeoJSON (Survey of India — J&K per Indian position)
  const [indiaGeoJSON, setIndiaGeoJSON] = useState(null);

  useEffect(() => {
    // Fetch India composite boundary that includes full J&K as per Indian official position.
    // Source: datameet/maps — india-composite.geojson
    fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson')
      .then(r => r.json())
      .then(data => setIndiaGeoJSON(data))
      .catch(() => {
        // Fallback: try alternate source
        fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
          .then(r => r.json())
          .then(data => setIndiaGeoJSON(data))
          .catch(() => null);
      });
  }, []);

  const handleMarkerClick = (hub) => {
    setSelectedHub(hub);
  };

  // Style for India official boundary overlay
  const indiaStyle = {
    color: '#00d4ff',
    weight: 1.5,
    opacity: 0.7,
    fillColor: 'transparent',
    fillOpacity: 0,
  };

  return (
    <div className="space-y-4 relative z-10 font-mono">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/30">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Globe className="text-blue h-6 w-6" />
            <span className="gradient-text-cyber">NETWORK TOPOLOGY MAPS</span>
          </h1>
          <p className="text-[10px] text-text-secondary mt-0.5 tracking-widest">
            REACT-LEAFLET · REAL HUB COORDINATES · CLICK MARKERS FOR DIAGNOSTICS
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg border border-border/60 rounded-lg p-0.5 gap-0.5 self-start">
          {[
            { id: 'N10', label: 'TOP 10 HUBS' },
            { id: 'N1000', label: 'FULL NETWORK' },
            { id: 'heatmap', label: 'DELAY HEATMAP' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSelectedHub(null); }}
              className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-purple/20 text-purple border border-purple/40'
                  : 'text-text-secondary hover:text-text-primary hover:bg-purple/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOP 10 HUBS — React-Leaflet interactive map ─────────────────── */}
      {activeTab === 'N10' && (
        <>
          {/* Info bar */}
          <div className="glass-card flex flex-wrap items-center gap-4 px-5 py-3 border border-pink/25">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-[11px] font-bold text-text-primary">TSP Tour — N=10</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <span className="text-[11px] text-text-secondary">Distance: <span className="text-blue font-bold">6,176.00 km</span></span>
            <div className="h-4 w-px bg-border/40" />
            <span className="text-[11px] text-text-secondary">Status: <span className="font-bold" style={{ color: '#00ff88' }}>Optimal</span> <span className="inline-block h-2 w-2 rounded-full bg-green animate-pulse" /></span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[9px] text-text-secondary flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue" />
                CLICK ANY MARKER FOR HUB DIAGNOSTICS
              </span>
              <button
                onClick={() => downloadCSV(
                  TOP_HUBS.map(h => ({
                    rank: h.composite_rank,
                    name: h.name,
                    state: h.state,
                    node_id: h.node,
                    betweenness: h.betweenness,
                    sla_breach_pct: (h.pct_sla_breach * 100).toFixed(1) + '%',
                    avg_delay_ratio: h.avg_delay_ratio.toFixed(2) + 'x',
                    outbound_trips_monthly: h.outbound_trip_count,
                    ftl_share_pct: (h.pct_ftl * 100).toFixed(1) + '%',
                    dominant_route_type: h.dominant_route_type,
                    peak_dispatch: h.peak_time_of_day,
                    composite_score: h.composite_score.toFixed(4),
                    in_degree: h.in_degree,
                    out_degree: h.out_degree,
                    lat: h.lat,
                    lng: h.lng,
                  })),
                  'deliveryiq_top10_bottleneck_hubs'
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 cursor-pointer"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Map + Detail Panel */}
          <div className="relative rounded-2xl overflow-hidden border border-pink/30"
            style={{
              boxShadow: '0 0 30px rgba(255,45,120,0.12), 0 0 60px rgba(0,0,0,0.5)',
              height: '560px',
            }}
          >
            {/* Cyberpunk corner accents */}
            {[
              { top: 0, left: 0, borderTop: '2px solid #ff2d78', borderLeft: '2px solid #ff2d78', borderRadius: '14px 0 0 0' },
              { top: 0, right: 0, borderTop: '2px solid #ff2d78', borderRight: '2px solid #ff2d78', borderRadius: '0 14px 0 0' },
              { bottom: 0, left: 0, borderBottom: '2px solid #ff2d78', borderLeft: '2px solid #ff2d78', borderRadius: '0 0 0 14px' },
              { bottom: 0, right: 0, borderBottom: '2px solid #ff2d78', borderRight: '2px solid #ff2d78', borderRadius: '0 0 14px 0' },
            ].map((s, i) => (
              <div key={i} className="absolute w-8 h-8 z-[999] pointer-events-none" style={s} />
            ))}

            {/* Badge */}
            <div className="absolute top-3 left-3 z-[999] px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase backdrop-blur-sm"
              style={{ background: 'rgba(5,5,8,0.85)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78' }}>
              ⬡ REACT-LEAFLET · LIVE
            </div>

            {/* ── Filter div wraps ONLY the map tiles ──
                Overlays (corner accents, badge, panel, legend) live outside
                so they keep correct neon colours in dark mode */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                filter: isDark ? 'invert(1) hue-rotate(180deg)' : 'none',
                transition: 'filter 0.3s ease',
              }}
            >
            <MapContainer
              center={[22.5, 80.5]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* India official boundary overlay — Survey of India composite
                  Correctly shows full J&K (including Pakistan-administered
                  Kashmir and Aksai Chin) as Indian territory */}
              {indiaGeoJSON && (
                <GeoJSON
                  key="india-boundary"
                  data={indiaGeoJSON}
                  style={indiaStyle}
                />
              )}

              {/* Corridor lines */}
              {CORRIDORS.map(([a, b], i) => {
                const h1 = TOP_HUBS[a], h2 = TOP_HUBS[b];
                return (
                  <Polyline
                    key={i}
                    positions={[[h1.lat, h1.lng], [h2.lat, h2.lng]]}
                    pathOptions={{ color: '#00d4ff', weight: 1.5, opacity: 0.5, dashArray: '6 8' }}
                  />
                );
              })}

              {/* Hub markers */}
              {TOP_HUBS.map((hub, i) => {
                const color = getTierColor(hub.composite_rank);
                const isSelected = selectedHub?.node === hub.node;
                const radius = 8 + hub.betweenness * 40;
                return (
                  <CircleMarker
                    key={hub.node}
                    center={[hub.lat, hub.lng]}
                    radius={isSelected ? radius + 4 : radius}
                    pathOptions={{
                      color: isSelected ? '#fff' : color,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.9 : 0.7,
                      weight: isSelected ? 2.5 : 1.5,
                    }}
                    eventHandlers={{ click: () => handleMarkerClick(hub) }}
                  />
                );
              })}
            </MapContainer>
            </div>{/* end filter div */}

            {/* Detail Panel — outside filter, text stays readable */}
            {selectedHub && (
              <HubDetailPanel hub={selectedHub} onClose={() => setSelectedHub(null)} />
            )}

            {/* Hub rank legend */}
            {!selectedHub && (
              <div className="absolute bottom-4 left-4 z-[999] glass-card p-3 space-y-2 border border-border/40"
                style={{ background: 'rgba(5,5,8,0.9)', minWidth: '180px' }}>
                <p className="text-[8px] text-text-secondary font-bold uppercase tracking-widest">RISK TIER LEGEND</p>
                {[
                  { label: 'Critical (Rank 1–2)', color: '#ff2d78' },
                  { label: 'High (Rank 3–5)', color: '#ffd700' },
                  { label: 'Elevated (Rank 6–10)', color: '#b44fff' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] text-text-secondary">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                    {l.label}
                  </div>
                ))}
                <p className="text-[8px] text-text-secondary pt-1 border-t border-border/30">Node size = Betweenness</p>
              </div>
            )}
          </div>

          {/* Hub list below map */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TOP_HUBS.map(hub => {
              const color = getTierColor(hub.composite_rank);
              const isSelected = selectedHub?.node === hub.node;
              return (
                <button
                  key={hub.node}
                  onClick={() => setSelectedHub(isSelected ? null : hub)}
                  className="glass-card px-3 py-2 text-left transition-all border cursor-pointer hover:scale-[1.02]"
                  style={{
                    borderColor: isSelected ? color : `${color}25`,
                    boxShadow: isSelected ? `0 0 12px ${color}30` : 'none',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[9px] font-bold" style={{ color }}># {hub.composite_rank}</span>
                  </div>
                  <p className="text-[9px] text-text-primary font-bold truncate">{hub.name}</p>
                  <p className="text-[8px] text-text-secondary">{hub.state}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── FULL NETWORK & HEATMAP — iframes ────────────────────────────── */}
      {(activeTab === 'N1000' || activeTab === 'heatmap') && (() => {
        const cfg = IFRAME_MAPS[activeTab];
        return (
          <>
            {/* Info bar */}
            <div className="glass-card flex flex-wrap items-center gap-4 px-5 py-3 border" style={{ borderColor: `${cfg.borderColor}30` }}>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-[11px] font-bold text-text-primary">{cfg.tour}</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <span className="text-[11px] text-text-secondary">
                Distance: <span className="font-bold" style={{ color: cfg.borderColor }}>{cfg.distance}</span>
              </span>
              <div className="h-4 w-px bg-border/40" />
              <span className="text-[11px] text-text-secondary">
                Status: <span className="font-bold" style={{ color: cfg.statusColor }}>{cfg.status}</span>{' '}
                <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ background: cfg.statusColor }} />
              </span>
              <div className="ml-auto text-[9px] text-text-secondary flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue" /> HOVER MARKERS · SCROLL TO ZOOM
              </div>
            </div>

            {/* iframe */}
            <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: `${cfg.borderColor}40`, boxShadow: `0 0 30px ${cfg.borderColor}15`, height: '560px' }}>
              <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase backdrop-blur-sm"
                style={{ background: 'rgba(5,5,8,0.85)', border: `1px solid ${cfg.borderColor}40`, color: cfg.borderColor }}>
                ⬡ FOLIUM · LEAFLET.JS
              </div>
              <iframe
                key={activeTab}
                src={cfg.src}
                title={cfg.tour}
                style={{
                  width: '100%', height: '100%', display: 'block', border: 'none',
                  filter: isDark ? 'invert(1) hue-rotate(180deg)' : 'none',
                  transition: 'filter 0.3s ease',
                }}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cfg.stats.map((s, i) => (
                <div key={i} className="glass-card px-4 py-3 border" style={{ borderColor: `${s.color}25` }}>
                  <span className="text-[9px] text-text-secondary block uppercase tracking-wider mb-1">{s.label}</span>
                  <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );
}
