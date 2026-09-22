/**
 * Real-time NPCI / UPI Central Directory Bank Name Lookup Simulator
 * Resolves phone numbers and UPI IDs to official bank-registered account holder names.
 */

export interface BankLookupResult {
  phone: string;
  bankRegisteredName: string;
  nickName?: string;
  bankName: string;
  vpa: string;
  ifscPrefix: string;
  isNpciVerified: boolean;
  accountType: string;
  avatarBg: string;
}

export const KNOWN_BANK_DIRECTORIES: Record<string, BankLookupResult> = {
  // User's specific requested test number
  '9390240130': {
    phone: '9390240130',
    bankRegisteredName: 'Giri',
    nickName: 'Giri (Dudekula Dasthagiri)',
    bankName: 'State Bank of India',
    vpa: '9390240130@sbi',
    ifscPrefix: 'SBIN0002148',
    isNpciVerified: true,
    accountType: 'Savings Account',
    avatarBg: 'bg-emerald-600',
  },
  '9876543210': {
    phone: '9876543210',
    bankRegisteredName: 'Ramesh Kumar',
    nickName: 'Ramesh',
    bankName: 'ICICI Bank',
    vpa: 'ramesh.k@okicici',
    ifscPrefix: 'ICIC0001024',
    isNpciVerified: true,
    accountType: 'Savings Account',
    avatarBg: 'bg-indigo-600',
  },
  '9812345678': {
    phone: '9812345678',
    bankRegisteredName: 'Priya Sharma',
    nickName: 'Priya',
    bankName: 'State Bank of India',
    vpa: 'priyasharma@sbi',
    ifscPrefix: 'SBIN0004921',
    isNpciVerified: true,
    accountType: 'Savings Account',
    avatarBg: 'bg-emerald-600',
  },
  '9765432109': {
    phone: '9765432109',
    bankRegisteredName: 'Rahul Verma',
    nickName: 'Rahul',
    bankName: 'HDFC Bank',
    vpa: 'rahul.verma@hdfcbank',
    ifscPrefix: 'HDFC0000128',
    isNpciVerified: true,
    accountType: 'Salary Account',
    avatarBg: 'bg-blue-600',
  },
  '9654321098': {
    phone: '9654321098',
    bankRegisteredName: 'Ananya Patel',
    nickName: 'Ananya',
    bankName: 'Axis Bank',
    vpa: 'ananya.p@okaxis',
    ifscPrefix: 'UTIB0000542',
    isNpciVerified: true,
    accountType: 'Savings Account',
    avatarBg: 'bg-purple-600',
  },
  '9432109876': {
    phone: '9432109876',
    bankRegisteredName: 'Suresh Kumar',
    nickName: 'Suresh Landlord',
    bankName: 'Yes Bank',
    vpa: 'suresh.rent@ybl',
    ifscPrefix: 'YESB0000892',
    isNpciVerified: true,
    accountType: 'Current Account',
    avatarBg: 'bg-amber-600',
  },
  '9321098765': {
    phone: '9321098765',
    bankRegisteredName: 'Rajesh Gupta',
    nickName: 'Rajesh Kirana Store',
    bankName: 'Bank of Baroda',
    vpa: 'rajesh.kirana@barodampay',
    ifscPrefix: 'BARB0BENGAL',
    isNpciVerified: true,
    accountType: 'Current Account',
    avatarBg: 'bg-rose-600',
  },
  '9876501234': {
    phone: '9876501234',
    bankRegisteredName: 'Suresh Verma (Unknown Sender)',
    nickName: 'Suresh Verma',
    bankName: 'HDFC Bank',
    vpa: '9876501234@hdfcbank',
    ifscPrefix: 'HDFC0000452',
    isNpciVerified: true,
    accountType: 'Savings Account',
    avatarBg: 'bg-teal-600',
  },
};

const RANDOM_FIRST_NAMES = [
  'Amit', 'Deepak', 'Kavita', 'Manish', 'Naveen', 'Pooja', 'Rohit', 'Sunil', 'Vijay', 'Vikas', 'Venkatesh', 'Chaitanya', 'Sai Kumar'
];
const RANDOM_LAST_NAMES = [
  'Reddy', 'Sharma', 'Rao', 'Patil', 'Gupta', 'Singh', 'Naidu', 'Choudhary', 'Mehta', 'Das', 'Iyer', 'Nair'
];
const RANDOM_BANKS = [
  { name: 'State Bank of India', ifsc: 'SBIN0001000', vpaSuffix: '@sbi' },
  { name: 'HDFC Bank', ifsc: 'HDFC0000200', vpaSuffix: '@hdfcbank' },
  { name: 'ICICI Bank', ifsc: 'ICIC0000300', vpaSuffix: '@icici' },
  { name: 'Axis Bank', ifsc: 'UTIB0000400', vpaSuffix: '@axis' },
  { name: 'Kotak Mahindra Bank', ifsc: 'KKBK0000500', vpaSuffix: '@kotak' },
  { name: 'Punjab National Bank', ifsc: 'PUNB0000600', vpaSuffix: '@pnb' },
  { name: 'Canara Bank', ifsc: 'CNRB0000700', vpaSuffix: '@cnrb' },
];

/**
 * Real-time lookup as user types:
 * Returns the exact bank registered name for known numbers like 9390240130 -> 'Giri'
 * Or deterministically generates a verified bank name for any 10-digit mobile number.
 */
export function lookupBankRegisteredName(phoneOrUpi: string): BankLookupResult | null {
  const clean = phoneOrUpi.replace(/[^a-zA-Z0-9@.]/g, '').trim();

  // If input has @ (UPI handle)
  if (clean.includes('@')) {
    const handle = clean.split('@')[0];
    // Check if handle matches phone
    if (KNOWN_BANK_DIRECTORIES[handle]) {
      return KNOWN_BANK_DIRECTORIES[handle];
    }
    const capHandle = handle.charAt(0).toUpperCase() + handle.slice(1);
    return {
      phone: clean,
      bankRegisteredName: `${capHandle}`,
      nickName: capHandle,
      bankName: 'UPI Central Switch Account',
      vpa: clean,
      ifscPrefix: 'NPCI0001001',
      isNpciVerified: true,
      accountType: 'Verified UPI VPA',
      avatarBg: 'bg-indigo-600',
    };
  }

  // Extract trailing 10 digits
  const digits = clean.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const tenDigits = digits.slice(-10);

  if (KNOWN_BANK_DIRECTORIES[tenDigits]) {
    return KNOWN_BANK_DIRECTORIES[tenDigits];
  }

  // Deterministic generator based on digit sum so same number always produces same bank name
  const seed = tenDigits.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  const firstName = RANDOM_FIRST_NAMES[seed % RANDOM_FIRST_NAMES.length];
  const lastName = RANDOM_LAST_NAMES[(seed * 3) % RANDOM_LAST_NAMES.length];
  const bank = RANDOM_BANKS[seed % RANDOM_BANKS.length];

  return {
    phone: tenDigits,
    bankRegisteredName: `${firstName} ${lastName}`,
    nickName: firstName,
    bankName: bank.name,
    vpa: `${tenDigits}${bank.vpaSuffix}`,
    ifscPrefix: bank.ifsc,
    isNpciVerified: true,
    accountType: 'Savings Account',
    avatarBg: 'bg-blue-600',
  };
}
