import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const PasswordStrengthInput: React.FC<PasswordStrengthInputProps> = ({
  value,
  onChange,
  label = "Password",
  placeholder = "••••••••",
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules
  const hasMinLen = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  // Calculate score
  const passedCount = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'text-rose-500';
  let barColor = 'bg-rose-500';

  if (passedCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'text-emerald-500';
    barColor = 'bg-emerald-500';
  } else if (passedCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'text-amber-500';
    barColor = 'bg-amber-500';
  } else if (value.length > 0) {
    strengthLabel = 'Weak';
    strengthColor = 'text-orange-500';
    barColor = 'bg-orange-500';
  }

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {/* Floating Outline Box matching Picture 2 */}
      <div className="relative pt-2">
        {/* Border container with floating pill label */}
        <div className="relative border-2 border-emerald-500/80 rounded-2xl p-3.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
          
          {/* Green Floating Pill Label on top border */}
          <span className="absolute -top-3 left-5 px-2 bg-white text-emerald-600 font-bold text-xs tracking-tight z-10 flex items-center gap-1">
            {label}
          </span>

          <div className="flex items-center justify-between">
            <input
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-slate-900 font-mono text-base tracking-widest focus:outline-none border-none p-0 pr-8"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
              className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer flex-shrink-0"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-slate-500" />
              ) : (
                <Eye className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Password Strength Indicator Header */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Password Strength</span>
          <span className={`font-bold ${strengthColor}`}>{strengthLabel}</span>
        </div>

        {/* Strength Progress Line */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300 rounded-full`}
            style={{ width: `${(passedCount / 5) * 100}%` }}
          ></div>
        </div>

        {/* Checklist row matching Picture 2 */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-semibold text-slate-600">
          <div className={`flex items-center space-x-1 ${hasMinLen ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasMinLen ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
            <span>8 Chars</span>
          </div>

          <div className={`flex items-center space-x-1 ${hasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
            <span>A-Z</span>
          </div>

          <div className={`flex items-center space-x-1 ${hasLower ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasLower ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
            <span>a-z</span>
          </div>

          <div className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
            <span>123</span>
          </div>

          <div className={`flex items-center space-x-1 ${hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
            <span>@#$</span>
          </div>
        </div>
      </div>
    </div>
  );
};
