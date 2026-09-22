import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, X, Check, Lock, AlertCircle } from 'lucide-react';
import { PaymentCard } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: PaymentCard) => void;
}

export const AddCardModal: React.FC<Props> = ({ isOpen, onClose, onAddCard }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('29');
  const [cvv, setCvv] = useState('');
  const [cardCategory, setCardCategory] = useState<'debit' | 'credit'>('debit');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Format 16-digit card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    setError('');
  };

  const detectNetwork = (rawDigits: string): { type: 'visa' | 'rupay' | 'mastercard'; label: 'Visa' | 'RuPay' | 'Mastercard' } => {
    if (rawDigits.startsWith('4')) return { type: 'visa', label: 'Visa' };
    if (rawDigits.startsWith('60') || rawDigits.startsWith('65') || rawDigits.startsWith('81') || rawDigits.startsWith('50')) {
      return { type: 'rupay', label: 'RuPay' };
    }
    return { type: 'mastercard', label: 'Mastercard' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = cardNumber.replace(/\s/g, '');
    if (digitsOnly.length < 16) {
      setError('Please enter a valid 16-digit card number');
      return;
    }
    if (!holderName.trim()) {
      setError('Please enter the name on card');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter 3-digit CVV');
      return;
    }

    const { type, label } = detectNetwork(digitsOnly);
    const last4 = digitsOnly.slice(-4);

    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      cardType: type,
      cardNetwork: label,
      cardNumberMasked: `${label} •••• ${last4}`,
      last4,
      holderName: holderName.toUpperCase(),
      expiryMonth,
      expiryYear,
      bankName,
      cardCategory,
      isDefault: false,
    };

    onAddCard(newCard);
    onClose();
  };

  const digits = cardNumber.replace(/\s/g, '');
  const network = detectNetwork(digits);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900">Add New Card</h3>
            <p className="text-xs text-slate-500">Tokenized & secured under RBI card storage rules</p>
          </div>
        </div>

        {/* Live Card Preview */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl mb-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded text-white/90">
              {cardCategory.toUpperCase()} CARD
            </span>
            <span className="text-sm font-black italic tracking-wide text-amber-300">
              {network.label}
            </span>
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-sm sm:text-base font-mono font-bold tracking-widest">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
          </div>

          <div className="flex justify-between items-end text-xs">
            <div>
              <p className="text-[9px] text-white/60 uppercase">Card Holder</p>
              <p className="font-bold truncate max-w-[180px]">{holderName || 'CARDHOLDER NAME'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/60 uppercase">Expires</p>
              <p className="font-mono font-bold">{expiryMonth}/{expiryYear}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4532 8912 3456 9012"
              maxLength={19}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name on Card</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g. DUDEKULA DASTHAGIRI"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Month</label>
              <select
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <select
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {['26', '27', '28', '29', '30', '31', '32'].map((y) => (
                  <option key={y} value={y}>20{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                placeholder="•••"
                maxLength={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
              <select
                value={cardCategory}
                onChange={(e) => setCardCategory(e.target.value as 'debit' | 'credit')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="debit">Debit Card</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="SBI">SBI</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Card credentials are tokenized in compliance with RBI safety standards.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" /> Save & Tokenize Card
          </button>
        </form>
      </motion.div>
    </div>
  );
};
