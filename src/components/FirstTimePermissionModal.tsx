import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Camera,
  Bell,
  Fingerprint,
  Image,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Settings,
  Info,
  ChevronRight,
  Sparkles,
  Smartphone,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { DocPayLogoIcon } from './DocPayLogo';
import { AppPermissionSettings, PermissionStatus } from '../types';

interface Props {
  initialPermissions: AppPermissionSettings;
  onComplete: (permissions: AppPermissionSettings) => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export const FirstTimePermissionModal: React.FC<Props> = ({
  initialPermissions,
  onComplete,
  onLogActivity,
}) => {
  // Step State: 'welcome' -> 1 (Camera) -> 2 (Notifications) -> 3 (Biometrics) -> 4 (Photos/Media) -> 'summary'
  const [currentStep, setCurrentStep] = useState<'welcome' | 1 | 2 | 3 | 4 | 'summary'>('welcome');

  // Permission State map
  const [permissions, setPermissions] = useState<AppPermissionSettings>(initialPermissions);

  // Simulated System Dialog Overlay
  const [activeSystemPrompt, setActiveSystemPrompt] = useState<{
    key: keyof AppPermissionSettings;
    title: string;
    description: string;
    icon: any;
  } | null>(null);

  // Modal overlays for Policy/Terms
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Handle Permission Choice
  const handleUpdatePermission = (key: keyof AppPermissionSettings, status: PermissionStatus) => {
    const updated = { ...permissions, [key]: status };
    setPermissions(updated);
    localStorage.setItem('docpay_app_permissions', JSON.stringify(updated));

    const statusLabel = status === 'allowed' ? 'Granted' : 'Denied';
    onLogActivity(
      `Permission ${statusLabel}`,
      `User ${statusLabel.toLowerCase()} permission for ${key}`,
      'security'
    );
  };

  // Trigger Native Android/iOS System Simulation Dialog
  const triggerSystemPrompt = (
    key: keyof AppPermissionSettings,
    title: string,
    description: string,
    icon: any
  ) => {
    setActiveSystemPrompt({ key, title, description, icon });
  };

  // Next Step Helper
  const handleNextStep = () => {
    if (currentStep === 'welcome') {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep('summary');
    }
  };

  // Final Finish Handler
  const handleFinishSetup = () => {
    localStorage.setItem('docpay_first_login_permission_completed', 'true');
    localStorage.setItem('docpay_app_permissions', JSON.stringify(permissions));
    onLogActivity(
      'First-Time Permission Flow Completed',
      'Completed privacy onboarding and recorded app permission settings.',
      'auth'
    );
    onComplete(permissions);
  };

  const getStepProgressNumber = () => {
    if (currentStep === 'welcome') return 0;
    if (currentStep === 'summary') return 4;
    return currentStep;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      
      {/* Container with Material 3 Banking Aesthetic */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.35)] overflow-hidden text-slate-100 my-auto flex flex-col">

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <DocPayLogoIcon className="w-8 h-8 shrink-0 drop-shadow-md" />
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>DocPay Enterprise</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Android 14 Ready
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                First-Time Login Security & Privacy Flow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Secure Setup</span>
          </div>
        </div>

        {/* Progress Bar (Visible on permission steps 1..4) */}
        {typeof currentStep === 'number' && (
          <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                {currentStep}
              </span>
              <span>Step {currentStep} of 4</span>
            </div>

            <div className="flex-1 mx-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">

          {/* ==================== STEP 0: WELCOME & PRIVACY SCREEN ==================== */}
          {currentStep === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 mx-auto shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Welcome to DocPay Enterprise
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Before you start using the app, we need a few permissions to enable features such as document scanning, QR scanning, notifications, and secure authentication.
                </p>
              </div>

              {/* Privacy Highlights Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">🔒 Privacy-First Design</h4>
                    <p className="text-[11px] text-slate-400">
                      Permissions are requested individually only when required for explicit app functions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Zero Deceptive Data Collection</h4>
                    <p className="text-[11px] text-slate-400">
                      We never access SMS, contacts, personal phone calls, or sensitive private files without your authorization.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Full User Control</h4>
                    <p className="text-[11px] text-slate-400">
                      You can manage or revoke permissions at any time via Profile → Settings → Permissions & Privacy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-indigo-400/40"
                >
                  <span>Continue to Permissions</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== STEP 1: CAMERA PERMISSION ==================== */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-md">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">Camera Permission</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  “Allow camera access to scan QR codes and documents.”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" /> Why this is needed:
                </h4>
                <ul className="space-y-1.5 text-slate-300 pl-5 list-disc text-[11px]">
                  <li>Scan payment QR codes (UPI, BharatQR)</li>
                  <li>Scan Aadhaar, PAN, and academic certificates into Document Vault</li>
                  <li>Live identity snapshot verification</li>
                </ul>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                    permissions.camera === 'allowed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : permissions.camera === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {permissions.camera === 'allowed'
                    ? 'Allowed'
                    : permissions.camera === 'denied'
                    ? 'Denied'
                    : 'Not Requested'}
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerSystemPrompt(
                      'camera',
                      'Allow DocPay to access your Camera?',
                      'Required to scan payment QR codes and identity documents.',
                      Camera
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Allow Camera Access</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdatePermission('camera', 'denied');
                      handleNextStep();
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Not Now
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Continue Without Permission
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== STEP 2: NOTIFICATIONS PERMISSION ==================== */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
                  <Bell className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">Notifications Permission</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  “Allow notifications for payment, autopay, and important account security alerts.”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" /> Why this is needed:
                </h4>
                <ul className="space-y-1.5 text-slate-300 pl-5 list-disc text-[11px]">
                  <li>Instant payment credit / debit receipts</li>
                  <li>Autopay execution reminders and mandate alerts</li>
                  <li>Fraud detection warnings and login activity alerts</li>
                </ul>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                    permissions.notifications === 'allowed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : permissions.notifications === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {permissions.notifications === 'allowed'
                    ? 'Allowed'
                    : permissions.notifications === 'denied'
                    ? 'Denied'
                    : 'Not Requested'}
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerSystemPrompt(
                      'notifications',
                      'Allow DocPay to send you Notifications?',
                      'Required for transaction receipts, autopay execution alerts & security notices.',
                      Bell
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-amber-400 transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-slate-950" />
                  <span>Allow Notifications</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdatePermission('notifications', 'denied');
                      handleNextStep();
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Not Now
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Continue Without Permission
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== STEP 3: BIOMETRIC AUTH PERMISSION ==================== */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">Biometric Authentication</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  “Enable fingerprint or face authentication for quick and secure access.”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" /> Why this is needed:
                </h4>
                <ul className="space-y-1.5 text-slate-300 pl-5 list-disc text-[11px]">
                  <li>Instant 1-second app unlock without entering 4-digit PIN</li>
                  <li>Secure high-value payment authorization</li>
                  <li>Biometric data stays strictly encrypted inside Android KeyStore / iOS Secure Enclave</li>
                </ul>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                    permissions.biometrics === 'allowed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : permissions.biometrics === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {permissions.biometrics === 'allowed'
                    ? 'Enabled'
                    : permissions.biometrics === 'denied'
                    ? 'Disabled'
                    : 'Not Configured'}
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerSystemPrompt(
                      'biometrics',
                      'Enable Biometric Lock for DocPay?',
                      'Uses Android Fingerprint / Face ID to secure app startup & payments.',
                      Fingerprint
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-200" />
                  <span>Enable Biometrics</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdatePermission('biometrics', 'denied');
                      handleNextStep();
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Not Now
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Continue Without Permission
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== STEP 4: PHOTOS & MEDIA PERMISSION ==================== */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-md">
                  <Image className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">Photos & Media Access</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  “Allow photos and media access to upload document images, PDFs, and payment attachments.”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" /> Why this is needed:
                </h4>
                <ul className="space-y-1.5 text-slate-300 pl-5 list-disc text-[11px]">
                  <li>Upload Aadhaar/PAN/Marks Card images from Gallery</li>
                  <li>Save exported PDF documents to phone storage</li>
                  <li>Attach payment proof screenshots to support tickets</li>
                </ul>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                    permissions.photosMedia === 'allowed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : permissions.photosMedia === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {permissions.photosMedia === 'allowed'
                    ? 'Allowed'
                    : permissions.photosMedia === 'denied'
                    ? 'Denied'
                    : 'Not Requested'}
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerSystemPrompt(
                      'photosMedia',
                      'Allow DocPay to access Photos and Media?',
                      'Required to upload document files & save PDF downloads.',
                      Image
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Image className="w-4 h-4 text-purple-200" />
                  <span>Allow Photos & Media</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdatePermission('photosMedia', 'denied');
                      handleNextStep();
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Not Now
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Continue Without Permission
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== FINAL STEP: SUMMARY & FINISH ==================== */}
          {currentStep === 'summary' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">Setup Summary</h3>
                <p className="text-xs text-slate-300">
                  Your first-time login security & permission setup is complete.
                </p>
              </div>

              {/* Permission Summary Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
                  Configured Permissions
                </h4>

                <div className="divide-y divide-slate-800/80">
                  <div className="py-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-200">
                      <Camera className="w-4 h-4 text-indigo-400" /> Camera Access
                    </span>
                    <span className={permissions.camera === 'allowed' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {permissions.camera === 'allowed' ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-200">
                      <Bell className="w-4 h-4 text-amber-400" /> Notifications
                    </span>
                    <span className={permissions.notifications === 'allowed' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {permissions.notifications === 'allowed' ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-200">
                      <Fingerprint className="w-4 h-4 text-emerald-400" /> Biometric Authentication
                    </span>
                    <span className={permissions.biometrics === 'allowed' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {permissions.biometrics === 'allowed' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-200">
                      <Image className="w-4 h-4 text-purple-400" /> Photos & Documents
                    </span>
                    <span className={permissions.photosMedia === 'allowed' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {permissions.photosMedia === 'allowed' ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-[11px] text-indigo-200 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  You can update any of these permissions at any time from <strong>Profile → Settings → Permissions & Privacy</strong>.
                </span>
              </div>

              <button
                type="button"
                onClick={handleFinishSetup}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-emerald-300/50"
              >
                <span>Enter Home Page</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </motion.div>
          )}

        </div>
      </div>

      {/* ==================== SIMULATED NATIVE SYSTEM PERMISSION DIALOG ==================== */}
      <AnimatePresence>
        {activeSystemPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  {React.createElement(activeSystemPrompt.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Android System Dialog
                  </span>
                  <h4 className="font-extrabold text-sm text-white">{activeSystemPrompt.title}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {activeSystemPrompt.description}
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdatePermission(activeSystemPrompt.key, 'allowed');
                    setActiveSystemPrompt(null);
                    handleNextStep();
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md"
                >
                  While using the app (Allow)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdatePermission(activeSystemPrompt.key, 'allowed');
                    setActiveSystemPrompt(null);
                    handleNextStep();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  Only this time
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdatePermission(activeSystemPrompt.key, 'denied');
                    setActiveSystemPrompt(null);
                    handleNextStep();
                  }}
                  className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer"
                >
                  Don't allow
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== PRIVACY POLICY MODAL ==================== */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> DocPay Privacy Policy
              </h3>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-300 leading-relaxed pr-1">
              <p>
                <strong>1. Minimum Permission Principle:</strong> We only request hardware permissions (Camera, Notifications, Biometrics, Photos) when you directly initiate a feature that requires them.
              </p>
              <p>
                <strong>2. Data Encryption:</strong> All sensitive document scans and biometric keys are stored using hardware-backed AES-256 encryption. Biometric credentials never leave your mobile device.
              </p>
              <p>
                <strong>3. No Deceptive Access:</strong> DocPay does not read SMS messages, call logs, location, contacts, or unapproved media folders.
              </p>
              <p>
                <strong>4. Revocation Right:</strong> You may grant or revoke permissions at any point through App Settings without losing access to unrelated app functions.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* ==================== TERMS & CONDITIONS MODAL ==================== */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Terms & Conditions
              </h3>
              <button
                onClick={() => setShowTerms(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-300 leading-relaxed pr-1">
              <p>
                <strong>1. Acceptance:</strong> By using DocPay Enterprise, you agree to adhere to safe transaction guidelines and NPCI/RBI security protocols.
              </p>
              <p>
                <strong>2. Separate Consent:</strong> Permission approvals are purely functional and do not constitute acceptance of financial liability or automated charges without explicit transaction PIN authorization.
              </p>
              <p>
                <strong>3. Sensitive Info Safeguard:</strong> Generic permission requests will NEVER ask for bank account PINs, OTP codes, Aadhaar biometric seeds, or credit card CVVs.
              </p>
            </div>

            <button
              onClick={() => setShowTerms(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
            >
              Close Terms
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
