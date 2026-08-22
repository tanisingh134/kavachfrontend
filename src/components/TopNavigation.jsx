import React from 'react';
import {
  Shield, Compass, Cpu, Mic, Bot, RefreshCw,
  HelpCircle, Users, GitBranch, Sparkles, Search, Sliders
} from 'lucide-react';
import { translations } from '../services/translations';

export default function TopNavigation({ activeTab, onSelectTab, isOffline, language = 'en' }) {
  const t = translations[language] || translations.en;

  const tabs = [
    {
      id: 'dashboard',
      label: t.tabDashboard || '1. Live Mesh Map',
      icon: Shield,
      badge: 'Live',
      badgeColor: 'bg-yellow-500 text-slate-950'
    },
    {
      id: 'graph-search',
      label: t.tabGraphSearch || '⭐ Graph Search & Prefs',
      icon: Search,
      badge: 'Graph AI',
      badgeColor: 'bg-violet-500 text-white animate-pulse'
    },
    {
      id: 'counterfactual',
      label: t.tabCounterfactual || '2. Counterfactual Sim',
      icon: GitBranch,
      badge: 'What-If',
      badgeColor: 'bg-violet-500 text-white'
    },
    {
      id: 'prediction',
      label: t.tabTwoMinute || '3. 2-Min Prediction',
      icon: Compass,
      badge: '🔮 Forward',
      badgeColor: 'bg-violet-500 text-slate-950 font-black'
    },
    {
      id: 'offline-brain',
      label: t.tabOffline || '4. Offline Brain',
      icon: Cpu,
      badge: isOffline ? 'Offline' : 'Edge',
      badgeColor: isOffline ? 'bg-amber-500 text-slate-950' : 'bg-yellow-600 text-white'
    },
    {
      id: 'silent-sos',
      label: t.tabSilentSos || '5. Silent SOS',
      icon: Mic,
      badge: 'Acoustic',
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'alert-escalation',
      label: t.tabEscalation || '6. AI Alert Tiers',
      icon: Bot,
      badge: '4-Tiers',
      badgeColor: 'bg-violet-600 text-white'
    },
    {
      id: 'self-correcting',
      label: t.tabSelfCorrecting || '7. Self-Correcting',
      icon: RefreshCw,
      badge: 'Telemetry',
      badgeColor: 'bg-yellow-500 text-slate-950'
    },
    {
      id: 'explainability',
      label: t.tabExplainability || '8. Explainable AI',
      icon: HelpCircle,
      badge: 'XAI',
      badgeColor: 'bg-violet-500 text-white'
    },
    {
      id: 'safety-network',
      label: t.tabSafetyNetwork || '9. Family Network',
      icon: Users,
      badge: 'Portal',
      badgeColor: 'bg-slate-700 text-slate-200'
    }
  ];

  return (
    <nav className="glass-panel border-b border-safety-border/60 px-3 sm:px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-amber-500/20 border border-amber-400 text-amber-200 shadow-lg shadow-amber-950/50 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm ${
                isActive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
