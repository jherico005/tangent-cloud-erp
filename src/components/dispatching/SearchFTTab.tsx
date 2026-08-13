import React, { useState } from 'react';
import { FieldTechnician } from '../../types';
import { Search, UserCheck, Phone, MapPin, Truck, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface SearchFTTabProps {
  fieldTechnicians: FieldTechnician[];
}

export const SearchFTTab: React.FC<SearchFTTabProps> = ({ fieldTechnicians }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  const filteredFTs = fieldTechnicians.filter(ft => {
    if (sectorFilter !== 'ALL' && ft.sector !== sectorFilter) return false;
    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase();
      const searchable = `${ft.name} ${ft.employeeCode} ${ft.area} ${ft.sector} ${ft.vehicle} ${ft.contactNumber}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search Header */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-sm">Field Technician Directory</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full text-xs">
            {fieldTechnicians.length} Registered Technicians
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none"
          >
            <option value="ALL">All Sectors</option>
            <option value="SOUTH LUZON">SOUTH LUZON</option>
            <option value="NORTH LUZON">NORTH LUZON</option>
            <option value="NCR">NCR</option>
            <option value="VISAYAS">VISAYAS</option>
            <option value="MINDANAO">MINDANAO</option>
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FT name, code..."
              className="bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1.5 text-slate-800 focus:outline-none w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Technicians Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFTs.map((ft) => (
          <div key={ft.id} className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{ft.name}</h4>
                <span className="font-mono text-blue-700 text-xs font-semibold">{ft.employeeCode}</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                ft.status === 'Available'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : ft.status === 'On Delivery'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {ft.status}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Area & Sector:</span>
                <strong className="text-slate-800">{ft.area} • {ft.sector}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vehicle / Transport:</span>
                <span className="font-medium">{ft.vehicle}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono font-bold text-blue-700">{ft.contactNumber}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="bg-blue-50 p-2 rounded border border-blue-100">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Jobs</span>
                <span className="font-extrabold text-blue-900 text-base">{ft.activeDispatches}</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Completed Today</span>
                <span className="font-extrabold text-emerald-900 text-base">{ft.completedToday}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
