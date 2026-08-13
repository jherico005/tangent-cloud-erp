import React, { useState } from 'react';
import { AuditLogItem } from '../../types';
import { FileCheck2, Search, Filter, History, Calendar, User, Download } from 'lucide-react';

interface ServiceRequestAuditLogsViewProps {
  auditLogs: AuditLogItem[];
}

export const ServiceRequestAuditLogsView: React.FC<ServiceRequestAuditLogsViewProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const searchable = `${log.srn} ${log.action} ${log.performedBy} ${log.details}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3 text-xs">
      {/* Top Header */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-sm">Service Request Audit Logs</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full">
            {auditLogs.length} Audit Entries
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Release">Release</option>
            <option value="Dispatch">Dispatch</option>
            <option value="eFSR">eFSR</option>
            <option value="System">System</option>
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SRN, user or action..."
              className="bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1.5 text-slate-800 focus:outline-none w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1e588f] text-white font-bold">
              <th className="p-2.5">Timestamp</th>
              <th className="p-2.5">SRN</th>
              <th className="p-2.5">Action</th>
              <th className="p-2.5">Performed By</th>
              <th className="p-2.5">Details</th>
              <th className="p-2.5 text-center">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/50">
                <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                <td className="p-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">{log.srn}</td>
                <td className="p-2.5 font-bold text-slate-800 whitespace-nowrap">{log.action}</td>
                <td className="p-2.5 text-slate-700 font-medium whitespace-nowrap">{log.performedBy}</td>
                <td className="p-2.5 text-slate-600">{log.details}</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-300">
                    {log.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
