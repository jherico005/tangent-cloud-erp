import React, { useState, useMemo } from 'react';
import { ServiceRequest, AreaType, SectorType, RequestCategory } from '../../types';
import { TangentLoadingScreen } from '../common/TangentLoadingScreen';
import { 
  SlidersHorizontal, 
  Send, 
  RefreshCw, 
  Download, 
  Search, 
  ArrowUpDown, 
  CheckSquare, 
  Square,
  FileText,
  AlertCircle,
  UploadCloud,
  Database
} from 'lucide-react';

interface AssignFTTabProps {
  requests: ServiceRequest[];
  onSelectRequest: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onOpenDispatchModal: () => void;
  onOpenReassignModal: () => void;
  onViewSRNDetails: (request: ServiceRequest) => void;
  onExportCSV: (filtered: ServiceRequest[]) => void;
  onOpenCsvModal?: () => void;
  onOpenSmartSdModal?: () => void;
}

export const AssignFTTab: React.FC<AssignFTTabProps> = ({
  requests,
  onSelectRequest,
  onSelectAll,
  onOpenDispatchModal,
  onOpenReassignModal,
  onViewSRNDetails,
  onExportCSV,
  onOpenCsvModal,
  onOpenSmartSdModal
}) => {
  // Left Panel Filter States
  const [filterStatus, setFilterStatus] = useState<string>('Release To Dispatcher');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterSrnText, setFilterSrnText] = useState<string>('');
  const [isMayaOnly, setIsMayaOnly] = useState<boolean>(false);

  // Top Table Filter States
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedRequestor, setSelectedRequestor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Loading Transition State
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);

  const triggerFilterLoading = () => {
    setIsFilterLoading(true);
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 450);
  };

  // Sorting state
  const [sortField, setSortField] = useState<keyof ServiceRequest>('releasedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Queue Status Counters
  const undispatchedCount = useMemo(() => {
    return requests.filter(r => r.status === 'Release To Dispatcher' || r.status === 'Pending Dispatch').length;
  }, [requests]);

  const dispatchedCount = useMemo(() => {
    return requests.filter(r => r.status === 'Dispatched' || r.status === 'In Transit').length;
  }, [requests]);

  const completedCount = useMemo(() => {
    return requests.filter(r => r.status === 'Completed' || r.status === 'eFSR Submitted').length;
  }, [requests]);

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (filterStatus !== 'ALL' && req.status !== filterStatus) {
        return false;
      }

      // Area filter
      if (filterArea !== 'ALL' && req.area !== filterArea) {
        return false;
      }

      // Sector filter
      if (filterSector !== 'ALL' && req.sector !== filterSector) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'ALL' && req.requestCategory !== filterCategory) {
        return false;
      }

      // MAYA filter
      if (isMayaOnly && !req.isMayaRequest && !req.accountName.toUpperCase().includes('MAYA')) {
        return false;
      }

      // Project filter
      if (selectedProject !== 'ALL' && req.projectName !== selectedProject) {
        return false;
      }

      // Requestor filter
      if (selectedRequestor !== 'ALL' && req.requestor !== selectedRequestor) {
        return false;
      }

      // SRN List Textarea Filter (if user typed specific SRNs)
      if (filterSrnText.trim().length > 0) {
        const srnLines = filterSrnText
          .split('\n')
          .map(s => s.trim().toUpperCase())
          .filter(Boolean);
        if (srnLines.length > 0) {
          const matchesAnySRN = srnLines.some(srn => req.srn.toUpperCase().includes(srn));
          if (!matchesAnySRN) return false;
        }
      }

      // Global Search input
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const searchable = `${req.merchantName} ${req.merchantAddress} ${req.cityMunicipality} ${req.province} ${req.srn} ${req.accountName}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [
    requests,
    filterStatus,
    filterArea,
    filterSector,
    filterCategory,
    isMayaOnly,
    selectedProject,
    selectedRequestor,
    filterSrnText,
    searchQuery
  ]);

  // Sorted Requests
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRequests, sortField, sortDirection]);

  // Selected Count
  const selectedCount = requests.filter(r => r.selected).length;
  const isAllSelected = sortedRequests.length > 0 && sortedRequests.every(r => r.selected);

  const handleSort = (field: keyof ServiceRequest) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Action Bar (Dispatch & Reassign) matching screenshot */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <button className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          </button>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Filter & Dispatch Console
          </span>
          {selectedCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-cyan-300 rounded-full border border-blue-200 dark:border-blue-800">
              {selectedCount} Selected
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onOpenSmartSdModal && (
            <button
              onClick={onOpenSmartSdModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm bg-gradient-to-r from-cyan-800 via-teal-800 to-blue-900 hover:from-cyan-700 hover:to-blue-800 text-white border border-cyan-500/30 cursor-pointer active:scale-95"
              title="Sync Active Service Orders (SO) directly from SMART SD (Strateq)"
            >
              <Database className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Sync SMART SD</span>
            </button>
          )}

          {onOpenCsvModal && (
            <button
              onClick={onOpenCsvModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              title="Import Batch CSV Dispatch Manifest from IMS/CCI-ARCO"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload CSV Manifest</span>
            </button>
          )}

          {/* Dispatch Button matching screenshot */}
          <button
            onClick={onOpenDispatchModal}
            disabled={selectedCount === 0}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
              selectedCount > 0 
                ? 'bg-[#cbe3ff] dark:bg-blue-900 text-[#0d4f8f] dark:text-cyan-200 hover:bg-[#b0d5ff] dark:hover:bg-blue-800 cursor-pointer' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span>Dispatch</span>
          </button>

          {/* Reassign Button matching screenshot */}
          <button
            onClick={onOpenReassignModal}
            disabled={selectedCount === 0}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
              selectedCount > 0 
                ? 'bg-[#d2f3dc] dark:bg-emerald-950 text-[#146b38] dark:text-emerald-300 hover:bg-[#baf0cb] dark:hover:bg-emerald-900 cursor-pointer' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reassign</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Filter Drawer + Right Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Filter Panel (Cols 3) matching screenshot */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 text-xs transition-colors duration-200">
          {/* Status */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="Release To Dispatcher">Release To Dispatcher</option>
              <option value="Pending Dispatch">Pending Dispatch</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="eFSR Submitted">eFSR Submitted</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Area */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Area:</label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">ALL AREAS</option>
              <option value="LUZON">LUZON</option>
              <option value="VISAYAS">VISAYAS</option>
              <option value="MINDANAO">MINDANAO</option>
              <option value="NCR">NCR</option>
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 dark:text-slate-300 text-[11px] block">Sector:</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm px-2.5 py-1.5 text-slate-900 dark:text-slate-100 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">ALL SECTORS</option>
              <option value="SOUTH LUZON">SOUTH LUZON</option>
              <option value="NORTH LUZON">NORTH LUZON</option>
              <option value="NCR">NCR</option>
              <option value="VISAYAS">VISAYAS</option>
              <option value="MINDANAO">MINDANAO</option>
            </select>
          </div>

          {/* Request Category */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 dark:text-slate-300 text-[11px] block">Request Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm px-2.5 py-1.5 text-slate-900 dark:text-slate-100 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">ALL</option>
              <option value="INS">INS</option>
              <option value="INS-RPL">INS-RPL</option>
              <option value="INS-RPG">INS-RPG</option>
              <option value="INS-FTS">INS-FTS</option>
              <option value="PLO">PLO</option>
              <option value="PLO-DPG">PLO-DPG</option>
              <option value="RPL">RPL</option>
              <option value="RPL-FTS">RPL-FTS</option>
              <option value="RPG">RPG</option>
              <option value="CHK">CHK</option>
              <option value="ACC">ACC</option>
              <option value="OTH">OTH</option>
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Date From:</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Date To:</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* SRN Textarea */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">SRN:</label>
            <textarea
              rows={3}
              value={filterSrnText}
              onChange={(e) => setFilterSrnText(e.target.value)}
              placeholder="Paste SRNs line-by-line..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* MAYA Request Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="mayaCheckbox"
              checked={isMayaOnly}
              onChange={(e) => setIsMayaOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="mayaCheckbox" className="font-bold text-slate-700 dark:text-slate-300 text-xs cursor-pointer">
              MAYA Request
            </label>
          </div>

          {/* Bottom Left Panel Buttons matching screenshot */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => onExportCSV(sortedRequests)}
              title="Download Records (CSV/Excel)"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                // Apply Filter / Clear custom SRN box if any
                setFilterSrnText('');
              }}
              title="Apply Search Filters"
              className="flex-1 bg-[#1e588f] hover:bg-[#174673] text-white font-bold py-1.5 px-3 rounded shadow-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Filter</span>
            </button>

            <button
              onClick={() => {
                triggerFilterLoading();
                setFilterStatus('ALL');
                setFilterArea('ALL');
                setFilterSector('ALL');
                setFilterCategory('ALL');
                setFilterSrnText('');
                setSearchQuery('');
                setSelectedProject('ALL');
                setSelectedRequestor('ALL');
                setIsMayaOnly(false);
              }}
              title="Clear All Filters & Show All Uploads"
              className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded shadow-xs transition-colors cursor-pointer text-[10px]"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right Data Table Area (Cols 9) matching screenshot */}
        <div className="lg:col-span-9 space-y-3 relative min-h-[400px]">
          {/* SATELLITE ORBIT LOADING SCREEN OVERLAY ON FILTER */}
          {isFilterLoading && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-xs rounded-xl flex items-center justify-center p-4 shadow-xl">
              <TangentLoadingScreen
                progress={80}
                statusMessage="Filtering & Querying Data Records..."
                fullscreen={false}
              />
            </div>
          )}

          {/* Quick Queue Status Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs text-xs transition-colors duration-200">
            <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px] mr-1">Quick Queues:</span>

            <button
              onClick={() => {
                triggerFilterLoading();
                setFilterStatus('Release To Dispatcher');
                setFilterSrnText('');
                setFilterArea('ALL');
                setFilterSector('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center space-x-1.5 transition cursor-pointer ${
                filterStatus === 'Release To Dispatcher' || filterStatus === 'Pending Dispatch'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>📦 IMS Uploaded / Pending Dispatch</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                filterStatus === 'Release To Dispatcher' ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                {undispatchedCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterStatus('Dispatched');
                setFilterSrnText('');
                setFilterArea('ALL');
                setFilterSector('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center space-x-1.5 transition cursor-pointer ${
                filterStatus === 'Dispatched' || filterStatus === 'In Transit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>🚚 Dispatched to Field Techs</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                filterStatus === 'Dispatched' ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                {dispatchedCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterStatus('Completed');
                setFilterSrnText('');
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center space-x-1.5 transition cursor-pointer ${
                filterStatus === 'Completed' || filterStatus === 'eFSR Submitted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>✅ Completed / eFSR</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                filterStatus === 'Completed' ? 'bg-emerald-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                {completedCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterStatus('ALL');
                setFilterSrnText('');
                setFilterArea('ALL');
                setFilterSector('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center space-x-1.5 transition cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-slate-800 dark:bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>🌐 All Records</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                filterStatus === 'ALL' ? 'bg-slate-900 text-cyan-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                {requests.length}
              </span>
            </button>
          </div>
          {/* Top Filter Bar above Table */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs transition-colors duration-200">
            {/* Project Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Project Name:</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Select Project</option>
                <option value="PNB Terminal Upgrade Phase 2">PNB Terminal Upgrade Phase 2</option>
                <option value="MAYA Merchant Rollout 2026">MAYA Merchant Rollout 2026</option>
                <option value="BDO Annual PM Drive">BDO Annual PM Drive</option>
                <option value="Metrobank Decommissioning">Metrobank Decommissioning</option>
              </select>
            </div>

            {/* Requestor */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Requestor:</label>
              <select
                value={selectedRequestor}
                onChange={(e) => setSelectedRequestor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">No Requestor Found</option>
                <option value="Central Ops - PNB Unit">Central Ops - PNB Unit</option>
                <option value="MAYA Ops Desk">MAYA Ops Desk</option>
                <option value="BDO Merchant Services">BDO Merchant Services</option>
                <option value="Metrobank Card Ops">Metrobank Card Ops</option>
              </select>
            </div>

            {/* Search */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Search:</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search records..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded pl-8 pr-2 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                {/* Table Header matching Tangent Blue header bar in screenshot */}
                <thead>
                  <tr className="bg-[#245c92] dark:bg-slate-950 text-white dark:text-cyan-200 font-bold select-none text-[11px] border-b border-blue-600/40 dark:border-slate-800">
                    <th className="p-2.5 w-8 text-center border-r border-blue-600/40">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        className="rounded text-cyan-400 focus:ring-cyan-400 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th 
                      onClick={() => handleSort('merchantName')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Merchant Name</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('merchantAddress')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Merchant Address</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('cityMunicipality')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>City/ Municipality</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('province')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Province</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('area')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Area</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('sector')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sector</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('srn')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>SRN</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('requestCategory')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Request Category</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('accountName')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Account Name</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('clientCount')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Client Count</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('releasedDate')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>CCIARCO/IMS/POSP/RC Released</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('releasedTime')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>CCIARCO/IMS/POSP/RC Released Time</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('slaRemarks')}
                      className="p-2.5 cursor-pointer hover:bg-blue-700/60 border-r border-blue-600/40 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>SLA Remarks</span>
                        <ArrowUpDown className="w-3 h-3 text-cyan-200" />
                      </div>
                    </th>
                    <th className="p-2.5 border-r border-blue-600/40 whitespace-nowrap">
                      <span>Contact Person</span>
                    </th>
                    <th className="p-2.5 border-r border-blue-600/40 whitespace-nowrap">
                      <span>Contact Number</span>
                    </th>
                    <th className="p-2.5 border-r border-blue-600/40 whitespace-nowrap min-w-[200px]">
                      <span>Addtl Instructions</span>
                    </th>
                    <th className="p-2.5 border-r border-blue-600/40 whitespace-nowrap">
                      <span>Project</span>
                    </th>
                    <th className="p-2.5 border-r border-blue-600/40 whitespace-nowrap">
                      <span>Requestor</span>
                    </th>
                    <th className="p-2.5 whitespace-nowrap">
                      <span>Request Classification</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  {sortedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={20} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-200">No Service Requests found</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try adjusting your filters or search criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedRequests.map((req, index) => (
                      <tr 
                        key={req.id}
                        className={`hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors ${
                          req.selected ? 'bg-blue-50/90 dark:bg-blue-950/80' : index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                          <input
                            type="checkbox"
                            checked={!!req.selected}
                            onChange={(e) => onSelectRequest(req.id, e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>

                        {/* Merchant Name */}
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.merchantName}
                        </td>

                        {/* Merchant Address */}
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 max-w-[220px] truncate uppercase" title={req.merchantAddress}>
                          {req.merchantAddress}
                        </td>

                        {/* City/Municipality */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.cityMunicipality}
                        </td>

                        {/* Province */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.province}
                        </td>

                        {/* Area */}
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-semibold border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.area}
                        </td>

                        {/* Sector */}
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-semibold border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.sector}
                        </td>

                        {/* SRN (Clickable) */}
                        <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          <button
                            onClick={() => onViewSRNDetails(req)}
                            className="font-mono font-bold text-blue-700 dark:text-cyan-400 hover:text-blue-900 dark:hover:text-cyan-200 hover:underline cursor-pointer"
                          >
                            {req.srn}
                          </button>
                        </td>

                        {/* Request Category */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
                          {req.requestCategory}
                        </td>

                        {/* Account Name */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          {req.accountName}
                        </td>

                        {/* Client Count */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
                          {req.clientCount}
                        </td>

                        {/* Released Date */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-mono border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          {req.releasedDate}
                        </td>

                        {/* Released Time */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-mono border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          {req.releasedTime}
                        </td>

                        {/* SLA Remarks */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-mono border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          {req.slaRemarks || req.releasedDate}
                        </td>

                        {/* Contact Person */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.contactPerson || 'N/A'}
                        </td>

                        {/* Contact Number */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-mono border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          {req.contactNumber || 'N/A'}
                        </td>

                        {/* Addtl Instructions */}
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 max-w-[280px] truncate uppercase" title={req.remarks}>
                          {req.remarks || 'NO INSTRUCTIONS'}
                        </td>

                        {/* Project */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium border-r border-slate-200 dark:border-slate-800 uppercase whitespace-nowrap">
                          {req.projectName || 'STANDARD'}
                        </td>

                        {/* Requestor */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                          {req.requestor || 'SYSTEM'}
                        </td>

                        {/* Request Classification */}
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-semibold uppercase whitespace-nowrap">
                          {req.requestClassification || 'REGULAR'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching screenshot ("Showing 1 to 2 of 2 entries") */}
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-cyan-400">
              <div>
                Showing 1 to {sortedRequests.length} of {sortedRequests.length} entries
              </div>

              <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500">
                <button className="p-1 hover:text-slate-600 dark:hover:text-slate-300 cursor-not-allowed">◀</button>
                <span className="px-2 py-0.5 bg-blue-600 dark:bg-cyan-600 text-white rounded text-[11px]">1</span>
                <button className="p-1 hover:text-slate-600 dark:hover:text-slate-300 cursor-not-allowed">▶</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
