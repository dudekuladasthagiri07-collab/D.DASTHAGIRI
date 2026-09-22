import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, Key, Camera, FileText, CheckCircle2, Clock, X, Upload } from 'lucide-react';
import { BankAccount, UserProfile } from '../types';
import { FaceAuthSimulator } from './FaceAuthSimulator';
import { BankLogo } from './BankLogo';

interface Props {
  bank: BankAccount;
  user: UserProfile;
  onClose: () => void;
  onConfirmRemoval: (bankId: string, trackingId: string) => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
}

export const BankRemovalModal: React.FC<Props> = ({
  bank,
  user,
  onClose,
  onConfirmRemoval,
  onLogActivity,
}) => {
  const [step, setStep] = useState<'otp' | 'face' | 'account_details' | 'kyc' | 'reason' | 'confirmation'>('otp');
  
  // State variables for inputs
  const [otp, setOtp] = useState('');
  const [simulatedOtp] = useState('918230');
  const [confirmAccountNo, setConfirmAccountNo] = useState('');
  const [confirmIfsc, setConfirmIfsc] = useState('');
  const [kycFileUploaded, setKycFileUploaded] = useState(false);
  const [kycDocName, setKycDocName] = useState('Aadhaar_KYC_Verification.pdf');
  const [removalReason, setRemovalReason] = useState('Account closed at bank');
  const [customReason, setCustomReason] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== simulatedOtp && otp !== '123456') {
      setErrorMsg(`Invalid OTP code. Use simulated code ${simulatedOtp} or 123456`);
      return;
    }
    setErrorMsg('');
    setStep('face');
  };

  // Step 2: Facial Recognition
  const handleFaceSuccess = () => {
    setStep('account_details');
  };

  // Step 3: Account details input
  const handleVerifyAccountDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAccountNo || confirmAccountNo.length < 4) {
      setErrorMsg('Please enter account number for safety validation');
      return;
    }
    setErrorMsg('');
    setStep('kyc');
  };

  // Step 4: Upload KYC
  const handleKycUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFileUploaded) {
      setKycFileUploaded(true);
    }
    setStep('reason');
  };

  // Step 5: Reason for removal & Submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trackCode = `TRK-RMV-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingId(trackCode);

    onLogActivity(
      'Bank Removal Initiated',
      `Multi-step secure removal submitted for ${bank.bankName} (${bank.accountNumberMasked}). Tracking ID: ${trackCode}`,
      'bank'
    );

    setStep('confirmation');
  };

  const handleFinish = () => {
    onConfirmRemoval(bank.id, trackingId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 relative text-slate-800 shadow-xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-800">Multi-Step Bank Removal Protocol</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bank Target Badge */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2.5">
            <BankLogo bankName={bank.bankName} ifscCode={bank.ifscCode} size="sm" />
            <div>
              <span className="text-slate-500 block text-[10px]">TARGET ACCOUNT</span>
              <span className="font-bold text-slate-800">{bank.bankName}</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-indigo-700 font-bold">{bank.accountNumberMasked}</span>
          </div>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-6 px-1">
          <span className={step === 'otp' ? 'text-rose-600 font-bold underline' : ''}>1. OTP</span>
          <span>→</span>
          <span className={step === 'face' ? 'text-rose-600 font-bold underline' : ''}>2. Face</span>
          <span>→</span>
          <span className={step === 'account_details' ? 'text-rose-600 font-bold underline' : ''}>3. Details</span>
          <span>→</span>
          <span className={step === 'kyc' ? 'text-rose-600 font-bold underline' : ''}>4. KYC</span>
          <span>→</span>
          <span className={step === 'reason' ? 'text-rose-600 font-bold underline' : ''}>5. Reason</span>
        </div>

        {/* STEP 1: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 border border-rose-100">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Step 1: Security Mobile OTP</h4>
              <p className="text-xs text-slate-500 mt-1">To prevent unauthorized account delinking</p>
            </div>

            <div className="p-3 bg-slate-50 border border-rose-200 rounded-xl text-xs space-y-1">
              <span className="text-rose-700 font-semibold block">💬 REMOVAL OTP CODE</span>
              <span className="font-mono text-amber-700 font-bold text-sm">Simulated OTP: {simulatedOtp}</span>
            </div>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 918230"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-center text-xl font-mono text-emerald-700 focus:outline-none focus:border-indigo-500"
            />

            {errorMsg && <p className="text-xs text-rose-600 text-center font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm"
            >
              Verify OTP & Proceed to Face Scan
            </button>
          </form>
        )}

        {/* STEP 2: Facial Biometric Scan */}
        {step === 'face' && (
          <div>
            <FaceAuthSimulator
              onSuccess={handleFaceSuccess}
              title="Step 2: Facial Biometric Consent"
              subtitle="Hold device steady to prove live account owner identity"
            />
          </div>
        )}

        {/* STEP 3: Confirm Account Details */}
        {step === 'account_details' && (
          <form onSubmit={handleVerifyAccountDetails} className="space-y-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Step 3: Confirm Account Details</h4>
              <p className="text-xs text-slate-500 mt-1">Enter details of the bank account you wish to unbind</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Full Account Number</label>
              <input
                type="text"
                value={confirmAccountNo}
                onChange={(e) => setConfirmAccountNo(e.target.value)}
                placeholder="Enter account number"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={confirmIfsc || bank.ifscCode}
                onChange={(e) => setConfirmIfsc(e.target.value.toUpperCase())}
                placeholder={bank.ifscCode}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-600 text-center font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm"
            >
              Confirm Account Details & Proceed to KYC Upload
            </button>
          </form>
        )}

        {/* STEP 4: Upload KYC Documents */}
        {step === 'kyc' && (
          <form onSubmit={handleKycUpload} className="space-y-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Step 4: Upload KYC Verification Proof</h4>
              <p className="text-xs text-slate-500 mt-1">Mandatory for audit trailing bank account disconnections</p>
            </div>

            <div
              onClick={() => setKycFileUploaded(true)}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 transition-colors"
            >
              <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                {kycFileUploaded ? `Attached: ${kycDocName}` : 'Click to Upload Aadhaar / PAN KYC Scan'}
              </p>
              <p className="text-[10px] text-slate-500">Supports PDF, PNG, JPG (Max 5MB)</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm"
            >
              Proceed to Reason Selection
            </button>
          </form>
        )}

        {/* STEP 5: Reason for removal */}
        {step === 'reason' && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Step 5: Reason for Account Removal</h4>
              <p className="text-xs text-slate-500 mt-1">Help banking gateways classify disconnections</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Reason</label>
              <select
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              >
                <option value="Account closed at bank">Account closed at bank</option>
                <option value="Switching primary account">Switching primary bank account</option>
                <option value="Security concerns or fraudulent activity suspicion">Security concerns / Fraud suspicion</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            {removalReason === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Details</label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Explain reason..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-800"
                />
              </div>
            )}

            <button
              type="submit"
              id="submit-removal-request-btn"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm"
            >
              Submit Disconnection Request
            </button>
          </form>
        )}

        {/* STEP 6: Confirmation Screen & Tracking */}
        {step === 'confirmation' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="font-bold text-base text-slate-800">Disconnection Request Received</h4>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 font-mono text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking Code:</span>
                <span className="text-emerald-700 font-bold">{trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Target:</span>
                <span className="text-slate-800 font-semibold">{bank.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Status:</span>
                <span className="text-amber-800 flex items-center gap-1 font-sans font-semibold">
                  <Clock className="w-3 h-3" /> Processing Removal (1-2 Hours)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              A notification has been automatically dispatched to {bank.bankName} nodal security officer.
            </p>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs"
            >
              Complete & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
