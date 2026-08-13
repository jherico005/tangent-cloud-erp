import React, { useState } from 'react';
import { ServiceRequest, FieldTechnician } from '../../types';
import { Send, X, Check, AlertCircle, User, Calendar, Clock, FileText } from 'lucide-react';

interface DispatchModalProps {
  selectedRequests: ServiceRequest[];
  fieldTechnicians: FieldTechnician[];
  onClose: () => void;
  onConfirmDispatch: (
    srnIds: string[], 
    ftId: string, 
    ftName: string, 
    dispatchDate: string, 
    dispatchTime: string, 
    remarks: string
  ) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  selectedRequests,
  fieldTechnicians,
  onClose,
  onConfirmDispatch
}) => {
  const [selectedFTId, setSelectedFTId] = useState<string>(
    fieldTechnicians[0]?.id || ''
  );
  const [dispatchDate, setDispatchDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dispatchTime, setDispatchTime] = useState<string>('08:30 AM');
  const [remarks, setRemarks] = useState<string>('Dispatched via Cloud Dispatch Portal. Priority field service.');
  const [error, setError] = useState<string>('');

  const selectedFT = fieldTechnicians.find(ft => ft.id === selectedFTId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFTId) {
      setError('Please select a Field Technician.');
      return;
    }
    if (selectedRequests.length === 0) {
      setError('No Service Requests selected for dispatch.');
      return;
    }

    onConfirmDispatch(
      selectedRequests.map(r => r.id),
      selectedFTId,
      selectedFT?.name || 'Assigned FT',
      dispatchDate,
      dispatchTime,
      remarks
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header matching Tangent Blue theme */}
        <div className="bg-[#1e588f] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/40 flex items-center justify-center text-cyan-200">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Dispatch Service Requests</h3>
              <p className="text-xs text-blue-200">Assign Field Technician & schedule dispatch route</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selected SRNs summary box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Selected SRNs ({selectedRequests.length})
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">
                Batch Dispatch
              </span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {selectedRequests.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-2 rounded border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div className="font-semibold text-slate-800">
                    <span className="text-blue-700 font-mono font-bold mr-2">{item.srn}</span>
                    <span>{item.merchantName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    {item.cityMunicipality}, {item.province}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Technician Selector */}
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Field Technician (FT)*</span>
              </label>
              <select
                value={selectedFTId}
                onChange={(e) => {
                  setSelectedFTId(e.target.value);
                  setError('');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fieldTechnicians.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name} ({ft.employeeCode}) — {ft.sector} [{ft.status}] ({ft.activeDispatches} Active Dispatches)
                  </option>
                ))}
              </select>
              {selectedFT && (
                <div className="text-[11px] text-slate-500 bg-blue-50/60 px-2.5 py-1.5 rounded border border-blue-100 flex items-center justify-between mt-1">
                  <span>Vehicle: <strong className="text-slate-700">{selectedFT.vehicle}</strong></span>
                  <span>Contact: <strong className="text-slate-700">{selectedFT.contactNumber}</strong></span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Dispatch Date*</span>
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Dispatch Time</span>
              </label>
              <input
                type="text"
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Remarks */}
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Dispatcher Instructions / Remarks</span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md flex items-center space-x-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Dispatch ({selectedRequests.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
