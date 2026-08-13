import React, { useState } from 'react';
import { ServiceRequest, AreaType, SectorType } from '../../types';
import { Plus, X, Building, MapPin, Hash, Check } from 'lucide-react';

interface NewSRNModalProps {
  onClose: () => void;
  onCreateSRN: (newRequest: Omit<ServiceRequest, 'id'>) => void;
}

export const NewSRNModal: React.FC<NewSRNModalProps> = ({ onClose, onCreateSRN }) => {
  const [merchantName, setMerchantName] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [cityMunicipality, setCityMunicipality] = useState('Lipa');
  const [province, setProvince] = useState('Batangas');
  const [area, setArea] = useState<AreaType>('LUZON');
  const [sector, setSector] = useState<SectorType>('SOUTH LUZON');
  const [requestCategory, setRequestCategory] = useState('INS');
  const [accountName, setAccountName] = useState('PNB');
  const [clientCount, setClientCount] = useState(1);
  const [projectName, setProjectName] = useState('PNB Terminal Upgrade Phase 2');
  const [requestor, setRequestor] = useState('Central Ops - PNB Unit');
  const [isMayaRequest, setIsMayaRequest] = useState(false);
  const [terminalModel, setTerminalModel] = useState('Pax A920 Pro');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || !merchantAddress) return;

    const srnNumber = `2026${requestCategory}${Math.floor(1000000 + Math.random() * 9000000)}`;
    const now = new Date();
    const releasedDate = now.toISOString().split('T')[0];
    const releasedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    onCreateSRN({
      merchantName: merchantName.toUpperCase(),
      merchantAddress: merchantAddress.toUpperCase(),
      cityMunicipality,
      province,
      area,
      sector,
      srn: srnNumber,
      requestCategory,
      accountName,
      clientCount,
      releasedDate,
      releasedTime,
      status: 'Release To Dispatcher',
      projectName,
      requestor,
      isMayaRequest,
      terminalModel
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        <div className="bg-[#1e588f] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-cyan-300" />
            <h3 className="font-bold text-base">Release New Service Request (SRN)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Merchant Name*</label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. ROBINSONS SUPERMARKET LIPA"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Merchant Address*</label>
              <input
                type="text"
                required
                value={merchantAddress}
                onChange={(e) => setMerchantAddress(e.target.value)}
                placeholder="e.g. GF ROBINSONS PLACE LIPA, BATANGAS"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">City / Municipality</label>
              <input
                type="text"
                value={cityMunicipality}
                onChange={(e) => setCityMunicipality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Province</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-xs">Request Category</label>
              <select
                value={requestCategory}
                onChange={(e) => setRequestCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 text-xs font-sans"
              >
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

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. PNB, MAYA, BDO"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Terminal Model</label>
              <select
                value={terminalModel}
                onChange={(e) => setTerminalModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              >
                <option value="Pax A920 Pro">Pax A920 Pro</option>
                <option value="Ingenico Move/5000">Ingenico Move/5000</option>
                <option value="Maya Smart POS Sunmi V2">Maya Smart POS Sunmi V2</option>
                <option value="Verifone VX520">Verifone VX520</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Client Count</label>
              <input
                type="number"
                min={1}
                value={clientCount}
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
            <input
              type="checkbox"
              id="isMayaNew"
              checked={isMayaRequest}
              onChange={(e) => setIsMayaRequest(e.target.checked)}
              className="rounded text-blue-600 w-4 h-4"
            />
            <label htmlFor="isMayaNew" className="font-bold text-slate-700">
              Flag as MAYA Integration Request
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Release to Dispatcher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
