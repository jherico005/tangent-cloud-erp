import React from 'react';
import { IMSLogItem } from '../../types';
import { Layers, UploadCloud, FileSpreadsheet } from 'lucide-react';

interface IMSLogsViewProps {
  imsLogs: IMSLogItem[];
  onOpenCsvModal?: () => void;
}

export const IMSLogsView: React.FC<IMSLogsViewProps> = ({ imsLogs, onOpenCsvModal }) => {
  return (
    <div className="space-y-3 text-xs">
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-sm">IMS Inventory Terminal Logs</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full">
            {imsLogs.length} Inventory Records
          </span>
        </div>

        {onOpenCsvModal && (
          <button
            type="button"
            onClick={onOpenCsvModal}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload CSV Dispatch Manifest</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1e588f] text-white font-bold">
              <th className="p-2.5">Timestamp</th>
              <th className="p-2.5">Serial Number</th>
              <th className="p-2.5">Terminal Model</th>
              <th className="p-2.5">Account</th>
              <th className="p-2.5">Movement Type</th>
              <th className="p-2.5">Released To / Custodian</th>
              <th className="p-2.5">Verified By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {imsLogs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/50">
                <td className="p-2.5 font-mono text-slate-600">{log.timestamp}</td>
                <td className="p-2.5 font-mono font-bold text-blue-700">{log.serialNumber}</td>
                <td className="p-2.5 font-semibold text-slate-800">{log.model}</td>
                <td className="p-2.5 font-bold text-slate-800">{log.account}</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    log.movementType === 'Outbound to Dispatch' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {log.movementType}
                  </span>
                </td>
                <td className="p-2.5 text-slate-800">{log.releasedTo}</td>
                <td className="p-2.5 text-slate-600">{log.verifiedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
