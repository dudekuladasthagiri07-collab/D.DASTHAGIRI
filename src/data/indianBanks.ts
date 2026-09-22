export interface IndianBankInfo {
  id: string;
  name: string;
  code: string;
  category: 'Public Sector' | 'Private Sector' | 'Payments Bank' | 'Small Finance Bank' | 'Regional Rural Bank';
  defaultIfsc: string;
  defaultBranch: string;
  bgColor: string;
  textColor: string;
}

export const ALL_INDIAN_BANKS: IndianBankInfo[] = [
  // Public Sector Banks
  { id: 'sbi', name: 'State Bank of India (SBI)', code: 'SBIN', category: 'Public Sector', defaultIfsc: 'SBIN0004567', defaultBranch: 'Koramangala 4th Block Branch, Bengaluru', bgColor: 'bg-blue-600', textColor: 'text-white' },
  { id: 'pnb', name: 'Punjab National Bank (PNB)', code: 'PUNB', category: 'Public Sector', defaultIfsc: 'PUNB0102000', defaultBranch: 'Connaught Place Branch, New Delhi', bgColor: 'bg-red-700', textColor: 'text-white' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BARB', category: 'Public Sector', defaultIfsc: 'BARB0VJINDIRA', defaultBranch: 'Jubilee Hills Branch, Hyderabad', bgColor: 'bg-orange-600', textColor: 'text-white' },
  { id: 'canara', name: 'Canara Bank', code: 'CNRB', category: 'Public Sector', defaultIfsc: 'CNRB0001890', defaultBranch: 'T. Nagar Main Branch, Chennai', bgColor: 'bg-sky-600', textColor: 'text-white' },
  { id: 'union', name: 'Union Bank of India', code: 'UBIN', category: 'Public Sector', defaultIfsc: 'UBIN0531234', defaultBranch: 'Fort Branch, Mumbai', bgColor: 'bg-red-600', textColor: 'text-white' },
  { id: 'bankofindia', name: 'Bank of India', code: 'BKID', category: 'Public Sector', defaultIfsc: 'BKID0001000', defaultBranch: 'Star House Branch, Bandra, Mumbai', bgColor: 'bg-blue-800', textColor: 'text-white' },
  { id: 'indianbank', name: 'Indian Bank', code: 'IDIB', category: 'Public Sector', defaultIfsc: 'IDIB000M001', defaultBranch: 'Anna Salai Main Branch, Chennai', bgColor: 'bg-indigo-700', textColor: 'text-white' },
  { id: 'centralbank', name: 'Central Bank of India', code: 'CBIN', category: 'Public Sector', defaultIfsc: 'CBIN0280001', defaultBranch: 'Nariman Point Branch, Mumbai', bgColor: 'bg-cyan-700', textColor: 'text-white' },
  { id: 'indianoverseas', name: 'Indian Overseas Bank (IOB)', code: 'IOBA', category: 'Public Sector', defaultIfsc: 'IOBA0000001', defaultBranch: 'Cathedral Road Branch, Chennai', bgColor: 'bg-blue-700', textColor: 'text-white' },
  { id: 'ucobank', name: 'UCO Bank', code: 'UCBA', category: 'Public Sector', defaultIfsc: 'UCBA0000001', defaultBranch: 'BTM Layout Branch, Bengaluru', bgColor: 'bg-teal-700', textColor: 'text-white' },
  { id: 'bankofmaharashtra', name: 'Bank of Maharashtra', code: 'MAHB', category: 'Public Sector', defaultIfsc: 'MAHB0000001', defaultBranch: 'Shivajinagar Branch, Pune', bgColor: 'bg-emerald-700', textColor: 'text-white' },
  { id: 'punjabandsind', name: 'Punjab & Sind Bank', code: 'PSIB', category: 'Public Sector', defaultIfsc: 'PSIB0000001', defaultBranch: 'Rajendra Place Branch, New Delhi', bgColor: 'bg-amber-700', textColor: 'text-white' },

  // Private Sector Banks
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', category: 'Private Sector', defaultIfsc: 'HDFC0001234', defaultBranch: 'MG Road Main Branch, Bengaluru', bgColor: 'bg-blue-900', textColor: 'text-white' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC', category: 'Private Sector', defaultIfsc: 'ICIC0000892', defaultBranch: 'Indiranagar 100ft Road Branch, Bengaluru', bgColor: 'bg-amber-600', textColor: 'text-white' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', category: 'Private Sector', defaultIfsc: 'AXIS0000120', defaultBranch: 'Whitefield IT Park Branch, Bengaluru', bgColor: 'bg-rose-800', textColor: 'text-white' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KKBK', category: 'Private Sector', defaultIfsc: 'KKBK0000450', defaultBranch: 'Somajiguda Branch, Hyderabad', bgColor: 'bg-red-600', textColor: 'text-white' },
  { id: 'indusind', name: 'IndusInd Bank', code: 'INDB', category: 'Private Sector', defaultIfsc: 'INDB0000001', defaultBranch: 'Peddar Road Branch, Mumbai', bgColor: 'bg-red-900', textColor: 'text-white' },
  { id: 'yesbank', name: 'Yes Bank', code: 'YESB', category: 'Private Sector', defaultIfsc: 'YESB0000001', defaultBranch: 'Chanakyapuri Branch, New Delhi', bgColor: 'bg-blue-700', textColor: 'text-white' },
  { id: 'idfcfirst', name: 'IDFC FIRST Bank', code: 'IDFB', category: 'Private Sector', defaultIfsc: 'IDFB0010001', defaultBranch: 'Kalyan Nagar Branch, Bengaluru', bgColor: 'bg-rose-700', textColor: 'text-white' },
  { id: 'federal', name: 'Federal Bank', code: 'FDRL', category: 'Private Sector', defaultIfsc: 'FDRL0001001', defaultBranch: 'Aluva Main Branch, Kochi', bgColor: 'bg-amber-700', textColor: 'text-white' },
  { id: 'southindian', name: 'South Indian Bank', code: 'SIBL', category: 'Private Sector', defaultIfsc: 'SIBL0000001', defaultBranch: 'Thrissur Main Branch, Kerala', bgColor: 'bg-red-800', textColor: 'text-white' },
  { id: 'karurvysya', name: 'Karur Vysya Bank', code: 'KVBL', category: 'Private Sector', defaultIfsc: 'KVBL0001001', defaultBranch: 'Karur Central Branch, Tamil Nadu', bgColor: 'bg-violet-700', textColor: 'text-white' },
  { id: 'cityunion', name: 'City Union Bank', code: 'CIUB', category: 'Private Sector', defaultIfsc: 'CIUB0000001', defaultBranch: 'Kumbakonam Main Branch, Tamil Nadu', bgColor: 'bg-blue-800', textColor: 'text-white' },
  { id: 'bandhan', name: 'Bandhan Bank', code: 'BDBL', category: 'Private Sector', defaultIfsc: 'BDBL0000001', defaultBranch: 'Salt Lake Sector V Branch, Kolkata', bgColor: 'bg-cyan-800', textColor: 'text-white' },
  { id: 'rbl', name: 'RBL Bank', code: 'RATN', category: 'Private Sector', defaultIfsc: 'RATN0000001', defaultBranch: 'Lower Parel Branch, Mumbai', bgColor: 'bg-blue-900', textColor: 'text-white' },
  { id: 'jammuandkashmir', name: 'J&K Bank', code: 'JAKA', category: 'Private Sector', defaultIfsc: 'JAKA0000001', defaultBranch: 'Residency Road Branch, Srinagar', bgColor: 'bg-teal-800', textColor: 'text-white' },
  { id: 'karnataka', name: 'Karnataka Bank', code: 'KARB', category: 'Private Sector', defaultIfsc: 'KARB0000001', defaultBranch: 'Kodialbail Branch, Mangaluru', bgColor: 'bg-indigo-800', textColor: 'text-white' },

  // Payments Banks & Digital Banks
  { id: 'ippb', name: 'India Post Payments Bank (IPPB)', code: 'IPOS', category: 'Payments Bank', defaultIfsc: 'IPOS0000001', defaultBranch: 'Central Postal Operations, New Delhi', bgColor: 'bg-red-600', textColor: 'text-white' },
  { id: 'paytm', name: 'Paytm Payments Bank', code: 'PYTM', category: 'Payments Bank', defaultIfsc: 'PYTM0123456', defaultBranch: 'Noida Sector 5, Uttar Pradesh', bgColor: 'bg-sky-500', textColor: 'text-white' },
  { id: 'airtel', name: 'Airtel Payments Bank', code: 'AIRP', category: 'Payments Bank', defaultIfsc: 'AIRP0000001', defaultBranch: 'Gurugram Cyber City, Haryana', bgColor: 'bg-red-700', textColor: 'text-white' },
  { id: 'jiopayments', name: 'Jio Payments Bank', code: 'JIOP', category: 'Payments Bank', defaultIfsc: 'JIOP0000001', defaultBranch: 'RIL BKC Complex, Mumbai', bgColor: 'bg-blue-600', textColor: 'text-white' },
  { id: 'fino', name: 'Fino Payments Bank', code: 'FINO', category: 'Payments Bank', defaultIfsc: 'FINO0000001', defaultBranch: 'Juinagar Branch, Navi Mumbai', bgColor: 'bg-purple-700', textColor: 'text-white' },

  // Small Finance Banks
  { id: 'au_sfb', name: 'AU Small Finance Bank', code: 'AUBL', category: 'Small Finance Bank', defaultIfsc: 'AUBL0002100', defaultBranch: 'Jaipur Main Branch, Rajasthan', bgColor: 'bg-amber-600', textColor: 'text-white' },
  { id: 'equitas', name: 'Equitas Small Finance Bank', code: 'ESFB', category: 'Small Finance Bank', defaultIfsc: 'ESFB0001001', defaultBranch: 'Spencer Plaza Branch, Chennai', bgColor: 'bg-blue-600', textColor: 'text-white' },
  { id: 'ujjivan', name: 'Ujjivan Small Finance Bank', code: 'UJVN', category: 'Small Finance Bank', defaultIfsc: 'UJVN0001001', defaultBranch: 'Koramangala Branch, Bengaluru', bgColor: 'bg-indigo-600', textColor: 'text-white' },
  { id: 'jana', name: 'Jana Small Finance Bank', code: 'JSFB', category: 'Small Finance Bank', defaultIfsc: 'JSFB0001001', defaultBranch: 'Richmond Road Branch, Bengaluru', bgColor: 'bg-purple-800', textColor: 'text-white' },

  // Regional Rural Banks
  { id: 'andhra_pragathi', name: 'Andhra Pragathi Grameena Bank', code: 'APGB', category: 'Regional Rural Bank', defaultIfsc: 'APGB0000001', defaultBranch: 'Kadapa Main Branch, Andhra Pradesh', bgColor: 'bg-emerald-700', textColor: 'text-white' },
  { id: 'karnataka_gramin', name: 'Karnataka Gramin Bank', code: 'PKGB', category: 'Regional Rural Bank', defaultIfsc: 'PKGB0000001', defaultBranch: 'Ballari Central Branch, Karnataka', bgColor: 'bg-yellow-700', textColor: 'text-white' },
  { id: 'telangana_grameena', name: 'Telangana Grameena Bank', code: 'TGBX', category: 'Regional Rural Bank', defaultIfsc: 'TGBX0000001', defaultBranch: 'Nampally Branch, Hyderabad', bgColor: 'bg-teal-700', textColor: 'text-white' },
  { id: 'kerala_gramin', name: 'Kerala Gramin Bank', code: 'KLGB', category: 'Regional Rural Bank', defaultIfsc: 'KLGB0000001', defaultBranch: 'Malappuram Head Office, Kerala', bgColor: 'bg-green-800', textColor: 'text-white' }
];

