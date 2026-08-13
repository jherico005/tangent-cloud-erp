import React from 'react';
import { ServiceRequest, FieldTechnician } from '../../types';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Send, ShieldCheck, PieChart, Users, Activity } from 'lucide-react';

interface DashboardTabProps {
  requests: ServiceRequest[];
  fieldTechnicians: FieldTechnician[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ requests, fieldTechnicians }) => {
  const totalSRNs = requests.length;
  const releasedCount = requests.filter(r => r.status === 'Release To Dispatcher').length;
  const dispatchedCount = requests.filter(r => r.status === 'Dispatched' || r.status === 'In Transit').length;
  const efsrSubmittedCount = requests.filter(r => r.status === 'eFSR Submitted').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  const southLuzonCount = requests.filter(r => r.sector === 'SOUTH LUZON').length;
  const northLuzonCount = requests.filter(r => r.sector === 'NORTH LUZON').length;
  const manilaCount = requests.filter(r => r.sector === 'MANILA').length;

  return (
    <div className="space-y-4 text-xs">
      {/* Live System Activity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-3 rounded-lg text-white flex items-center justify-between border border-blue-800/40 shadow-sm relative overflow-hidden group transform transition-all duration-300 hover:translate-y-1 hover:shadow-md">
        <div className="flex items-center space-x-2.5 z-10">
          <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">LIVE DASHBOARD MONITORING</h4>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-blue-200/70">Real-time telemetry and field technician tracking active</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-200/60 hidden sm:inline-block">Auto-Sync 100ms</span>
      </div>

      {/* Top Stat Cards with Live Slide-Down Hover Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:translate-y-1.5 hover:shadow-md hover:border-amber-400 active:translate-y-2">
          {/* Top glowing cursor beam */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block group-hover:text-amber-700 transition-colors">Pending Release</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-amber-600 group-hover:scale-105 transition-transform">{releasedCount}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Ready for FT dispatch</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:translate-y-1.5 hover:shadow-md hover:border-blue-400 active:translate-y-2">
          {/* Top glowing cursor beam */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block group-hover:text-blue-700 transition-colors">Active Dispatched</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-blue-600 group-hover:scale-105 transition-transform">{dispatchedCount}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Technicians on field</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all">
            <Send className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:translate-y-1.5 hover:shadow-md hover:border-purple-400 active:translate-y-2">
          {/* Top glowing cursor beam */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block group-hover:text-purple-700 transition-colors">eFSR Submitted</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-purple-600 group-hover:scale-105 transition-transform">{efsrSubmittedCount}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Awaiting dispatcher audit</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-100 transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:translate-y-1.5 hover:shadow-md hover:border-emerald-400 active:translate-y-2">
          {/* Top glowing cursor beam */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block group-hover:text-emerald-700 transition-colors">Completed Today</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 group-hover:scale-105 transition-transform">{completedCount + 3}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">100% SLA target</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown Charts / Progress bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector Volume Distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 transform transition-all duration-300 hover:translate-y-1.5 hover:shadow-md hover:border-blue-300">
          <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Sector Service Request Distribution</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>South Luzon (Batangas / Laguna / Cavite)</span>
                <span className="font-bold text-blue-600">{southLuzonCount} SRNs</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (southLuzonCount / (totalSRNs || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="p-2 rounded-lg hover:bg-cyan-50/50 transition-colors">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>North Luzon (Pampanga / Bulacan / Baguio)</span>
                <span className="font-bold text-cyan-600">{northLuzonCount} SRNs</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (northLuzonCount / (totalSRNs || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="p-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>NCR / Metro Manila</span>
                <span className="font-bold text-indigo-600">{manilaCount} SRNs</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (manilaCount / (totalSRNs || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Fleet Capacity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 transform transition-all duration-300 hover:translate-y-1.5 hover:shadow-md hover:border-emerald-300">
          <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Field Technician Availability</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{fieldTechnicians.length} Technicians</span>
          </h3>

          <div className="space-y-2">
            {fieldTechnicians.map((ft) => (
              <div 
                key={ft.id} 
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 transform transition-all duration-200 hover:translate-y-0.5 hover:bg-white hover:border-emerald-300 hover:shadow-xs cursor-pointer group"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{ft.name}</span>
                    {ft.status === 'Available' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block">{ft.sector} • {ft.vehicle}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    ft.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ft.status}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {ft.activeDispatches} Active / {ft.completedToday} Done
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
