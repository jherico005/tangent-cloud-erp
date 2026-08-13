import React, { useState, useEffect } from 'react';
import { EFSRRecord } from '../../types';
import { azureApi } from '../../services/azureApi';
import { 
  Search, 
  Download, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  ArrowLeft, 
  Edit, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Paperclip, 
  Building, 
  User, 
  Phone, 
  MapPin, 
  Smile, 
  FileSpreadsheet,
  FileCheck,
  Database
} from 'lucide-react';
import { EFSRPdfModal } from '../modals/EFSRPdfModal';
import { EFSRCorrectionModal } from '../modals/EFSRCorrectionModal';

interface EFSRViewerProps {
  efsrRecords: EFSRRecord[];
}

export const EFSRViewer: React.FC<EFSRViewerProps> = ({ efsrRecords: initialRecords }) => {
  const [records, setRecords] = useState<EFSRRecord[]>(initialRecords);
  const [isLoadingAzure, setIsLoadingAzure] = useState(false);
  const [isAzureConnected, setIsAzureConnected] = useState(false);

  // Fetch live eFSR records from Azure API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAzureRecords = async () => {
      setIsLoadingAzure(true);
      try {
        const health = await azureApi.checkHealth();
        if (isMounted) setIsAzureConnected(health.azureDbConnected);

        const liveRecords = await azureApi.getEFSRRecords();
        if (isMounted && liveRecords && liveRecords.length > 0) {
          setRecords(liveRecords);
          if (!selectedRecord && liveRecords[0]) {
            setSelectedRecord(liveRecords[0]);
          }
        }
      } catch (err) {
        console.warn('Falling back to local eFSR records state:', err);
      } finally {
        if (isMounted) setIsLoadingAzure(false);
      }
    };

    fetchAzureRecords();
    return () => { isMounted = false; };
  }, []);
  
  // Navigation mode: 'search' | 'details'
  const [viewMode, setViewMode] = useState<'search' | 'details'>('search');
  const [selectedRecord, setSelectedRecord] = useState<EFSRRecord | null>(records[0] || null);

  // Search filter states
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  
  // Checkbox field toggles
  const [checkSrn, setCheckSrn] = useState(true);
  const [checkEfsr, setCheckEfsr] = useState(false);
  const [checkSerial, setCheckSerial] = useState(false);
  const [checkAccountCode, setCheckAccountCode] = useState(false);
  const [checkMerchant, setCheckMerchant] = useState(false);
  const [checkTechnician, setCheckTechnician] = useState(false);
  const [checkServicedDate, setCheckServicedDate] = useState(false);

  // Filter input values
  const [filterSrn, setFilterSrn] = useState('2026INS0015870');
  const [filterEfsr, setFilterEfsr] = useState('');
  const [filterSerial, setFilterSerial] = useState('');
  const [filterAccountCode, setFilterAccountCode] = useState('ALL');
  const [filterMerchant, setFilterMerchant] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('2026-08-01');
  const [filterDateTo, setFilterDateTo] = useState('2026-08-07');

  // Search Triggered State
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(true);

  // Modal states
  const [pdfModalRecord, setPdfModalRecord] = useState<EFSRRecord | null>(null);
  const [correctionModalRecord, setCorrectionModalRecord] = useState<EFSRRecord | null>(null);

  // Tab inside Details View
  const [detailsTab, setDetailsTab] = useState<'merchant' | 'terminal' | 'service' | 'note' | 'attachments'>('merchant');

  // Filter logic
  const filteredRecords = records.filter(r => {
    if (!isSearchSubmitted) return true;

    if (checkSrn && filterSrn.trim()) {
      const srnList = filterSrn.split(/[\n,]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
      if (!srnList.some(s => r.srn.toLowerCase().includes(s))) return false;
    }

    if (checkEfsr && filterEfsr.trim()) {
      const efsrList = filterEfsr.split(/[\n,]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
      if (!efsrList.some(s => r.efsrNumber.toLowerCase().includes(s))) return false;
    }

    if (checkSerial && filterSerial.trim()) {
      if (!r.serialNumber?.toLowerCase().includes(filterSerial.toLowerCase()) &&
          !r.terminalSerialInstalled?.toLowerCase().includes(filterSerial.toLowerCase())) return false;
    }

    if (checkAccountCode && filterAccountCode !== 'ALL') {
      if (r.accountCode !== filterAccountCode) return false;
    }

    if (checkMerchant && filterMerchant.trim()) {
      if (!r.merchantName.toLowerCase().includes(filterMerchant.toLowerCase())) return false;
    }

    if (checkTechnician && filterTechnician !== 'ALL') {
      if (!r.technicianName.toLowerCase().includes(filterTechnician.toLowerCase())) return false;
    }

    return true;
  });

  const handleResetSearch = () => {
    setFilterSrn('');
    setFilterEfsr('');
    setFilterSerial('');
    setFilterAccountCode('ALL');
    setFilterMerchant('');
    setFilterTechnician('ALL');
    setFilterDateFrom('2026-08-01');
    setFilterDateTo('2026-08-07');
    setCheckSrn(false);
    setCheckEfsr(false);
    setCheckSerial(false);
    setCheckAccountCode(false);
    setCheckMerchant(false);
    setCheckTechnician(false);
    setCheckServicedDate(false);
    setIsSearchSubmitted(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchSubmitted(true);
  };

  const handleSelectRecord = (record: EFSRRecord) => {
    setSelectedRecord(record);
    setViewMode('details');
  };

  const handleUpdateRecordFromCorrection = (recordId: string, selectedReasons: string[], updatedRecord?: EFSRRecord) => {
    let finalRecord: EFSRRecord;
    if (updatedRecord) {
      finalRecord = updatedRecord;
      setRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(updatedRecord);
      }
    } else {
      setRecords(prev => prev.map(r => {
        if (r.id === recordId) {
          finalRecord = { ...r, status: 'For eFSR Correction', correctionReasons: selectedReasons };
          return finalRecord;
        }
        return r;
      }));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(prev => prev ? { ...prev, status: 'For eFSR Correction', correctionReasons: selectedReasons } : prev);
      }
    }

    // Sync seamlessly to Azure API
    azureApi.updateEFSRRecord(recordId, {
      status: 'For eFSR Correction',
      correctionReasons: selectedReasons
    }).catch(err => {
      console.warn('Azure API eFSR record update sync notice:', err);
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-800">

      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-md border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>FSR Viewer</span>
          </h2>
          <p className="text-[11px] text-slate-500">Search and manage field service reports</p>
        </div>

        <div className="text-right">
          <div className="font-bold text-slate-800 text-xs">SRN Management</div>
          <div className="text-[10px] text-slate-500">Service request tracking</div>
        </div>
      </div>

      {/* VIEW MODE 1: SEARCH & RESULTS */}
      {viewMode === 'search' && (
        <div className="space-y-4">

          {/* Search eFSR Collapsible Panel */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Header */}
            <div 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="bg-[#1b497d] text-white px-4 py-2.5 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wide">
                <Search className="w-4 h-4 text-cyan-200" />
                <span>Search eFSR</span>
              </div>
              <button type="button" className="text-slate-200 hover:text-white">
                {isSearchExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Form Fields */}
            {isSearchExpanded && (
              <form onSubmit={handleSearchSubmit} className="p-4 space-y-4 bg-slate-50/50">
                
                {/* Row 1: SRN, eFSR Number, Serial Number */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* SRN */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkSrn} 
                        onChange={(e) => setCheckSrn(e.target.checked)} 
                        className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                      />
                      <span className="font-bold text-slate-700 text-[11px]">SRN</span>
                    </label>
                    <textarea
                      rows={2}
                      value={filterSrn}
                      onChange={(e) => setFilterSrn(e.target.value)}
                      placeholder="# Enter one or more SRNs"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono resize-none"
                    />
                  </div>

                  {/* eFSR Number */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkEfsr} 
                        onChange={(e) => setCheckEfsr(e.target.checked)} 
                        className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                      />
                      <span className="font-bold text-slate-700 text-[11px]">eFSR Number</span>
                    </label>
                    <textarea
                      rows={2}
                      value={filterEfsr}
                      onChange={(e) => setFilterEfsr(e.target.value)}
                      placeholder="📄 Enter one or more FSRs"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono resize-none"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkSerial} 
                        onChange={(e) => setCheckSerial(e.target.checked)} 
                        className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                      />
                      <span className="font-bold text-slate-700 text-[11px]">Serial Number</span>
                    </label>
                    <input
                      type="text"
                      value={filterSerial}
                      onChange={(e) => setFilterSerial(e.target.value)}
                      placeholder="|||| Enter Serial Number"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>

                </div>

                {/* Row 2: Account Code, Merchant Name, Field Technician */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Account Code */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkAccountCode} 
                        onChange={(e) => setCheckAccountCode(e.target.checked)} 
                        className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                      />
                      <span className="font-bold text-slate-700 text-[11px]">Account Code</span>
                    </label>
                    <select
                      value={filterAccountCode}
                      onChange={(e) => setFilterAccountCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="ALL">Select Account Code</option>
                      <option value="JWS">JWS</option>
                      <option value="MAYA">MAYA</option>
                      <option value="BDO">BDO</option>
                      <option value="BPI">BPI</option>
                      <option value="METROBANK">METROBANK</option>
                      <option value="PNB">PNB</option>
                    </select>
                  </div>

                  {/* Merchant Name */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkMerchant} 
                        onChange={(e) => setCheckMerchant(e.target.checked)} 
                        className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                      />
                      <span className="font-bold text-slate-700 text-[11px]">Merchant Name</span>
                    </label>
                    <input
                      type="text"
                      value={filterMerchant}
                      onChange={(e) => setFilterMerchant(e.target.value)}
                      placeholder="🏪 Enter Merchant Name"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  {/* Field Technician */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkTechnician} 
                        onChange={(e) => setCheckTechnician(e.target.checked)} 
                        className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                      />
                      <span className="font-bold text-slate-700 text-[11px]">Field Technician</span>
                    </label>
                    <select
                      value={filterTechnician}
                      onChange={(e) => setFilterTechnician(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="ALL">Select Field Technician</option>
                      <option value="Magat, Stephen Matubis">Magat, Stephen Matubis</option>
                      <option value="Jherico Pantaleon">Jherico Pantaleon</option>
                      <option value="Mark Lester Santos">Mark Lester Santos</option>
                      <option value="Ramon Dela Cruz">Ramon Dela Cruz</option>
                    </select>
                  </div>

                </div>

                {/* Row 3: Serviced Date (From / To) */}
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checkServicedDate} 
                      onChange={(e) => setCheckServicedDate(e.target.checked)} 
                      className="rounded border-slate-300 text-[#1b497d] focus:ring-[#1b497d]"
                    />
                    <span className="font-bold text-slate-700 text-[11px]">Serviced Date</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">From</span>
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">To</span>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#1b497d] hover:bg-[#163c68] text-white font-bold py-2 px-4 rounded text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>SEARCH</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-xs border border-slate-300 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Search Results Section */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden p-4 space-y-3">
            
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs">
                Search Results: <span className="text-[#1b497d]">{filteredRecords.length} Record(s)</span>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  type="button"
                  onClick={() => alert('Exporting eFSR dataset to CSV...')}
                  className="bg-[#1b497d] hover:bg-[#163c68] text-white px-3 py-1.5 rounded text-[11px] font-bold flex items-center space-x-1.5 shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <button 
                  type="button"
                  onClick={handleResetSearch}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-[11px] font-bold flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Search</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#1b497d] text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5 text-center">Download eFSR</th>
                    <th className="p-2.5">FSR Code</th>
                    <th className="p-2.5">SRN</th>
                    <th className="p-2.5">Account Code</th>
                    <th className="p-2.5">Servicing Status</th>
                    <th className="p-2.5">Terminal Status</th>
                    <th className="p-2.5">Serial Number</th>
                    <th className="p-2.5">PO Serial Number</th>
                    <th className="p-2.5">Merchant Name</th>
                    <th className="p-2.5">Field Technician</th>
                    <th className="p-2.5">Serviced Date</th>
                    <th className="p-2.5">Time Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-500 font-medium">
                        No eFSR records found matching search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr 
                        key={rec.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Download PDF button */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setPdfModalRecord(rec)}
                            className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors inline-flex items-center justify-center"
                            title="Download eFSR PDF Document"
                          >
                            <FileText className="w-4 h-4 text-red-600 fill-red-100" />
                          </button>
                        </td>

                        {/* FSR Code (Clickable link to open Details View) */}
                        <td className="p-2.5 font-bold">
                          <button
                            type="button"
                            onClick={() => handleSelectRecord(rec)}
                            className="text-blue-700 hover:underline font-mono"
                          >
                            {rec.efsrNumber}
                          </button>
                        </td>

                        {/* SRN */}
                        <td className="p-2.5 font-mono text-slate-700">{rec.srn}</td>

                        {/* Account Code */}
                        <td className="p-2.5 font-bold text-slate-800">{rec.accountCode || 'JWS'}</td>

                        {/* Servicing Status */}
                        <td className="p-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'Approved' || rec.servicingStatus === 'Successful' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'For eFSR Correction'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.servicingStatus || rec.status}
                          </span>
                        </td>

                        {/* Terminal Status */}
                        <td className="p-2.5 text-slate-600">{rec.terminalStatus || '-'}</td>

                        {/* Serial Number */}
                        <td className="p-2.5 font-mono text-slate-700">{rec.serialNumber || rec.terminalSerialInstalled || 'N/A'}</td>

                        {/* PO Serial Number */}
                        <td className="p-2.5 font-mono text-slate-600">{rec.poSerialNumber || 'N/A'}</td>

                        {/* Merchant Name */}
                        <td className="p-2.5 font-bold text-slate-900">{rec.merchantName}</td>

                        {/* Field Technician */}
                        <td className="p-2.5 text-slate-800">{rec.technicianName}</td>

                        {/* Serviced Date */}
                        <td className="p-2.5 text-slate-700">{rec.dateCompleted}</td>

                        {/* Time Completed */}
                        <td className="p-2.5 text-slate-700 font-mono">{rec.timeCompleted || rec.timeOutCompleted || '02:56 PM'}</td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
              <div>Showing 1 to {filteredRecords.length} of {filteredRecords.length} results</div>
              <div className="flex items-center space-x-1">
                <button className="px-2 py-1 border border-slate-200 rounded text-slate-400 hover:bg-slate-50" disabled>&lt;</button>
                <button className="px-2.5 py-1 bg-[#1b497d] text-white rounded font-bold">1</button>
                <button className="px-2 py-1 border border-slate-200 rounded text-slate-400 hover:bg-slate-50" disabled>&gt;</button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW MODE 2: FSR DETAILS VIEW */}
      {viewMode === 'details' && selectedRecord && (
        <div className="space-y-4">
          
          {/* FSR DETAILS Header */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-md border border-slate-200 shadow-2xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">FSR DETAILS</div>
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedRecord.efsrNumber} ({selectedRecord.accountCode || 'JWS'})
              </h3>
            </div>

            <button
              onClick={() => setPdfModalRecord(selectedRecord)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded flex items-center space-x-1.5 border border-slate-300 transition-colors"
            >
              <span>eFSR Download</span>
              <Download className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>

          {/* Status Badge Centered */}
          <div className="flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-2xs ${
              selectedRecord.status === 'Approved' || selectedRecord.servicingStatus === 'Successful'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : selectedRecord.status === 'For eFSR Correction'
                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span>{selectedRecord.servicingStatus || selectedRecord.status}</span>
            </span>
          </div>

          {/* FSR Summary Card */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-[#1b497d] text-white px-4 py-2.5 font-bold text-xs">
              FSR Summary
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">FSR NUMBER(S)</span>
                <div className="font-bold text-slate-900">{selectedRecord.efsrNumber} ({selectedRecord.accountCode || 'JWS'})</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">SRN</span>
                <div className="font-bold text-slate-900 font-mono">{selectedRecord.srn}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">SERVICE DATE</span>
                <div className="font-medium text-slate-800">{selectedRecord.dateCompleted}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">SERVICE TYPE</span>
                <div className="font-bold text-slate-800">{selectedRecord.serviceType || 'INS'}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">FIELD TECHNICIAN</span>
                <div className="font-medium text-slate-800">{selectedRecord.technicianName}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">ACCOUNT CODE</span>
                <div className="font-bold text-slate-800">{selectedRecord.accountCode || 'JWS'}</div>
              </div>
            </div>
          </div>

          {/* Details Tabbed Navigation */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Tab Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-2 overflow-x-auto">
              <button
                onClick={() => setDetailsTab('merchant')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  detailsTab === 'merchant'
                    ? 'border-[#1b497d] text-[#1b497d] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Merchant Info
              </button>

              <button
                onClick={() => setDetailsTab('terminal')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  detailsTab === 'terminal'
                    ? 'border-[#1b497d] text-[#1b497d] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Terminal Details
              </button>

              <button
                onClick={() => setDetailsTab('service')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  detailsTab === 'service'
                    ? 'border-[#1b497d] text-[#1b497d] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Service Details
              </button>

              <button
                onClick={() => setDetailsTab('note')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  detailsTab === 'note'
                    ? 'border-[#1b497d] text-[#1b497d] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Note
              </button>

              <button
                onClick={() => setDetailsTab('attachments')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                  detailsTab === 'attachments'
                    ? 'border-[#1b497d] text-[#1b497d] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Attachments</span>
                <RefreshCw className="w-3 h-3 text-slate-500" />
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5">
              
              {/* TAB 1: Merchant Info */}
              {detailsTab === 'merchant' && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">MERCHANT NAME</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedRecord.merchantName}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">MERCHANT ADDRESS</span>
                    <div className="font-medium text-slate-800">{selectedRecord.merchantAddress || 'Panganiban Drive, Tinago Naga City, Camarines Sur'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">CONTACT PERSON</span>
                    <div className="font-medium text-slate-800">{selectedRecord.contactPerson || 'Judith Deniega'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">CONTACT NUMBER</span>
                    <div className="font-mono text-slate-800">{selectedRecord.contactNumber || '09564252532'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">RATING</span>
                    <div className="font-medium text-blue-600 flex items-center space-x-1 mt-0.5">
                      <span>😄</span>
                      <span>{selectedRecord.rating || 'Satisfied'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Terminal Details */}
              {detailsTab === 'terminal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">TERMINAL TYPE</span>
                    <div className="font-bold text-slate-900">{selectedRecord.terminalType || 'Pax A920 Pro'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">PERIPHERALS</span>
                    <div className="font-medium text-slate-800">{selectedRecord.peripherals || 'Power Adapter, Base Dock'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">SERIAL NUMBER</span>
                    <div className="font-mono font-bold text-blue-700">{selectedRecord.serialNumber || selectedRecord.terminalSerialInstalled || 'PX-90182811'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">MID</span>
                    <div className="font-mono text-slate-800">{selectedRecord.mid || '000301928311'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">TID</span>
                    <div className="font-mono text-slate-800">{selectedRecord.tid || '19028311'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">APPLICATION VERSION</span>
                    <div className="font-mono text-slate-800">{selectedRecord.appVersion || 'v2.4.12'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">DATA SIM DETAILS</span>
                    <div className="font-medium text-slate-800">{selectedRecord.simDetails || 'Globe Telecom 4G'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">DATA SIM SERIAL NUMBER</span>
                    <div className="font-mono text-slate-800">{selectedRecord.simSerial || '8963029182312'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">ACCESSORIES</span>
                    <div className="font-medium text-slate-800">{selectedRecord.accessories || 'Thermal Roll x2, POS Holder'}</div>
                  </div>
                </div>
              )}

              {/* TAB 3: Service Details */}
              {detailsTab === 'service' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">TERMINAL ACCEPTANCE TESTING</span>
                    <div className="font-bold text-emerald-700">{selectedRecord.acceptanceTesting || 'PASSED'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">SERVICE DELIVERY REPORT</span>
                    <div className="font-mono text-slate-800">{selectedRecord.sdrNumber || 'SDR-90182-B'}</div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">FT'S REMARKS</span>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium">
                      {selectedRecord.remarks || 'Merchant signal weak indoors. Terminal unable to complete test host ping.'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">LEFT PREVIOUS LOCATION</span>
                    <div className="font-mono text-slate-800">{selectedRecord.leftPreviousLocation || '02:10 PM'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">ARRIVAL AT MERCHANT</span>
                    <div className="font-mono text-slate-800">{selectedRecord.arrivalAtMerchant || selectedRecord.timeInArrival || '02:25 PM'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">SERVICE STARTED</span>
                    <div className="font-mono text-slate-800">{selectedRecord.serviceStarted || '02:30 PM'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">SERVICE COMPLETED</span>
                    <div className="font-mono text-slate-800">{selectedRecord.serviceCompleted || selectedRecord.timeOutCompleted || '02:56 PM'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">DEPARTURE FROM MERCHANT</span>
                    <div className="font-mono text-slate-800">{selectedRecord.departureFromMerchant || '03:05 PM'}</div>
                  </div>
                </div>
              )}

              {/* TAB 4: Note */}
              {detailsTab === 'note' && (
                <div className="space-y-3 max-w-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">FIELD SERVICE NOTES & DISPATCH REMARKS</span>
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-amber-950 leading-relaxed font-medium">
                    {selectedRecord.actionTaken || 'Terminal installation attempted. Merchant location has heavy concrete walls causing cellular reception drop. Field Technician recommended installing external antenna or switching to Wi-Fi connection.'}
                  </div>

                  {selectedRecord.correctionReasons && selectedRecord.correctionReasons.length > 0 && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded text-teal-900 space-y-1">
                      <div className="font-bold text-xs text-teal-800">Flagged for eFSR Correction:</div>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        {selectedRecord.correctionReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Attachments */}
              {detailsTab === 'attachments' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase block">ATTACHED PHOTO PROOFS ({selectedRecord.attachments?.length || 2})</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedRecord.attachments?.map((att) => (
                      <div key={att.id} className="border border-slate-200 rounded p-2 bg-slate-50 space-y-1">
                        <img src={att.url} alt={att.name} className="w-full h-28 object-cover rounded" />
                        <div className="font-bold text-[11px] truncate">{att.name}</div>
                        <div className="text-[10px] text-slate-500">{att.date || selectedRecord.dateCompleted}</div>
                      </div>
                    )) || (
                      <>
                        <div className="border border-slate-200 rounded p-2 bg-slate-50 space-y-1">
                          <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400" alt="Storefront" className="w-full h-28 object-cover rounded" />
                          <div className="font-bold text-[11px]">Storefront_Naga.jpg</div>
                        </div>
                        <div className="border border-slate-200 rounded p-2 bg-slate-50 space-y-1">
                          <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400" alt="Signal Error" className="w-full h-28 object-cover rounded" />
                          <div className="font-bold text-[11px]">Signal_Error_Display.jpg</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setViewMode('search')}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Search</span>
            </button>

            <button
              onClick={() => setCorrectionModalRecord(selectedRecord)}
              className="px-4 py-2 bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>For eFSR Correction</span>
            </button>
          </div>

        </div>
      )}

      {/* MODAL 1: PDF Viewer Modal */}
      {pdfModalRecord && (
        <EFSRPdfModal
          efsrRecord={pdfModalRecord}
          onClose={() => setPdfModalRecord(null)}
          onUpdateRecord={(updated) => {
            setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
            if (selectedRecord?.id === updated.id) {
              setSelectedRecord(updated);
            }
          }}
        />
      )}

      {/* MODAL 2: For eFSR Correction Modal */}
      {correctionModalRecord && (
        <EFSRCorrectionModal
          record={correctionModalRecord}
          onClose={() => setCorrectionModalRecord(null)}
          onSubmitCorrection={handleUpdateRecordFromCorrection}
        />
      )}

    </div>
  );
};
