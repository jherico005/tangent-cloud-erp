import React, { useState } from 'react';
import { ServiceRequest, FieldTechnician } from '../../types';
import { RefreshCw, X, Check, UserCheck, AlertTriangle } from 'lucide-react';

interface ReassignModalProps {
  selectedRequests: ServiceRequest[];
  fieldTechnicians: FieldTechnician[];
  onClose: () => void;
  onConfirmReassign: (srnIds: string[], newFtId: string, newFtName: string, reason: string) => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  selectedRequests,
  fieldTechnicians,
  onClose,
  onConfirmReassign
}) => {
  const [selectedFTId, setSelectedFTId] = useState<string>(
    fieldTechnicians[1]?.id || fieldTechnicians[0]?.id || ''
  );
  const [reason, setReason] = useState<string>('Route optimization / Technician unavailability');

  const selectedFT = fieldTechnicians.find(ft => ft.id === selectedFTId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFTId || selectedRequests.length === 0) return;

    onConfirmReassign(
      selectedRequests.map(r => r.id),
      selectedFTId,
      selectedFT?.name || 'Reassigned FT',
      reason
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="bg-emerald-700 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/50 flex items-center justify-center text-emerald-100">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Reassign Field Technician</h3>
              <p className="text-xs text-emerald-100">Change assigned technician for selected SRNs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-bold block">Reassigning {selectedRequests.length} Service Request(s)</span>
              The existing technician will be notified of the route cancellation and the new technician will receive immediate dispatch alert.
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>New Field Technician*</span>
            </label>
            <select
              value={selectedFTId}
              onChange={(e) => setSelectedFTId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {fieldTechnicians.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.name} ({ft.employeeCode}) — {ft.sector} [{ft.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Reason for Reassignment</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md flex items-center space-x-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Reassign</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
