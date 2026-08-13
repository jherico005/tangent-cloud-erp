import React from 'react';
import { POSPrepLogItem } from '../../types';
import { Terminal, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

interface POSPrepDailyLogsViewProps {
  posPrepLogs: POSPrepLogItem[];
}

export const POSPrepDailyLogsView: React.FC<POSPrepDailyLogsViewProps> = ({ posPrepLogs }) => {
  return (
    <div className="space-y-3 text-xs">
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-sm">POS Prep Daily Preparation Logs</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full">
            {posPrepLogs.length} Prepped Units
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1e588f] text-white font-bold">
              <th className="p-2.5">Date</th>
              <th className="p-2.5">SRN</th>
              <th className="p-2.5">Model</th>
              <th className="p-2.5">Serial Number</th>
              <th className="p-2.5">SIM Card No</th>
              <th className="p-2.5">Account</th>
              <th className="p-2.5">Prep Status</th>
              <th className="p-2.5">Prepped By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {posPrepLogs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/50">
                <td className="p-2.5 font-mono text-slate-600">{log.date}</td>
                <td className="p-2.5 font-mono font-bold text-blue-700">{log.srn}</td>
                <td className="p-2.5 font-semibold text-slate-800">{log.terminalModel}</td>
                <td className="p-2.5 font-mono font-bold text-slate-800">{log.serialNumber}</td>
                <td className="p-2.5 font-mono text-slate-600">{log.simCardNo}</td>
                <td className="p-2.5 font-bold text-slate-800">{log.accountName}</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                    {log.prepStatus}
                  </span>
                </td>
                <td className="p-2.5 text-slate-700">{log.preppedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
