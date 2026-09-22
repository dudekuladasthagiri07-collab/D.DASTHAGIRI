import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Phone,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Send,
  RefreshCw,
  QrCode,
  CreditCard,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { BankAccount, UserProfile } from '../../types';
import { BankLogo } from '../BankLogo';
import { lookupBankRegisteredName, BankLookupResult } from '../../utils/bankLookup';

interface Props {
  banks: BankAccount[];
  user: UserProfile;
  onInitiatePayment: (recipient: {
    name: string;
    phoneOrUpi: string;
    bankName: string;
    avatarBg?: string;
  }) => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
  onTriggerNotification?: (params: {
    title: string;
    message: string;
    type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
    status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
    category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
  }) => void;
}

const FREQUENT_PAYEES = [
  {
    phone: '9390240130',
    name: 'Giri',
    fullName: 'Giri (Dudekula Dasthagiri)',
    bankName: 'State Bank of India',
    vpa: '9390240130@sbi',
    avatarBg: 'bg-emerald-600',
    initials: 'G',
    lastPaid: '₹1,500 yesterday',
  },
  {
    phone: '9876543210',
    name: 'Ramesh Kumar',
    fullName: 'Ramesh Kumar',
    bankName: 'ICICI Bank',
    vpa: 'ramesh.k@okicici',
    avatarBg: 'bg-indigo-600',
    initials: 'RK',
    lastPaid: '₹1,200 3d ago',
  },
  {
    phone: '9812345678',
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    bankName: 'State Bank of India',
    vpa: 'priyasharma@sbi',
    avatarBg: 'bg-teal-600',
    initials: 'PS',
    lastPaid: '₹3,500 last week',
  },
  {
    phone: '9765432109',
    name: 'Rahul Verma',
    fullName: 'Rahul Verma',
    bankName: 'HDFC Bank',
    vpa: 'rahul.verma@hdfcbank',
    avatarBg: 'bg-blue-600',
    initials: 'RV',
    lastPaid: '₹500 on 28 Aug',
  },
  {
    phone: '9654321098',
    name: 'Ananya Patel',
    fullName: 'Ananya Patel',
    bankName: 'Axis Bank',
    vpa: 'ananya.p@okaxis',
    avatarBg: 'bg-purple-600',
    initials: 'AP',
    lastPaid: '₹2,100 on 24 Aug',
  },
];

