import React, { useState } from 'react';
import { AppUser, UserRole } from '../../types';
import { Users, UserPlus, Search, Shield, KeyRound, CheckCircle2, XCircle, Trash2, Smartphone, Building2, User, Database, X, Check } from 'lucide-react';
import { NewEmployeeModal } from '../modals/NewEmployeeModal';
import { PasswordStrengthInput } from '../common/PasswordStrengthInput';

interface EmployeeManagementViewProps {
  users: AppUser[];
  onAddUser: (newUser: AppUser) => void;
  onUpdateUserStatus: (userId: string, status: 'Active' | 'Inactive') => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (userId: string, newPassword?: string) => void;
  onUpdateUser?: (updatedUser: AppUser) => void;
  isAzureConnected?: boolean;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  users,
  onAddUser,
  onUpdateUserStatus,
  onDeleteUser,
  onResetPassword,
  onUpdateUser,
  isAzureConnected = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<AppUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newPasswordValue) {
      if (onUpdateUser) {
        onUpdateUser({
          ...resetModalUser,
          password: newPasswordValue
        });
      } else {
        onResetPassword(resetModalUser.id, newPasswordValue);
      }
    }
    setResetModalUser(null);
    setNewPasswordValue('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRole = true;
    if (roleFilter === 'Super Admin') {
      matchesRole = user.role === 'Super Admin' || user.role === 'super-admin';
    } else if (roleFilter === 'Department Admin') {
      matchesRole = user.role === 'Department Admin' || user.role === 'department-admin';
    } else if (roleFilter === 'Department User') {
      matchesRole = user.role === 'Department User' || user.role === 'department-user';
    } else if (roleFilter === 'Field Technician') {
      matchesRole = user.role === 'Field Technician' || user.role === 'field-technician';
    } else if (roleFilter !== 'ALL') {
      matchesRole = user.role === roleFilter;
    }

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    const roleStr = String(role).toLowerCase();
    if (roleStr === 'super admin' || roleStr === 'super-admin') {
      return <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 font-bold rounded text-[10px] inline-flex items-center gap-1"><Shield className="w-3 h-3 text-purple-700" /> Super Admin</span>;
    } else if (roleStr === 'department admin' || roleStr === 'department-admin') {
      return <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 font-bold rounded text-[10px] inline-flex items-center gap-1"><Shield className="w-3 h-3 text-blue-700" /> Admin ng Department</span>;
    } else if (roleStr === 'department user' || roleStr === 'department-user') {
      return <span className="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-300 font-bold rounded text-[10px] inline-flex items-center gap-1"><Building2 className="w-3 h-3 text-teal-700" /> User ng Department</span>;
    } else if (roleStr === 'field technician' || roleStr === 'field-technician') {
      return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded text-[10px] inline-flex items-center gap-1"><Smartphone className="w-3 h-3 text-emerald-700" /> Field Technician (FT)</span>;
    } else if (roleStr === 'dispatcher') {
      return <span className="px-2 py-0.5 bg-[#1b497d]/10 text-[#1b497d] border border-[#1b497d]/30 font-bold rounded text-[10px]">Senior Dispatcher</span>;
    } else {
      return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded text-[10px]">{role}</span>;
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      
      {/* Top Header Bar */}
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-[#1b497d] rounded-md border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span>Account & User Directory</span>
              <span className="px-2 py-0.5 bg-blue-100 text-[#1b497d] font-mono text-[10px] font-bold rounded-full">
                {users.length} Accounts
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Create and manage accounts for Field Technicians (FT), Department Admins, Department Users, and Super Admins.
            </p>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-[11px]">
          <Database className={`w-3.5 h-3.5 ${isAzureConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span className="font-bold text-slate-700">Azure SQL Sync:</span>
          <span className={`font-bold ${isAzureConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isAzureConnected ? 'CONNECTED' : 'STANDBY / MOCK API'}
          </span>
        </div>
      </div>

      {/* Role Summary Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Card 1: Field Technicians */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'Field Technician' ? 'ALL' : 'Field Technician')}
          className={`p-3 rounded-md border cursor-pointer transition shadow-2xs ${
            roleFilter === 'Field Technician' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold text-[10px] uppercase text-emerald-800">Field Technicians (FT)</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {users.filter(u => u.role === 'Field Technician' || u.role === 'field-technician').length}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Mobile Field App Access</div>
        </div>

        {/* Card 2: Department Admins */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'Department Admin' ? 'ALL' : 'Department Admin')}
          className={`p-3 rounded-md border cursor-pointer transition shadow-2xs ${
            roleFilter === 'Department Admin' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold text-[10px] uppercase text-blue-800">Admin ng Department</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {users.filter(u => u.role === 'Department Admin' || u.role === 'department-admin').length}
          </div>
          <div className="text-[10px] text-blue-700 font-medium">Department Management</div>
        </div>

        {/* Card 3: Department Users */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'Department User' ? 'ALL' : 'Department User')}
          className={`p-3 rounded-md border cursor-pointer transition shadow-2xs ${
            roleFilter === 'Department User' ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'bg-white border-slate-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold text-[10px] uppercase text-teal-800">User ng Department</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {users.filter(u => u.role === 'Department User' || u.role === 'department-user').length}
          </div>
          <div className="text-[10px] text-teal-700 font-medium">Department Portal Staff</div>
        </div>

        {/* Card 4: Super Admins */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'Super Admin' ? 'ALL' : 'Super Admin')}
          className={`p-3 rounded-md border cursor-pointer transition shadow-2xs ${
            roleFilter === 'Super Admin' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold text-[10px] uppercase text-purple-800">Super Admin</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {users.filter(u => u.role === 'Super Admin' || u.role === 'super-admin').length}
          </div>
          <div className="text-[10px] text-purple-700 font-medium">Full System Controls</div>
        </div>

      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, employee code, or department..."
              className="bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 w-full"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 font-bold text-slate-700 text-xs"
          >
            <option value="ALL">All Account Roles</option>
            <option value="Field Technician">Field Technician (FT)</option>
            <option value="Department Admin">Admin ng Department</option>
            <option value="Department User">User ng Department</option>
            <option value="Super Admin">Super Admin</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 bg-[#1b497d] hover:bg-[#163c68] text-white font-bold rounded text-xs flex items-center space-x-1.5 shadow-2xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1b497d] text-white font-bold text-[10px] uppercase tracking-wider">
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Full Name & Credentials</th>
                <th className="p-2.5">Role</th>
                <th className="p-2.5">Department & Sector</th>
                <th className="p-2.5">Contact Number</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-blue-800">{u.employeeCode}</td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300 flex-shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-700">{u.username}</span>
                          <span className="text-slate-300">|</span>
                          <span>Pass: {u.password}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2.5">{getRoleBadge(u.role)}</td>
                  <td className="p-2.5">
                    <div className="font-bold text-slate-800">{u.department}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{u.area || 'LUZON'} • {u.sector || 'SOUTH LUZON'}</div>
                  </td>
                  <td className="p-2.5 font-mono text-slate-700">{u.contactNumber}</td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => onUpdateUserStatus(u.id, u.status === 'Active' ? 'Inactive' : 'Active')}
                      className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[10px] transition cursor-pointer ${
                        u.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {u.status === 'Active' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                      <span>{u.status}</span>
                    </button>
                  </td>
                  <td className="p-2.5 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResetModalUser(u);
                        setNewPasswordValue(u.password || '');
                      }}
                      title="Reset / Set Password"
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    {u.username !== 'superadmin' && u.username !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete user account "${u.name}"?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        title="Delete User Account"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No accounts found matching the selected role or search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <NewEmployeeModal
          onClose={() => setIsAddModalOpen(false)}
          onCreateUser={(newUser) => {
            onAddUser(newUser);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* Password Reset Modal Matching Picture 2 */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-600" />
                  <span>Set / Change User Password</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target: <span className="font-bold text-slate-800">{resetModalUser.name}</span> ({resetModalUser.username})
                </p>
              </div>
              <button onClick={() => setResetModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <PasswordStrengthInput
                value={newPasswordValue}
                onChange={setNewPasswordValue}
                label="New Password"
                placeholder="Enter new password..."
              />

              <div className="pt-3 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
