import React, { useState } from 'react';
import { NavigationModule, AppUser } from '../types';
import { 
  FileCheck2, 
  Eye, 
  Layers, 
  Send, 
  Terminal, 
  Clock, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  FoldVertical
} from 'lucide-react';

interface SidebarProps {
  currentUser?: AppUser | null;
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  counts?: {
    dispatchingPending: number;
    pendingTotal: number;
    efsrSubmitted: number;
  };
}

interface MenuItem {
  id: NavigationModule;
  label: string;
  icon: React.FC<{ className?: string }>;
  badgeKey?: 'dispatchingPending' | 'pendingTotal' | 'efsrSubmitted';
}

const menuItems: MenuItem[] = [
  {
    id: 'audit-logs',
    label: 'Service Request Audit Logs',
    icon: FileCheck2
  },
  {
    id: 'efsr-viewer',
    label: 'eFSR Viewer',
    icon: Eye,
    badgeKey: 'efsrSubmitted'
  },
  {
    id: 'ims-logs',
    label: 'IMS Logs',
    icon: Layers
  },
  {
    id: 'dispatching',
    label: 'Dispatching',
    icon: Send,
    badgeKey: 'dispatchingPending'
  },
  {
    id: 'posprep-logs',
    label: 'POSPrep Daily Logs',
    icon: Terminal
  },
  {
    id: 'pending-summary',
    label: 'Pending Summary',
    icon: Clock,
    badgeKey: 'pendingTotal'
  },
  {
    id: 'cciarco-logs',
    label: 'CCIARCO Support Daily Logs',
    icon: HelpCircle
  },
  {
    id: 'employee-management',
    label: 'User & Employee Directory',
    icon: Users
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeModule,
  onSelectModule,
  counts
}) => {
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Super Admin Role check for Employee Management
  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'super-admin';
  const visibleMenuItems = menuItems.filter(item => {
    if (item.id === 'employee-management') {
      return isSuperAdmin;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-[#1b5285] text-white flex-shrink-0 flex flex-col justify-between select-none shadow-lg">
      <div className="py-4 px-2 space-y-1">
        {/* Collapsible/Folding Portal Navigation Header */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          title="Click to fold/unfold Portal Navigation"
          className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-extrabold tracking-wider text-blue-200/80 uppercase hover:text-white hover:bg-blue-900/40 rounded transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-center space-x-1.5">
            <FoldVertical className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
            <span>PORTAL NAVIGATION</span>
          </div>
          <div className="flex items-center space-x-1 text-[9px] text-cyan-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-400/20 font-mono">
            <span>{isNavOpen ? 'FOLD' : 'UNFOLD'}</span>
            <ChevronDown className={`w-3 h-3 transform transition-transform duration-300 ${isNavOpen ? 'rotate-180' : 'rotate-0'}`} />
          </div>
        </button>

        {/* Collapsible Folding Accordion List with Slide-Down / Drop Effects */}
        <div 
          className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
            isNavOpen ? 'max-h-[600px] opacity-100 py-1' : 'max-h-0 opacity-0 py-0'
          }`}
        >
          {visibleMenuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            const badgeValue = item.badgeKey && counts ? counts[item.badgeKey] : 0;

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                style={{ transitionDelay: `${idx * 25}ms` }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 transform cursor-pointer relative group ${
                  isActive
                    ? 'bg-[#2b7ccc] text-white shadow-md font-bold translate-y-0.5 border-l-4 border-cyan-300'
                    : 'text-blue-100/90 hover:bg-[#23639e] hover:text-white hover:translate-y-1 hover:shadow-md hover:border-l-4 hover:border-cyan-400 active:translate-y-1.5'
                }`}
              >
                {/* Live hover cursor glow indicator on hover */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex items-center space-x-2.5 truncate z-10">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyan-200' : 'text-blue-200 group-hover:text-cyan-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1 z-10">
                  {badgeValue > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold transition-transform group-hover:scale-105 ${
                      isActive ? 'bg-cyan-300 text-blue-950 shadow-xs' : 'bg-blue-900/60 text-cyan-200 border border-blue-400/30'
                    }`}>
                      {badgeValue}
                    </span>
                  )}
                  {isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-blue-300/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cloud Status Footer in Sidebar */}
      <div className="p-3 bg-[#16436e] border-t border-blue-800/40 text-[11px] text-blue-200/80 space-y-1">
        <div className="flex items-center justify-between font-semibold text-white">
          <span className="font-bold text-xs tracking-wide">Tangent Azure Cloud System</span>
          <span className="flex items-center gap-1 text-[9px] text-sky-200 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-700/60 font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            Azure
          </span>
        </div>
        <p className="text-[10px] text-blue-300/70 leading-tight">
          Cloud Service System v2.6 • Realtime Sync Active
        </p>
      </div>
    </aside>
  );
};
