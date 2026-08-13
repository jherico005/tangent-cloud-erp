import React from 'react';
import { HelpCircle, CheckCircle, Clock } from 'lucide-react';

export const CCIARCOSupportView: React.FC = () => {
  const supportLogs = [
    {
      id: 'sup-1',
      ticketNo: 'SUP-2026-0041',
      srn: '2026INS0018216',
      merchantName: 'PRESNET',
      issueCategory: 'SIM Card Signal Loss',
      status: 'Resolved',
      handledBy: 'Helpdesk Support - Ana',
      time: '09:40 AM'
    },
    {
      id: 'sup-2',
      ticketNo: 'SUP-2026-0042',
      srn: '2026REP0019001',
      merchantName: 'SM HYPERMARKET BATANGAS',
      issueCategory: 'Paper Roll Jam',
      status: 'Open',
      handledBy: 'Helpdesk Support - Mark',
      time: '10:15 AM'
    }
  ];

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-sm">CCIARCO Support Daily Incident Logs</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full">
            {supportLogs.length} Incident Tickets
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1e588f] text-white font-bold">
              <th className="p-2.5">Ticket No</th>
              <th className="p-2.5">SRN</th>
              <th className="p-2.5">Merchant</th>
              <th className="p-2.5">Issue Category</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Handled By</th>
              <th className="p-2.5">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {supportLogs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/50">
                <td className="p-2.5 font-mono text-blue-700 font-bold">{log.ticketNo}</td>
                <td className="p-2.5 font-mono text-slate-700">{log.srn}</td>
                <td className="p-2.5 font-bold text-slate-800">{log.merchantName}</td>
                <td className="p-2.5 text-slate-700">{log.issueCategory}</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    log.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-2.5 text-slate-700">{log.handledBy}</td>
                <td className="p-2.5 font-mono text-slate-600">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
