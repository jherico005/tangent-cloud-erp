import React, { useState, useEffect } from 'react';
import { AppUser } from '../../types';
import { TangentLoadingScreen, TangentLogoSVG } from '../common/TangentLoadingScreen';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Server, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Zap,
  Globe,
  Radio,
  Fingerprint,
  Sun,
  Moon,
  UserPlus,
  Building,
  Phone,
  Mail
} from 'lucide-react';

interface LoginViewProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const DYNAMIC_PHRASES = [
  "Innovating the future with cutting-edge technology.",
  "Unified Cloud & Mobile Management System.",
  "Real-time telemetry and field service dispatching.",
  "Your trusted partner in digital transformation.",
  "Seamless POS prep staging & digital eFSR signatures.",
  "Providing top-notch IT solutions for enterprise."
];

export const LoginView: React.FC<LoginViewProps> = ({ 
  users, 
  onLoginSuccess,
  isDarkMode: propIsDarkMode,
  onToggleTheme: propOnToggleTheme
}) => {
  // State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('jcpantaleon');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [presetSearch, setPresetSearch] = useState('');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<string>('field-technician');
  const [regDepartment, setRegDepartment] = useState('Field Engineering');
  const [regContact, setRegContact] = useState('09170000000');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Theme State persisted across Login & Logout
  const [localIsDarkMode, setLocalIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tangent_theme_mode');
    return saved ? saved === 'dark' : true;
  });

  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : localIsDarkMode;

  const handleToggleTheme = () => {
    if (propOnToggleTheme) {
      propOnToggleTheme();
    } else {
      setLocalIsDarkMode(prev => !prev);
    }
  };

  useEffect(() => {
    localStorage.setItem('tangent_theme_mode', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Dynamic Changing Word/Tagline State
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading Screen State
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authStepMessage, setAuthStepMessage] = useState('');

  // Typewriter / Changing Word Effect Logic
  useEffect(() => {
    const currentPhrase = DYNAMIC_PHRASES[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayedText !== currentPhrase) {
      timer = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
      }, 40);
    } else if (!isDeleting && displayedText === currentPhrase) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
    } else if (isDeleting && displayedText !== '') {
      timer = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length - 1));
      }, 20);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % DYNAMIC_PHRASES.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, phraseIndex]);

  // Handle Login Sequence with Satellite Orbit Loading Screen
  const triggerAuthSequence = (targetUser: AppUser) => {
    setIsAuthenticating(true);
    setAuthProgress(15);
    setAuthStepMessage(`Authenticating ${targetUser.name} (${targetUser.role.toUpperCase()})...`);

    setTimeout(() => {
      setAuthProgress(50);
      setAuthStepMessage('Establishing Azure Cloud Session & Telemetry...');
    }, 250);

    setTimeout(() => {
      setAuthProgress(85);
      setAuthStepMessage('Verifying Credentials & Syncing Telemetry...');
    }, 500);

    setTimeout(() => {
      setAuthProgress(100);
      setAuthStepMessage('Access Granted! Launching Workspace...');
    }, 750);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(targetUser);
    }, 1100);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Try Supabase Realtime Database Login first
    const spResult = await supabaseAuthService.loginUser(username, password);
    if (spResult.success && spResult.user) {
      if (spResult.user.status === 'Inactive') {
        setErrorMsg('This account is currently marked as INACTIVE. Please contact system admin.');
        return;
      }
      triggerAuthSequence(spResult.user);
      return;
    }

    // 2. Fall back to local users list (e.g., admin / jcpantaleon or preset users)
    const targetUser = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (targetUser) {
      if (targetUser.status === 'Inactive') {
        setErrorMsg('This account is currently marked as INACTIVE. Please contact system admin.');
        return;
      }
      triggerAuthSequence(targetUser);
    } else {
      setErrorMsg(spResult.error || 'Invalid Username or Password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsername.trim() || !regPassword || !regName.trim()) {
      setErrorMsg('Please complete all required fields (Name, Username, Password).');
      return;
    }

    setIsRegistering(true);
    const result = await supabaseAuthService.registerUser({
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim() || `${regUsername.trim().toLowerCase()}@tangentsolutionsinc.com`,
      password: regPassword,
      role: regRole as any,
      department: regDepartment,
      contactNumber: regContact
    });

    setIsRegistering(false);

    if (result.success && result.user) {
      setSuccessMsg(`Account successfully registered in Supabase Database! Logging in as ${result.user.name}...`);
      setTimeout(() => {
        triggerAuthSequence(result.user!);
      }, 1000);
    } else {
      setErrorMsg(result.error || 'Failed to register account in Supabase Database.');
    }
  };

  const handleQuickLogin = (demoUser: AppUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setErrorMsg('');
    triggerAuthSequence(demoUser);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans antialiased select-none transition-colors duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Eye-Safe Ambient Glow Orbs */}
      {isDarkMode ? (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </>
      )}

      {/* Top Bar Cloud Status & Theme Toggle Switch */}
      <div className={`p-4 border-b flex justify-between items-center max-w-7xl mx-auto w-full text-xs relative z-10 ${
        isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="font-semibold">Tangent Cloud Infrastructure (AWS / Azure Connected)</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline-flex items-center">
            <Server className={`w-3.5 h-3.5 mr-1 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} /> Web & Mobile Server API v3.8
          </span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>System Operational</span>
          </span>

          {/* Theme Mode Toggle Button */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px]">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Login Content Card */}
      <div className="flex-1 flex items-center justify-center p-4 my-6 relative z-10">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 max-w-5xl w-full border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl relative group transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-slate-900/90 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          
          {/* Top Edge Glowing Beam Effect */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80"></div>

          {/* Left Hero Branding Section */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1b497d] via-[#163a63] to-[#0f2845] p-8 text-white flex flex-col justify-between relative overflow-hidden border-r border-blue-900/40">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
            <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              {/* Logo & Header */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 p-1">
                  <TangentLogoSVG size={40} className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
                    TANGENT
                    <Zap className="w-4 h-4 text-cyan-300 fill-cyan-300 animate-bounce" />
                  </h1>
                  <p className="text-[10px] text-cyan-200 tracking-widest uppercase font-bold">Field Service Cloud Platform</p>
                </div>
              </div>

              {/* DYNAMIC CHANGING WORD / TAGLINE EFFECT SECTION */}
              <div className="space-y-3 pt-3">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Dynamic Platform Tagline</span>
                </div>

                {/* Animated Typewriter Tagline Box */}
                <div className="min-h-[70px] flex items-center">
                  <h2 className="text-xl font-extrabold leading-snug tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                    "{displayedText}"
                    <span className="inline-block w-2 h-5 ml-1 bg-cyan-300 animate-pulse align-middle"></span>
                  </h2>
                </div>

                <p className="text-xs text-blue-100/80 leading-relaxed font-normal border-t border-white/10 pt-3">
                  Real-time dispatching, field technician iOS & Android portal, POS prep staging, eFSR viewer, and multi-department telemetry.
                </p>
              </div>

              {/* Key Features Bullet List */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center space-x-2 text-cyan-100 group/item">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                  <span className="font-semibold">Real-time Field Tech Mobile Portal Sync</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-100 group/item">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                  <span className="font-semibold">Role-Based Dashboards (Super Admin & Departments)</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-100 group/item">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                  <span className="font-semibold">Digital eFSR Canvas Signature & Image Proof</span>
                </div>
              </div>
            </div>

            {/* Left Footer Credentials Note */}
            <div className="pt-6 border-t border-white/15 relative z-10 text-[11px] text-blue-200 flex items-center justify-between">
              <span className="flex items-center gap-1 font-bold">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-300" />
                <span>Default Credentials:</span>
              </span>
              <span className="bg-white/15 px-2.5 py-1 rounded-md text-cyan-200 font-bold border border-white/20 shadow-xs">
                admin / jcpantaleon
              </span>
            </div>
          </div>

          {/* Right Login Form & Preset Accounts */}
          <div className={`lg:col-span-7 p-8 flex flex-col justify-between space-y-6 relative transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-900/95' : 'bg-slate-50/90'
          }`}>
            {/* SATELLITE ORBIT LOADING SCREEN OVERLAY ON LOGIN */}
            {isAuthenticating && (
              <TangentLoadingScreen
                progress={authProgress}
                statusMessage={authStepMessage}
                fullscreen={true}
                transparent={true}
                isDarkMode={isDarkMode}
              />
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl font-extrabold flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    <ShieldCheck className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-700'}`} />
                    <span>System Authentication</span>
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Connected to Supabase Realtime Database & Auth.
                  </p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs ${
                  isDarkMode 
                    ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <Globe className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Supabase Sync Active</span>
                </span>
              </div>

              {/* AUTH MODE TOGGLE TABS */}
              <div className="flex rounded-xl p-1 mb-4 bg-slate-800/40 border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    authMode === 'register'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register New Account</span>
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-950/90 border border-red-700/80 rounded-xl text-red-200 text-xs flex items-center space-x-2 animate-shake shadow-md">
                  <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                  <span className="font-bold">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-emerald-200 text-xs flex items-center space-x-2 shadow-md">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}

              {authMode === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className={`font-bold block tracking-wide ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Username / Account ID
                    </label>
                    <div className="relative group/input">
                      <User className={`w-4 h-4 absolute left-3 top-3 transition-colors ${
                        isDarkMode 
                          ? 'text-slate-500 group-focus-within/input:text-cyan-400' 
                          : 'text-slate-400 group-focus-within/input:text-blue-600'
                      }`} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin"
                        className={`w-full border rounded-xl pl-9 pr-3 py-2.5 font-semibold transition-all focus:outline-none focus:ring-2 ${
                          isDarkMode 
                            ? 'bg-slate-950/90 border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-cyan-500/30' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`font-bold block tracking-wide ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Password
                    </label>
                    <div className="relative group/input">
                      <Lock className={`w-4 h-4 absolute left-3 top-3 transition-colors ${
                        isDarkMode 
                          ? 'text-slate-500 group-focus-within/input:text-cyan-400' 
                          : 'text-slate-400 group-focus-within/input:text-blue-600'
                      }`} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full border rounded-xl pl-9 pr-3 py-2.5 font-semibold transition-all focus:outline-none focus:ring-2 ${
                          isDarkMode 
                            ? 'bg-slate-950/90 border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-cyan-500/30' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`flex items-center justify-between text-xs pt-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <label className="flex items-center space-x-2 cursor-pointer group/check">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={`rounded cursor-pointer ${
                          isDarkMode ? 'border-slate-700 bg-slate-950 text-cyan-500' : 'border-slate-300 text-blue-600'
                        }`}
                      />
                      <span className="font-semibold">Remember session</span>
                    </label>
                    <span className={`cursor-pointer transition-colors font-semibold ${
                      isDarkMode ? 'hover:text-cyan-400 text-slate-400' : 'hover:text-blue-700 text-slate-500'
                    }`}>
                      Supabase Cloud DB Active
                    </span>
                  </div>

                  <button
                    type="submit"
                    className={`w-full font-extrabold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer active:scale-[0.98] relative overflow-hidden group/btn ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-[#1b497d] via-[#215a99] to-[#1b497d] hover:from-[#215a99] hover:to-[#215a99] text-white border border-blue-400/30' 
                        : 'bg-[#1b497d] hover:bg-[#163a63] text-white border border-blue-800/40'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-sweep"></div>
                    <span>Log In via Supabase Cloud</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-cyan-200" />
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM BOUND TO SUPABASE */
                <form onSubmit={handleRegister} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-slate-300">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Juan De La Cruz"
                        className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-300">Username *</label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="e.g. juan_delacruz"
                        className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="juan@tangentsolutionsinc.com"
                        className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-300">Password *</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-slate-300">Role</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="field-technician">Field Technician</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="department-user">Department User</option>
                        <option value="department-admin">Department Admin</option>
                        <option value="super-admin">Super Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-300">Department</label>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="Field Engineering"
                        className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-300">Mobile / Contact Number</label>
                    <input
                      type="text"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      placeholder="09170000000"
                      className="w-full border rounded-xl px-3 py-2 bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full mt-2 font-extrabold py-3 px-4 rounded-xl shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border border-emerald-400/30"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isRegistering ? 'Registering in Supabase...' : 'Register Account in Supabase'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Quick Demo Preset Accounts Switcher */}
            <div className={`pt-4 border-t space-y-2.5 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-extrabold flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>1-Click Account Selector for Testing</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  {users.length} Auto-Registered Users
                </span>
              </div>

              {/* Category Filter & Search Box */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="🔍 Search name, channel (e.g., GCash, Maya, JFC, Petron, BPI)..."
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] max-h-52 overflow-y-auto pr-1">
                {users.filter(u => {
                  if (!presetSearch) return u.accountChannelId || ['user-001','user-002','user-007'].includes(u.id);
                  const q = presetSearch.toLowerCase();
                  return (
                    u.name.toLowerCase().includes(q) ||
                    u.username.toLowerCase().includes(q) ||
                    u.department.toLowerCase().includes(q) ||
                    (u.accountChannelId && u.accountChannelId.toLowerCase().includes(q))
                  );
                }).slice(0, 18).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className={`p-2 border rounded-xl text-left transition-all duration-200 group cursor-pointer hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 ${
                      isDarkMode 
                        ? 'bg-slate-950/90 hover:bg-slate-800/90 border-slate-800 hover:border-cyan-500/50' 
                        : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className={`font-extrabold truncate flex items-center justify-between text-[11px] ${
                      isDarkMode ? 'text-slate-200 group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-blue-700'
                    }`}>
                      <span className="truncate">{u.name}</span>
                      <ArrowRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 ${
                        isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5 font-semibold flex items-center gap-1">
                      {u.accountChannelId ? (
                        <span className="bg-sky-900/80 text-sky-200 px-1 rounded text-[8px]">
                          {u.accountChannelId.replace('CHANNEL_', '')}
                        </span>
                      ) : null}
                      <span className="truncate">{u.department || u.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 text-center text-xs border-t relative z-10 font-bold ${
        isDarkMode ? 'border-slate-800/60 text-slate-500' : 'border-slate-200 text-slate-600'
      }`}>
        &copy; 2026 Tangent Merchant Services & Field Systems Inc. All rights reserved. Cloud Database Version 4.2
      </div>
    </div>
  );
};


