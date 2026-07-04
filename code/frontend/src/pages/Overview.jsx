import React, { useEffect, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import {
  Building2, Clock, AlertTriangle, Activity, DollarSign,
  Network, Brain, Truck, MapPin, BarChart2, Route,
  TrendingUp, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import CyberKPICard from '../components/ui/CyberKPICard';
import CyberTooltip from '../components/charts/CyberTooltip';

// ─── Delay by Time of Day data ──────────────────────────────────────────────
const timeDelayData = [
  { name: 'Morning', delay: 1.8 },
  { name: 'Afternoon', delay: 2.1 },
  { name: 'Evening', delay: 2.6 },
  { name: 'Night', delay: 3.1 },
];

// ─── Route Type split data ───────────────────────────────────────────────────
const routeSplitData = [
  { name: 'FTL', value: 99660, pct: 68.8 },
  { name: 'Carting', value: 45207, pct: 31.2 },
];
const PIE_COLORS = ['#b44fff', '#00d4ff'];

// ─── Insight cards ───────────────────────────────────────────────────────────
const insights = [
  {
    color: '#ff2d78', icon: AlertTriangle, badgeClass: 'badge-pink',
    tag: 'Data Quality Finding',
    title: '1,170 Ghost Corridors Detected',
    body: 'Corridors with zero activity but registered in the network — potential data quality issues inflating node count. Excluded from graph construction after validation.',
  },
  {
    color: '#ffd700', icon: TrendingUp, badgeClass: 'badge-gold',
    tag: 'Time Pattern Insight',
    title: 'Night Shipments 3.1x More Delayed',
    body: 'Evening and Night time buckets show 3.1x average delay vs 1.8x for Morning slots. Shifting 30% of Night volume to Morning could recover 18% of SLA breaches.',
  },
  {
    color: '#b44fff', icon: Network, badgeClass: 'badge-purple',
    tag: 'Critical Finding',
    title: 'Top 3 Hubs = 41% of All Delays',
    body: 'Three facilities account for 41% of total SLA breach contribution based on betweenness centrality × pct_sla_breach composite score. Upgrading these 3 recovers majority of at-risk revenue.',
  },
  {
    color: '#00ff88', icon: Truck, badgeClass: 'badge-green',
    tag: 'Quick Win',
    title: 'FTL Outperforms Carting on 150km+',
    body: 'Routes exceeding 150km show 18% lower delay ratio under FTL vs Carting. Converting 2,847 eligible Carting segments to FTL could reduce network delay ratio from 2.22x to 1.91x.',
  },
];

// ─── CTA nav links ───────────────────────────────────────────────────────────
const ctaLinks = [
  { icon: MapPin,       color: '#b44fff', page: 'Network Maps',        title: 'Network Maps',       sub: 'Interactive Leaflet topology' },
  { icon: AlertTriangle,color: '#ff2d78', page: 'Bottleneck Hubs',     title: 'Bottleneck Hubs',    sub: 'Top 20 critical facilities' },
  { icon: Route,        color: '#00d4ff', page: 'Corridor Audit',      title: 'Corridor Audit',     sub: 'Top 50 delayed routes' },
  { icon: BarChart2,    color: '#ffd700', page: 'ETA Model',           title: 'ETA Model',          sub: 'Baseline vs graph benchmark' },
  { icon: Truck,        color: '#00ff88', page: 'FTL Advisor',         title: 'FTL Advisor',        sub: 'Embedded ML decisions' },
  { icon: Brain,        color: '#b44fff', page: 'Intelligence Centre', title: 'Intelligence',       sub: 'Pre-computed AI insights' },
];

// ─── Custom Pie center label ─────────────────────────────────────────────────
function PieCenterLabel({ cx, cy }) {
  return (
    <text x={cx} y={cy} textAnchor="middle">
      <tspan
        x={cx} dy="-4" fontSize="18" fontWeight="800" fontFamily="monospace"
        fill="url(#pieGrad)"
      >144,867</tspan>
      <tspan x={cx} dy="18" fontSize="10" fill="#6b6b9a" fontFamily="monospace">Total Trips</tspan>
    </text>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Overview({ isDark, setActivePage }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredInsight, setHoveredInsight] = useState(null);
  const [hoveredCta, setHoveredCta] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const nav = (page) => setActivePage && setActivePage(page);

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>

      {/* ── SECTION 1 · HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          width: '100%',
          textAlign: 'center',
          paddingTop: '64px',
          paddingBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated radial blobs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 50% at 10% 10%, #b44fff08 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 90% 5%,  #00d4ff08 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 90%, #ff2d7808 0%, transparent 70%)
          `,
          animation: 'heroGradientShift 20s ease infinite alternate',
        }} />

        <style>{`
          @keyframes heroGradientShift {
            0%   { opacity: 1; transform: scale(1); }
            100% { opacity: 0.6; transform: scale(1.05); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>

        {/* Badge */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s ease',
          marginBottom: '24px',
        }}>
          <span className="badge-purple" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
            ⬡ Graph-Based Network Intelligence · 144,867 Trip Segments
          </span>
        </div>

        {/* Heading — TypeAnimation */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease 0.1s',
          marginBottom: '20px',
          minHeight: '72px',
        }}>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #b44fff 0%, #00d4ff 50%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Outfit", sans-serif',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            <TypeAnimation
              sequence={[
                'Optimizing Delivery ETAs with Graph Intelligence',
                2800,
                'Identifying Bottleneck Hubs Across 1,508 Facilities',
                2800,
                '83% of Corridors Delayed vs OSRM Predictions',
                2800,
                'XGBoost + NetworkX + Rule-Based AI Engine',
                2800,
              ]}
              wrapper="span"
              speed={52}
              repeat={Infinity}
              cursor={true}
            />
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: '#6b6b9a',
          maxWidth: '580px',
          margin: '0 auto 28px',
          lineHeight: 1.7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s',
        }}>
          An end-to-end Graph Intelligence system predicting delivery ETAs,
          surfacing bottleneck hubs, and generating zero-API AI recommendations
          for Delhivery's 1,508-facility logistics network.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '14px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '22px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s',
        }}>
          <button
            onClick={() => nav('Network Maps')}
            style={{
              background: 'linear-gradient(135deg, #b44fff, #00d4ff)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 28px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(180,79,255,0.4)',
              letterSpacing: '0.02em',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(180,79,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(180,79,255,0.4)'; }}
          >
            Explore Network Maps →
          </button>

          <button
            onClick={() => nav('Bottleneck Hubs')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(180,79,255,0.4)',
              borderRadius: '10px',
              padding: '12px 28px',
              color: '#b44fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,79,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            View Bottleneck Hubs
          </button>
        </div>

        {/* Trust pills */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s ease 0.8s',
        }}>
          {['ROC-AUC Model Validated', 'Zero API Calls', 'Graph-Enhanced Predictions'].map((pill, i) => (
            <span key={i} style={{ fontSize: '11px', color: '#6b6b9a', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: '#00ff88', fontWeight: 700 }}>✓</span> {pill}
            </span>
          ))}
        </div>
      </section>

      {/* ── SECTION 2 · KPI CARDS ────────────────────────────────────────── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginTop: '-8px',
        marginBottom: '48px',
      }}>
        <CyberKPICard title="Total Facilities"      value={1508}  icon={Building2}      color="#b44fff" sub="Source + destination nodes"        delay={1000} />
        <CyberKPICard title="Avg Delay Ratio"       value={2.22}  icon={Clock}          color="#00d4ff" sub="vs OSRM predictions"  suffix="x"   delay={1120} />
        <CyberKPICard title="Corridors Delayed"     value={83}    icon={AlertTriangle}  color="#ff2d78" sub=">20% delay vs OSRM"   suffix="%"   delay={1240} />
        <CyberKPICard title="Network Health Score"  value={34}    icon={Activity}       color="#ffd700" sub="Critical — immediate action" suffix="/100" delay={1360} />
        <CyberKPICard title="Revenue at Risk"       value={14.8}  icon={DollarSign}     color="#00ff88" sub="₹Cr estimated monthly" prefix="₹" suffix="Cr" delay={1480} />
      </section>

      {/* ── SECTION 3 · HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ marginBottom: '52px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #b44fff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
          }}>How DeliveryIQ Works</h2>
          <p style={{ fontSize: '13px', color: '#6b6b9a' }}>From raw trip data to actionable network intelligence</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', flexWrap: 'wrap' }}>
          {/* Step 1 */}
          <div className="glass-card hover-lift" style={{ flex: 1, minWidth: '220px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#b44fff10', border: '1px solid #b44fff30', borderRadius: '12px', padding: '12px', display: 'inline-flex', width: 'fit-content' }}>
              <Network style={{ width: '28px', height: '28px', color: '#b44fff' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Build the Network Graph</h3>
            <p style={{ fontSize: '11px', color: '#6b6b9a', lineHeight: 1.65, flex: 1 }}>
              144,867 trip segments parsed into a directed weighted graph. 1,508 facilities as nodes, corridors as edges weighted by median delay ratio stratified by route type and time of day.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="badge-purple" style={{ width: 'fit-content', fontSize: '9px' }}>NetworkX · GraphML</span>
              <span style={{ fontSize: '11px', color: '#b44fff', fontWeight: 700 }}>1,508 Nodes · 2,847 Edges</span>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '22px', background: 'linear-gradient(135deg, #b44fff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', flexShrink: 0, padding: '0 4px' }}>→</div>

          {/* Step 2 */}
          <div className="glass-card hover-lift" style={{ flex: 1, minWidth: '220px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#00d4ff10', border: '1px solid #00d4ff30', borderRadius: '12px', padding: '12px', display: 'inline-flex', width: 'fit-content' }}>
              <AlertTriangle style={{ width: '28px', height: '28px', color: '#00d4ff' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Surface Critical Hubs</h3>
            <p style={{ fontSize: '11px', color: '#6b6b9a', lineHeight: 1.65, flex: 1 }}>
              Betweenness centrality, in/out degree, and clustering coefficients computed for every hub. Composite risk score identifies chokepoints causing SLA breaches across the network.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="badge-blue" style={{ width: 'fit-content', fontSize: '9px' }}>XGBoost · Graph Features</span>
              <span style={{ fontSize: '11px', color: '#00d4ff', fontWeight: 700 }}>Top 20 Hubs Ranked</span>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '22px', background: 'linear-gradient(135deg, #00d4ff, #ff2d78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', flexShrink: 0, padding: '0 4px' }}>→</div>

          {/* Step 3 */}
          <div className="glass-card hover-lift" style={{ flex: 1, minWidth: '220px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#ff2d7810', border: '1px solid #ff2d7830', borderRadius: '12px', padding: '12px', display: 'inline-flex', width: 'fit-content' }}>
              <Brain style={{ width: '28px', height: '28px', color: '#ff2d78' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zero-API Intelligence</h3>
            <p style={{ fontSize: '11px', color: '#6b6b9a', lineHeight: 1.65, flex: 1 }}>
              Rule-based engine + pre-computed ML outputs generate instant hub insights, corridor fixes, and FTL vs Carting recommendations — no API calls required at runtime.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="badge-pink" style={{ width: 'fit-content', fontSize: '9px' }}>Rule-Based · Pre-Computed ML</span>
              <span style={{ fontSize: '11px', color: '#ff2d78', fontWeight: 700 }}>5 AI JSON Files Embedded</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · INSIGHT CALLOUTS ─────────────────────────────────── */}
      <section style={{ marginBottom: '52px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #b44fff 0%, #00d4ff 50%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
          }}>Key Network Intelligence</h2>
          <p style={{ fontSize: '13px', color: '#6b6b9a' }}>Pre-computed findings a network manager would miss in a summary report</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {insights.map((ins, i) => {
            const Icon = ins.icon;
            const isHovered = hoveredInsight === i;
            return (
              <div
                key={i}
                className="glass-card"
                onMouseEnter={() => setHoveredInsight(i)}
                onMouseLeave={() => setHoveredInsight(null)}
                style={{
                  borderLeft: `4px solid ${ins.color}`,
                  background: isHovered ? `${ins.color}08` : 'var(--bg-card)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'default',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
                  boxShadow: isHovered ? `0 0 20px ${ins.color}25, 0 8px 32px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: `${ins.color}15`, border: `1px solid ${ins.color}30`, borderRadius: '8px', padding: '6px' }}>
                    <Icon style={{ width: '16px', height: '16px', color: ins.color }} />
                  </div>
                  <span className={ins.badgeClass} style={{ fontSize: '9px' }}>{ins.tag}</span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#e8e8ff', lineHeight: 1.3 }}>{ins.title}</h3>
                <p style={{ fontSize: '11px', color: '#6b6b9a', lineHeight: 1.65 }}>{ins.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 5 · CHARTS ROW ───────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '52px' }}>

        {/* Chart 1 — Delay by Time of Day */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 700, marginBottom: '4px',
            background: 'linear-gradient(135deg, #00d4ff, #b44fff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Delay by Time of Day</h3>
          <p style={{ fontSize: '11px', color: '#6b6b9a', marginBottom: '16px' }}>Avg delay ratio vs OSRM per time bucket</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeDelayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b44fff" />
                  <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1a1a3a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b6b9a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b9a', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 4]} />
              <Tooltip content={<CyberTooltip suffix="x" />} />
              <Bar dataKey="delay" fill="url(#barGrad)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1200} name="Delay Ratio" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — Route Type Distribution (Donut) */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 700, marginBottom: '4px',
            background: 'linear-gradient(135deg, #b44fff, #00d4ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Route Type Distribution</h3>
          <p style={{ fontSize: '11px', color: '#6b6b9a', marginBottom: '8px' }}>FTL vs Carting trip volume breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <defs>
                <linearGradient id="pieGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b44fff" />
                  <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
              <Pie
                data={routeSplitData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                dataKey="value"
                isAnimationActive
                animationDuration={1200}
                label={({ name, pct }) => `${name} ${pct}%`}
                labelLine={{ stroke: '#6b6b9a', strokeWidth: 1 }}
              >
                {routeSplitData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} style={{ filter: `drop-shadow(0 0 6px ${PIE_COLORS[i]}80)` }} />
                ))}
              </Pie>
              <PieCenterLabel cx="50%" cy="50%" />
              <Tooltip content={<CyberTooltip />} />
              <Legend
                formatter={(value, entry) => (
                  <span style={{ fontSize: '10px', color: entry.color, fontFamily: 'monospace', fontWeight: 700 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
            <span className="badge-purple" style={{ fontSize: '9px' }}>FTL: 99,660 trips</span>
            <span className="badge-blue" style={{ fontSize: '9px' }}>Carting: 45,207 trips</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 · CTA LINKS ROW ────────────────────────────────────── */}
      <section style={{
        textAlign: 'center',
        padding: '48px 0 24px',
        borderTop: '1px solid rgba(180,79,255,0.1)',
      }}>
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #b44fff 0%, #00d4ff 50%, #ff2d78 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px',
        }}>Explore the Full Analysis</h2>
        <p style={{ fontSize: '13px', color: '#6b6b9a', marginBottom: '32px' }}>
          Every insight is pre-computed — instant load, zero API calls
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {ctaLinks.map((link, i) => {
            const Icon = link.icon;
            const isHov = hoveredCta === i;
            return (
              <button
                key={i}
                onClick={() => nav(link.page)}
                onMouseEnter={() => setHoveredCta(i)}
                onMouseLeave={() => setHoveredCta(null)}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  border: `1px solid ${isHov ? link.color + '50' : 'rgba(180,79,255,0.1)'}`,
                  borderRadius: '14px',
                  transform: isHov ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'transform 0.22s, border-color 0.22s, box-shadow 0.22s',
                  boxShadow: isHov ? `0 0 18px ${link.color}25, 0 8px 24px rgba(0,0,0,0.4)` : '0 2px 12px rgba(0,0,0,0.2)',
                  background: 'var(--bg-card)',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{
                  background: `${link.color}15`,
                  border: `1px solid ${link.color}30`,
                  borderRadius: '10px',
                  padding: '10px',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '22px', height: '22px', color: link.color }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#e8e8ff', marginBottom: '3px' }}>{link.title}</p>
                  <p style={{ fontSize: '10px', color: '#6b6b9a' }}>{link.sub}</p>
                </div>
                <ChevronRight
                  style={{
                    width: '16px', height: '16px',
                    color: link.color,
                    opacity: isHov ? 1 : 0,
                    transition: 'opacity 0.2s',
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
