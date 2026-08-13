import React, { useState } from 'react';
import { AppUser, ServiceRequest, POSPrepLogItem, IMSLogItem } from '../../types';
import { CsvImportModal } from '../modals/CsvImportModal';
import { 
  Building2, 
  Plus, 
  Terminal, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  Search, 
  Send, 
  LogOut, 
  Key, 
  Cpu, 
  Box, 
  ShieldAlert,
  ArrowRight,
  UploadCloud
} from 'lucide-react';

interface DepartmentPortalProps {
  currentUser: AppUser;
  requests: ServiceRequest[];
  posPrepLogs: POSPrepLogItem[];
  imsLogs: IMSLogItem[];
  onAddPOSPrepLog: (log: POSPrepLogItem) => void;
  onAddIMSLog: (log: IMSLogItem) => void;
  onCreateSRN: (newRequest: Omit<ServiceRequest, 'id'>) => void;
  onBatchImportCSV?: (newRequests: ServiceRequest[], newIMSLogs: IMSLogItem[]) => void;
  onLogout: () => void;
}

export const DepartmentPortal: React.FC<DepartmentPortalProps> = ({
  currentUser,
  requests,
  posPrepLogs,
  imsLogs,
  onAddPOSPrepLog,
  onAddIMSLog,
  onCreateSRN,
  onBatchImportCSV,
  onLogout
}) => {
  const departmentType = currentUser.role;

  // CSV Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // POS Prep Form State
  const [prepSrn, setPrepSrn] = useState(`2026INS00${Math.floor(10000 + Math.random() * 90000)}`);
  const [prepModel, setPrepModel] = useState('Pax A920 Pro');
  const [prepSerial, setPrepSerial] = useState(`PX-90${Math.floor(100000 + Math.random() * 900000)}`);
  const [prepSim, setPrepSim] = useState(`8963029${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [prepAccount, setPrepAccount] = useState('PNB');
  const [merchantName, setMerchantName] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');

  // IMS Form State
  const [imsSerial, setImsSerial] = useState(`PX-90${Math.floor(100000 + Math.random() * 900000)}`);
  const [imsModel, setImsModel] = useState('Pax A920 Pro');
  const [imsAccount, setImsAccount] = useState('SBIS, PNB');
  const [imsMovement, setImsMovement] = useState<'Inbound' | 'Outbound to Dispatch' | 'Returned' | 'Defective'>('Outbound to Dispatch');
  const [imsReleasedTo, setImsReleasedTo] = useState('Field Technician Ramon Dela Cruz');

  // Support Ticket Form State
  const [ticketSrn, setTicketSrn] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketLog, setTicketLog] = useState<{ id: string; srn: string; subject: string; status: string; time: string }[]>([
    { id: '1', srn: '2026INS0018216', subject: 'Merchant requested urgent AM schedule', status: 'Escalated to Dispatcher', time: '10:15 AM' }
  ]);

  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Submit POS Prep
  const handlePOSPrepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: POSPrepLogItem = {
      id: `prep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      srn: prepSrn,
      terminalModel: prepModel,
      serialNumber: prepSerial,
      simCardNo: prepSim,
      accountName: prepAccount,
      prepStatus: 'Packed',
      preppedBy: currentUser.name
    };

    onAddPOSPrepLog(newLog);

    if (merchantName && merchantAddress) {
      onCreateSRN({
        merchantName: merchantName.toUpperCase(),
        merchantAddress: merchantAddress.toUpperCase(),
        cityMunicipality: 'Lipa',
        province: 'Batangas',
        area: 'LUZON',
        sector: 'SOUTH LUZON',
        srn: prepSrn,
        requestCategory: 'INS',
        accountName: prepAccount,
        clientCount: 1,
        releasedDate: new Date().toISOString().split('T')[0],
        releasedTime: new Date().toLocaleTimeString(),
        status: 'Release To Dispatcher',
        terminalModel: prepModel,
        serialNumber: prepSerial
      });
      triggerToast(`POS Prep complete & Service Request ${prepSrn} released to Dispatcher queue!`);
    } else {
      triggerToast(`POS Prep log created for ${prepSerial}.`);
    }

    setPrepSrn(`2026INS00${Math.floor(10000 + Math.random() * 90000)}`);
    setPrepSerial(`PX-90${Math.floor(100000 + Math.random() * 900000)}`);
    setMerchantName('');
    setMerchantAddress('');
  };

  // Submit IMS Vault Log
  const handleIMSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIms: IMSLogItem = {
      id: `ims-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      serialNumber: imsSerial,
      model: imsModel,
      account: imsAccount,
      movementType: imsMovement,
      releasedTo: imsReleasedTo,
      verifiedBy: currentUser.name
    };

    onAddIMSLog(newIms);
    triggerToast(`Inventory movement logged for serial ${imsSerial}!`);
    setImsSerial(`PX-90${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Submit Support Ticket
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject) return;

    setTicketLog(prev => [{
      id: Date.now().toString(),
      srn: ticketSrn || 'General Query',
      subject: ticketSubject,
      status: 'Open - Logged to Dispatcher',
      time: new Date().toLocaleTimeString()
    }, ...prev]);

    triggerToast('Support Inquiry logged and notified to Dispatch Team.');
    setTicketSrn('');
    setTicketSubject('');
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-[#1e588f] dark:bg-slate-950 border-b border-[#184673] dark:border-slate-800 p-4 px-6 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e588f] to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-md">
            T
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>{currentUser.department}</span>
              <span className="px-2 py-0.5 bg-blue-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold rounded-full uppercase">
                Department Online Portal
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              User: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 font-bold text-xs rounded-lg flex items-center space-x-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout / Switch Portal</span>
        </button>
      </header>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {toastMsg && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 1. POS PREP DEPARTMENT VIEW */}
        {(departmentType === 'posprep-tech' || departmentType === 'department-user') && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400 border-b border-slate-700 pb-3">
                <Terminal className="w-5 h-5" />
                <h2 className="font-extrabold text-base text-white">POS Staging & Key Injection Module</h2>
              </div>

              <form onSubmit={handlePOSPrepSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Target SRN Number</label>
                  <input
                    type="text"
                    required
                    value={prepSrn}
                    onChange={(e) => setPrepSrn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-cyan-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Terminal Model</label>
                  <select
                    value={prepModel}
                    onChange={(e) => setPrepModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Pax A920 Pro">Pax A920 Pro</option>
                    <option value="Ingenico Move/5000">Ingenico Move/5000</option>
                    <option value="Maya Smart POS Sunmi V2">Maya Smart POS Sunmi V2</option>
                    <option value="Verifone VX520">Verifone VX520</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Serial Number Injection</label>
                  <input
                    type="text"
                    required
                    value={prepSerial}
                    onChange={(e) => setPrepSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-emerald-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SIM Card ICCID Serial</label>
                  <input
                    type="text"
                    value={prepSim}
                    onChange={(e) => setPrepSim(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Account Name</label>
                  <input
                    type="text"
                    value={prepAccount}
                    onChange={(e) => setPrepAccount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Merchant Name (Release SRN)</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="e.g. SM HYPERMARKET BATANGAS"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 uppercase"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1">
                  <label className="font-bold text-slate-300">Merchant Address</label>
                  <input
                    type="text"
                    value={merchantAddress}
                    onChange={(e) => setMerchantAddress(e.target.value)}
                    placeholder="e.g. GF SM CITY LIPA, BATANGAS"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 uppercase"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    <span>Log Key Injection & Release SRN to Dispatcher</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Prep Logs */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-3">Recent Staging & Key Injection Records ({posPrepLogs.length})</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="p-2">SRN</th>
                      <th className="p-2">Model</th>
                      <th className="p-2">Serial</th>
                      <th className="p-2">Account</th>
                      <th className="p-2">Prepped By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {posPrepLogs.map((l) => (
                      <tr key={l.id}>
                        <td className="p-2 font-mono text-cyan-300 font-bold">{l.srn}</td>
                        <td className="p-2 text-slate-200">{l.terminalModel}</td>
                        <td className="p-2 font-mono text-emerald-400">{l.serialNumber}</td>
                        <td className="p-2 text-slate-300">{l.accountName}</td>
                        <td className="p-2 text-slate-400">{l.preppedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. IMS WAREHOUSE VAULT VIEW */}
        {departmentType === 'ims-custodian' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Layers className="w-5 h-5" />
                  <h2 className="font-extrabold text-base text-white">IMS Warehouse Vault Movement Entry</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload CSV Dispatch Manifest</span>
                </button>
              </div>

              <form onSubmit={handleIMSSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Terminal Serial Number</label>
                  <input
                    type="text"
                    required
                    value={imsSerial}
                    onChange={(e) => setImsSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-emerald-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Model</label>
                  <select
                    value={imsModel}
                    onChange={(e) => setImsModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Pax A920 Pro">Pax A920 Pro</option>
                    <option value="Ingenico Move/5000">Ingenico Move/5000</option>
                    <option value="Verifone VX520">Verifone VX520</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Movement Type</label>
                  <select
                    value={imsMovement}
                    onChange={(e) => setImsMovement(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                  >
                    <option value="Outbound to Dispatch">Outbound to Dispatch</option>
                    <option value="Inbound">Inbound (Supplier Batch)</option>
                    <option value="Returned">Returned from Field</option>
                    <option value="Defective">Defective / Quarantine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Released / Handed To</label>
                  <input
                    type="text"
                    value={imsReleasedTo}
                    onChange={(e) => setImsReleasedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Bank Account</label>
                  <input
                    type="text"
                    value={imsAccount}
                    onChange={(e) => setImsAccount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Box className="w-4 h-4" />
                    <span>Log Inventory Transfer</span>
                  </button>
                </div>
              </form>
            </div>

            {/* IMS Movement Table */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-3">Vault Movement Logs ({imsLogs.length})</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">Serial</th>
                      <th className="p-2">Model</th>
                      <th className="p-2">Movement</th>
                      <th className="p-2">Released To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {imsLogs.map((i) => (
                      <tr key={i.id}>
                        <td className="p-2 text-slate-400">{i.timestamp}</td>
                        <td className="p-2 font-mono text-emerald-400 font-bold">{i.serialNumber}</td>
                        <td className="p-2 text-slate-200">{i.model}</td>
                        <td className="p-2 font-bold text-amber-300">{i.movementType}</td>
                        <td className="p-2 text-slate-300">{i.releasedTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CCI-ARCO MERCHANT SUPPORT VIEW */}
        {departmentType === 'cciarco-support' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 border-b border-slate-700 pb-3">
                <HelpCircle className="w-5 h-5" />
                <h2 className="font-extrabold text-base text-white">CCI-ARCO Merchant Helpdesk Portal</h2>
              </div>

              <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">SRN Number (Optional)</label>
                    <input
                      type="text"
                      value={ticketSrn}
                      onChange={(e) => setTicketSrn(e.target.value)}
                      placeholder="e.g. 2026INS0018216"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Merchant Issue / Inquiry Subject*</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Terminal paper jam / Merchant requesting schedule update"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-xl shadow flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket to Central Dispatch</span>
                </button>
              </form>
            </div>

            {/* Support Logs */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-3">Support Escalation History ({ticketLog.length})</h3>
              <div className="space-y-2 text-xs">
                {ticketLog.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-400 font-bold">{t.srn}</span>
                        <span className="text-slate-400 text-[10px]">{t.time}</span>
                      </div>
                      <p className="font-semibold text-slate-100 mt-0.5">{t.subject}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 font-bold rounded-full text-[10px]">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          uploaderName={currentUser.name}
          onImportConfirm={(importedReqs, importedIMS) => {
            if (onBatchImportCSV) {
              onBatchImportCSV(importedReqs, importedIMS);
            }
            triggerToast(`Successfully uploaded CSV! ${importedReqs.length} SRNs released directly to Dispatching.`);
          }}
        />

      </main>
    </div>
  );
};
