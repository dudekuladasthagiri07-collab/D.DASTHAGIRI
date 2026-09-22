import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  CheckCircle2,
  QrCode,
  Share2,
  Copy,
  Check,
  Edit2,
  Star,
  Plus,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { UpiProfile, UserProfile } from '../../types';
import { UpiQrModal } from './UpiQrModal';

interface Props {
  upiProfile: UpiProfile;
  user?: UserProfile;
  onUpdateUpiProfile: React.Dispatch<React.SetStateAction<UpiProfile>>;
  onLogActivity?: (title: string, desc: string, type: 'bank' | 'auth' | 'security' | 'document' | 'portal') => void;
  onTriggerNotification?: (notif: any) => void;
}

export const UpiVpaSection: React.FC<Props> = ({
  upiProfile,
  user,
  onUpdateUpiProfile,
  onLogActivity,
  onTriggerNotification,
}) => {
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // Change UPI number modal
  const [showChangeNumberModal, setShowChangeNumberModal] = useState<boolean>(false);
  const [newUpiNumber, setNewUpiNumber] = useState<string>('');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);

  // Change Primary VPA modal
  const [showChangePrimaryVpaModal, setShowChangePrimaryVpaModal] = useState<boolean>(false);
  const [selectedPrimaryCandidate, setSelectedPrimaryCandidate] = useState<string>(upiProfile.primaryVpa);
  const [customVpaInput, setCustomVpaInput] = useState<string>('');

  // Add new VPA handle
  const [showAddVpaModal, setShowAddVpaModal] = useState<boolean>(false);
  const [newVpaHandle, setNewVpaHandle] = useState<string>('');
  const [newVpaSuffix, setNewVpaSuffix] = useState<string>('@upi');

  const handleCopy = (vpa: string) => {
    navigator.clipboard?.writeText(vpa);
    setCopiedVpa(vpa);
    setTimeout(() => setCopiedVpa(null), 2000);
  };

  const handleShareQr = () => {
    const vpa = upiProfile.primaryVpa;
    const name = user?.name || 'Dudekula Dasthagiri';
    if (navigator.share) {
      navigator.share({
        title: `Pay ${name} via UPI`,
        text: `UPI ID: ${vpa}`,
        url: window.location.href,
      }).catch(() => {});
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  // Change UPI Number handlers
  const handleSendNumberOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpiNumber.length < 10) return;
    setIsOtpSent(true);
    setSimulatedOtp('9182');
  };

  const handleVerifyNumberOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const last2 = newUpiNumber.slice(-2);
    const masked = `${newUpiNumber.slice(0, 2)}XXXXXX${last2}`;

    onUpdateUpiProfile((prev) => ({
      ...prev,
      upiNumberMasked: masked,
      fullUpiNumber: newUpiNumber,
      isUpiNumberVerified: true,
    }));

    if (onLogActivity) {
      onLogActivity(
        'UPI Number Updated',
        `Registered new verified UPI number ${masked} on NPCI mapper`,
        'bank'
      );
    }
    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'UPI Number Updated',
        message: `Your UPI number has been updated to ${masked} and linked to ${upiProfile.primaryVpa}.`,
        type: 'bank',
        status: 'success',
      });
    }

    setShowChangeNumberModal(false);
    setIsOtpSent(false);
    setNewUpiNumber('');
    setOtpInput('');
  };

  // Change Primary VPA handlers
  const handleSetPrimaryVpa = (vpa: string) => {
    onUpdateUpiProfile((prev) => ({
      ...prev,
      primaryVpa: vpa,
    }));

    if (onLogActivity) {
      onLogActivity(
        'Primary VPA Changed',
        `Set ${vpa} as default UPI ID for incoming payments`,
        'bank'
      );
    }
    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Primary UPI ID Changed',
        message: `${vpa} is now your default UPI ID.`,
        type: 'bank',
        status: 'success',
      });
    }

    setShowChangePrimaryVpaModal(false);
  };

  const handleAddNewVpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpaHandle.trim()) return;
    const cleanHandle = newVpaHandle.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    const fullVpa = `${cleanHandle}${newVpaSuffix}`;

    if (!upiProfile.linkedVpas.includes(fullVpa)) {
      onUpdateUpiProfile((prev) => ({
        ...prev,
        linkedVpas: [...prev.linkedVpas, fullVpa],
      }));
      if (onLogActivity) {
        onLogActivity('New VPA Created', `Created UPI handle ${fullVpa}`, 'bank');
      }
    }

    setNewVpaHandle('');
    setShowAddVpaModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                UPI Numbers & VPA Handles
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                NPCI Central Directory • Instant 8-to-10 Digit Routing
              </p>
            </div>
          </div>

          {/* QR Actions Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>View QR</span>
            </button>

            <button
              type="button"
              onClick={handleShareQr}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: UPI Number & Primary VPA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UPI Number Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                Registered UPI Number
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified ✓
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-mono font-black text-slate-900 tracking-tight">
                {upiProfile.upiNumberMasked}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Anyone across India can pay you on this 10-digit mobile number using any UPI app.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              NPCI Mapper Status: Active
            </span>
            <button
              type="button"
              onClick={() => setShowChangeNumberModal(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>
          </div>
        </div>

        {/* Primary VPA Card */}
        <div className="bg-white border border-blue-200 ring-2 ring-blue-500/10 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                Primary Virtual Payment Address (VPA)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-xs">
                <Star className="w-3 h-3 fill-current" />
                Primary ✓
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-mono font-black text-blue-700 tracking-tight">
                {upiProfile.primaryVpa}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your default UPI ID for accepting payments, web checkouts, and recurring mandates.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleCopy(upiProfile.primaryVpa)}
              className="text-xs text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedVpa === upiProfile.primaryVpa ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedVpa === upiProfile.primaryVpa ? 'Copied!' : 'Copy VPA'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowChangePrimaryVpaModal(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Change Primary VPA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Linked VPAs Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Linked VPAs</h3>
            <p className="text-xs text-slate-500">
              Active handles connected to your bank accounts
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddVpaModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add VPA</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {upiProfile.linkedVpas.map((vpa) => {
            const isPrimary = vpa === upiProfile.primaryVpa;
            const isCopied = copiedVpa === vpa;

            return (
              <div
                key={vpa}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isPrimary
                    ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-extrabold text-sm text-slate-900 block truncate">
                      {vpa}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {vpa.endsWith('@sbi')
                        ? 'State Bank of India Handle'
                        : vpa.endsWith('@axis')
                        ? 'Axis Bank Handle'
                        : 'Universal UPI Handle'}
                    </span>
                  </div>
                  {isPrimary && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-xs">
                      Primary
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => handleCopy(vpa)}
                    className="text-[11px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryVpa(vpa)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Make Primary
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Viewer Modal */}
      <UpiQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        upiProfile={upiProfile}
        user={user}
      />

      {/* Change UPI Number Modal */}
      {showChangeNumberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4"
          >
            <button
              onClick={() => setShowChangeNumberModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Change UPI Number</h3>
              <p className="text-xs text-slate-500">
                Link another 10-digit mobile number on the NPCI central mapper.
              </p>
            </div>

            {!isOtpSent ? (
              <form onSubmit={handleSendNumberOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={newUpiNumber}
                      onChange={(e) => setNewUpiNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={newUpiNumber.length < 10}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Send Verification OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyNumberOtp} className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                  <span>Enter OTP sent to +91 {newUpiNumber}. Use demo code: </span>
                  <strong className="font-mono font-bold">{simulatedOtp}</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="9182"
                    maxLength={4}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpInput.length < 4}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Verify & Update UPI Number
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Change Primary VPA Modal */}
      {showChangePrimaryVpaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4"
          >
            <button
              onClick={() => setShowChangePrimaryVpaModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Select Primary VPA</h3>
              <p className="text-xs text-slate-500">
                Incoming UPI transfers will resolve to this default handle.
              </p>
            </div>

            <div className="space-y-2">
              {upiProfile.linkedVpas.map((vpa) => (
                <button
                  key={vpa}
                  type="button"
                  onClick={() => handleSetPrimaryVpa(vpa)}
                  className={`w-full p-3 rounded-xl border text-left font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    vpa === upiProfile.primaryVpa
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <span>{vpa}</span>
                  {vpa === upiProfile.primaryVpa ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white">
                      Current Primary
                    </span>
                  ) : (
                    <span className="text-xs text-blue-600 font-semibold">Select</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add New VPA Handle Modal */}
      {showAddVpaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4"
          >
            <button
              onClick={() => setShowAddVpaModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Create New VPA Handle</h3>
              <p className="text-xs text-slate-500">
                Choose a custom username for your DocPay UPI address.
              </p>
            </div>

            <form onSubmit={handleAddNewVpa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI Username
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newVpaHandle}
                    onChange={(e) => setNewVpaHandle(e.target.value)}
                    placeholder="dasthagiri.pro"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newVpaSuffix}
                    onChange={(e) => setNewVpaSuffix(e.target.value)}
                    className="px-2.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                  >
                    <option value="@upi">@upi</option>
                    <option value="@hdfcbank">@hdfcbank</option>
                    <option value="@sbi">@sbi</option>
                    <option value="@axis">@axis</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newVpaHandle.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Create VPA Handle
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Payment link & QR copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};
