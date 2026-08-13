import React from 'react';
import { PendingSummaryItem } from '../../types';
import { Clock, PieChart, BarChart } from 'lucide-react';

interface PendingSummaryViewProps {
  pendingSummary: PendingSummaryItem[];
}

export const PendingSummaryView: React.FC<PendingSummaryViewProps> = ({ pendingSummary }) => {
  const grandTotal = pendingSummary.reduce((acc, curr) => acc + curr.totalPending, 0);

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-slate-800 text-sm">Pending Service Request Breakdown</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-extrabold rounded-full">
            {grandTotal} Overall Pending
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1e588f] text-white font-bold">
              <th className="p-2.5">Account Name</th>
              <th className="p-2.5">Area</th>
              <th className="p-2.5">Sector</th>
              <th className="p-2.5 text-center">INS</th>
              <th className="p-2.5 text-center">REP</th>
              <th className="p-2.5 text-center">PNT</th>
              <th className="p-2.5 text-center">PUP</th>
              <th className="p-2.5 text-center">SWP</th>
              <th className="p-2.5 text-center font-black">Total Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {pendingSummary.map((item, i) => (
              <tr key={i} className="hover:bg-amber-50/40">
                <td className="p-2.5 font-bold text-slate-900">{item.accountName}</td>
                <td className="p-2.5 font-semibold text-slate-700">{item.area}</td>
                <td className="p-2.5 font-semibold text-slate-700">{item.sector}</td>
                <td className="p-2.5 text-center text-slate-800">{item.insPending}</td>
                <td className="p-2.5 text-center text-slate-800">{item.repPending}</td>
                <td className="p-2.5 text-center text-slate-800">{item.pntPending}</td>
                <td className="p-2.5 text-center text-slate-800">{item.pupPending}</td>
                <td className="p-2.5 text-center text-slate-800">{item.swpPending}</td>
                <td className="p-2.5 text-center font-black text-amber-700 bg-amber-50/60">{item.totalPending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
