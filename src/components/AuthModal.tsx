import React, { useState, useEffect, useRef } from 'react';
import { DocPayLogoIcon } from './DocPayLogo';
import {
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  User,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  X,
  AlertTriangle,
  Camera,
  Upload,
  Trash2,
  ArrowRight,
  RefreshCw,
  Globe,
  MapPin,
  Calendar,
  Check,
  Smartphone,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onClose: () => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
  onTriggerNotification?: (params: {
    title: string;
    message: string;
    type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
    status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
    category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
    actionLabel?: string;
    actionTab?: string;
  }) => void;
}

export const AuthModal: React.FC<Props> = ({
  user,
  onUpdateUser,
  onClose,
  onLogActivity,
  onTriggerNotification,
}) => {
  // Overall Flow Step: 'login_signup' (1) -> 'phone_otp' (2) -> 'complete_profile' (3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1 STATE: Login / Sign Up
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(user.email || 'giri.vasu19@example.com');
  const [password, setPassword] = useState('Password@123');
  const [confirmPassword, setConfirmPassword] = useState('Password@123');
  const [fullName, setFullName] = useState(user.name || 'GIRI_VASU_19');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [step1Error, setStep1Error] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 2 STATE: Phone OTP
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('9390240130');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState('889210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(45);
  const [otpError, setOtpError] = useState('');
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // STEP 3 STATE: Complete Profile
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatarUrl || 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&auto=format&fit=crop&q=80'
  );
  const [displayName, setDisplayName] = useState(user.displayName || 'Giri Vasu');
  const [username, setUsername] = useState(user.username || 'girivasu19');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '1995-05-20');
  const [gender, setGender] = useState(user.gender || 'Male');
  const [country, setCountry] = useState(user.country || 'India');
  const [state, setState] = useState(user.state || 'Karnataka');
  const [city, setCity] = useState(user.city || 'Bengaluru');
  const [zipCode, setZipCode] = useState(user.zipCode || '560103');
  const [addressLine, setAddressLine] = useState(user.address || 'Flat 302, Green Glen Layout, Bellandur');
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage || 'English');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(user.theme || 'dark');
  const [step3Error, setStep3Error] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let timerInterval: any;
    if (currentStep === 2 && otpSent && otpTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [currentStep, otpSent, otpTimer]);

  // Country Codes List
  const countryCodes = [
    { code: '+91', label: '🇮🇳 India (+91)' },
    { code: '+1', label: '🇺🇸 USA / Canada (+1)' },
    { code: '+44', label: '🇬🇧 UK (+44)' },
    { code: '+971', label: '🇦🇪 UAE (+971)' },
    { code: '+65', label: '🇸🇬 Singapore (+65)' },
    { code: '+61', label: '🇦🇺 Australia (+61)' },
  ];

  // Password Strength Meter & Requirements
  const getPasswordRequirements = (pass: string) => {
    return {
      minLength: pass.length >= 8,
      hasUpper: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[^A-Za-z0-9]/.test(pass),
    };
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) {
      return { score: 0, label: 'Not Entered', color: 'bg-zinc-800', barColor: 'bg-zinc-800', textColor: 'text-slate-400', level: 0 };
    }
    const reqs = getPasswordRequirements(pass);
    const passedCount = Object.values(reqs).filter(Boolean).length;

    switch (passedCount) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', barColor: 'bg-rose-500', textColor: 'text-rose-400', level: 1 };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', barColor: 'bg-amber-500', textColor: 'text-amber-400', level: 2 };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-yellow-400', barColor: 'bg-yellow-400', textColor: 'text-yellow-300', level: 3 };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500', barColor: 'bg-emerald-500', textColor: 'text-emerald-400', level: 4 };
      default:
        return { score: 10, label: 'Very Weak', color: 'bg-rose-600', barColor: 'bg-rose-600', textColor: 'text-rose-500', level: 0 };
    }
  };

  // STEP 1 SUBMIT
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error('');

    if (!email || !email.includes('@')) {
      setStep1Error('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setStep1Error('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setStep1Error('Please enter your full legal name.');
        return;
      }
      if (password !== confirmPassword) {
        setStep1Error('Passwords do not match.');
        return;
      }
      if (!acceptTerms) {
        setStep1Error('You must accept the Terms & Conditions to proceed.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogActivity('Step 1 Authenticated', `${authMode.toUpperCase()} successful for ${email}`, 'auth');
      
      // Auto-send OTP for Step 2
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(generatedOtp);
      setOtpSent(true);
      setOtpTimer(45);
      setCurrentStep(2);
    }, 800);
  };

  // STEP 2: OTP Digit Handler
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const arr = pasted.split('');
      setOtpDigits(arr);
      verifyOtpCode(pasted);
    }
  };

  const verifyOtpCode = (codeToVerify: string) => {
    setIsOtpVerifying(true);
    setTimeout(() => {
      setIsOtpVerifying(false);
      if (codeToVerify === simulatedOtp || codeToVerify === '123456' || codeToVerify === '889210') {
        setOtpSuccess(true);
        onLogActivity('Mobile OTP Verified', `Phone ${countryCode} ${phoneNumber} verified via SMS OTP`, 'auth');
        if (onTriggerNotification) {
          onTriggerNotification({
            title: 'Mobile OTP Verification Successful',
            message: `One-Time Password verified for ${countryCode} ${phoneNumber}. Secure session authenticated.`,
            type: 'otp',
            status: 'success',
            actionLabel: 'View Profile',
            actionTab: 'dashboard',
          });
        }
        setTimeout(() => {
          setCurrentStep(3);
        }, 1000);
      } else {
        setOtpError(`Invalid OTP. Use auto-detected code ${simulatedOtp} or 123456`);
      }
    }, 800);
  };

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(newOtp);
    setOtpTimer(45);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    onLogActivity('Resend OTP Requested', `New SMS code dispatched to ${countryCode} ${phoneNumber}`, 'auth');
  };

  // STEP 3: Complete Profile Submit
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep3Error('');

    if (!fullName.trim()) {
      setStep3Error('Full Name is required.');
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      name: fullName,
      displayName: displayName || fullName,
      username: username || fullName.toLowerCase().replace(/\s+/g, '_'),
      phone: `${countryCode} ${phoneNumber}`,
      phoneVerified: true,
      email: email,
      address: addressLine,
      country,
      state,
      city,
      zipCode,
      dateOfBirth,
      gender,
      preferredLanguage,
      theme,
      avatarUrl,
      onboardingCompleted: true,
      isLoggedIn: true,
      accountStatus: 'active',
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    onUpdateUser(updatedUser);
    onLogActivity('Profile Onboarding Completed', `User ${fullName} completed 3-step setup successfully.`, 'auth');
    onClose();
  };

  // Profile Picture File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-slate-100 my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <DocPayLogoIcon className="w-8 h-8 shrink-0 drop-shadow-md" />
            <div>
              <h3 className="font-black text-sm tracking-tight gold-shine-text">
                DocPay Enterprise Auth
              </h3>
              <p className="text-[10px] text-amber-300/80 font-mono">3-Step Security Onboarding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-zinc-900 px-6 py-3 border-b border-amber-500/10 flex items-center justify-between text-xs font-extrabold">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep >= 1 ? 'bg-amber-400 text-slate-950' : 'bg-zinc-800 text-slate-500'}`}>
              1
            </span>
            <span>Auth</span>
          </div>

          <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 2 ? 'bg-amber-400' : 'bg-zinc-800'}`} />

          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep >= 2 ? 'bg-amber-400 text-slate-950' : 'bg-zinc-800 text-slate-500'}`}>
              2
            </span>
            <span>OTP</span>
          </div>

          <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 3 ? 'bg-amber-400' : 'bg-zinc-800'}`} />

          <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep >= 3 ? 'bg-amber-400 text-slate-950' : 'bg-zinc-800 text-slate-500'}`}>
              3
            </span>
            <span>Profile</span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6">

          {/* ==================== STEP 1: LOGIN / SIGN UP ==================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight gold-shine-text">
                  Welcome
                </h2>
                <p className="text-xs text-slate-300">
                  Access your secure digital identity vault, bank accounts & document portal
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-2xl border border-amber-500/20">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setStep1Error('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setStep1Error('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStep1Submit({ preventDefault: () => {} } as any)}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="text-base">🌐</span>
                  <span className="hidden sm:inline">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStep1Submit({ preventDefault: () => {} } as any)}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="text-base">🍎</span>
                  <span className="hidden sm:inline">Apple</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStep1Submit({ preventDefault: () => {} } as any)}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="text-base">💻</span>
                  <span className="hidden sm:inline">Microsoft</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0">
                  Or continue with email
                </span>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">Full Legal Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-300">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to your email!')}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength Meter for Sign Up */}
                  {authMode === 'signup' && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          Password Security:
                        </span>
                        <span className={`font-extrabold uppercase tracking-wider text-[10px] ${getPasswordStrength(password).textColor}`}>
                          {getPasswordStrength(password).label} ({getPasswordStrength(password).score}%)
                        </span>
                      </div>

                      {/* 4-Segment Visual Bar Meter */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => {
                          const strength = getPasswordStrength(password);
                          const isActive = strength.level >= step;
                          return (
                            <div
                              key={step}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isActive ? strength.barColor : 'bg-zinc-800'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Real-time Requirements Checklist */}
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                        {(() => {
                          const reqs = getPasswordRequirements(password);
                          return [
                            { label: '8+ Characters', met: reqs.minLength },
                            { label: 'Uppercase Letter', met: reqs.hasUpper },
                            { label: 'Number (0-9)', met: reqs.hasNumber },
                            { label: 'Special Symbol', met: reqs.hasSpecial },
                          ].map((req, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 transition-colors">
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold ${
                                  req.met
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}
                              >
                                {req.met ? '✓' : '•'}
                              </span>
                              <span className={req.met ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                                {req.label}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Checkboxes */}
                <div className="space-y-2 text-xs text-slate-300 pt-1">
                  {authMode === 'login' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded accent-amber-400"
                      />
                      <span>Remember Me on this device</span>
                    </label>
                  ) : (
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="rounded accent-amber-400 mt-0.5"
                      />
                      <span>
                        I agree to the <span className="text-amber-300 font-bold underline">Terms & Conditions</span> and <span className="text-amber-300 font-bold underline">Privacy Policy</span>.
                      </span>
                    </label>
                  )}
                </div>

                {step1Error && (
                  <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {step1Error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl gold-shine-button text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-amber-300/50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Log In & Continue' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ==================== STEP 2: PHONE OTP VERIFICATION ==================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight gold-shine-text">
                  Verify Your Mobile Number
                </h2>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Bind your phone number to NPCI & DocPay encrypted portal
                </p>
              </div>

              {/* Phone Entry Row */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-300">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-zinc-900 border border-amber-500/30 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Automatic SMS OTP Detection Banner */}
              <div className="p-3 bg-zinc-900/90 border-2 border-amber-400/60 rounded-2xl space-y-1.5 shadow-md animate-bounce-short">
                <div className="flex items-center justify-between text-amber-400 text-[10px] font-black">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" /> SIMULATED SMS DETECTED
                  </span>
                  <span>Just Now</span>
                </div>
                <p className="text-xs text-slate-200">
                  Your OTP verification code is:{' '}
                  <span className="font-mono font-black text-amber-300 text-sm bg-black/50 px-2 py-0.5 rounded border border-amber-400/40">
                    {simulatedOtp}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const arr = simulatedOtp.split('');
                    setOtpDigits(arr);
                    verifyOtpCode(simulatedOtp);
                  }}
                  className="w-full py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-extrabold text-[11px] transition-all cursor-pointer"
                >
                  ⚡ Tap to Auto-Fill & Verify OTP
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-2xl bg-zinc-900 border-2 border-amber-500/40 text-center text-lg sm:text-xl font-black text-amber-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/30 transition-all"
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <p className="text-xs text-rose-400 font-bold text-center flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {otpError}
                </p>
              )}

              {otpSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-center text-emerald-300 font-black text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <span>Mobile Number Verified Successfully! Proceeding to Profile...</span>
                </div>
              )}

              {/* Countdown & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                {otpTimer > 0 ? (
                  <span>Resend code in <strong className="text-amber-300 font-mono">{otpTimer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-amber-300 hover:underline font-bold"
                  >
                    Resend New OTP Code
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-slate-400 hover:text-white"
                >
                  Back to Step 1
                </button>
              </div>

              <button
                type="button"
                onClick={() => verifyOtpCode(otpDigits.join(''))}
                disabled={isOtpVerifying}
                className="w-full py-3 rounded-2xl gold-shine-button text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-amber-300/50"
              >
                {isOtpVerifying ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ==================== STEP 3: COMPLETE PROFILE ==================== */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight gold-shine-text">
                  Complete Your Profile
                </h2>
                <p className="text-xs text-slate-300">Set up your personal information & preferences</p>
              </div>

              {/* Profile Photo Selector */}
              <div className="flex items-center gap-4 bg-zinc-900/80 p-3 rounded-2xl border border-amber-500/20">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shrink-0 shadow-md">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                </div>

                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-white">Profile Photo</p>
                  <div className="flex flex-wrap gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraActive(!isCameraActive);
                        if (!isCameraActive) {
                          setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isCameraActive ? 'Capture Snapshot' : 'Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvatarUrl('https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&auto=format&fit=crop&q=80')}
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Reset Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Verified Phone</label>
                    <input
                      type="text"
                      readOnly
                      value={`${countryCode} ${phoneNumber}`}
                      className="w-full bg-zinc-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold rounded-xl px-3 py-2 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Address Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">PIN / ZIP Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Address Line</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Preferences
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="dark">Dark Gold Luxury</option>
                      <option value="light">Light Slate</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>

              {step3Error && (
                <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {step3Error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStep3Submit}
                  className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Skip Optional Fields
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl gold-shine-button text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-amber-300/50"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Save & Continue</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
