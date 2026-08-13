import React, { useState, useRef } from 'react';
import { ServiceRequest, IMSLogItem } from '../../types';
import { parseDispatchCSV } from '../../utils/csvParser';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirm: (importedSRNs: ServiceRequest[], importedIMSLogs: IMSLogItem[]) => void;
  uploaderName?: string;
}

const SAMPLE_CSV_PRESET = `Merchant Name,Merchant Address,City Municipality,Province,Area,Sector,SRN,Request Category,Account Name,ClientCount,CCIARCO/IMS/RC Released Date,CCIARCO/IMS/RC Released Date,SLA Remarks,Contact Person,Contact Number,Addtl Instructions,Project,CSRequester,ProjectClassification
DALI 04315,MIGUEL LEONOR ST SAN GABRIEL SAN PABLO LAGUNA,SAN PABLO,LAGUNA,LUZON,SOUTH LUZON,2026CHK0091449,CHK,PML,1,2026-08-06,05:24:21 PM,08/10/2026,JOHN PAUL D. LAYLAY,09662150178,"FOR SERVICING: REMARKS: THE MAYA TERMINAL CAN NO LONGER BE USED BECAUSE IT NO LONGER CHARGES. SN: 0821020689 TN: 27602398 MAYA ZONING: ZONE 3",,Elvin Jay Daluria,
KENNY ROGERS ROASTERS,"GROUND FLOOR, KENNY ROGERS ROASTERS AYALA MALLS SOLENAD 3, SANTA ROSA, LAGUNA",SANTA ROSA,LAGUNA,LUZON,SOUTH LUZON,2026CHK0091425,CHK,PML,1,2026-08-06,04:42:11 PM,08/10/2026,IAN RIVERA,09663495285,"FOR TERMINAL SERVICING PLEASE. SN: 0823711086 TN: 27554534 REMARKS: ONE KEEPS STOPPING ERROR ZONE 3",,Althea Reign Declines,
SUNDROPS DAY SPA,"038B-039 LGF SM CITY BACOOR, HABAY II, BACOOR, CAVITE",BACOOR,CAVITE,LUZON,SOUTH LUZON,2026CHK0091407,CHK,PML,1,2026-08-06,03:44:51 PM,08/09/2026,SHEILA,09369348358,"FOR TERMINAL SERVICING PLEASE. SN: 0821976439 TN: 27605171 ZONE 2",,Althea Reign Declines,
JOLLIBEE JB0548,INDANG TRECE RD SAN AGUSTIN T MARTIRES CAVITE,Trece MARTIRES,CAVITE,LUZON,SOUTH LUZON,2026RPL0027748,RPL,PML,1,2026-08-06,02:57:07 PM,2026-08-13,SHARON ROMEA,09566000000,"Note to FTS:27368209 Pull-out Serial: 0823594028",BATCH 1 TANGENT MAYA KITTING,Neil Paulo Redoma,
MERCURY DRUG 1049,GEN E AGUINALDO HIWAY LUKSUHIN SILANG CAVITE,SILANG,CAVITE,LUZON,SOUTH LUZON,2026CHK0091364,CHK,PML,1,2026-08-06,01:47:36 PM,08/09/2026,LORI PAE MENDOZA,09088137321,"DEVICE REPLACEMENT DUE TO NO POWER ZONING: ZONE 3",,Diana Rose Mora,`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportConfirm,
  uploaderName = 'IMS Custodian'
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedData, setParsedData] = useState<{
    requests: ServiceRequest[];
    imsLogs: IMSLogItem[];
    invalidRows: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
        processCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const processCSV = (text: string) => {
    const result = parseDispatchCSV(text, uploaderName);
    setParsedData({
      requests: result.serviceRequests,
      imsLogs: result.imsLogs,
      invalidRows: result.invalidRowsCount
    });
  };

  const handleLoadSample = () => {
    setFileName('sample_dispatch_manifest_2026.csv');
    setCsvContent(SAMPLE_CSV_PRESET);
    processCSV(SAMPLE_CSV_PRESET);
  };

  const handleConfirmImport = () => {
    if (parsedData && parsedData.requests.length > 0) {
      onImportConfirm(parsedData.requests, parsedData.imsLogs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1e588f] px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-700 rounded-lg text-cyan-200">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">Import CSV Dispatch Manifest to Dispatching Queue</h3>
              <p className="text-[11px] text-cyan-100">Upload batch SRN records from IMS / CCI-ARCO for immediate dispatch release</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Preset / Upload Input Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* File Drag & Drop Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 p-5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition space-y-2 group"
            >
              <FileSpreadsheet className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-slate-800 text-xs block">Click to Browse CSV File</span>
                <span className="text-[10px] text-slate-500">Supports .csv manifest files with SRNs, Merchants & Addresses</span>
              </div>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".csv,text/csv" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>

            {/* Quick Sample CSV Loader */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Test Sample Dispatch Manifest</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Load pre-configured Tangent South Luzon CSV sample records (DALI, Kenny Rogers, Sundrops, Jollibee, etc.) directly into the parser.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadSample}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-300" />
                <span>Load Sample CSV Data</span>
              </button>
            </div>

          </div>

          {/* Raw CSV Textarea Input Option */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 text-xs">Or Paste Raw CSV Data Directly:</label>
              {fileName && <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">File: {fileName}</span>}
            </div>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                processCSV(e.target.value);
              }}
              placeholder="Paste Merchant Name, Merchant Address, City Municipality, Province, Area, Sector, SRN, Request Category, Account Name..."
              className="w-full font-mono text-[11px] p-2.5 bg-slate-900 text-cyan-300 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parsed Preview Table */}
          {parsedData && (
            <div className="space-y-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-slate-900">CSV Manifest Validated</span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold rounded-full text-[10px]">
                    {parsedData.requests.length} Valid SRNs Ready
                  </span>
                </div>
                {parsedData.invalidRows > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{parsedData.invalidRows} empty/invalid lines skipped</span>
                  </span>
                )}
              </div>

              {/* Preview List */}
              <div className="max-h-48 overflow-y-auto border border-emerald-200 rounded-lg bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2">SRN</th>
                      <th className="p-2">Merchant Name</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedData.requests.map((r, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        <td className="p-2 font-mono font-bold text-blue-700">{r.srn}</td>
                        <td className="p-2 font-bold text-slate-900">{r.merchantName}</td>
                        <td className="p-2 text-slate-600">{r.cityMunicipality}, {r.province}</td>
                        <td className="p-2 font-semibold text-slate-800">{r.requestCategory}</td>
                        <td className="p-2 font-mono text-emerald-700 font-bold">{r.accountName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!parsedData || parsedData.requests.length === 0}
            className={`px-5 py-2 font-bold rounded-lg text-white shadow-md flex items-center space-x-2 transition cursor-pointer ${
              parsedData && parsedData.requests.length > 0 
                ? 'bg-emerald-600 hover:bg-emerald-500' 
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Import & Release {parsedData ? parsedData.requests.length : 0} SRNs to Dispatching</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
