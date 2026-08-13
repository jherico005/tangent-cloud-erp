import React, { useState } from 'react';
import { EFSRRecord } from '../../types';
import { FileEdit, CheckCircle2, XCircle, Search, Eye, AlertTriangle, ShieldCheck, FileText, Download } from 'lucide-react';
import { EFSRPdfModal } from '../modals/EFSRPdfModal';

interface EFSRCorrectionTabProps {
  efsrRecords: EFSRRecord[];
  onApproveEFSR?: (id: string) => void;
  onRequestCorrection?: (id: string, reason: string) => void;
}

export const EFSRCorrectionTab: React.FC<EFSRCorrectionTabProps> = ({
  efsrRecords,
  onApproveEFSR,
  onRequestCorrection
}) => {
  const [selectedRecord, setSelectedRecord] = useState<EFSRRecord | null>(efsrRecords[0] || null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [pdfModalRecord, setPdfModalRecord] = useState<EFSRRecord | null>(null);

  const filtered = efsrRecords.filter(r => 
    r.efsrNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.srn.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.merchantName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left List of eFSRs */}
      <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs p-3 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center space-x-1.5">
            <FileEdit className="w-4 h-4 text-blue-600" />
            <span>eFSR Submissions for Verification</span>
          </h3>
          <span className="text-xs text-blue-600 font-semibold">{efsrRecords.length} Reports</span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search eFSR or Merchant..."
            className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1.5 text-xs focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((record) => (
            <div
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                selectedRecord?.id === record.id
                  ? 'bg-blue-50/90 border-blue-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-blue-800">{record.efsrNumber}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  record.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {record.status}
                </span>
              </div>
              <div className="font-bold text-slate-900 truncate">{record.merchantName}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                <span>SRN: <strong className="text-slate-700">{record.srn}</strong></span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfModalRecord(record);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detailed Verification Panel */}
      <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-4">
        {selectedRecord ? (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-[#1e588f] text-white p-3 rounded-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-200 block">Report Details</span>
                <h3 className="font-mono font-bold text-base">{selectedRecord.efsrNumber}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPdfModalRecord(selectedRecord)}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Merchant Name:</span>
                <strong className="text-slate-900 text-sm">{selectedRecord.merchantName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Field Technician:</span>
                <strong className="text-slate-800">{selectedRecord.technicianName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Date Completed:</span>
                <span className="font-mono text-slate-800">{selectedRecord.dateCompleted}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Signal / Connectivity:</span>
                <span className="font-semibold text-emerald-700">{selectedRecord.signalStrength || 'Good 4G'}</span>
              </div>
            </div>

            {/* Test Transaction & Serial Numbers */}
            <div className="border border-slate-200 p-3 rounded-lg space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification Checklist</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                  <span className="text-slate-500 block text-[10px]">Installed POS Serial</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.terminalSerialInstalled || 'PX-90182811'}</span>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Merchant Signature Status</span>
                  <span className="font-bold text-emerald-700">{selectedRecord.merchantSignature || 'Digital Signature Captured'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Technician Field Remarks:</span>
                <p className="bg-slate-50 p-2 rounded border border-slate-200 italic text-slate-700">
                  "{selectedRecord.remarks}"
                </p>
              </div>
            </div>

            {/* Correction Form */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="font-bold text-slate-800 block">Request Correction / Notes to Tech</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Enter reasons if eFSR needs correction (e.g. illegible receipt photo, missing serial number)..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => {
                    if (onRequestCorrection && correctionReason) {
                      onRequestCorrection(selectedRecord.id, correctionReason);
                      setCorrectionReason('');
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Request Correction</span>
                </button>

                <button
                  onClick={() => {
                    if (onApproveEFSR) onApproveEFSR(selectedRecord.id);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve eFSR</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Select an eFSR from the list to review details.</div>
        )}
      </div>

      {pdfModalRecord && (
        <EFSRPdfModal
          efsrRecord={pdfModalRecord}
          onClose={() => setPdfModalRecord(null)}
        />
      )}
    </div>
  );
};
