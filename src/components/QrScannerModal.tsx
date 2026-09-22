import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  RotateCw,
  Volume2,
  VolumeX,
  Upload,
  CreditCard,
  Building2,
  Send,
  Lock,
  Sun,
  Moon,
  Check,
  ArrowRight,
  Info,
  Sparkles,
  Smartphone,
  Receipt,
  Download,
  Share2,
} from 'lucide-react';
import { BankAccount, BankTransaction, UserProfile } from '../types';

interface Props {
  banks?: BankAccount[];
  user?: UserProfile;
  onAddTransaction?: (tx: BankTransaction) => void;
  onClose: () => void;
  onLogActivity: (
    title: string,
    desc: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export const QrScannerModal: React.FC<Props> = ({
  banks = [],
  user,
  onAddTransaction,
  onClose,
  onLogActivity,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Appearance / Material Theme Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Camera & Scan Viewport Controls
  const [useCamera, setUseCamera] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanner Steps: 'scanning' | 'details' | 'pin_prompt' | 'success' | 'blocked'
  const [scanStep, setScanStep] = useState<'scanning' | 'details' | 'pin_prompt' | 'success' | 'blocked'>('scanning');

  // Scanned Payee State
  const [scannedPayee, setScannedPayee] = useState<{
    id: string;
    type: 'merchant' | 'p2p' | 'utility' | 'govt' | 'unsafe';
    name: string;
    vpa: string;
    verified: boolean;
    defaultAmount: number;
    category: string;
    riskScore: number;
    warningMessage?: string;
  } | null>(null);

  // Payment Form Inputs
  const [payAmount, setPayAmount] = useState<number>(250);
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || 'bank-1');
  const [paymentNote, setPaymentNote] = useState<string>('Payment via Docpay Scanner');

  // PIN & Receipt State
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isProcessingPay, setIsProcessingPay] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<BankTransaction | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setUseCamera(false);
      }
    }
    if (useCamera) {
      startCam();
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [useCamera, cameraFacing]);

  // Preset Payment QR Scans
  const handleSelectPresetQr = (qrType: 'merchant' | 'utility' | 'p2p' | 'govt' | 'unsafe') => {
    if (soundEnabled) {
      // Audio beep effect
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {
        // audio context fail fallback
      }
    }

    if (qrType === 'merchant') {
      const data = {
        id: `m-${Date.now()}`,
        type: 'merchant' as const,
        name: 'Starbucks India Coffee',
        vpa: 'starbucks@hdfcbank',
        verified: true,
        defaultAmount: 320,
        category: 'Food & Beverage',
        riskScore: 2,
      };
      setScannedPayee(data);
      setPayAmount(320);
      setPaymentNote('Coffee & Pastry order');
      setScanStep('details');
      onLogActivity('Payment QR Scanned', 'Scanned verified merchant QR: Starbucks India', 'bank');
    } else if (qrType === 'utility') {
      const data = {
        id: `u-${Date.now()}`,
        type: 'utility' as const,
        name: 'BESCOM Electricity Bill',
        vpa: 'bescom.bill@icici',
        verified: true,
        defaultAmount: 1450,
        category: 'Electricity Bill',
        riskScore: 0,
      };
      setScannedPayee(data);
      setPayAmount(1450);
      setPaymentNote('Monthly Electricity Payout');
      setScanStep('details');
      onLogActivity('Bill QR Scanned', 'Scanned BESCOM Electricity Bill QR', 'bank');
    } else if (qrType === 'p2p') {
      const data = {
        id: `p-${Date.now()}`,
        type: 'p2p' as const,
        name: 'Ramesh Kumar',
        vpa: 'ramesh.kumar@okaxis',
        verified: true,
        defaultAmount: 500,
        category: 'Personal Transfer',
        riskScore: 5,
      };
      setScannedPayee(data);
      setPayAmount(500);
      setPaymentNote('Dinner split');
      setScanStep('details');
      onLogActivity('Personal UPI QR Scanned', 'Scanned P2P UPI QR for Ramesh Kumar', 'bank');
    } else if (qrType === 'govt') {
      const data = {
        id: `g-${Date.now()}`,
        type: 'govt' as const,
        name: 'Income Tax Department e-Challan',
        vpa: 'incometax@sbi',
        verified: true,
        defaultAmount: 2500,
        category: 'Official Government Payout',
        riskScore: 0,
      };
      setScannedPayee(data);
      setPayAmount(2500);
      setPaymentNote('Advance Tax Payment Challan');
      setScanStep('details');
      onLogActivity('Govt QR Scanned', 'Scanned official Income Tax e-Challan QR', 'portal');
    } else {
      // Unsafe Fraudulent Link QR
      const data = {
        id: `f-${Date.now()}`,
        type: 'unsafe' as const,
        name: 'UNVERIFIED SUSPICIOUS PAYEE',
        vpa: 'claim-cashback-now@unverified',
        verified: false,
        defaultAmount: 9999,
        category: 'Phishing Malware Link',
        riskScore: 96,
        warningMessage:
          'HIGH RISK DETECTED: This QR code redirects to an unverified third-party host known for APK malware injections and illegal phishing. Docpay Security has blocked execution.',
      };
      setScannedPayee(data);
      setScanStep('blocked');
      onLogActivity('SUSPICIOUS QR BLOCKED', 'Blocked high-risk phishing payment QR code', 'security');
    }
  };

  // Image File Upload Simulation for Gallery QR
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectPresetQr('merchant');
    }
  };

  // Proceed to PIN
  const handleProceedToPin = () => {
    if (payAmount <= 0) return;
    setEnteredPin('');
    setPinError('');
    setScanStep('pin_prompt');
  };

  // Submit UPI PIN and Finalize Transaction
  const handleConfirmPin = (num?: string) => {
    let pinVal = enteredPin;
    if (num) {
      if (enteredPin.length < 6) {
        pinVal = enteredPin + num;
        setEnteredPin(pinVal);
      }
    }

    if (pinVal.length === 6) {
      setIsProcessingPay(true);
      setPinError('');

      setTimeout(() => {
        setIsProcessingPay(false);
        const utrVal = `UTR2026${Math.floor(10000000 + Math.random() * 90000000)}`;
        const selectedBank = banks.find((b) => b.id === selectedBankId) || banks[0];

        const newTx: BankTransaction = {
          id: `tx-qr-${Date.now()}`,
          type: 'send',
          fromBankId: selectedBank?.id || 'bank-1',
          fromBankName: selectedBank?.bankName || 'HDFC Bank',
          recipientName: scannedPayee?.name || 'UPI Merchant',
          recipientUpiOrPhone: scannedPayee?.vpa || 'payee@upi',
          amount: payAmount,
          timestamp: new Date().toLocaleString([], {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'completed',
          utrNumber: utrVal,
          note: paymentNote,
        };

        if (onAddTransaction) {
          onAddTransaction(newTx);
        }

        setCompletedTx(newTx);
        setScanStep('success');
        onLogActivity(
          'UPI Payment Completed',
          `Paid ₹${payAmount.toLocaleString('en-IN')} to ${scannedPayee?.name} via QR Scanner. UTR: ${utrVal}`,
          'bank'
        );
      }, 1200);
    }
  };

  const handleDeletePinChar = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Material 3 Expressive Container Surface */}
      <div
        className={`w-full max-w-lg rounded-[28px] sm:rounded-[32px] border transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header Bar */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <QrCode className="w-5 h-5 text-slate-950 font-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight gold-shine-text">Payments Scanner</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  NPCI UPI • GOLD
                </span>
              </div>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Scan any QR Code, BharatQR, or Payment Bill
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Switcher */}
            <button
              id="scanner-theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
              }`}
              title="Toggle Dark/Light Material Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY CONTENT BASED ON STEP */}
        <div className="p-5 space-y-5">
          {scanStep === 'scanning' && (
            <div className="space-y-4">
              {/* ANIMATED VIEWPORT SCANNER CAMERA */}
              <div
                className={`relative w-full h-64 sm:h-72 rounded-[24px] overflow-hidden border-2 flex items-center justify-center shadow-inner ${
                  isDarkMode
                    ? 'bg-slate-950 border-purple-500/40'
                    : 'bg-slate-900 border-purple-400/50'
                }`}
              >
                {useCamera ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Flashlight Overlay Simulation */}
                    {flashOn && (
                      <div className="absolute inset-0 bg-white/20 pointer-events-none transition-opacity" />
                    )}

                    {/* Animated Pulsing Frame Glow */}
                    <div className="absolute inset-0 border-2 border-purple-400/50 bg-purple-500/10 pointer-events-none rounded-[24px]" />
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2 text-white">
                    <Camera className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
                    <p className="text-xs font-semibold text-slate-300">
                      Camera feed ready or select test preset below
                    </p>
                  </div>
                )}

                {/* VIEWPORT TARGET CORNER BRACKETS (MATERIAL ACCENTS) */}
                <div className="absolute inset-8 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-xl shadow-[0_0_10px_#a855f7]" />
                    <div className="w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-xl shadow-[0_0_10px_#a855f7]" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-xl shadow-[0_0_10px_#a855f7]" />
                    <div className="w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-xl shadow-[0_0_10px_#a855f7]" />
                  </div>
                </div>

                {/* ANIMATED LASER SCAN BEAM */}
                <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_18px_#c084fc] animate-scan-line pointer-events-none" />

                {/* Active Status Badge Overlay */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 border border-purple-500/50 text-purple-200 text-[10px] font-bold flex items-center gap-2 shadow-lg backdrop-blur-md pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                  <span>ALIGN QR CODE WITHIN FRAME</span>
                </div>

                {/* Camera Viewport Controls Floating Overlay Bar */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
                  {/* Flashlight Toggle */}
                  <button
                    onClick={() => setFlashOn(!flashOn)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      flashOn
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Toggle Flashlight"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] hidden sm:inline">{flashOn ? 'Flash ON' : 'Flash'}</span>
                  </button>

                  {/* Camera Switch */}
                  <button
                    onClick={() =>
                      setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Flip Camera"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="text-[10px] hidden sm:inline">Flip</span>
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      soundEnabled
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    title="Toggle Audio Feedback"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Beep ON' : 'Mute'}</span>
                  </button>

                  {/* Upload Image from Gallery */}
                  <label
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Upload QR from Gallery"
                  >
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px]">Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* QUICK SCAN PRESETS SIMULATOR (MATERIAL DESIGN CARDS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-extrabold uppercase tracking-wider text-[10px] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Simulate Payment Scan Presets
                  </span>
                  <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Detect
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    id="scan-preset-merchant"
                    onClick={() => handleSelectPresetQr('merchant')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-purple-500/30 hover:border-purple-400 text-white'
                        : 'bg-slate-50 border-purple-200 hover:border-purple-500 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">☕</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400">
                        Retail
                      </span>
                    </div>
                    <span className="font-extrabold text-xs truncate">Starbucks QR</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-400">₹320.00</span>
                  </button>

                  <button
                    id="scan-preset-utility"
                    onClick={() => handleSelectPresetQr('utility')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-indigo-500/30 hover:border-indigo-400 text-white'
                        : 'bg-slate-50 border-indigo-200 hover:border-indigo-500 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">⚡</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400">
                        Bill
                      </span>
                    </div>
                    <span className="font-extrabold text-xs truncate">BESCOM Power</span>
                    <span className="text-[10px] font-mono font-semibold text-indigo-400">₹1,450.00</span>
                  </button>

                  <button
                    id="scan-preset-p2p"
                    onClick={() => handleSelectPresetQr('p2p')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-emerald-500/30 hover:border-emerald-400 text-white'
                        : 'bg-slate-50 border-emerald-200 hover:border-emerald-500 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">👤</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                        P2P UPI
                      </span>
                    </div>
                    <span className="font-extrabold text-xs truncate">Ramesh Kumar</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-400">₹500.00</span>
                  </button>

                  <button
                    id="scan-preset-govt"
                    onClick={() => handleSelectPresetQr('govt')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-amber-500/30 hover:border-amber-400 text-white'
                        : 'bg-slate-50 border-amber-200 hover:border-amber-500 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🏛️</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                        Official
                      </span>
                    </div>
                    <span className="font-extrabold text-xs truncate">Income Tax</span>
                    <span className="text-[10px] font-mono font-semibold text-amber-400">₹2,500.00</span>
                  </button>

                  <button
                    id="scan-preset-unsafe"
                    onClick={() => handleSelectPresetQr('unsafe')}
                    className={`col-span-2 sm:col-span-2 p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-200'
                        : 'bg-rose-50 border-rose-200 hover:border-rose-400 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🚨</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                        SUSPICIOUS PHISHING QR
                      </span>
                    </div>
                    <span className="font-extrabold text-xs truncate">Test Fraud Guard Block</span>
                    <span className="text-[10px] font-mono text-rose-400">Unverified APK Link</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNED PAYEE & AMOUNT DETAILS */}
          {scanStep === 'details' && scannedPayee && (
            <div className="space-y-4 animate-fade-in">
              {/* Payee Verification Banner Card */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isDarkMode
                    ? 'bg-slate-800/90 border-purple-500/30 text-white'
                    : 'bg-purple-50/80 border-purple-200 text-slate-900'
                }`}
              >
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#6A1BFF] to-[#8E24AA] text-white shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-sm truncate">{scannedPayee.name}</h4>
                    {scannedPayee.verified && (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-purple-400 font-semibold">{scannedPayee.vpa}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Category: {scannedPayee.category} • NPCI Security Clearance Score 100%
                  </p>
                </div>
              </div>

              {/* Amount Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Enter Payment Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-purple-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Math.max(0, Number(e.target.value)))}
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl font-mono text-2xl font-black outline-none border transition-all ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-purple-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                {/* Amount Quick Chips */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  {[100, 250, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setPayAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        payAmount === amt
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Account Selection Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">Select Debit Bank Account</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className={`w-full p-3 rounded-2xl font-semibold text-xs border outline-none cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {banks && banks.length > 0 ? (
                    banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (••• {b.accountNumberMasked.slice(-4)}) - Bal: ₹
                        {b.balance || '50,000'}
                      </option>
                    ))
                  ) : (
                    <option value="bank-default">HDFC Bank (••• 8821) - Bal: ₹1,24,500.00</option>
                  )}
                </select>
              </div>

              {/* Payment Remarks Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Note / Message (Optional)</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Lunch split / Order Payment"
                  className={`w-full p-3 rounded-2xl text-xs font-medium border outline-none ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Buttons Action Footer */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setScanStep('scanning')}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs border cursor-pointer transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Rescan
                </button>

                <button
                  onClick={handleProceedToPin}
                  disabled={payAmount <= 0}
                  className="flex-2 py-3.5 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-[#6A1BFF] via-[#7B2CBF] to-[#8E24AA] text-white shadow-xl shadow-purple-900/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Pay ₹{payAmount.toLocaleString('en-IN')} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTERACTIVE UPI PIN PAD AUTHORIZATION */}
          {scanStep === 'pin_prompt' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 inline-block mx-auto">
                <Lock className="w-8 h-8 mx-auto" />
              </div>

              <div>
                <h4 className="font-black text-lg">Enter 6-Digit UPI PIN</h4>
                <p className="text-xs text-slate-400">
                  Authorizing payment of <span className="font-mono font-bold text-purple-400">₹{payAmount.toLocaleString('en-IN')}</span> to {scannedPayee?.name}
                </p>
              </div>

              {/* PIN Display Dots */}
              <div className="flex items-center justify-center gap-3 py-3">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      idx < enteredPin.length
                        ? 'bg-purple-500 border-purple-400 shadow-[0_0_8px_#a855f7]'
                        : isDarkMode
                        ? 'border-slate-700 bg-slate-950'
                        : 'border-slate-300 bg-slate-100'
                    }`}
                  />
                ))}
              </div>

              {pinError && <p className="text-xs font-bold text-rose-400">{pinError}</p>}

              {/* Keypad Grid 1-9 & 0 */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      if (k === 'C') setEnteredPin('');
                      else if (k === '⌫') handleDeletePinChar();
                      else handleConfirmPin(k);
                    }}
                    className={`p-3.5 rounded-2xl font-mono text-base font-black transition-all cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-95'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {isProcessingPay && (
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Encrypted Bank Handshake in progress...</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT SCREEN */}
          {scanStep === 'success' && completedTx && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-900/40 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                  Payment Successful
                </span>
                <h4 className="text-3xl font-mono font-black text-emerald-400 mt-2">
                  ₹{completedTx.amount.toLocaleString('en-IN')}
                </h4>
                <p className="text-xs font-semibold text-slate-300 mt-1">
                  Paid to <span className="font-bold text-white">{completedTx.recipientName}</span>
                </p>
              </div>

              {/* Receipt Details Card */}
              <div
                className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-400 font-semibold">Bank UTR Reference:</span>
                  <span className="font-mono font-bold text-purple-400">{completedTx.utrNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Paid via UPI VPA:</span>
                  <span className="font-mono font-bold text-slate-200">{completedTx.recipientUpiOrPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Debited From:</span>
                  <span className="font-semibold text-slate-200">{completedTx.fromBankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Time & Date:</span>
                  <span className="font-semibold text-slate-200">{completedTx.timestamp}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setScanStep('scanning');
                    setCompletedTx(null);
                  }}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
                >
                  Scan Another QR
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl font-extrabold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FRAUD BLOCK WARNING SCREEN */}
          {scanStep === 'blocked' && scannedPayee && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-900/50">
                <AlertTriangle className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                  HIGH-RISK FRAUD BLOCKED
                </span>
                <h4 className="text-lg font-black text-rose-400 mt-2">{scannedPayee.name}</h4>
                <p className="text-xs text-rose-300 font-mono mt-1 font-bold">{scannedPayee.vpa}</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-left text-xs text-rose-200 space-y-2">
                <p className="font-semibold leading-relaxed">{scannedPayee.warningMessage}</p>
                <div className="text-[10px] font-mono text-rose-400 font-bold">
                  Risk Score: {scannedPayee.riskScore}% (Phishing Alert)
                </div>
              </div>

              <button
                onClick={() => setScanStep('scanning')}
                className="w-full py-3 rounded-2xl font-extrabold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
              >
                Back to Safe Scanner
              </button>
            </div>
          )}
        </div>

        {/* Footer Material Disclaimer */}
        <div
          className={`px-5 py-3 border-t text-[10px] flex items-center justify-between ${
            isDarkMode
              ? 'border-slate-800 bg-slate-950/60 text-slate-500'
              : 'border-slate-100 bg-slate-50 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1 font-semibold">
            <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit Encrypted NPCI Payment Gateway
          </span>
          <span className="font-mono">Docpay v2.6 • M3 Expressive</span>
        </div>
      </div>
    </div>
  );
};
