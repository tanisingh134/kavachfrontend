import React, { useState } from 'react';
import { 
  Shield, Key, Lock, User, Phone, ArrowRight, Sparkles, 
  CheckCircle2, Eye, EyeOff, ShieldCheck, Mail
} from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';
import { translations } from '../services/translations';

const BACKEND_URL = 'http://localhost:5000';

export default function AuthModal({ onLoginSuccess, isOpen, onClose, language = 'en' }) {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const t = translations[language] || translations.en;
  const isHi = language === 'hi';

  if (!isOpen) return null;

  const handleEnterKavach = async (e) => {
    e.preventDefault();
    playHapticTone('subtle');
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'Login failed.' });
        return;
      }
      playHapticTone('success');
      setStatusMessage({
        type: 'success',
        text: isHi ? 'पहचान सत्यापित। MongoDB से लोड हो रहा है...' : 'Identity verified. Loaded from MongoDB...'
      });
      localStorage.setItem('kavach_user', JSON.stringify(data.user));
      setTimeout(() => onLoginSuccess(data.user), 400);
    } catch (err) {
      setStatusMessage({ type: 'error', text: isHi ? 'बैकएंड/MongoDB से कनेक्ट नहीं हो सका।' : 'Could not reach backend / MongoDB.' });
    }
  };

  const handleInitializeKavach = async (e) => {
    e.preventDefault();
    playHapticTone('success');
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: identifier, phone, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'Registration failed.' });
        return;
      }
      setStatusMessage({
        type: 'success',
        text: isHi ? 'खाता MongoDB में सेव हो गया!' : 'Profile saved to MongoDB.'
      });
      localStorage.setItem('kavach_user', JSON.stringify(data.user));
      setTimeout(() => onLoginSuccess(data.user), 500);
      return;
    } catch (err) {
      console.warn('Register fallback:', err);
      setStatusMessage({ type: 'error', text: isHi ? 'बैकएंड/MongoDB से कनेक्ट नहीं हो सका।' : 'Could not reach backend / MongoDB.' });
    }
  };

  const handleRecoverKey = async (e) => {
    e.preventDefault();
    playHapticTone('subtle');
    setIsSendingOtp(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail || identifier })
      });
      const data = await response.json();
      setIsSendingOtp(false);

      if (data.success && data.emailSent) {
        setForgotStep('otp');
        setStatusMessage({ 
          type: 'success', 
          text: isHi
            ? `6-अंक OTP ${recoveryEmail || identifier} पर भेज दिया गया है। ईमेल चेक करें।`
            : `A 6-digit OTP was emailed to ${recoveryEmail || identifier}. Check inbox and spam.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || data.error || (isHi
            ? 'OTP ईमेल नहीं भेजा जा सका। बैकएंड चालू रखें।'
            : 'OTP email failed. Keep the backend running on port 5000.')
        });
      }
    } catch (err) {
      setIsSendingOtp(false);
      setStatusMessage({ 
        type: 'error', 
        text: isHi
          ? 'बैकएंड से कनेक्ट नहीं हो सका। पोर्ट 5000 पर सर्वर चालू करें।'
          : 'Could not reach the backend. Start the server on port 5000.'
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    playHapticTone('subtle');
    setIsVerifyingOtp(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail || identifier,
          otp: otpCode,
          newPassword
        })
      });
      const data = await response.json();
      setIsVerifyingOtp(false);
      if (!response.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'OTP verification failed.' });
        return;
      }
      localStorage.setItem('kavach_user', JSON.stringify(data.user));
      setStatusMessage({
        type: 'success',
        text: isHi ? 'पासकोड रीसेट हो गया। कवच में प्रवेश...' : 'Passcode reset. Entering Kavach...'
      });
      setTimeout(() => onLoginSuccess(data.user), 600);
    } catch (err) {
      setIsVerifyingOtp(false);
      setStatusMessage({ type: 'error', text: 'Could not verify OTP. Is the backend running?' });
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-[#12061c]/90 backdrop-blur-xl flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="glass-panel-glow max-w-md w-full rounded-3xl p-6 sm:p-7 border border-yellow-500/35 shadow-2xl relative flex flex-col gap-5 overflow-hidden my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-safety-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-violet-600/30 border border-yellow-400/50 flex items-center justify-center shadow-lg shadow-violet-950/40">
              <Shield className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 tracking-wide flex items-center gap-2">
                {t.appTitle}
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  v2.4 Live
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {isHi ? 'स्वायत्त सुरक्षा प्रमाणीकरण' : 'Autonomous Security Gateway'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-safety-border/70 text-xs font-bold">
          <button
            onClick={() => { setAuthMode('login'); setStatusMessage(null); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'login' 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t.authEnterTitle}</span>
          </button>

          <button
            onClick={() => { setAuthMode('register'); setStatusMessage(null); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'register' 
                ? 'bg-gradient-to-r from-violet-700 to-fuchsia-800 text-white shadow-md font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.authInitTitle}</span>
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            statusMessage.type === 'success' ? 'bg-yellow-950/60 text-yellow-200 border-yellow-500/50' :
            statusMessage.type === 'error' ? 'bg-rose-950/60 text-rose-200 border-rose-500/50' :
            'bg-violet-950/60 text-violet-200 border-violet-500/50'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {authMode === 'login' && (
          <form onSubmit={handleEnterKavach} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                <User className="w-3 h-3 text-yellow-400" /> {t.authGuardianId}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your.email@gmail.com or phone"
                className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 outline-none font-medium transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-yellow-400" /> {t.authPasscode}
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setForgotStep('email'); setStatusMessage(null); }}
                  className="text-[10px] text-yellow-400 hover:text-yellow-300 underline font-semibold"
                >
                  {t.authForgotLink}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security passcode"
                  className="w-full bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 pr-9 outline-none font-medium transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl transition shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-1.5 transform hover:scale-[1.01]"
            >
              <span>{t.authSignInBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleInitializeKavach} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                <User className="w-3 h-3 text-violet-400" /> {t.authName}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-violet-400 rounded-xl p-2.5 outline-none font-medium transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                <Mail className="w-3 h-3 text-violet-400" /> {t.authGuardianId}
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your.email@gmail.com"
                className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-violet-400 rounded-xl p-2.5 outline-none font-medium transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-violet-400" /> {t.authPhone}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-violet-400 rounded-xl p-2.5 outline-none font-medium transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-violet-400" /> {t.authCreatePass}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-violet-400 rounded-xl p-2.5 outline-none font-medium transition"
              />
            </div>

            <button
              type="submit"
              className="mt-1 bg-gradient-to-r from-violet-700 to-fuchsia-800 hover:from-violet-600 hover:to-fuchsia-700 text-white font-black text-xs py-3.5 px-4 rounded-xl transition shadow-lg shadow-violet-950/60 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.authSignUpBtn}</span>
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
              <Mail className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <span>
                {isHi 
                  ? 'Forgot Passcode पर क्लिक करें। 6-अंक OTP आपके ईमेल पर SMTP से जाएगा।' 
                  : 'Click send. A 6-digit OTP is emailed automatically via SMTP — no extra setup screen.'}
              </span>
            </div>

            {forgotStep === 'email' && (
              <form onSubmit={handleRecoverKey} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-300">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs py-3 px-4 rounded-xl transition shadow-lg shadow-yellow-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSendingOtp ? (isHi ? 'OTP भेजा जा रहा है...' : 'Sending OTP to email...') : t.authSendResetBtn}
                </button>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-300">Email OTP</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="bg-slate-900/90 text-sm tracking-[0.4em] text-center font-black text-yellow-200 border border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-300">New Passcode</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a new passcode"
                    className="bg-slate-900/90 text-xs text-slate-100 border border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 font-black text-xs py-3 px-4 rounded-xl disabled:opacity-50"
                >
                  {isVerifyingOtp ? (isHi ? 'सत्यापित हो रहा है...' : 'Verifying OTP...') : (isHi ? 'OTP सत्यापित करें और रीसेट करें' : 'Verify OTP & Reset Passcode')}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep('email')}
                  className="text-[10px] text-yellow-400 underline"
                >
                  {isHi ? 'OTP दोबारा भेजें' : 'Resend OTP'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setAuthMode('login'); setForgotStep('email'); }}
              className="text-xs text-slate-400 hover:text-slate-200 text-center font-medium"
            >
              {t.authBackToLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
