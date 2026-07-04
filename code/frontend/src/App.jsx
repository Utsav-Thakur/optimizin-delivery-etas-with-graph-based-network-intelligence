import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  Route, 
  BarChart2, 
  Truck, 
  Brain, 
  FileText, 
  Info,
  Menu,
  ShieldCheck,
  Zap
} from 'lucide-react';

// Import UI Component
import ParticleBackground from './components/ui/ParticleBackground';

// Import Pages
import Overview from './pages/Overview';
import NetworkMaps from './pages/NetworkMaps';
import BottleneckHubs from './pages/BottleneckHubs';
import CorridorAudit from './pages/CorridorAudit';
import ETAModel from './pages/ETAModel';
import FTLAdvisor from './pages/FTLAdvisor';
import IntelligenceCentre from './pages/IntelligenceCentre';
import StrategyMemo from './pages/StrategyMemo';
import About from './pages/About';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

function DashboardApp() {
  const [activePage, setActivePage] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Theme state: React state only (No localStorage, sessionStorage)
  const [theme, setTheme] = useState('dark');

  // Full-bleed mode: hide sidebar on landing/overview page
  const isLanding = activePage === 'Overview';

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sidebar sections
  const sections = [
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Network Maps', icon: MapPin },
        { name: 'Bottleneck Hubs', icon: AlertTriangle },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Corridor Audit', icon: Route },
        { name: 'ETA Model', icon: BarChart2 },
        { name: 'FTL Advisor', icon: Truck },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Intelligence Centre', icon: Brain },
        { name: 'Strategy Memo', icon: FileText },
        { name: 'About', icon: Info },
      ]
    }
  ];

  const renderActivePage = () => {
    const isDark = theme === 'dark';
    switch (activePage) {
      case 'Overview': return <Overview isDark={isDark} setActivePage={setActivePage} />;
      case 'Network Maps': return <NetworkMaps isDark={isDark} />;
      case 'Bottleneck Hubs': return <BottleneckHubs isDark={isDark} />;
      case 'Corridor Audit': return <CorridorAudit isDark={isDark} />;
      case 'ETA Model': return <ETAModel isDark={isDark} />;
      case 'FTL Advisor': return <FTLAdvisor isDark={isDark} />;
      case 'Intelligence Centre': return <IntelligenceCentre isDark={isDark} />;
      case 'Strategy Memo': return <StrategyMemo isDark={isDark} />;
      case 'About': return <About isDark={isDark} />;
      default: return <Overview isDark={isDark} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex relative overflow-hidden">
      {/* 40 Animated Particles behind everything */}
      <ParticleBackground />

      {/* Sidebar Navigation — hidden on Overview landing page */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-bg border-r border-purple/20 z-30 transition-transform duration-300 w-[240px] select-none flex flex-col justify-between print:hidden ${
          sidebarOpen && !isLanding ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderLeft: '1px solid rgba(180, 79, 255, 0.15)' }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="p-5 border-b border-border/40 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold tracking-wider gradient-text-purple">
                ⬡ DeliveryIQ
              </h2>
              <span className="text-[10px] text-text-secondary font-medium tracking-widest uppercase mt-0.5">
                Graph Intelligence
              </span>
            </div>
            {/* Animated status dot (live) */}
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple pulse-dot text-purple" />
              <span className="text-[9px] font-bold text-purple uppercase tracking-wider">Live</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* Section Header */}
                <div className="px-3 flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold tracking-widest text-text-secondary uppercase">
                    {section.title}
                  </span>
                  <div className="h-[1px] flex-1 bg-border/20 ml-2" />
                </div>

                {/* Items */}
                <div className="space-y-0.5">
                  {section.items.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.name;
                    return (
                      <button
                        key={idx}
                        id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setActivePage(item.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition duration-200 group border border-transparent ${
                          isActive 
                            ? 'glass-card border-l-2 border-l-purple glow-purple text-transparent bg-clip-text' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-purple/10 hover:border-l-2 hover:border-l-purple/50'
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-purple' : 'text-text-secondary group-hover:text-purple'}`} />
                        <span className={isActive ? 'gradient-text-purple font-bold' : ''}>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer - Network Status */}
        <div className="p-4 border-t border-border/40 bg-bg/60">
          <div className="glass-card p-3 flex items-center gap-3 border border-purple/20">
            <span className="h-2.5 w-2.5 rounded-full bg-green pulse-dot text-green" />
            <div>
              <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Network Status</p>
              <p className="text-[9px] text-green font-medium uppercase tracking-wide">Operational // Live</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 min-h-screen relative z-10 print:pl-0 ${
          sidebarOpen && !isLanding ? 'pl-[240px]' : 'pl-0'
        }`}
      >
        {/* Top Header Panel — condensed on landing page */}
        <header className="bg-bg/85 backdrop-blur border-b border-border/40 px-6 py-3 flex items-center justify-between sticky top-0 z-20 print:hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle — only shown on inner pages */}
            {!isLanding && (
              <button
                id="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg border border-border hover:border-purple/50 bg-card/60 text-text-secondary hover:text-text-primary transition"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            {/* Logo / brand — always visible */}
            <button
              onClick={() => setActivePage('Overview')}
              className="flex flex-col cursor-pointer"
            >
              <h2 className="text-[16px] font-bold tracking-wider gradient-text-purple leading-none">⬡ DeliveryIQ</h2>
              <span className="text-[9px] text-text-secondary font-medium tracking-widest uppercase">Graph Intelligence</span>
            </button>
            {!isLanding && (
              <div className="hidden sm:block border-l border-border pl-4">
                <span className="text-[10px] text-text-secondary font-bold block uppercase tracking-wider">Logistics Pipeline</span>
                <span className="text-[9px] text-purple font-semibold">144.8K Rows Mapped</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme state switcher (React state only) */}
            <button
              id="theme-switcher"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 text-[10px] font-bold tracking-wider rounded border border-purple/30 bg-purple/10 text-purple hover:bg-purple/20 transition cursor-pointer"
            >
              {theme.toUpperCase()} MODE
            </button>
            
            <div className="flex items-center gap-2 bg-card/80 border border-border px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green animate-pulse"></span>
              <span className="text-[9px] font-bold text-text-primary uppercase tracking-wider">Model Offline</span>
            </div>
          </div>
        </header>

        {/* Active Page Viewport Frame */}
        <main className={`flex-1 w-full mx-auto print:p-0 ${
          isLanding
            ? 'max-w-[1200px] px-6 md:px-12'
            : 'p-6 md:p-8 max-w-[1400px]'
        }`}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardApp />
    </QueryClientProvider>
  );
}
