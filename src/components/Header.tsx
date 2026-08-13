import React from 'react';
import { UserProfile, NavigationModule, AppUser } from '../types';
import { Home, LogOut, Cloud, RefreshCw, Radio, Smartphone, Users, Wifi, WifiOff, Sun, Moon, ShieldCheck } from 'lucide-react';
import { TangentLogo } from './common/TangentLogo';

interface HeaderProps {
  user: UserProfile;
  currentUser?: AppUser | null;
  activeModule: NavigationModule;
  onNavigateHome: () => void;
  onRefreshData?: () => void;
  onOpenNewSRNModal?: () => void;
  onOpenMobilePortal?: () => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
  isSyncing?: boolean;
  isOffline?: boolean;
  onSimulateOffline?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const moduleTitles: Record<NavigationModule, string> = {
  'audit-logs': 'Service Request Audit Logs',
  'efsr-viewer': 'eFSR Viewer & Report Verification',
  'ims-logs': 'IMS Terminal Inventory Logs',
  'dispatching': 'Dispatcher Logs',
  'posprep-logs': 'POSPrep Daily Preparation Logs',
  'pending-summary': 'Pending Service Request Summary',
  'cciarco-logs': 'CCIARCO Support Daily Logs',
  'employee-management': 'User & Employee Directory'
};

export const Header: React.FC<HeaderProps> = ({
  user,
  currentUser,
  activeModule,
  onNavigateHome,
  onRefreshData,
  onOpenNewSRNModal,
  onOpenMobilePortal,
  onOpenProfileModal,
  onLogout,
  isSyncing = false,
  isOffline = false,
  onSimulateOffline,
  isDarkMode = true,
  onToggleTheme
}) => {
  const displayAvatar = currentUser?.avatar || user.avatar;
  const displayName = currentUser ? currentUser.name : user.name;
  const displayRole = currentUser ? currentUser.role.replace('-', ' ') : user.role;

  return (
    <header className="bg-[#1e588f] text-white h-14 px-4 flex items-center justify-between shadow-md border-b border-[#184673] select-none sticky top-0 z-30">
      {/* Left: Brand Logo & Module Name */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={onNavigateHome}
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {/* Tangent Custom Icon */}
          <TangentLogo className="w-8 h-8 rounded-full shadow-md" />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wide uppercase text-white font-sans leading-tight">
              TANGENT AZURE CLOUD SYSTEM
            </span>
            <span className="text-[9px] text-cyan-200 tracking-wider font-semibold uppercase">
              Cloud Service System
            </span>
          </div>
        </div>

        {/* Dynamic Header Title matching screenshot */}
        <div className="hidden md:flex items-center space-x-2 border-l border-blue-400/40 pl-6">
          <h1 className="text-xl font-bold tracking-tight text-emerald-300 font-sans">
            {moduleTitles[activeModule]}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Live Cloud Badge, User Info */}
      <div className="flex items-center space-x-4">
        {/* Connection Offline Toggle & Status */}
        {onSimulateOffline && (
          <button
            onClick={onSimulateOffline}
            title={isOffline ? "Connection Lost! Click to Reconnect" : "Click to Simulate Network Disconnection"}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              isOffline
                ? 'bg-rose-900/90 text-rose-200 border-rose-500 animate-pulse shadow-md'
                : 'bg-slate-900/60 text-cyan-200 border-cyan-400/40 hover:bg-slate-800'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span className="text-[11px] uppercase">OFFLINE MODE</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline text-[10px] text-emerald-300">ONLINE</span>
              </>
            )}
          </button>
        )}

        {/* HTTPS / SSL Encrypted Connection Badge */}
        <div 
          className="flex items-center space-x-1.5 bg-emerald-950/90 text-emerald-300 border border-emerald-400/60 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm tracking-wide cursor-default hover:bg-emerald-900 transition-colors"
          title="Custom Domain: https://dispatcher.tangentsolutionsinc.com (256-Bit TLS/SSL Encrypted Connection)"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider">HTTPS / SSL Encrypted</span>
          <span className="sm:hidden text-[10px]">SSL</span>
        </div>

        {/* Sync & Cloud Status */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#184673]/60 px-3 py-1 rounded-full text-xs text-blue-100 border border-blue-400/30">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-300">Cloud Live</span>
          <span className="text-blue-300/60">|</span>
          <Cloud className="w-3.5 h-3.5 text-cyan-300" />
          <span>Syncing Realtime</span>
          <span className="text-blue-300/60">|</span>
          <span className="px-1.5 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-400/60 rounded text-[9px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Azure Connected
          </span>
        </div>

        {/* Refresh / Action button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            title="Refresh Cloud Data"
            className="p-1.5 rounded-md hover:bg-blue-700/60 text-blue-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
          </button>
        )}

        {/* Dark/Light Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Theme`}
            className="p-1.5 rounded-md hover:bg-blue-700/60 text-amber-300 transition-colors cursor-pointer flex items-center justify-center"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-sky-200" />
            )}
          </button>
        )}

        {/* Quick Mobile Tech Portal Trigger */}
        {onOpenMobilePortal && (
          <button
            onClick={onOpenMobilePortal}
            title="Open Mobile Field Tech App View"
            className="hidden sm:flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded shadow transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Field Tech Mobile App</span>
          </button>
        )}

        {/* Quick New SRN trigger */}
        {onOpenNewSRNModal && (
          <button
            onClick={onOpenNewSRNModal}
            className="hidden sm:flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-2.5 py-1 rounded shadow transition-colors cursor-pointer"
          >
            <span>+ Release SRN</span>
          </button>
        )}

        {/* User Info & Avatar matching screenshot top right */}
        <div 
          onClick={onOpenProfileModal}
          title="Click to view / update Profile & Change Password"
          className="flex items-center space-x-2 pl-2 border-l border-blue-400/30 cursor-pointer hover:opacity-90 group transition-opacity"
        >
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[10px] text-amber-300 font-bold tracking-wide">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}!
            </span>
            <span className="text-xs font-semibold text-blue-50 -mt-0.5 group-hover:text-amber-200 transition-colors">
              {displayName}
            </span>
            <span className="text-[9px] text-cyan-200 capitalize font-mono -mt-0.5">
              {displayRole}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300 bg-amber-400 flex items-center justify-center text-amber-900 font-bold text-xs shadow-xs group-hover:ring-2 group-hover:ring-cyan-300 transition-all">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              'JP'
            )}
          </div>
        </div>

        <button 
          onClick={onNavigateHome}
          title="Home Portal"
          className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded transition-colors cursor-pointer ml-1"
        >
          <Home className="w-4 h-4" />
        </button>

        {onLogout && (
          <button 
            onClick={onLogout}
            title="Logout / Switch Account"
            className="p-1.5 text-blue-100 hover:text-rose-200 hover:bg-rose-800/40 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
