import React, { useState } from 'react';
import { EFSRRecord } from '../../types';
import { Edit, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface EFSRCorrectionModalProps {
  record: EFSRRecord | null;
  onClose: () => void;
  onSubmitCorrection: (recordId: string, selectedReasons: string[], updatedRecord?: EFSRRecord) => void;
}

interface AccordionSection {
  id: string;
  title: string;
  items: string[];
}

const CORRECTION_SECTIONS: AccordionSection[] = [
  {
    id: 'merchant_info',
    title: 'Incorrect of missing Merchant Information',
    items: [
      'eFSR Number',
      'Merchant Name',
      'Client Code',
      'Contact Number',
      'Complete Address'
    ]
  },
  {
    id: 'service_info',
    title: 'Service Information',
    items: [
      'Service Type',
      'SRN',
      'Service Status',
      'Serviced Date'
    ]
  },
  {
    id: 'terminal_a',
    title: 'Incorrect or missing information in Terminal A',
    items: [
      'Terminal Type',
      'Peripherals',
      'Serial Number',
      'MID',
      'TID',
      'Application Version',
      'Data SIM Details',
      'Data SIM Serial Number',
      'Accessories',
      'Activities Performed'
    ]
  },
  {
    id: 'terminal_b',
    title: 'Incorrect or missing information in Terminal B',
    items: [
      'Terminal Type',
      'Peripherals',
      'Serial Number',
      'MID',
      'TID',
      'Application Version',
      'Data SIM Details',
      'Data SIM Serial Number',
      'Accessories',
      'Asset Condition Upon Pull Out',
      'Missing Items'
    ]
  },
  {
    id: 'field_tech',
    title: 'Incorrect or missing information in Field Technician',
    items: [
      'Terminal Acceptance Testing',
      "FT's Remarks",
      'Service Delivery Report',
      'FT Name',
      'Left Previous Location',
      'Arrival at Merchant',
      'Service Started',
      'Service Completed',
      'Departure from Merchant'
    ]
  }
];

export const EFSRCorrectionModal: React.FC<EFSRCorrectionModalProps> = ({
  record,
  onClose,
  onSubmitCorrection
}) => {
  if (!record) return null;

  // Accordion expanded states (open first section by default or all togglable)
  const [openAccordion, setOpenAccordion] = useState<string | null>('merchant_info');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fsrSelection, setFsrSelection] = useState<string>(`All (${record.efsrNumber} (${record.accountCode || 'JWS'}))`);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => prev === id ? null : id);
  };

  const handleCheckboxChange = (itemLabel: string) => {
    setSelectedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(i => i !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please select at least one reason for eFSR Correction.');
      return;
    }

    // Submit correction request
    onSubmitCorrection(record.id, selectedItems, {
      ...record,
      status: 'For eFSR Correction',
      correctionReasons: selectedItems,
      correctionSubmittedAt: new Date().toISOString()
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        
        {/* Teal Header */}
        <div className="bg-[#009688] text-white p-4 flex items-start justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">For eFSR Correction</h3>
              <p className="text-xs text-teal-100 font-normal">Provide details to report the SRN to TLs bucket.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-teal-100 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Submitted to TLs Bucket!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              eFSR Correction request for <strong>{record.srn}</strong> has been flagged with {selectedItems.length} item(s) selected.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
            
            {/* SRN */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">SRN</label>
              <div className="font-bold text-slate-900 text-sm">{record.srn}</div>
            </div>

            {/* FSR */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                FSR <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={fsrSelection}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-medium cursor-not-allowed"
              />
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  {record.efsrNumber} ({record.accountCode || 'JWS'})
                </span>
              </div>
            </div>

            {/* Reasons for eFSR Correction Accordion Section */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 block">
                Reasons for eFSR Correction <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2">
                {CORRECTION_SECTIONS.map((section) => {
                  const isOpen = openAccordion === section.id;
                  const selectedCount = section.items.filter(i => selectedItems.includes(i)).length;

                  return (
                    <div 
                      key={section.id}
                      className="border border-[#b2f5ea] rounded-lg overflow-hidden bg-[#e6fcf5] transition-all"
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(section.id)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-[#00796b] hover:bg-[#d7f9f1] transition-colors"
                      >
                        <span className="flex items-center space-x-2">
                          <span>{section.title}</span>
                          {selectedCount > 0 && (
                            <span className="bg-[#009688] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                              {selectedCount}
                            </span>
                          )}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#00796b]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#00796b]" />
                        )}
                      </button>

                      {/* Accordion Content */}
                      {isOpen && (
                        <div className="p-3 bg-white border-t border-[#b2f5ea] space-y-2">
                          {section.items.map((item) => {
                            const isChecked = selectedItems.includes(item);
                            return (
                              <label
                                key={item}
                                className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900 py-1 px-1 rounded hover:bg-slate-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxChange(item)}
                                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 accent-[#009688]"
                                />
                                <span>{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#009688] hover:bg-[#00796b] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                Submit
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