export function getBranchFromIfsc(ifscCode: string): { bankName: string; branchName: string } {
  const code = (ifscCode || '').trim().toUpperCase();
  if (code.length < 4) {
    return { bankName: 'Unknown Bank', branchName: 'Branch details auto-fetching...' };
  }

  const prefix = code.substring(0, 4);
  const matchedBank = ALL_INDIAN_BANKS.find(b => b.code === prefix);

  const suffix = code.length >= 7 ? code.substring(code.length - 4) : '1001';

  let resolvedBranch = 'Central Metropolitan Branch';
  if (suffix === '1234') resolvedBranch = 'MG Road Main Branch, Bengaluru';
  else if (suffix === '4567') resolvedBranch = 'Koramangala 4th Block Branch, Bengaluru';
  else if (suffix === '0892') resolvedBranch = 'Indiranagar 100ft Road Branch, Bengaluru';
  else if (suffix === '0120') resolvedBranch = 'Whitefield IT Park Branch, Bengaluru';
  else if (suffix === '2000') resolvedBranch = 'Connaught Place Branch, New Delhi';
  else if (suffix === '2100') resolvedBranch = 'Jubilee Hills Branch, Hyderabad';
  else resolvedBranch = `Branch Code #${suffix} - Sector Branch`;

  return {
    bankName: matchedBank ? matchedBank.name : `${prefix} Partner Bank`,
    branchName: matchedBank ? `${matchedBank.defaultBranch} (Code: ${code})` : `${resolvedBranch} (IFSC: ${code})`
  };
}

