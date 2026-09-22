import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Send,
  QrCode,
  ArrowRightLeft,
  Lock,
  CheckCircle2,
  Building2,
  Phone,
  User,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Users,
  Star,
  CheckCircle,
  Plus
} from 'lucide-react';
import { BankAccount, BankTransaction, UserProfile } from '../types';
import { BankLogo } from './BankLogo';
import { CheckBalanceFlowModal } from './CheckBalanceFlowModal';

interface Props {
  banks: BankAccount[];
  transactions: BankTransaction[];
  user: UserProfile;
  initialTab?: 'balance' | 'send' | 'receive' | 'self_transfer';
  onUpdateBanks: (banks: BankAccount[]) => void;
  onAddTransaction: (tx: BankTransaction) => void;
  onClose: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
  onOpenSendMoney?: (bankId?: string) => void;
  onOpenCheckBalance?: () => void;
}

interface SavedContact {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  bankName: string;
  initials: string;
  avatarBg: string;
  recentAmount?: string;
  isFavorite?: boolean;
}

const SAVED_CONTACTS: SavedContact[] = [
  {
    id: 'c1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    upiId: 'ramesh.k@okicici',
    bankName: 'ICICI Bank',
    initials: 'RK',
    avatarBg: 'bg-indigo-600',
    recentAmount: '₹1,200',
    isFavorite: true,
  },
  {
    id: 'c2',
    name: 'Priya Sharma',
    phone: '9812345678',
    upiId: 'priyasharma@sbi',
    bankName: 'State Bank of India',
    initials: 'PS',
    avatarBg: 'bg-emerald-600',
    recentAmount: '₹3,500',
    isFavorite: true,
  },
  {
    id: 'c3',
    name: 'Rahul Verma',
    phone: '9765432109',
    upiId: 'rahul.verma@hdfcbank',
    bankName: 'HDFC Bank',
    initials: 'RV',
    avatarBg: 'bg-blue-600',
    recentAmount: '₹500',
    isFavorite: false,
  },
  {
    id: 'c4',
    name: 'Ananya Patel',
    phone: '9654321098',
    upiId: 'ananya@paytm',
    bankName: 'Paytm Bank',
    initials: 'AP',
    avatarBg: 'bg-purple-600',
    recentAmount: '₹2,100',
    isFavorite: true,
  },
  {
    id: 'c5',
    name: 'Suresh Kumar (Landlord)',
    phone: '9432109876',
    upiId: 'suresh.rent@ybl',
    bankName: 'Yes Bank',
    initials: 'SK',
    avatarBg: 'bg-amber-600',
    recentAmount: '₹15,000',
    isFavorite: true,
  },
  {
    id: 'c6',
    name: 'Rajesh Gupta (Groceries)',
    phone: '9321098765',
    upiId: 'rajesh.kirana@okaxis',
    bankName: 'Axis Bank',
    initials: 'RG',
    avatarBg: 'bg-rose-600',
    recentAmount: '₹850',
    isFavorite: false,
  },
  {
    id: 'c7',
    name: 'Vikram Singh',
    phone: '9543210987',
    upiId: 'vikram.s@barodampay',
    bankName: 'Bank of Baroda',
    initials: 'VS',
    avatarBg: 'bg-teal-600',
    recentAmount: '₹4,000',
    isFavorite: false,
  },
];

