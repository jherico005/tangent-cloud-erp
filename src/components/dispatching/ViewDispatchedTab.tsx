import React, { useState } from 'react';
import { ServiceRequest, FieldTechnician } from '../../types';
import { Send, CheckCircle2, Clock, MapPin, Phone, UserCheck, ShieldAlert, FileText, Search, LayoutGrid, List } from 'lucide-react';

interface ViewDispatchedTabProps {
  requests: ServiceRequest[];
  fieldTechnicians: FieldTechnician[];
  onViewSRNDetails: (request: ServiceRequest) => void;
  onRecallDispatch?: (srnId: string) => void;
}

export const ViewDispatchedTab: React.FC<ViewDispatchedTabProps> = ({
  requests,
  fieldTechnicians,
  onViewSRNDetails,
  onRecallDispatch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'details' | 'list'>('details');

  // Dispatched requests only
  const dispatchedRequests = requests.filter(r => 
    r.status === 'Dispatched' || 
    r.status === 'In Transit' || 
    r.status === 'On Site' || 
    r.status === 'eFSR Submitted' || 
    r.status === 'Completed'
  );

  const filteredDispatches = dispatchedRequests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase();
      const searchable = `${r.srn} ${r.merchantName} ${r.assignedFTName} ${r.accountName} ${r.cityMunicipality}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search, Status Filters & View Mode Toggle Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800 text-sm">Dispatched SRNs Overview</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full text-xs">
            {dispatchedRequests.length} Total Active Dispatches
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* VIEW MODE TOGGLE BUTTONS (List vs Details) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('details')}
              title="Details View (Cards Grid)"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'details'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Details View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View (Data Table)"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Dispatched">Dispatched</option>
            <option value="In Transit">In Transit</option>
            <option value="eFSR Submitted">eFSR Submitted</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter technician or SRN..."
              className="bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1.5 text-slate-800 focus:outline-none w-48 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Dispatched Content Rendering based on ViewMode */}
      {filteredDispatches.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-200 text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-slate-700">No Dispatched Records Match Criteria</p>
          <p className="text-xs text-slate-400">All dispatched field service jobs will appear here.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* COMPACT LIST VIEW TABLE */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e588f] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">SRN / Ticket</th>
                  <th className="py-2.5 px-3">Merchant / Address</th>
                  <th className="py-2.5 px-3">Account / Category</th>
                  <th className="py-2.5 px-3">Assigned Technician</th>
                  <th className="py-2.5 px-3">Dispatch Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredDispatches.map((req, idx) => {
                  const ft = fieldTechnicians.find(f => f.id === req.assignedFTId);
                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-blue-50/60 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <button 
                          onClick={() => onViewSRNDetails(req)}
                          className="hover:underline text-left block"
                        >
                          {req.srn}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{req.merchantName}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-xs block">{req.merchantAddress}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">{req.accountName}</span>
                        <span className="text-[10px] text-slate-500 block">{req.requestCategory}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{req.assignedFTName || 'Ramon Dela Cruz'}</span>
                        {ft && <span className="text-[10px] text-slate-500 block">{ft.contactNumber} • {ft.vehicle}</span>}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span className="text-slate-800 block">{req.assignedDate || req.releasedDate}</span>
                        <span className="text-[10px] text-slate-500 block">{req.assignedTime || req.releasedTime}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border inline-block ${
                          req.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : req.status === 'eFSR Submitted'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onViewSRNDetails(req)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                          >
                            Details
                          </button>
                          {onRecallDispatch && req.status === 'Dispatched' && (
                            <button
                              onClick={() => onRecallDispatch(req.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                            >
                              Recall
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DETAILS CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDispatches.map((req) => {
            const ft = fieldTechnicians.find(f => f.id === req.assignedFTId);
            return (
              <div 
                key={req.id}
                className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <button 
                        onClick={() => onViewSRNDetails(req)}
                        className="font-mono font-bold text-blue-700 hover:underline text-sm block"
                      >
                        {req.srn}
                      </button>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {req.accountName} • {req.requestCategory}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      req.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : req.status === 'eFSR Submitted'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{req.merchantName}</h4>
                    <p className="text-xs text-slate-600 flex items-start space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{req.merchantAddress}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">Technician:</span>
                      <strong className="text-slate-900">{req.assignedFTName || 'Ramon Dela Cruz'}</strong>
                    </div>
                    {ft && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Vehicle: {ft.vehicle}</span>
                        <span className="flex items-center space-x-1 text-blue-600 font-semibold">
                          <Phone className="w-3 h-3" />
                          <span>{ft.contactNumber}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Assigned: {req.assignedDate || req.releasedDate}</span>
                      <span>Time: {req.assignedTime || req.releasedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onViewSRNDetails(req)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View SRN Log</span>
                  </button>

                  {onRecallDispatch && req.status === 'Dispatched' && (
                    <button
                      onClick={() => onRecallDispatch(req.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Recall Dispatch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

