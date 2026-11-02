import React, { useState, useEffect } from 'react';
import { ZoneAccount, UserRole } from '../types';
import { verifyCredentials } from '../utils/authCredentials';
import { Lock, User, Key, X, AlertCircle, ShieldCheck, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, zoneAccount: ZoneAccount | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Clear fields on close
  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Lockout countdown timer for brute force defense
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg(null);

    const result = verifyCredentials(username, password);

    if (result.success && result.role) {
      setFailedAttempts(0);
      onLoginSuccess(result.role, result.zone || null);
      onClose();
      return;
    }

    // Handle failure
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= 5) {
      setLockoutRemaining(30);
      setErrorMsg('ተደጋጋሚ የተሳሳተ ሙከራ ተገኝቷል። ለደህንነት ሲባል መግቢያው ለ30 ሰከንዶች ታግዷል።');
    } else {
      setErrorMsg(result.error || 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል አስገብተዋል። እባክዎ እንደገና ይሞክሩ።');
    }
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="ዝጋ"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ደህንነቱ የተጠበቀ መግቢያ</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">የዞን ወይም የክልል አስተዳዳሪ መለያ</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ይህ መግቢያ የተፈቀደላቸው የ10ሩ ዞኖች አስተባባሪዎች እና የክልሉ ማዕከላዊ አስተዳዳሪዎች ብቻ ወርሃዊ የሪፖርት ዳታዎችን ለመላክና ለማስተዳደር የሚጠቀሙበት ነው።
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900">
            {isLocked ? (
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{errorMsg}</p>
              {isLocked && (
                <p className="text-[11px] text-red-700 mt-1 font-mono">
                  የመጠባበቂያ ጊዜ፡ {lockoutRemaining} ሰከንዶች...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              የተጠቃሚ ስም (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                disabled={isLocked}
                placeholder="የተጠቃሚ ስምዎን ያስገቡ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/80 pl-9 pr-3 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors shadow-2xs disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              የይለፍ ቃል (Password)
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={isLocked}
                placeholder="የይለፍ ቃልዎን ያስገቡ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/80 pl-9 pr-10 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors shadow-2xs disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5"
                title={showPassword ? 'የይለፍ ቃል ደብቅ' : 'የይለፍ ቃል አሳይ'}
                aria-label={showPassword ? 'የይለፍ ቃል ደብቅ' : 'የይለፍ ቃል አሳይ'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white py-2.5 text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4" />
            <span>{isLocked ? `እባክዎ ይጠብቁ (${lockoutRemaining}s)` : 'ወደ መቆጣጠሪያው ግባ (Secure Sign In)'}</span>
          </button>
        </form>

        {/* Security Notice for Production */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            ይህ ይፋዊ የመንግሥት ፖርታል ነው። ያልተፈቀደ የመግባት ሙከራ የተከለከለ ሲሆን ሁሉም የመግቢያ እንቅስቃሴዎች በደህንነት ኦዲት መዝገብ ላይ ይመዘገባሉ።
          </span>
        </div>
      </div>
    </div>
  );
};