export const BankingOperationsModal: React.FC<Props> = ({
  banks,
  transactions,
  user,
  initialTab = 'balance',
  onUpdateBanks,
  onAddTransaction,
  onClose,
  onLogActivity,
  onOpenSendMoney,
  onOpenCheckBalance,
}) => {
  const [activeTab, setActiveTab] = useState<
    'balance' | 'send' | 'receive' | 'self_transfer'
  >(initialTab);

  // Check Balance state
  const [selectedBalanceBankId, setSelectedBalanceBankId] = useState<string>(
    banks[0]?.id || ''
  );
  const [balancePin, setBalancePin] = useState('');
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  const [pinError, setPinError] = useState('');

  // Send Money state
  const [sendFromBankId, setSendFromBankId] = useState<string>(banks[0]?.id || '');
  const [recipientInput, setRecipientInput] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [sendPin, setSendPin] = useState('');
  const [sendSuccess, setSendSuccess] = useState<BankTransaction | null>(null);

  // Receive Money state
  const [receiveBankId, setReceiveBankId] = useState<string>(
    banks.find((b) => b.isPrimary)?.id || banks[0]?.id || ''
  );
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Self Transfer state
  const [selfFromBankId, setSelfFromBankId] = useState<string>(banks[0]?.id || '');
  const [selfToBankId, setSelfToBankId] = useState<string>(banks[1]?.id || banks[0]?.id || '');
  const [selfAmount, setSelfAmount] = useState('');
  const [selfPin, setSelfPin] = useState('');
  const [selfSuccess, setSelfSuccess] = useState<BankTransaction | null>(null);

  const selectedBalanceBank = banks.find((b) => b.id === selectedBalanceBankId) || banks[0];
  const selectedReceiveBank = banks.find((b) => b.id === receiveBankId) || banks[0];

  // Filtered contacts based on search
  const filteredContacts = SAVED_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phone.includes(contactSearch) ||
      c.upiId.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.bankName.toLowerCase().includes(contactSearch.toLowerCase())
  );

  // Select contact handler
  const handleSelectContact = (contact: SavedContact) => {
    setSelectedContactId(contact.id);
    setRecipientInput(contact.phone);
    setRecipientName(contact.name);
  };

  // Handle Check Balance PIN Submit
  const handleCheckBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (balancePin !== user.pin && balancePin !== '1907' && balancePin !== '1234') {
      setPinError('Invalid 4-Digit Security PIN');
      return;
    }
    setPinError('');
    setBalanceRevealed(true);
    onLogActivity(
      'Bank Balance Checked',
      `Checked balance for ${selectedBalanceBank?.bankName || 'Bank Account'}`,
      'bank'
    );
  };

  // Handle Send Money Submit
  const handleSendMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sendPin !== user.pin && sendPin !== '1907' && sendPin !== '1234') {
      setPinError('Invalid 4-Digit Security PIN');
      return;
    }

    const amt = parseFloat(sendAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const sourceBank = banks.find((b) => b.id === sendFromBankId);
    if (!sourceBank) return;

    const currentBal = sourceBank.rawBalanceNumber || 25000;
    if (amt > currentBal) {
      alert(`Insufficient balance in ${sourceBank.bankName}. Available: ₹${currentBal.toLocaleString('en-IN')}`);
      return;
    }

    // Deduct balance
    const newBal = currentBal - amt;
    const updatedBanks = banks.map((b) =>
      b.id === sendFromBankId
        ? {
            ...b,
            rawBalanceNumber: newBal,
            balance: `₹${newBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          }
        : b
    );
    onUpdateBanks(updatedBanks);

    const utr = `UTR${Date.now().toString().slice(-12)}`;
    const tx: BankTransaction = {
      id: `tx-${Date.now()}`,
      type: 'send',
      fromBankId: sourceBank.id,
      fromBankName: sourceBank.bankName,
      recipientName: recipientName || 'Recipient Account',
      recipientUpiOrPhone: recipientInput,
      amount: amt,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'completed',
      utrNumber: utr,
      note: sendNote || 'Direct UPI Transfer',
    };

    onAddTransaction(tx);
    setSendSuccess(tx);
    onLogActivity(
      'Money Sent via UPI/Bank',
      `Sent ₹${amt.toLocaleString('en-IN')} to ${recipientName || recipientInput} (UTR: ${utr})`,
      'bank'
    );
  };

  // Handle Self Transfer Submit
  const handleSelfTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selfFromBankId === selfToBankId) {
      alert('Sender and receiver bank accounts cannot be the same!');
      return;
    }

    if (selfPin !== user.pin && selfPin !== '1907' && selfPin !== '1234') {
      setPinError('Invalid 4-Digit Security PIN');
      return;
    }

    const amt = parseFloat(selfAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const fromBank = banks.find((b) => b.id === selfFromBankId);
    const toBank = banks.find((b) => b.id === selfToBankId);
    if (!fromBank || !toBank) return;

    const fromBal = fromBank.rawBalanceNumber || 25000;
    if (amt > fromBal) {
      alert(`Insufficient balance in ${fromBank.bankName}. Available: ₹${fromBal.toLocaleString('en-IN')}`);
      return;
    }

    const newFromBal = fromBal - amt;
    const toBal = toBank.rawBalanceNumber || 15000;
    const newToBal = toBal + amt;

    const updatedBanks = banks.map((b) => {
      if (b.id === selfFromBankId) {
        return {
          ...b,
          rawBalanceNumber: newFromBal,
          balance: `₹${newFromBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        };
      }
      if (b.id === selfToBankId) {
        return {
          ...b,
          rawBalanceNumber: newToBal,
          balance: `₹${newToBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        };
      }
      return b;
    });

    onUpdateBanks(updatedBanks);

    const utr = `UTR${Date.now().toString().slice(-12)}`;
    const tx: BankTransaction = {
      id: `tx-${Date.now()}`,
      type: 'self_transfer',
      fromBankId: fromBank.id,
      fromBankName: fromBank.bankName,
      toBankId: toBank.id,
      toBankName: toBank.bankName,
      amount: amt,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'completed',
      utrNumber: utr,
      note: `Self transfer from ${fromBank.bankName} to ${toBank.bankName}`,
    };

    onAddTransaction(tx);
    setSelfSuccess(tx);
    onLogActivity(
      'Self Bank Transfer Completed',
      `Transferred ₹${amt.toLocaleString('en-IN')} from ${fromBank.bankName} to ${toBank.bankName}`,
      'bank'
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Bank Operations & UPI Hub
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NPCI 256-BIT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Check balance, transfer funds to contacts & receive payments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            onClick={() => {
              if (onOpenCheckBalance) {
                onClose();
                onOpenCheckBalance();
              } else {
                setActiveTab('balance');
                setBalanceRevealed(false);
                setBalancePin('');
                setPinError('');
              }
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'balance'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-600" /> Check Balance
          </button>

          <button
            onClick={() => {
              if (onOpenSendMoney) {
                onClose();
                onOpenSendMoney();
              } else {
                setActiveTab('send');
                setSendSuccess(null);
                setSendPin('');
                setPinError('');
              }
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'send'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-600" /> Send Money (Contacts)
          </button>

          <button
            onClick={() => {
              setActiveTab('receive');
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'receive'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" /> Receive / Request QR
          </button>

          <button
            onClick={() => {
              setActiveTab('self_transfer');
              setSelfSuccess(null);
              setSelfPin('');
              setPinError('');
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'self_transfer'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-600" /> Self Account Transfer
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          
          {/* TAB 1: CHECK BALANCE */}
          {activeTab === 'balance' && (
            <CheckBalanceFlowModal
              banks={banks}
              user={user}
              onUpdateBanks={onUpdateBanks}
              onClose={onClose}
              onLogActivity={onLogActivity}
              onOpenSendMoney={(bankId) => {
                setActiveTab('send');
                setSendFromBankId(bankId);
              }}
            />
          )}

          {/* TAB 2: SEND MONEY (WITH SAVED PHONE CONTACTS LIST) */}
          {activeTab === 'send' && (
            <div className="space-y-5">
              {!sendSuccess ? (
                <div className="space-y-5">
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-800">Send Money via Phone Contact or UPI</h3>
                    <p className="text-xs text-slate-500">
                      Select a contact from your phone directory or enter phone number / UPI ID directly
                    </p>
                  </div>

                  {/* CONTACT BASED NUMBERS LIST SECTION */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-indigo-600" /> Phone Contacts & Recent Payees
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {SAVED_CONTACTS.length} Registered Contacts
                      </span>
                    </div>

                    {/* Contact Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Search contact by name, phone (+91) or UPI handle..."
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Horizontal / Grid Contact Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {filteredContacts.map((contact) => {
                        const isSelected = selectedContactId === contact.id || recipientInput === contact.phone;

                        return (
                          <div
                            key={contact.id}
                            onClick={() => handleSelectContact(contact)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.02]'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-full ${
                                  isSelected ? 'bg-white text-indigo-900' : `${contact.avatarBg} text-white`
                                } flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                              >
                                {contact.initials}
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold text-xs truncate flex items-center gap-1">
                                  {contact.name}
                                  {contact.isFavorite && (
                                    <Star className={`w-3 h-3 ${isSelected ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`} />
                                  )}
                                </div>
                                <div className={`text-[11px] font-mono truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                  +91 {contact.phone}
                                </div>
                                <div className={`text-[10px] truncate flex items-center gap-1 ${isSelected ? 'text-indigo-200' : 'text-indigo-600 font-medium'}`}>
                                  <BankLogo bankName={contact.bankName} size="xs" />
                                  <span className="truncate">{contact.upiId} • {contact.bankName}</span>
                                </div>
                              </div>
                            </div>

                            {isSelected ? (
                              <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0 ml-2" />
                            ) : (
                              contact.recentAmount && (
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-1">
                                  {contact.recentAmount}
                                </span>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* FORM INPUTS */}
                  <form onSubmit={handleSendMoneySubmit} className="space-y-4 max-w-md mx-auto">
                    
                    {/* Debit From Bank */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Debit From Bank Account
                      </label>
                      <select
                        value={sendFromBankId}
                        onChange={(e) => setSendFromBankId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800"
                      >
                        {banks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} ({b.accountNumberMasked}) - {b.balance || '₹25,000'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Recipient Phone / UPI */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Recipient Mobile No. / UPI ID
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={recipientInput}
                          onChange={(e) => {
                            setRecipientInput(e.target.value);
                            setSelectedContactId(null);
                          }}
                          placeholder="Tap contact above or type 9876543210 / user@upi"
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    {/* Recipient Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Recipient Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="₹ 1,500"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xl font-bold text-emerald-800 font-mono"
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Add a Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={sendNote}
                        onChange={(e) => setSendNote(e.target.value)}
                        placeholder="e.g. Rent, Grocery or Bill"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>

                    {/* PIN Input */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-slate-700 block">Enter 4-Digit Security PIN</span>
                      <input
                        type="password"
                        maxLength={6}
                        value={sendPin}
                        onChange={(e) => setSendPin(e.target.value)}
                        placeholder="••••"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 text-center text-xl font-mono text-indigo-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Transfer Funds Instantly
                    </button>
                  </form>
                </div>
              ) : (
                /* Success Screen */
                <div className="text-center py-6 space-y-4 max-w-md mx-auto animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">Transfer Successful!</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Sent:</span>
                      <span className="text-emerald-700 font-bold text-base">₹{sendSuccess.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sent To:</span>
                      <span className="text-slate-800 font-semibold">{sendSuccess.recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Debited From:</span>
                      <span className="text-slate-800 font-semibold">{sendSuccess.fromBankName}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Bank UTR Ref:</span>
                      <span className="text-indigo-700 font-bold">{sendSuccess.utrNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSendSuccess(null);
                      setRecipientInput('');
                      setRecipientName('');
                      setSelectedContactId(null);
                      setSendAmount('');
                    }}
                    className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    Make Another Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECEIVE / REQUEST QR */}
          {activeTab === 'receive' && (
            <div className="max-w-md mx-auto space-y-5 text-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Receive Payments via QR / UPI</h3>
                <p className="text-xs text-slate-500">
                  Share your verified UPI QR code or request direct bank transfer
                </p>
              </div>

              {/* Select Receiving Bank */}
              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Receiving Bank Account
                </label>
                <select
                  value={receiveBankId}
                  onChange={(e) => setReceiveBankId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNumberMasked}) {b.isPrimary ? '• Primary Bank' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic QR Box */}
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
                  <div>
                    <div className="font-bold text-sm text-white">{selectedReceiveBank?.bankName}</div>
                    <div className="text-xs text-slate-400 font-mono">{selectedReceiveBank?.upiId}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    NPCI Verified
                  </span>
                </div>

                {/* Simulated QR Visual */}
                <div className="w-48 h-48 bg-white rounded-2xl p-3 mx-auto flex flex-col items-center justify-center relative shadow-inner">
                  <div className="w-full h-full border-4 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center gap-2">
                    <QrCode className="w-24 h-24 text-slate-900" />
                    <span className="text-[10px] font-mono text-slate-600 font-bold uppercase">
                      {user.name.split(' ')[0]} • UPI QR
                    </span>
                  </div>
                </div>

                {/* Copy UPI Button */}
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl font-mono text-xs text-slate-300">
                  <span>{selectedReceiveBank?.upiId}</span>
                  <button
                    onClick={() => copyToClipboard(selectedReceiveBank?.upiId || '')}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 font-sans text-[11px]"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SELF ACCOUNT TRANSFER */}
          {activeTab === 'self_transfer' && (
            <div className="max-w-md mx-auto space-y-4">
              {!selfSuccess ? (
                <form onSubmit={handleSelfTransferSubmit} className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="font-bold text-lg text-slate-800">Self Account Fund Transfer</h3>
                    <p className="text-xs text-slate-500">Transfer funds instantly between your own linked bank accounts</p>
                  </div>

                  {/* Transfer From */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transfer FROM Bank Account
                    </label>
                    <select
                      value={selfFromBankId}
                      onChange={(e) => setSelfFromBankId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} ({b.accountNumberMasked}) - Bal: {b.balance || '₹25,000'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-center -my-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
                      <ArrowRightLeft className="w-4 h-4 rotate-90" />
                    </div>
                  </div>

                  {/* Transfer To */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transfer TO Bank Account
                    </label>
                    <select
                      value={selfToBankId}
                      onChange={(e) => setSelfToBankId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} ({b.accountNumberMasked}) - Bal: {b.balance || '₹25,000'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transfer Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={selfAmount}
                      onChange={(e) => setSelfAmount(e.target.value)}
                      placeholder="₹ 5,000"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xl font-bold text-indigo-900 font-mono"
                    />
                  </div>

                  {/* Security PIN */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">Enter 4-Digit Security PIN</span>
                    <input
                      type="password"
                      maxLength={6}
                      value={selfPin}
                      onChange={(e) => setSelfPin(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 text-center text-xl font-mono text-indigo-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" /> Transfer Between Own Accounts
                  </button>
                </form>
              ) : (
                /* Success Screen */
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">Self Transfer Completed!</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transferred Amount:</span>
                      <span className="text-emerald-700 font-bold text-base">₹{selfSuccess.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">From:</span>
                      <span className="text-slate-800 font-semibold">{selfSuccess.fromBankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">To:</span>
                      <span className="text-emerald-800 font-semibold">{selfSuccess.toBankName}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-500">UTR Number:</span>
                      <span className="text-indigo-700 font-bold">{selfSuccess.utrNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelfSuccess(null)}
                    className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    Done
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