export function fetchAccountsByAadhaarOrMobile(identifier: string, userName: string) {
  const cleanId = identifier.replace(/\s+/g, '');
  const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return [
    {
      id: `discovered-sbi-${Date.now()}-1`,
      bankName: 'State Bank of India (SBI)',
      accountType: 'savings' as const,
      accountNumberMasked: '•••• •••• ' + (cleanId.length >= 4 ? cleanId.slice(-4) : '3891'),
      fullAccountNumber: '308291048' + (cleanId.length >= 4 ? cleanId.slice(-4) : '3891'),
      ifscCode: 'SBIN0004567',
      branchName: 'Koramangala 4th Block Branch, Bengaluru',
      upiId: `${cleanName || 'user'}@sbi`,
      balance: '₹48,200.00',
      rawBalanceNumber: 48200,
      isPrimary: false,
      verificationStatus: 'verified' as const,
      verificationCode: 'VER-SBI-AADH-' + Math.floor(1000 + Math.random() * 9000),
      linkedDate: new Date().toISOString().split('T')[0],
      riskLevel: 'low' as const,
      verificationNoticeSent: true,
    },
    {
      id: `discovered-pnb-${Date.now()}-2`,
      bankName: 'Punjab National Bank (PNB)',
      accountType: 'savings' as const,
      accountNumberMasked: '•••• •••• ' + (cleanId.length >= 4 ? (parseInt(cleanId.slice(-4)) + 12).toString().slice(-4) : '7721'),
      fullAccountNumber: '0912000100' + (cleanId.length >= 4 ? (parseInt(cleanId.slice(-4)) + 12).toString().slice(-4) : '7721'),
      ifscCode: 'PUNB0102000',
      branchName: 'Connaught Place Branch, New Delhi',
      upiId: `${cleanName || 'user'}@pnb`,
      balance: '₹18,450.00',
      rawBalanceNumber: 18450,
      isPrimary: false,
      verificationStatus: 'verified' as const,
      verificationCode: 'VER-PNB-AADH-' + Math.floor(1000 + Math.random() * 9000),
      linkedDate: new Date().toISOString().split('T')[0],
      riskLevel: 'low' as const,
      verificationNoticeSent: true,
    },
    {
      id: `discovered-canara-${Date.now()}-3`,
      bankName: 'Canara Bank',
      accountType: 'savings' as const,
      accountNumberMasked: '•••• •••• ' + (cleanId.length >= 4 ? (parseInt(cleanId.slice(-4)) + 45).toString().slice(-4) : '9018'),
      fullAccountNumber: '1200984712' + (cleanId.length >= 4 ? (parseInt(cleanId.slice(-4)) + 45).toString().slice(-4) : '9018'),
      ifscCode: 'CNRB0001890',
      branchName: 'T. Nagar Main Branch, Chennai',
      upiId: `${cleanName || 'user'}@canara`,
      balance: '₹29,800.00',
      rawBalanceNumber: 29800,
      isPrimary: false,
      verificationStatus: 'verified' as const,
      verificationCode: 'VER-CNRB-AADH-' + Math.floor(1000 + Math.random() * 9000),
      linkedDate: new Date().toISOString().split('T')[0],
      riskLevel: 'low' as const,
      verificationNoticeSent: true,
    }
  ];
}
