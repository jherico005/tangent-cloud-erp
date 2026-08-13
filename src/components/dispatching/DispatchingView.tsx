import React, { useState } from 'react';
import { DispatchSubTab, ServiceRequest, FieldTechnician, EFSRRecord } from '../../types';
import { AssignFTTab } from './AssignFTTab';
import { ViewDispatchedTab } from './ViewDispatchedTab';
import { EFSRCorrectionTab } from './EFSRCorrectionTab';
import { SearchFTTab } from './SearchFTTab';
import { DashboardTab } from './DashboardTab';
import { UserCheck, Eye, FileEdit, Search, BarChart3 } from 'lucide-react';

interface DispatchingViewProps {
  requests: ServiceRequest[];
  fieldTechnicians: FieldTechnician[];
  efsrRecords: EFSRRecord[];
  onSelectRequest: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onOpenDispatchModal: () => void;
  onOpenReassignModal: () => void;
  onViewSRNDetails: (request: ServiceRequest) => void;
  onExportCSV: (filtered: ServiceRequest[]) => void;
  onOpenCsvModal?: () => void;
  onOpenSmartSdModal?: () => void;
  onRecallDispatch?: (srnId: string) => void;
  onApproveEFSR?: (id: string) => void;
  onRequestCorrection?: (id: string, reason: string) => void;
}

export const DispatchingView: React.FC<DispatchingViewProps> = ({
  requests,
  fieldTechnicians,
  efsrRecords,
  onSelectRequest,
  onSelectAll,
  onOpenDispatchModal,
  onOpenReassignModal,
  onViewSRNDetails,
  onExportCSV,
  onOpenCsvModal,
  onOpenSmartSdModal,
  onRecallDispatch,
  onApproveEFSR,
  onRequestCorrection
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DispatchSubTab>('assign-ft');

  const subTabs: { id: DispatchSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'assign-ft', label: 'ASSIGN FT', icon: UserCheck },
    { id: 'view-dispatched', label: 'VIEW DISPATCHED', icon: Eye },
    { id: 'efsr-correction', label: 'EFSR CORRECTION', icon: FileEdit },
    { id: 'search-ft', label: 'SEARCH FT', icon: Search },
    { id: 'dashboard', label: 'DASHBOARD', icon: BarChart3 }
  ];

  return (
    <div className="space-y-3">
      {/* Sub-Tabs Navigation Header matching screenshot top tabs with live cursor drop effects */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 shadow-2xs flex items-center space-x-3 overflow-x-auto select-none transition-colors duration-200">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2.5 font-bold text-xs tracking-wide transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer rounded-t-lg relative group transform ${
                isActive
                  ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-300 bg-blue-50/60 dark:bg-slate-800/80 shadow-2xs translate-y-0.5'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-cyan-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:translate-y-1 hover:border-blue-400/60 active:translate-y-1.5'
              }`}
            >
              {/* Live hover cursor light bar that drops down */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-500 dark:bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t"></div>

              <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300'}`} />
              <span>{tab.label}</span>

              {/* Live status pulsing dot */}
              {isActive && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-cyan-400"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Content Rendering */}
      <div className="pt-1">
        {activeSubTab === 'assign-ft' && (
          <AssignFTTab
            requests={requests}
            onSelectRequest={onSelectRequest}
            onSelectAll={onSelectAll}
            onOpenDispatchModal={onOpenDispatchModal}
            onOpenReassignModal={onOpenReassignModal}
            onViewSRNDetails={onViewSRNDetails}
            onExportCSV={onExportCSV}
            onOpenCsvModal={onOpenCsvModal}
            onOpenSmartSdModal={onOpenSmartSdModal}
          />
        )}

        {activeSubTab === 'view-dispatched' && (
          <ViewDispatchedTab
            requests={requests}
            fieldTechnicians={fieldTechnicians}
            onViewSRNDetails={onViewSRNDetails}
            onRecallDispatch={onRecallDispatch}
          />
        )}

        {activeSubTab === 'efsr-correction' && (
          <EFSRCorrectionTab
            efsrRecords={efsrRecords}
            onApproveEFSR={onApproveEFSR}
            onRequestCorrection={onRequestCorrection}
          />
        )}

        {activeSubTab === 'search-ft' && (
          <SearchFTTab fieldTechnicians={fieldTechnicians} />
        )}

        {activeSubTab === 'dashboard' && (
          <DashboardTab requests={requests} fieldTechnicians={fieldTechnicians} />
        )}
      </div>
    </div>
  );
};