export const UpiContactsPaySection: React.FC<Props> = ({
  banks,
  user,
  onInitiatePayment,
  onLogActivity,
  onTriggerNotification,
}) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>('9390240130');
  const [lookupResult, setLookupResult] = useState<BankLookupResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Incoming transfer simulator state
  const [incomingSimNumber, setIncomingSimNumber] = useState<string>('9390240130');
  const [incomingSimAmount, setIncomingSimAmount] = useState<string>('500');
  const [incomingLogs, setIncomingLogs] = useState<Array<{
    id: string;
    phone: string;
    bankRegisteredName: string;
    bankName: string;
    amount: number;
    timestamp: string;
    utr: string;
  }>>([
    {
      id: 'inc-1',
      phone: '9390240130',
      bankRegisteredName: 'Giri',
      bankName: 'State Bank of India',
      amount: 1500,
      timestamp: 'Today, 02:45 PM',
      utr: 'UPI/939024013082',
    },
    {
      id: 'inc-2',
      phone: '9876501234',
      bankRegisteredName: 'Suresh Verma (Unknown Sender)',
      bankName: 'HDFC Bank',
      amount: 750,
      timestamp: 'Yesterday, 11:20 AM',
      utr: 'UPI/489102849182',
    },
  ]);

  // Primary Bank of Sender
  const primaryBank = banks.find((b) => b.isPrimary) || banks[0];

  // Auto-trigger lookup as user types
  useEffect(() => {
    const cleanDigits = phoneNumberInput.replace(/\D/g, '');
    if (cleanDigits.length >= 10 || phoneNumberInput.includes('@')) {
      setIsVerifying(true);
      const timer = setTimeout(() => {
        const res = lookupBankRegisteredName(phoneNumberInput);
        setLookupResult(res);
        setIsVerifying(false);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setLookupResult(null);
      setIsVerifying(false);
    }
  }, [phoneNumberInput]);

  // Handle Pay Recipient
  const handlePayRecipient = (rec: {
    name: string;
    phoneOrUpi: string;
    bankName: string;
    avatarBg?: string;
  }) => {
    onLogActivity(
      'UPI Recipient Selected',
      `Initiated payment to ${rec.name} (${rec.phoneOrUpi}) verified via ${rec.bankName}`,
      'bank'
    );
    onInitiatePayment(rec);
  };

  // Simulate Incoming Payment from Unknown or Known Number
  const handleSimulateIncomingPayment = () => {
    const clean = incomingSimNumber.trim() || '9390240130';
    const num = parseFloat(incomingSimAmount) || 500;
    const lookup = lookupBankRegisteredName(clean);
    const resolvedName = lookup ? lookup.bankRegisteredName : `Unknown Sender (+91 ${clean})`;
    const resolvedBank = lookup ? lookup.bankName : 'UPI Direct Gateway';
    const utr = `UPI/${Date.now().toString().slice(-12)}`;

    const newLog = {
      id: `inc-${Date.now()}`,
      phone: clean,
      bankRegisteredName: resolvedName,
      bankName: resolvedBank,
      amount: num,
      timestamp: 'Just now',
      utr,
    };

    setIncomingLogs((prev) => [newLog, ...prev]);

    if (onTriggerNotification) {
      onTriggerNotification({
        title: `₹${num.toLocaleString('en-IN')} Received from ${resolvedName}`,
        message: `Phone: +91 ${clean} • Official name as per ${resolvedBank}: "${resolvedName}" credited to ${primaryBank?.bankName || 'HDFC Bank'}. UTR: ${utr}`,
        type: 'bank',
        status: 'success',
        category: 'bank',
      });
    }

    onLogActivity(
      'Money Received via UPI',
      `Received ₹${num} from ${resolvedName} (+91 ${clean}) as per bank records. UTR: ${utr}`,
      'bank'
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER EXPLAINER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-extrabold border border-emerald-500/40">
              NPCI REAL-TIME MAPPER
            </span>
            <span className="text-xs text-indigo-200 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Bank Registered Name Lookup
            </span>
          </div>
          <h2 className="text-lg font-black text-white">Send Money to Contacts & UPI Numbers</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-0.5">
            Type any 10-digit mobile number to automatically resolve the recipient's official name registered with their bank (e.g. typing <strong>9390240130</strong> reveals <strong>Giri</strong>).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPhoneNumberInput('9390240130');
            }}
            className="px-3 py-1.5 bg-indigo-600/60 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-400/40 cursor-pointer shadow-xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Test 9390240130 (Giri)</span>
          </button>
        </div>
      </div>

      {/* SENDER DETAILS BANNER (Shows sender's bank-linked phone and name as per request) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 font-black">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm">{user.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  SENDER (YOU)
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Bank-Linked Mobile: <span className="font-bold text-slate-800">+91 9390240130</span> • UPI ID: <span className="font-bold text-slate-800">dasthagiri@upi</span>
              </p>
            </div>
          </div>

          {primaryBank && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <BankLogo bankName={primaryBank.bankName} ifscCode={primaryBank.ifscCode} size="sm" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Debited From Primary</p>
                <p className="text-xs font-black text-slate-800">{primaryBank.bankName} ({primaryBank.accountNumberMasked})</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN SEARCH & REAL-TIME BANK RESOLUTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          Enter Mobile Number or UPI ID
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Phone className="w-4 h-4 text-indigo-600" />
          </div>
          <input
            type="text"
            value={phoneNumberInput}
            onChange={(e) => setPhoneNumberInput(e.target.value)}
            placeholder="Enter 10-digit mobile (e.g. 9390240130) or name@upi"
            className="w-full pl-10 pr-24 py-3 bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-slate-900 font-mono font-bold text-base focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
          {phoneNumberInput && (
            <button
              onClick={() => setPhoneNumberInput('')}
              className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* VERIFICATION STATUS CARD */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-800 font-medium"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Checking NPCI Unified Payment Central Directory for registered name...</span>
            </motion.div>
          )}

          {!isVerifying && lookupResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white border-2 border-emerald-500/40 rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${lookupResult.avatarBg} text-white flex items-center justify-center font-black text-lg shadow-sm`}>
                    {lookupResult.bankRegisteredName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-slate-900">
                        {lookupResult.bankRegisteredName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-white" /> VERIFIED AS PER BANK
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Official Account Name: <span className="font-bold text-slate-900">{lookupResult.bankRegisteredName}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Linked Bank: <span className="font-bold text-slate-800">{lookupResult.bankName}</span> • VPA: <span className="font-bold text-slate-800">{lookupResult.vpa}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePayRecipient({
                      name: lookupResult.bankRegisteredName,
                      phoneOrUpi: lookupResult.phone,
                      bankName: lookupResult.bankName,
                      avatarBg: lookupResult.avatarBg,
                    })
                  }
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Pay {lookupResult.nickName || lookupResult.bankRegisteredName}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NPCI Verified Direct Account
                </span>
                <span className="font-mono text-slate-500">
                  Phone: +91 {lookupResult.phone}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FREQUENT RECIPIENTS ROW */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Frequent & Saved Contacts</h3>
          <span className="text-[11px] text-slate-500 font-medium">Names verified as per Bank</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {FREQUENT_PAYEES.map((payee) => (
            <button
              key={payee.phone}
              type="button"
              onClick={() => {
                setPhoneNumberInput(payee.phone);
                handlePayRecipient({
                  name: payee.name,
                  phoneOrUpi: payee.phone,
                  bankName: payee.bankName,
                  avatarBg: payee.avatarBg,
                });
              }}
              className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-2xl ${payee.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform`}>
                {payee.initials}
              </div>
              <div className="min-w-0 w-full">
                <p className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600">
                  {payee.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {payee.phone}
                </p>
                <p className="text-[9px] text-indigo-600 font-semibold truncate mt-0.5">
                  {payee.bankName}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* UNKNOWN PERSON INCOMING PAYMENT SIMULATION */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Incoming Payment Resolution Engine</span>
            </div>
            <h3 className="text-base font-black text-white">
              Unknown Sender? View Official Name as per Bank
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              When an unknown person sends money to your account, DocPay queries the bank switch to identify and display their real bank-registered name instead of just an unrecognized phone number.
            </p>
          </div>
        </div>

        {/* Interactive Simulator Bar */}
        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-3">
          <p className="text-xs font-bold text-slate-300">
            Simulate an incoming transfer from any phone number:
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={incomingSimNumber}
              onChange={(e) => setIncomingSimNumber(e.target.value)}
              placeholder="Sender phone (e.g. 9390240130)"
              className="w-full sm:w-56 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400"
            />
            <div className="flex items-center gap-1 w-full sm:w-36">
              <span className="text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={incomingSimAmount}
                onChange={(e) => setIncomingSimAmount(e.target.value)}
                placeholder="Amount"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              onClick={handleSimulateIncomingPayment}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Simulate Money Received</span>
            </button>
          </div>
        </div>

        {/* INCOMING LEDGER DISPLAY */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Recent Received Transfers (Bank Name Resolved)</span>
            <span>{incomingLogs.length} Received</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {incomingLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-sm">
                        {log.bankRegisteredName}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                        BANK NAME
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      +91 {log.phone} • {log.bankName} • {log.timestamp}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      UTR: {log.utr}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    +₹{log.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-slate-400">Credited to Primary</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
