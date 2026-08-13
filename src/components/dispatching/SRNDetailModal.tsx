import React from 'react';
import { ServiceRequest } from '../../types';
import { X, Building2, MapPin, Hash, User, Calendar, Cpu, CheckCircle2, FileText, Smartphone } from 'lucide-react';

interface SRNDetailModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onQuickDispatch?: (request: ServiceRequest) => void;
}

export const SRNDetailModal: React.FC<SRNDetailModalProps> = ({
  request,
  onClose,
  onQuickDispatch
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Top Header */}
        <div className="bg-[#1e588f] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center text-cyan-200 font-bold font-mono">
              SRN
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg font-mono text-cyan-200">{request.srn}</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-cyan-900 text-cyan-200 border border-cyan-400/40">
                  {request.requestCategory}
                </span>
              </div>
              <p className="text-xs text-blue-200">{request.projectName || 'Service Request Entry'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-blue-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Current Status</span>
              <span className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>{request.status}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Account / Client</span>
              <span className="font-mono font-bold text-blue-700 text-xs">{request.accountName} (Count: {request.clientCount})</span>
            </div>
          </div>

          {/* Merchant Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Merchant Information */}
            <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-900 flex items-center space-x-1.5 border-b border-blue-200/60 pb-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Merchant Information</span>
              </h4>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Merchant Name</span>
                  <span className="font-bold text-slate-900 text-sm">{request.merchantName}</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Address</span>
                  <span className="text-slate-800 font-medium flex items-start space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{request.merchantAddress}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">City/Municipality</span>
                    <span className="font-medium text-slate-800">{request.cityMunicipality}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">Province</span>
                    <span className="font-medium text-slate-800">{request.province}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">Area</span>
                    <span className="font-semibold text-blue-700">{request.area}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">Sector</span>
                    <span className="font-semibold text-blue-700">{request.sector}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal & Dispatch Details */}
            <div className="space-y-3 bg-emerald-50/40 p-3.5 rounded-lg border border-emerald-100">
              <h4 className="font-bold text-emerald-900 flex items-center space-x-1.5 border-b border-emerald-200/60 pb-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Terminal & Logistics Info</span>
              </h4>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Terminal Model</span>
                  <span className="font-bold text-slate-800">{request.terminalModel || 'Standard POS Terminal'}</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Serial Number</span>
                  <span className="font-mono font-bold text-slate-900 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                    {request.serialNumber || 'N/A - Pending Assign'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Contact Person</span>
                  <span className="font-medium text-slate-800">
                    {request.contactPerson || 'Store Manager'} ({request.contactNumber || 'N/A'})
                  </span>
                </div>

                <div className="pt-1 border-t border-emerald-200/50">
                  <span className="text-[11px] font-semibold text-slate-500 block">Released Date & Time</span>
                  <span className="text-slate-800 font-medium">
                    {request.releasedDate} @ {request.releasedTime}
                  </span>
                </div>

                {request.assignedFTName && (
                  <div className="bg-emerald-100/80 p-2 rounded border border-emerald-200 text-emerald-900 mt-2">
                    <span className="text-[10px] font-bold uppercase block text-emerald-700">Assigned Field Technician</span>
                    <span className="font-bold text-xs">{request.assignedFTName}</span>
                    <span className="text-[11px] block text-emerald-800">{request.assignedDate} ({request.assignedTime})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project & Requestor */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 font-semibold mr-1">Project Name:</span>
              <strong className="text-slate-800">{request.projectName || 'General Field Services'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold mr-1">Requestor:</span>
              <strong className="text-slate-800">{request.requestor || 'Central Ops'}</strong>
            </div>
            {request.isMayaRequest && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-300">
                MAYA Integrated Request
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 italic">
            Tangent Cloud Dispatcher Portal • System ID: {request.id}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Close
            </button>

            {onQuickDispatch && request.status === 'Release To Dispatcher' && (
              <button
                onClick={() => {
                  onClose();
                  onQuickDispatch(request);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Dispatch Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
