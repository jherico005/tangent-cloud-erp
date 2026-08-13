import React, { useState, useRef } from 'react';
import { AppUser, UserRole, AreaType, SectorType } from '../../types';
import { UserPlus, X, Shield, Building, Phone, Mail, User, Lock, Check, Camera, Upload } from 'lucide-react';
import { PasswordStrengthInput } from '../common/PasswordStrengthInput';

interface NewEmployeeModalProps {
  onClose: () => void;
  onCreateUser: (newUser: AppUser) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({ onClose, onCreateUser }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('Tangent@123');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Field Technician');
  const [employeeCode, setEmployeeCode] = useState(`FT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [department, setDepartment] = useState('Field Operations');
  const [area, setArea] = useState<AreaType>('LUZON');
  const [sector, setSector] = useState<SectorType>('SOUTH LUZON');
  const [contactNumber, setContactNumber] = useState('09171234567');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Field Technician' || selectedRole === 'field-technician') {
      setEmployeeCode(`FT-2026-${Math.floor(100 + Math.random() * 900)}`);
      setDepartment('Field Operations');
    } else if (selectedRole === 'Department Admin' || selectedRole === 'department-admin') {
      setEmployeeCode(`DA-2026-${Math.floor(100 + Math.random() * 900)}`);
      setDepartment('Department Administration');
    } else if (selectedRole === 'Department User' || selectedRole === 'department-user') {
      setEmployeeCode(`DU-2026-${Math.floor(100 + Math.random() * 900)}`);
      setDepartment('Operations Support');
    } else if (selectedRole === 'Super Admin' || selectedRole === 'super-admin') {
      setEmployeeCode(`SA-2026-${Math.floor(100 + Math.random() * 900)}`);
      setDepartment('Executive Management');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      password,
      name,
      email: email || `${username.trim().toLowerCase()}@tangentsolutionsinc.com`,
      role,
      employeeCode,
      department,
      area,
      sector,
      contactNumber,
      avatar,
      status: 'Active',
      assignedFTId: (role === 'Field Technician' || role === 'field-technician') ? `FT-${Math.floor(200 + Math.random() * 800)}` : undefined
    };

    onCreateUser(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="bg-[#1b497d] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-cyan-300" />
            <div>
              <h3 className="font-bold text-base">Create Account / Register New Employee</h3>
              <p className="text-[10px] text-cyan-100">Synchronized with Microsoft Azure SQL Database</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-200 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
          
          {/* Account Role Selector Quick Cards */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">Select Account Role*</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('Field Technician')}
                className={`p-2.5 rounded-lg border text-left transition flex items-start space-x-2 cursor-pointer ${
                  role === 'Field Technician' || role === 'field-technician'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-1 bg-emerald-200 text-emerald-900 rounded mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Field Technician (FT)</div>
                  <div className="text-[10px] font-normal text-slate-500">Mobile app servicing & dispatch</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('Department Admin')}
                className={`p-2.5 rounded-lg border text-left transition flex items-start space-x-2 cursor-pointer ${
                  role === 'Department Admin' || role === 'department-admin'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-1 bg-blue-200 text-blue-900 rounded mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Admin ng Department</div>
                  <div className="text-[10px] font-normal text-slate-500">Department administrative manager</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('Department User')}
                className={`p-2.5 rounded-lg border text-left transition flex items-start space-x-2 cursor-pointer ${
                  role === 'Department User' || role === 'department-user'
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-600'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-1 bg-teal-200 text-teal-900 rounded mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">User ng Department</div>
                  <div className="text-[10px] font-normal text-slate-500">Standard department portal staff</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('Super Admin')}
                className={`p-2.5 rounded-lg border text-left transition flex items-start space-x-2 cursor-pointer ${
                  role === 'Super Admin' || role === 'super-admin'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-600'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-1 bg-purple-200 text-purple-900 rounded mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Super Admin</div>
                  <div className="text-[10px] font-normal text-slate-500">Full platform system administrator</div>
                </div>
              </button>
            </div>
          </div>

          {/* Profile Photo Attachment Selector */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <label className="font-bold text-slate-800 text-[11px] block">Attach Profile Picture / Photo</label>
            <div className="flex items-center space-x-3">
              <img src={avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-xs" />
              
              <div className="space-y-1">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 font-bold rounded text-[11px] text-slate-700 flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Photo File</span>
                </button>
                <div className="text-[10px] text-slate-500">Or pick preset avatar:</div>
              </div>

              <div className="flex items-center space-x-1.5 ml-auto">
                {DEFAULT_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-6 h-6 rounded-full overflow-hidden border transition cursor-pointer ${avatar === url ? 'ring-2 ring-blue-600 scale-105' : 'opacity-60'}`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Full Name*</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stephen Matubis Magat"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Login Username*</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ft_stephen"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Employee Code</label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Department Name</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="0917xxxxxxx"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as AreaType)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
              >
                <option value="LUZON">LUZON</option>
                <option value="NCR">NCR</option>
                <option value="VISAYAS">VISAYAS</option>
                <option value="MINDANAO">MINDANAO</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorType)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
              >
                <option value="SOUTH LUZON">SOUTH LUZON</option>
                <option value="NORTH LUZON">NORTH LUZON</option>
                <option value="CENTRAL LUZON">CENTRAL LUZON</option>
                <option value="NCR">NCR</option>
                <option value="VISAYAS">VISAYAS</option>
                <option value="MINDANAO">MINDANAO</option>
              </select>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@tangentsolutionsinc.com"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
              />
            </div>
          </div>

          {/* Password Section - Exact Picture 2 UI */}
          <div className="pt-2 border-t border-slate-200">
            <PasswordStrengthInput
              value={password}
              onChange={setPassword}
              label="Account Password"
              placeholder="Set password..."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-bold text-slate-600 hover:text-slate-800 rounded transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-[#1b497d] hover:bg-[#163c68] rounded shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Create Account in Azure SQL</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

