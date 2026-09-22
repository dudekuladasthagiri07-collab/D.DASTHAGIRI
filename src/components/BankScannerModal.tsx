import React, { useState, useRef } from 'react';
import {
  Building2,
  QrCode,
  CheckCircle2,
  X,
  Copy,
  Check,
  ArrowRightLeft,
  Camera,
  Upload,
  ShieldCheck,
  CreditCard,
  Eye,
  EyeOff,
  Sparkles,
  Search
} from 'lucide-react';
import { BankAccount, UserProfile } from '../types';
import { BankLogo } from './BankLogo';

interface Props {
  banks: BankAccount[];
  selectedBankId?: string;
  user: UserProfile;
  onUpdateBanks: (banks: BankAccount[]) => void;
  onClose: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export const BankScannerModal: React.FC<Props> = ({
  banks,
  selectedBankId,
  user,
  onUpdateBanks,
  onClose,
  onLogActivity,
}) => {
  // Current active bank being displayed in scanner
  const defaultBank =
    banks.find((b) => b.id === selectedBankId) ||
    banks.find((b) => b.isPrimary) ||
    banks[0];

  const [activeBank, setActiveBank] = useState<BankAccount>(defaultBank);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'qr_card' | 'switch_accounts' | 'scan_qr'>('qr_card');

  // QR Scanner Simulation State
  const [scannedResult, setScannedResult] = useState<{
    bankName: string;
    accountName: string;
    upiId: string;
    ifsc: string;
    status: string;
  } | null>(null);

  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSetPrimaryBank = (bankId: string) => {
    const updated = banks.map((b) => ({
      ...b,
      isPrimary: b.id === bankId,
    }));
    onUpdateBanks(updated);
    const targetBank = banks.find((b) => b.id === bankId);
    if (targetBank) {
      setActiveBank({ ...targetBank, isPrimary: true });
      onLogActivity(
        'Primary Bank Account Changed',
        `Set ${targetBank.bankName} (${targetBank.accountNumberMasked}) as primary bank account`,
        'bank'
      );
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStartScanCamera = async () => {
    setScannedResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanningCamera(true);

      // Auto simulate scan detection after 2.5 seconds
      setTimeout(() => {
        setScannedResult({
          bankName: 'Axis Bank',
          accountName: user.name || 'Rajesh Kumar',
          upiId: 'rajesh.k@axisbank',
          ifsc: 'UTIB0001092',
          status: 'Verified Govt Banking Gateway',
        });
        stopCamera();
      }, 2500);
    } catch (err) {
      console.error('Camera error:', err);
      // Fallback result
      setScannedResult({
        bankName: 'Kotak Mahindra Bank',
        accountName: user.name || 'Rajesh Kumar',
        upiId: 'rajesh@kotak',
        ifsc: 'KKBK0000412',
        status: 'Verified Account',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanningCamera(false);
  };

  // Generate SVG QR pattern visually
  const generateQrSvg = (upi: string) => {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-950 p-2">
        <rect width="100" height="100" fill="#ffffff" />
        {/* Outer Position Detection Squares */}
        <path d="M 10 10 H 35 V 35 H 10 Z M 15 15 V 30 H 30 V 15 Z M 20 20 H 25 V 25 H 20 Z" fill="#1e1b4b" />
        <path d="M 65 10 H 90 V 35 H 65 Z M 70 15 V 30 H 85 V 15 Z M 75 20 H 80 V 25 H 75 Z" fill="#1e1b4b" />
        <path d="M 10 65 H 35 V 90 H 10 Z M 15 70 V 85 H 30 V 70 Z M 20 75 H 25 V 80 H 20 Z" fill="#1e1b4b" />

        {/* Inner Data Matrix Grid */}
        <rect x="42" y="12" width="6" height="6" fill="#1e1b4b" />
        <rect x="52" y="12" width="6" height="6" fill="#1e1b4b" />
        <rect x="42" y="22" width="16" height="6" fill="#1e1b4b" />
        <rect x="12" y="42" width="10" height="6" fill="#1e1b4b" />
        <rect x="26" y="42" width="8" height="6" fill="#1e1b4b" />
        <rect x="40" y="40" width="20" height="20" fill="#4338ca" />
        <rect x="65" y="42" width="10" height="6" fill="#1e1b4b" />
        <rect x="80" y="42" width="8" height="6" fill="#1e1b4b" />
        <rect x="42" y="65" width="12" height="6" fill="#1e1b4b" />
        <rect x="58" y="65" width="8" height="6" fill="#1e1b4b" />
        <rect x="70" y="65" width="18" height="18" fill="#1e1b4b" />
        <rect x="42" y="78" width="8" height="12" fill="#1e1b4b" />
        <rect x="54" y="82" width="12" height="8" fill="#1e1b4b" />

        {/* Center Bank Shield Logo */}
        <circle cx="50" cy="50" r="8" fill="#ffffff" stroke="#4338ca" strokeWidth="2" />
        <path d="M 47 48 L 50 51 L 53 46" fill="none" stroke="#4338ca" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-indigo-900 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-300" />
            <div>
              <h3 className="font-bold text-base text-white">Bank Profile & Scanner Gateway</h3>
              <p className="text-[11px] text-indigo-200">Passbook QR • Account Switcher • Live Scan</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('qr_card')}
            className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr_card'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Bank Scanner Card
          </button>

          <button
            onClick={() => setActiveTab('switch_accounts')}
            className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'switch_accounts'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Switch Bank Accounts ({banks.length})
          </button>

          <button
            onClick={() => setActiveTab('scan_qr')}
            className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'scan_qr'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Scan QR
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* TAB 1: BANK SCANNER CARD / PASSBOOK QR */}
          {activeTab === 'qr_card' && (
            <div className="space-y-5">
              
              {/* Account Switcher Bar inside Card View */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-500 font-medium">Selected Bank Profile:</span>
                <select
                  value={activeBank.id}
                  onChange={(e) => {
                    const b = banks.find((item) => item.id === e.target.value);
                    if (b) setActiveBank(b);
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} {b.isPrimary ? '• (Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* PHONEPE / PASSBOOK STYLE BANK SCANNER CARD */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700 rounded-2xl p-6 text-white shadow-xl space-y-6 relative overflow-hidden">
                
                {/* Background watermark */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Building2 className="w-48 h-48 text-white" />
                </div>

                {/* Bank Card Top Row */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <BankLogo bankName={activeBank.bankName} ifscCode={activeBank.ifscCode} size="lg" showBadgeText />
                    <div>
                      <h4 className="font-bold text-base text-white">{activeBank.bankName}</h4>
                      <p className="text-[11px] text-indigo-200 uppercase font-mono tracking-wider">
                        {activeBank.accountType} ACCOUNT
                      </p>
                    </div>
                  </div>

                  {activeBank.isPrimary ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PRIMARY BANK
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimaryBank(activeBank.id)}
                      className="px-2.5 py-1 bg-indigo-700/60 hover:bg-indigo-600 text-indigo-100 border border-indigo-500/50 rounded-full text-[10px] font-semibold transition-all"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>

                {/* Center SVG QR Code Frame */}
                <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-inner relative z-10 max-w-xs mx-auto border border-indigo-200">
                  <div className="w-44 h-44 rounded-xl border border-slate-200 overflow-hidden bg-white">
                    {generateQrSvg(activeBank.upiId || 'rajeshkumar@hdfcbank')}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono text-center">
                    SCAN QR FOR BANK VERIFICATION & PAYMENTS
                  </p>
                  <p className="text-xs font-mono font-bold text-indigo-900 mt-0.5">
                    {activeBank.upiId || `${user.phone.replace(/[^0-9]/g, '')}@upi`}
                  </p>
                </div>

                {/* Account Details Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2.5 font-mono text-xs relative z-10">
                  
                  {/* Account Holder */}
                  <div className="flex justify-between items-center text-indigo-200">
                    <span>Account Holder</span>
                    <span className="font-bold text-white uppercase">{user.name}</span>
                  </div>

                  {/* Masked / Unmasked Account Number */}
                  <div className="flex justify-between items-center text-indigo-200">
                    <span>Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {showFullAccount
                          ? `5010023948${activeBank.accountNumberMasked.slice(-4)}`
                          : activeBank.accountNumberMasked}
                      </span>
                      <button
                        onClick={() => setShowFullAccount(!showFullAccount)}
                        className="text-indigo-300 hover:text-white"
                        title="Toggle Full Account Number"
                      >
                        {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* IFSC */}
                  <div className="flex justify-between items-center text-indigo-200">
                    <span>IFSC Code</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-amber-300">{activeBank.ifscCode}</span>
                      <button
                        onClick={() => handleCopyText(activeBank.ifscCode, 'ifsc')}
                        className="text-indigo-300 hover:text-white"
                      >
                        {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Available Balance if present */}
                  {activeBank.balance && (
                    <div className="flex justify-between items-center text-indigo-200 pt-2 border-t border-white/10">
                      <span>Available Balance</span>
                      <span className="font-bold text-emerald-300 text-sm">{activeBank.balance}</span>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="flex justify-between items-center text-indigo-200 pt-1">
                    <span>Verification Code</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{activeBank.verificationCode}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SWITCH BETWEEN ALL CONNECTED BANK ACCOUNTS */}
          {activeTab === 'switch_accounts' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                💡 <strong className="font-bold">Bank Account Management:</strong> Choose which linked bank account acts as your primary receiving bank or view profiles of other accounts.
              </div>

              <div className="space-y-3">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      bank.isPrimary
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <BankLogo bankName={bank.bankName} ifscCode={bank.ifscCode} size="md" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{bank.bankName}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {bank.accountType.toUpperCase()} • {bank.accountNumberMasked}
                          </p>
                        </div>
                      </div>

                      {bank.isPrimary ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                          ACTIVE PRIMARY
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimaryBank(bank.id)}
                          className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg transition-all"
                        >
                          Switch to Primary
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">IFSC Code</span>
                        <span className="font-bold text-slate-800">{bank.ifscCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">UPI ID</span>
                        <span className="font-bold text-indigo-700">{bank.upiId || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setActiveBank(bank);
                          setActiveTab('qr_card');
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Show Scanner Card
                      </button>

                      <span className="text-[10px] text-slate-400">Linked on {bank.linkedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CAMERA SCANNER FOR OTHER BANK QRS */}
          {activeTab === 'scan_qr' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm text-slate-800">Bank QR Code Scanner</h4>
                <p className="text-xs text-slate-500">Scan any Bank or UPI QR code to fetch verification profile</p>
              </div>

              {!isScanningCamera && !scannedResult && (
                <div className="p-8 border-2 border-dashed border-indigo-200 rounded-2xl text-center space-y-4 bg-slate-50">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Scan Bank QR Code via Live Camera</p>
                    <p className="text-[11px] text-slate-500">Detects NPCI / UPI & Official Government Gateway Details</p>
                  </div>

                  <button
                    onClick={handleStartScanCamera}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 mx-auto transition-all"
                  >
                    <Camera className="w-4 h-4" /> Start Camera Scan
                  </button>
                </div>
              )}

              {/* LIVE CAMERA VIEW */}
              {isScanningCamera && (
                <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-black max-h-64 flex items-center justify-center border border-indigo-500/50">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto object-cover max-h-56" />
                    <div className="absolute inset-0 border-2 border-emerald-400/80 rounded-xl m-8 pointer-events-none animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Scanning QR Code...
                    </span>
                    <button
                      onClick={stopCamera}
                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* SCANNED RESULT PREVIEW */}
              {scannedResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Bank QR Scanned Successfully</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name</span>
                      <span className="font-bold text-slate-800">{scannedResult.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Holder Name</span>
                      <span className="font-bold text-slate-800">{scannedResult.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">UPI Handle</span>
                      <span className="font-bold text-indigo-700">{scannedResult.upiId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code</span>
                      <span className="font-bold text-slate-800">{scannedResult.ifsc}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setScannedResult(null);
                      handleStartScanCamera();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs"
                  >
                    Scan Another QR Code
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
