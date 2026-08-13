import React, { useState } from 'react';
import { ServiceRequest } from '../../types';
import { smartSdService, SmartSdAuthResponse } from '../../services/smartSdService';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Globe, 
  User, 
  Layers, 
  ArrowRight, 
  Clock, 
  ShieldCheck,
  Building2,
  Terminal,
  Database,
  Sparkles
} from 'lucide-react';

interface SmartSdSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncConfirm: (importedRequests: ServiceRequest[]) => void;
  teamLeaderName?: string;
}

export const SmartSdSyncModal: React.FC<SmartSdSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncConfirm,
  teamLeaderName = 'tl_manila_01'
}) => {
  // Form states
  const [username, setUsername] = useState<string>(teamLeaderName);
  const [password, setPassword] = useState<string>('StrateqTL2026!');
  const [baseUrl, setBaseUrl] = useState<string>('https://tangent.mysmartsd.com');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('ALL');

  // Async states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<string>('');
  const [authSession, setAuthSession] = useState<SmartSdAuthResponse | null>(null);
  const [syncedOrders, setSyncedOrders] = useState<ServiceRequest[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleAuthenticateAndSync = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSyncedOrders([]);
    setSyncStep('1. Authenticating with SMART SD Backend (Strateq API)...');

    // Step 1: Login & Get Auth Token
    const authResult = await smartSdService.login(username, password, baseUrl);

    if (!authResult.success || !authResult.token) {
      setIsLoading(false);
      setErrorMsg(authResult.error || 'SMART SD Authentication failed. Check credentials.');
      setSyncStep('');
      return;
    }

    setAuthSession(authResult);
    setSyncStep('2. Connected! Fetching Active Service Orders (SO/Tickets)...');

    // Step 2: Sync Service Orders
    setTimeout(async () => {
      setSyncStep('3. Transforming SMART SD Data to Tangent Dispatcher Logs Structure...');
      const syncResult = await smartSdService.syncServiceOrders(authResult.token!, username, {
        accountFilter: selectedAccountFilter
      });

      setIsLoading(false);
      if (!syncResult.success || !syncResult.requests) {
        setErrorMsg(syncResult.error || 'Failed to fetch Service Orders from SMART SD.');
        setSyncStep('');
        return;
      }

      setSyncedOrders(syncResult.requests);
      setSyncStep('Sync Completed Successfully!');
    }, 600);
  };

  const handleApplyImport = () => {
    if (syncedOrders.length > 0) {
      onSyncConfirm(syncedOrders);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-blue-900 text-white p-4 px-5 flex items-center justify-between border-b border-cyan-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-extrabold text-sm shadow-inner">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base tracking-wide text-white">SMART SD (Strateq) Gateway Sync</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-md">
                  Team Leader Integration
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct API Connection for Syncing Active Service Orders (SO) to Dispatcher Logs
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Credentials Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-bold">
                <KeyRound className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Team Leader Account Credentials</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Isolated in .env
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Leader Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g. tl_manila_01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SMART SD Base API URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Filter Selector */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Filter Account Channel:</span>
                <select
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">ALL ACCOUNTS (JFC, GCash, Maya, Petron, PNB, etc.)</option>
                  <option value="JFC">JFC (Jollibee Food Corp)</option>
                  <option value="GCASH">GCash Merchants</option>
                  <option value="MAYA">Maya Terminals</option>
                  <option value="PETRON">Petron Stations</option>
                  <option value="PNB">PNB Branches</option>
                  <option value="EASTWEST">EastWest Bank</option>
                </select>
              </div>

              <button
                onClick={handleAuthenticateAndSync}
                disabled={isLoading || !username}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-white transition-all shadow-md ${
                  isLoading 
                    ? 'bg-slate-500 cursor-not-allowed opacity-80' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Syncing SMART SD...' : 'Sync SMART SD'}</span>
              </button>
            </div>
          </div>

          {/* Progress / Status Section */}
          {syncStep && (
            <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 p-3 rounded-lg flex items-center space-x-3 text-cyan-900 dark:text-cyan-200">
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 animate-ping" />
              <span className="font-mono font-semibold text-[11px]">{syncStep}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Authenticated Session Badge */}
          {authSession && authSession.user && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold">Team Leader Auth Active:</span>
                <span className="font-mono font-semibold">{authSession.user.username}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                  {authSession.user.teamName}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                Source: {authSession.source}
              </span>
            </div>
          )}

          {/* Synced Service Orders Preview Table */}
          {syncedOrders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Transformed Service Orders for Dispatcher Logs ({syncedOrders.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">Status: Release To Dispatcher</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2 whitespace-nowrap">SO No.</th>
                      <th className="p-2 whitespace-nowrap">Assignm. ID</th>
                      <th className="p-2 whitespace-nowrap">Site / Merchant</th>
                      <th className="p-2 whitespace-nowrap">Summary / Type</th>
                      <th className="p-2 whitespace-nowrap">Account</th>
                      <th className="p-2 whitespace-nowrap">Assignee</th>
                      <th className="p-2 whitespace-nowrap">SLA Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    {syncedOrders.map((req, idx) => (
                      <tr key={idx} className="hover:bg-cyan-50/50 dark:hover:bg-slate-800/50 font-medium">
                        <td className="p-2 font-mono font-bold text-blue-600 dark:text-cyan-400 whitespace-nowrap">{req.srn}</td>
                        <td className="p-2 font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{req.assignmentId || `SR-${15169 + idx}`}</td>
                        <td className="p-2 font-bold text-slate-800 dark:text-slate-100">{req.merchantName}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-cyan-300 font-extrabold text-[10px] whitespace-nowrap">
                            {req.requestCategory}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{req.accountName}</td>
                        <td className="p-2 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{req.assignee || req.assignedFTName || 'FT-TL Jherico Pantaleon'}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 text-[10px] truncate max-w-[160px]" title={req.slaRemarks}>
                          {req.slaRemarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 px-5 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {syncedOrders.length > 0 
              ? `${syncedOrders.length} active tickets mapped to Tangent Dispatcher Logs structure` 
              : 'Enter Team Leader credentials and click Sync SMART SD to pull active SOs'}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            {syncedOrders.length > 0 && (
              <button
                onClick={handleApplyImport}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
              >
                <span>Import {syncedOrders.length} Tickets to Dispatcher Logs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
