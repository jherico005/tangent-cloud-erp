import React, { useState, useRef } from 'react';
import { AppUser } from '../../types';
import { 
  User, 
  X, 
  Shield, 
  Camera, 
  Upload, 
  KeyRound, 
  Check, 
  Phone, 
  Mail, 
  Building2, 
  Lock, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PasswordStrengthInput } from '../common/PasswordStrengthInput';

interface UserProfileModalProps {
  currentUser: AppUser;
  onClose: () => void;
  onUpdateUser: (updatedUser: AppUser) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onClose,
  onUpdateUser
}) => {
  const isSuperAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'super-admin';

  // Editable & Readonly State
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo File Upload Attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // If changing password, check match and strength
    let finalPassword = currentUser.password;
    if (newPassword) {
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your confirm password.');
        return;
      }
      finalPassword = newPassword;
    }

    const updatedUser: AppUser = {
      ...currentUser,
      avatar,
      name: isSuperAdmin ? name : currentUser.name,
      email,
      password: finalPassword
    };

    onUpdateUser(updatedUser);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden font-sans text-xs">
        
        {/* Modal Header */}
        <div className="bg-[#1e588f] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">My Account Profile</h3>
              <p className="text-[10px] text-cyan-100 font-mono">
                {currentUser.employeeCode} • {currentUser.role.replace('-', ' ')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Profile Picture Attachment Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="font-extrabold text-slate-800 text-xs block">Profile Photo Attachment</label>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <img 
                  src={avatar} 
                  alt={currentUser.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                  className="absolute bottom-0 right-0 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md border border-white cursor-pointer transition transform hover:scale-105"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-lg shadow-2xs text-xs flex items-center space-x-1.5 cursor-pointer transition"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Attach New Picture</span>
                </button>
                <p className="text-[10px] text-slate-500">Supports JPG, PNG or WEBP (Max 5MB)</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">Or choose preset avatar:</span>
              <div className="flex items-center space-x-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                      avatar === url ? 'border-blue-600 scale-110 shadow-sm' : 'border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* READ-ONLY INFORMATION BOX FOR BASIC USERS / FIELD TECHNICIANS */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-blue-900 border-b pb-1">
              Account Information ({isSuperAdmin ? 'Editable' : 'Fixed / Read-Only'})
            </h4>

            <div className="grid grid-cols-2 gap-3">
              
              {/* Username (READ ONLY FOR BASIC USERS) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Username (Uneditable)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.username}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-600 font-mono font-bold cursor-not-allowed select-none"
                />
              </div>

              {/* Contact Number (READ ONLY FOR BASIC USERS as requested) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" />
                  <span>Contact Number (Uneditable)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.contactNumber || 'N/A'}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-600 font-mono font-bold cursor-not-allowed select-none"
                />
              </div>

              {/* Employee Code */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Employee Code</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.employeeCode}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-600 font-mono font-bold cursor-not-allowed select-none"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Role</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.role.replace('-', ' ')}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-600 font-bold capitalize cursor-not-allowed select-none"
                />
              </div>

              {/* Department */}
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-700 block">Department & Sector</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.department} (${currentUser.area || 'LUZON'} - ${currentUser.sector || 'SOUTH LUZON'})`}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-600 font-medium cursor-not-allowed select-none"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-700 block">Full Name</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 font-bold ${
                    isSuperAdmin ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-100 border border-slate-300 text-slate-600 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@tangentsolutionsinc.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600"
                />
              </div>

            </div>
          </div>

          {/* CHANGE PASSWORD SECTION WITH PICTURE 2 PASSWORD STRENGTH UI */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Change Password</span>
              </h4>
              <span className="text-[10px] text-slate-500">(Leave empty to keep current password)</span>
            </div>

            {/* Password Strength Component (Exact Picture 2 design) */}
            <PasswordStrengthInput
              value={newPassword}
              onChange={setNewPassword}
              label="New Password"
              placeholder="Enter new password..."
            />

            {newPassword.length > 0 && (
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-700 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-extrabold text-white bg-[#1e588f] hover:bg-[#16416c] rounded-xl shadow-md flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
