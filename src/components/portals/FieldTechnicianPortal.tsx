import React, { useState, useRef } from 'react';
import { ServiceRequest, EFSRRecord, AppUser } from '../../types';
import { 
  Smartphone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  FileCheck2, 
  Signature, 
  Wifi, 
  X, 
  RotateCcw,
  LogOut,
  ShieldCheck,
  Send,
  FileText,
  MessageSquare,
  User,
  Mail,
  Phone,
  Building,
  Check,
  AlertCircle,
  Sparkles,
  Download
} from 'lucide-react';
import { EFSRPdfModal } from '../modals/EFSRPdfModal';
import { MobileTeamsChat } from '../chat/MobileTeamsChat';
import { TangentLogo } from '../common/TangentLogo';

interface FieldTechnicianPortalProps {
  currentUser: AppUser;
  requests: ServiceRequest[];
  efsrRecords: EFSRRecord[];
  users: AppUser[];
  onUpdateSRNStatus: (srnId: string, status: any, extraData?: any) => void;
  onSubmitEFSR: (efsr: EFSRRecord) => void;
  onLogout: () => void;
}

export const FieldTechnicianPortal: React.FC<FieldTechnicianPortalProps> = ({
  currentUser,
  requests,
  efsrRecords,
  users,
  onUpdateSRNStatus,
  onSubmitEFSR,
  onLogout
}) => {
  // Mobile frame simulation toggle & Active Tab state
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [deviceOS, setDeviceOS] = useState<'iOS' | 'Android'>('iOS');
  const [activeTab, setActiveTab] = useState<'dispatches' | 'history' | 'messages' | 'profile'>('dispatches');

  // Modal for submitting eFSR
  const [activeEFSRSRN, setActiveEFSRSRN] = useState<ServiceRequest | null>(null);
  const [pdfModalRecord, setPdfModalRecord] = useState<EFSRRecord | null>(null);

  // EFSR Form State
  const [terminalSerialInstalled, setTerminalSerialInstalled] = useState('PX-90182811');
  const [terminalSerialPulledOut, setTerminalSerialPulledOut] = useState('');
  const [signalStrength, setSignalStrength] = useState('4G - Excellent (-68dBm)');
  const [testTransactionSuccess, setTestTransactionSuccess] = useState(true);
  const [remarks, setRemarks] = useState('Terminal installed, tested successfully. Merchant trained on EMV contactless.');

  // Digital Signature Canvas Ref (for eFSR modal)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Profile Digital Signature Canvas Ref
  const profileSignatureRef = useRef<HTMLCanvasElement | null>(null);
  const [isProfileDrawing, setIsProfileDrawing] = useState(false);
  const [hasProfileSignature, setHasProfileSignature] = useState(true);

  // STRICT TAB FILTERING:
  // 1. "My Jobs" Tab: Filter so logged-in Field Technician ONLY sees tasks assigned to them with active status
  const myAssignedJobs = requests.filter(r => {
    const isAssigned = 
      r.assignedFTName?.toLowerCase() === currentUser.name.toLowerCase() ||
      r.assignedFTId === currentUser.assignedFTId ||
      r.assignedFTId === currentUser.id ||
      r.assignedTo === currentUser.id ||
      r.assignedTo === currentUser.name ||
      (r.status === 'Dispatched' && (!r.assignedFTName || r.assignedFTName === currentUser.name));

    return isAssigned && (r.status === 'Dispatched' || r.status === 'In Transit' || r.status === 'On Site');
  });

  // 2. "Reports" Tab: Filter for completed service tickets (Completed - Successful, Completed - Unsuccessful, eFSR Submitted, Completed)
  const myCompletedReports = requests.filter(r => {
    const isAssigned = 
      r.assignedFTName?.toLowerCase() === currentUser.name.toLowerCase() ||
      r.assignedFTId === currentUser.assignedFTId ||
      r.assignedFTId === currentUser.id ||
      r.assignedTo === currentUser.id ||
      r.assignedTo === currentUser.name ||
      !r.assignedFTName; // fallback view completed records

    const isCompletedStatus = 
      r.status === 'Completed' || 
      r.status === 'eFSR Submitted' || 
      r.status === 'Completed - Successful' || 
      r.status === 'Completed - Unsuccessful';

    return isAssigned && isCompletedStatus;
  });

  // Canvas Drawing Logic for Modal eFSR Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawnSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0f2c4a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Submit Electronic Field Service Report
  const handleConfirmSubmitEFSR = () => {
    if (!activeEFSRSRN) return;

    const efsrNo = `EFSR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateCompleted = now.toLocaleString();

    const newEFSRRecord: EFSRRecord = {
      id: `efsr-${Date.now()}`,
      efsrNumber: efsrNo,
      srn: activeEFSRSRN.srn,
      merchantName: activeEFSRSRN.merchantName,
      technicianName: currentUser.name,
      dateCompleted,
      status: 'Approved',
      terminalSerialInstalled,
      terminalSerialPulledOut: terminalSerialPulledOut || undefined,
      signalStrength,
      testTransactionSuccess,
      merchantSignature: hasDrawnSignature ? 'Digital Signature Captured' : 'Verified by Representative',
      remarks
    };

    onSubmitEFSR(newEFSRRecord);
    onUpdateSRNStatus(activeEFSRSRN.id, 'Completed - Successful', {
      serialNumber: terminalSerialInstalled,
      remarks: `eFSR ${efsrNo} submitted by ${currentUser.name}`
    });

    setActiveEFSRSRN(null);
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Controls Bar */}
      <div className="bg-[#1e588f] dark:bg-slate-950 border-b border-[#184673] dark:border-slate-800 p-3 px-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm text-white">Tangent Field Tech Mobile App</h1>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                {deviceOS} Online Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Logged in FT: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.employeeCode})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Frame Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 border transition cursor-pointer ${
              isMobileFrame 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isMobileFrame ? 'Phone Frame Mode' : 'Full Web View'}</span>
          </button>

          {/* OS Switch */}
          {isMobileFrame && (
            <button
              onClick={() => setDeviceOS(deviceOS === 'iOS' ? 'Android' : 'iOS')}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
            >
              {deviceOS === 'iOS' ? '🍎 iPhone 16 Pro' : '🤖 Android Galaxy'}
            </button>
          )}

          <button
            onClick={onLogout}
            className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 my-2">
        <div className={`${
          isMobileFrame 
            ? deviceOS === 'iOS'
              ? 'w-[380px] h-[750px] border-[12px] border-slate-800 rounded-[48px] shadow-2xl bg-slate-900 relative flex flex-col overflow-hidden ring-1 ring-slate-700'
              : 'w-[380px] h-[750px] border-[10px] border-slate-800 rounded-[32px] shadow-2xl bg-slate-900 relative flex flex-col overflow-hidden ring-1 ring-slate-700'
            : 'w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-800 p-4 min-h-[600px] shadow-2xl flex flex-col'
        }`}>

          {/* Mobile Notch / Status Header */}
          {isMobileFrame && (
            <div className="bg-slate-950 pt-3 pb-2 px-6 flex justify-between items-center text-[10px] text-slate-400 select-none border-b border-slate-800/80">
              <span className="font-mono font-bold text-slate-200">09:41 AM</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-800 rounded-full mr-2"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* App Top Header Bar */}
          <div className="bg-gradient-to-r from-[#1e588f] to-[#123657] p-3 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <TangentLogo className="w-7 h-7 rounded-full shadow-md flex-shrink-0" />
              <div>
                <h2 className="font-extrabold text-xs tracking-wide uppercase">TANGENT AZURE CLOUD SYSTEM</h2>
                <p className="text-[9px] text-cyan-200 uppercase font-semibold">South Luzon Field Ops</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-bold text-emerald-300">GPS Active</span>
            </div>
          </div>

          {/* TAB 1: MY JOBS (Strictly assigned tasks) */}
          {activeTab === 'dispatches' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">My Pending Jobs</span>
                    <span className="text-base font-extrabold text-cyan-400">{myAssignedJobs.length}</span>
                  </div>
                  <Clock className="w-5 h-5 text-cyan-400/80" />
                </div>

                <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Completed Reports</span>
                    <span className="text-base font-extrabold text-emerald-400">{myCompletedReports.length}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400/80" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span>My Assigned Jobs ({myAssignedJobs.length})</span>
                  </h3>
                  <span className="text-[9px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Strict FT Filter
                  </span>
                </div>

                {myAssignedJobs.length === 0 ? (
                  <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/60 my-4 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-xs text-slate-200">No Dispatched Jobs!</p>
                    <p className="text-[10px] text-slate-400">
                      You currently have no pending service requests dispatched specifically to your account ({currentUser.name}).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myAssignedJobs.map((req) => (
                      <div 
                        key={req.id}
                        className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 shadow-md space-y-2 hover:border-blue-500/80 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-blue-950 text-blue-400 font-mono text-[10px] font-bold rounded border border-blue-800">
                              {req.srn}
                            </span>
                            <h4 className="font-extrabold text-sm text-white mt-1 leading-tight">
                              {req.merchantName}
                            </h4>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                            req.status === 'On Site' 
                              ? 'bg-purple-900 text-purple-200 border border-purple-700'
                              : req.status === 'In Transit'
                              ? 'bg-amber-900 text-amber-200 border border-amber-700'
                              : 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-start space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{req.merchantAddress}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>Account: <strong className="text-slate-200">{req.accountName}</strong></span>
                            <span>Category: <strong className="text-cyan-300">{req.requestCategory}</strong></span>
                          </div>
                        </div>

                        {/* Action Workflow Buttons */}
                        <div className="pt-1 flex items-center gap-1.5 text-xs">
                          {req.status === 'Dispatched' && (
                            <button
                              onClick={() => onUpdateSRNStatus(req.id, 'In Transit')}
                              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 shadow cursor-pointer text-[11px]"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Start Transit</span>
                            </button>
                          )}

                          {req.status === 'In Transit' && (
                            <button
                              onClick={() => onUpdateSRNStatus(req.id, 'On Site')}
                              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 shadow cursor-pointer text-[11px]"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Mark On Site</span>
                            </button>
                          )}

                          {(req.status === 'On Site' || req.status === 'In Transit' || req.status === 'Dispatched') && (
                            <button
                              onClick={() => setActiveEFSRSRN(req)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 shadow cursor-pointer text-[11px]"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Fill eFSR Report</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REPORTS (Completed service tickets) */}
          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Completed Tickets & Reports ({myCompletedReports.length})</span>
                </h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Verified Records
                </span>
              </div>

              {myCompletedReports.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/60 my-4 space-y-2">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="font-bold text-xs text-slate-300">No Completed Reports Yet</p>
                  <p className="text-[10px] text-slate-400">
                    Once you submit eFSR reports for assigned jobs, completed ticket records will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myCompletedReports.map(req => {
                    const matchedEFSR = efsrRecords.find(e => e.srn === req.srn) || {
                      id: `efsr-${req.id}`,
                      efsrNumber: `EFSR-2026-${req.srn.slice(-5)}`,
                      srn: req.srn,
                      merchantName: req.merchantName,
                      technicianName: currentUser.name,
                      dateCompleted: new Date().toLocaleDateString(),
                      status: 'Approved',
                      terminalSerialInstalled: req.serialNumber || 'PX-90182811',
                      signalStrength: '4G - Excellent (-68dBm)',
                      testTransactionSuccess: true,
                      merchantSignature: 'Verified (Digital Signature Pad)',
                      remarks: req.remarks || 'Service ticket completed successfully.'
                    } as EFSRRecord;

                    return (
                      <div 
                        key={req.id}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-cyan-400 text-xs font-bold">{req.srn}</span>
                            <h4 className="font-extrabold text-xs text-white mt-0.5">{req.merchantName}</h4>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                            req.status.includes('Unsuccessful') 
                              ? 'bg-red-950 text-red-300 border border-red-800' 
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <div>Account: <strong className="text-slate-200">{req.accountName}</strong></div>
                          <div>Address: <span className="text-slate-300">{req.merchantAddress}</span></div>
                          {req.serialNumber && (
                            <div className="font-mono text-cyan-300">S/N: {req.serialNumber}</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                          <span className="text-[10px] text-slate-400">Completed eFSR Available</span>
                          <button
                            onClick={() => setPdfModalRecord(matchedEFSR)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg flex items-center space-x-1 shadow transition"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IN-APP MESSAGING (MS Teams Architecture) */}
          {activeTab === 'messages' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <MobileTeamsChat 
                currentUser={currentUser} 
                users={users} 
                serviceRequests={requests} 
                efsrRecords={efsrRecords} 
              />
            </div>
          )}

          {/* TAB 4: PROFILE & DIGITAL SIGNATURE */}
          {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
              {/* Profile Card Header */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center space-y-2 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 mx-auto flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white/20">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{currentUser.name}</h3>
                  <p className="text-[11px] text-cyan-300 font-bold">{currentUser.role}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold rounded-full">
                    ID: {currentUser.employeeCode || 'FT-889021'}
                  </span>
                </div>
              </div>

              {/* Structured Info List */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2.5">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Field Technician Details</span>
                </h4>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" /> Email:
                    </span>
                    <strong className="text-slate-100 font-mono text-[10px]">{currentUser.email}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact #:
                    </span>
                    <strong className="text-slate-100 font-mono text-[10px]">{currentUser.contactNumber || '+63 917 882 0019'}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-purple-400" /> Dept / Base:
                    </span>
                    <strong className="text-slate-100">{currentUser.department} - South Luzon</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Assigned Sector:
                    </span>
                    <strong className="text-slate-100">Naga / Legazpi Bicol Region</strong>
                  </div>
                </div>
              </div>

              {/* Digital Signature Component */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Signature className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Digital Signature Badge</span>
                  </h4>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Verified
                  </span>
                </div>

                <p className="text-[10px] text-slate-400">
                  This signature is automatically appended to your submitted eFSR reports and official field logs.
                </p>

                {/* Digital Signature Canvas Preview / Display */}
                <div className="bg-white rounded-xl p-3 border-2 border-cyan-500/50 text-center relative overflow-hidden">
                  <div className="font-serif text-slate-800 italic text-2xl font-bold py-2 tracking-wide select-none">
                    {currentUser.name}
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    Digital Signature • Employee ID {currentUser.employeeCode}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Bottom Navigation Bar (4 Tabs: My Jobs, Reports, Messages, Profile) */}
          {isMobileFrame && (
            <div className="bg-slate-950 border-t border-slate-800 p-2 grid grid-cols-4 gap-1 text-center text-[10px] text-slate-400 select-none">
              <button 
                onClick={() => setActiveTab('dispatches')}
                className={`p-1.5 rounded-lg font-bold flex flex-col items-center transition cursor-pointer ${
                  activeTab === 'dispatches' ? 'text-cyan-400 bg-slate-800/90' : 'hover:text-slate-200'
                }`}
              >
                <Navigation className="w-4 h-4 mb-0.5" />
                <span>My Jobs</span>
              </button>

              <button 
                onClick={() => setActiveTab('history')}
                className={`p-1.5 rounded-lg font-bold flex flex-col items-center transition cursor-pointer ${
                  activeTab === 'history' ? 'text-cyan-400 bg-slate-800/90' : 'hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-4 h-4 mb-0.5" />
                <span>Reports</span>
              </button>

              <button 
                onClick={() => setActiveTab('messages')}
                className={`p-1.5 rounded-lg font-bold flex flex-col items-center transition cursor-pointer relative ${
                  activeTab === 'messages' ? 'text-cyan-400 bg-slate-800/90' : 'hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4 mb-0.5" />
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                </div>
                <span>Messages</span>
              </button>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`p-1.5 rounded-lg font-bold flex flex-col items-center transition cursor-pointer ${
                  activeTab === 'profile' ? 'text-cyan-400 bg-slate-800/90' : 'hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-0.5" />
                <span>Profile</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Interactive Mobile eFSR Submission Modal */}
      {activeEFSRSRN && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-auto">
            <div className="bg-[#1e588f] p-4 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] text-cyan-200 uppercase font-bold block">Mobile eFSR Completion</span>
                <h3 className="font-extrabold text-sm font-mono">{activeEFSRSRN.srn}</h3>
              </div>
              <button onClick={() => setActiveEFSRSRN(null)} className="p-1 text-cyan-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
                <div className="font-bold text-cyan-300 text-xs">{activeEFSRSRN.merchantName}</div>
                <div className="text-[11px] text-slate-300">{activeEFSRSRN.merchantAddress}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Serial Installed*</label>
                  <input
                    type="text"
                    required
                    value={terminalSerialInstalled}
                    onChange={(e) => setTerminalSerialInstalled(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-cyan-300 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Serial Pulled Out (Opt)</label>
                  <input
                    type="text"
                    value={terminalSerialPulledOut}
                    onChange={(e) => setTerminalSerialPulledOut(e.target.value)}
                    placeholder="e.g. PX-1029384"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block text-[10px]">Signal Quality</label>
                  <select
                    value={signalStrength}
                    onChange={(e) => setSignalStrength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 text-[11px]"
                  >
                    <option value="4G - Excellent (-68dBm)">4G - Excellent (-68dBm)</option>
                    <option value="4G - Good (-80dBm)">4G - Good (-80dBm)</option>
                    <option value="WiFi Connected">WiFi Connected</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-3">
                  <input
                    type="checkbox"
                    id="testTx"
                    checked={testTransactionSuccess}
                    onChange={(e) => setTestTransactionSuccess(e.target.checked)}
                    className="rounded text-emerald-500 w-4 h-4 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="testTx" className="font-bold text-emerald-400 text-[11px] cursor-pointer">
                    Test Tx Approved ₱1.00
                  </label>
                </div>
              </div>

              {/* Digital Signature Pad */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-300 flex items-center space-x-1">
                    <Signature className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Merchant Digital Signature</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Pad
                  </button>
                </div>

                <div className="bg-white rounded-xl border-2 border-slate-600 overflow-hidden touch-none relative">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair bg-white"
                  />
                  {!hasDrawnSignature && (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs pointer-events-none italic">
                      Sign here using touch or mouse...
                    </span>
                  )}
                </div>
              </div>

              {/* Technician Remarks */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Technician Remarks & Feedback</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveEFSRSRN(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmitEFSR}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit eFSR Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pdfModalRecord && (
        <EFSRPdfModal
          efsrRecord={pdfModalRecord}
          onClose={() => setPdfModalRecord(null)}
        />
      )}

    </div>
  );
};
