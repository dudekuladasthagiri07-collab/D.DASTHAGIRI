import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock3,
  Coins,
  Smartphone,
  Search,
  UserPlus,
  Send,
  RefreshCw,
  Star,
  Award,
  Crown,
  ChevronRight,
  X,
  MessageSquare,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Filter,
  DollarSign,
  Zap,
  HelpCircle,
  ChevronUp,
} from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onLogActivity?: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  initials: string;
  avatarBg: string;
}

export interface InvitationRecord {
  id: string;
  contactId?: string;
  name: string;
  detail: string;
  initials: string;
  avatarBg: string;
  status: 'Pending' | 'Sent' | 'Accepted';
  sentDate: string;
  txnsCompleted?: number; // 0..3
  rewardEarned?: number; // ₹250
}

export interface RewardTier {
  id: string;
  name: string;
  requiredReferrals: number;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  bgGradient: string;
  icon: 'star' | 'shield' | 'award' | 'crown';
  bonusPerReferral: string;
  exclusivePerks: string[];
}

export interface RedemptionRecord {
  id: string;
  rewardName: string;
  category: 'Direct Bank Cash' | 'Shopping Voucher' | 'UPI Lite Booster' | 'Gold Bonus' | 'VIP Pass';
  date: string;
  pointsOrValue: string;
  status: 'Claimed' | 'Processing' | 'Delivered';
  refNumber: string;
}

export interface FAQItem {
  id: string;
  question: string;
  category: 'Referral Terms' | 'Reward Expiry' | 'Tier Logic' | 'Payouts';
  badgeColor: string;
  answer: string;
  highlights?: string[];
}

// 1. Simulated Contacts
const MOCK_CONTACTS: ContactItem[] = [
  { id: 'c-1', name: 'Aarav Sharma', phone: '+91 98450 11223', email: 'aarav.sharma@example.com', initials: 'AS', avatarBg: 'bg-indigo-600' },
  { id: 'c-2', name: 'Priya Reddy', phone: '+91 98765 43210', email: 'priya.reddy@example.com', initials: 'PR', avatarBg: 'bg-emerald-600' },
  { id: 'c-3', name: 'Rahul Kumar', phone: '+91 97412 88990', email: 'rahul.kumar@example.com', initials: 'RK', avatarBg: 'bg-amber-600' },
  { id: 'c-4', name: 'Ananya Singh', phone: '+91 99887 66554', email: 'ananya.singh@example.com', initials: 'AS', avatarBg: 'bg-violet-600' },
  { id: 'c-5', name: 'Vikram Rao', phone: '+91 93456 77889', email: 'vikram.rao@example.com', initials: 'VR', avatarBg: 'bg-cyan-600' },
  { id: 'c-6', name: 'Sneha Patel', phone: '+91 91234 56789', email: 'sneha.patel@example.com', initials: 'SP', avatarBg: 'bg-rose-600' },
  { id: 'c-7', name: 'Karthik Varma', phone: '+91 99001 88223', email: 'karthik.v@example.com', initials: 'KV', avatarBg: 'bg-teal-600' },
  { id: 'c-8', name: 'Swati Hegde', phone: '+91 98765 11009', email: 'swati.h@example.com', initials: 'SH', avatarBg: 'bg-fuchsia-600' },
  { id: 'c-9', name: 'Rohan Gupta', phone: '+91 98111 22334', email: 'rohan.g@example.com', initials: 'RG', avatarBg: 'bg-blue-600' },
  { id: 'c-10', name: 'Meera Nair', phone: '+91 97222 33445', email: 'meera.n@example.com', initials: 'MN', avatarBg: 'bg-orange-600' },
];

// 2. Recharts Performance Data (Past 30 days)
const REFERRAL_CHART_DATA = [
  { day: 'Jul 28', invitations: 4, referrals: 1, rewards: 250 },
  { day: 'Aug 01', invitations: 7, referrals: 2, rewards: 500 },
  { day: 'Aug 05', invitations: 9, referrals: 3, rewards: 750 },
  { day: 'Aug 09', invitations: 14, referrals: 5, rewards: 1250 },
  { day: 'Aug 13', invitations: 11, referrals: 6, rewards: 1500 },
  { day: 'Aug 17', invitations: 18, referrals: 8, rewards: 2000 },
  { day: 'Aug 21', invitations: 15, referrals: 9, rewards: 2250 },
  { day: 'Aug 24', invitations: 22, referrals: 11, rewards: 2750 },
  { day: 'Aug 27', invitations: 19, referrals: 12, rewards: 3000 },
];

// 3. Reward Tiers
const REWARD_TIERS: RewardTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    requiredReferrals: 0,
    badgeColor: 'bg-slate-700 text-slate-200',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-700',
    bgGradient: 'from-slate-900 to-slate-950',
    icon: 'shield',
    bonusPerReferral: '₹200 / referral',
    exclusivePerks: ['₹101 Welcome Bonus', 'Standard Referral Link', 'Basic In-App Tracker'],
  },
  {
    id: 'bronze',
    name: 'Bronze',
    requiredReferrals: 5,
    badgeColor: 'bg-amber-800 text-amber-100',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-700/60',
    bgGradient: 'from-amber-950/80 to-slate-950',
    icon: 'star',
    bonusPerReferral: '₹225 / referral',
    exclusivePerks: ['₹250 Cash Reward Unlock', 'Priority WhatsApp Share', '2x Scratch Cards'],
  },
  {
    id: 'silver',
    name: 'Silver',
    requiredReferrals: 10,
    badgeColor: 'bg-slate-300 text-slate-950 font-black',
    textColor: 'text-slate-200',
    borderColor: 'border-slate-400',
    bgGradient: 'from-slate-800 to-slate-950',
    icon: 'award',
    bonusPerReferral: '₹250 / referral',
    exclusivePerks: ['Early Access to Bill Deals', 'Zero-Fee Bank Transfers', 'Exclusive Merchant Coupons'],
  },
  {
    id: 'gold',
    name: 'Gold',
    requiredReferrals: 20,
    badgeColor: 'bg-amber-400 text-slate-950 font-black',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-400',
    bgGradient: 'from-amber-950 via-yellow-950 to-slate-950',
    icon: 'crown',
    bonusPerReferral: '₹300 / referral',
    exclusivePerks: ['₹750 Milestone Bonus', '5% Extra 24K Digital Gold', 'Dedicated Priority Helpline'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    requiredReferrals: 35,
    badgeColor: 'bg-purple-400 text-slate-950 font-black',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    icon: 'crown',
    bonusPerReferral: '₹400 / referral',
    exclusivePerks: ['VIP Lifetime Concierge', '₹2,000 Cash Milestone', 'Uncapped Monthly Rewards'],
  },
];

// 4. Initial Redemption Records
const INITIAL_REDEMPTIONS: RedemptionRecord[] = [
  {
    id: 'rdm-1',
    rewardName: '₹750 Direct Bank Cash',
    category: 'Direct Bank Cash',
    date: '25 Aug 2026, 04:30 PM',
    pointsOrValue: '₹750.00',
    status: 'Delivered',
    refNumber: 'NPCI-UTR-89102348',
  },
  {
    id: 'rdm-2',
    rewardName: 'Swiggy & Zomato ₹250 Voucher',
    category: 'Shopping Voucher',
    date: '18 Aug 2026, 11:20 AM',
    pointsOrValue: '₹250.00',
    status: 'Claimed',
    refNumber: 'VCH-FEAST-77192',
  },
  {
    id: 'rdm-3',
    rewardName: '₹250 UPI Lite Booster',
    category: 'UPI Lite Booster',
    date: '08 Aug 2026, 02:15 PM',
    pointsOrValue: '₹250.00',
    status: 'Delivered',
    refNumber: 'NPCI-UTR-66190234',
  },
  {
    id: 'rdm-4',
    rewardName: '24K Digital Gold Bonus (0.5g)',
    category: 'Gold Bonus',
    date: 'Today, 10:15 AM',
    pointsOrValue: '₹3,500.00',
    status: 'Processing',
    refNumber: 'AUG-GLD-998124',
  },
];

// 5. Frequently Asked Questions (FAQ) Data
const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-how-it-works',
    question: 'How does the SecurePay Refer & Earn program work step-by-step?',
    category: 'Referral Terms',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    answer:
      'Earning with SecurePay takes just 4 simple steps: 1) Share your unique referral link or code via WhatsApp, SMS, or Quick Share; 2) Your friend downloads SecurePay and creates an account using your code; 3) Your friend links their bank account via UPI; 4) Once your friend completes 3 eligible UPI payments (₹50+ each), you instantly receive ₹250 directly in your bank account, and your friend gets ₹101 welcome cash!',
    highlights: [
      'Step 1: Share your referral link or code',
      'Step 2: Friend signs up using your code',
      'Step 3: Friend links UPI bank account',
      'Step 4: Friend completes 3 payments (min ₹50 each) to trigger ₹250 payout',
    ],
  },
  {
    id: 'faq-terms',
    question: 'What qualifies as an eligible payment for the referral bonus?',
    category: 'Referral Terms',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    answer:
      'A referral is considered successfully completed when your invited friend registers on SecurePay using your unique referral code or link, links any valid UPI bank account, and completes at least 3 unique peer-to-peer (P2P), QR scan, or merchant transactions (minimum ₹50 each). Once the 3rd payment settles, your reward credit of ₹250 is instantly disbursed.',
    highlights: [
      'Friend must sign up using your code/link',
      'Requires 3 unique payments of ₹50 or more',
      'Transactions must be completed within 30 days of registration',
      'Both inviter and referee receive reward credits',
    ],
  },
  {
    id: 'faq-code-forgot',
    question: 'What if my friend forgot to enter my referral code during registration?',
    category: 'Referral Terms',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    answer:
      'No problem! If your friend signed up without entering a referral code, they have a 7-day grace period. They can navigate to Profile > Referrals > "Apply Referral Code", input your unique code, and link you as their referrer before making their 3rd qualifying transaction.',
    highlights: [
      '7-day grace period from account creation',
      'Referee can enter code in Profile settings',
      'Must be applied before completing the 3rd transaction',
    ],
  },
  {
    id: 'faq-payouts',
    question: 'How and when are referral cash earnings deposited into my bank?',
    category: 'Payouts',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    answer:
      'All referral cash earnings are settled in real-time via NPCI IMPS/UPI direct transfer straight to your designated primary bank account. You can also choose to redeem accumulated rewards as merchant vouchers or convert them into 24K 99.9% pure digital gold at real-time live market bullion rates.',
    highlights: [
      'Instant settlement via NPCI 24x7 IMPS / UPI rails',
      'Zero transfer fees or deduction charges',
      'Full tracking with official UTR reference numbers',
      'Detailed ledger available in your Redemption History tab',
    ],
  },
  {
    id: 'faq-tiers',
    question: 'How are Reward Tiers calculated and upgraded?',
    category: 'Tier Logic',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    answer:
      'Your tier is calculated automatically based on your cumulative count of verified successful referrals. As you reach milestone thresholds (Starter: 0+, Bronze: 5+, Silver: 10+, Gold: 20+, Platinum: 35+), you permanently unlock higher cash bonuses per referral (up to ₹400/ref), fee exemptions, priority payment routes, and exclusive milestone payouts.',
    highlights: [
      'Upgrades happen in real-time immediately upon qualification',
      'Tier status is permanent and does not downgrade at month-end',
      'Higher tiers increase the base earning per new referral',
      'Unlocks VIP priority customer concierge and booster cards',
    ],
  },
  {
    id: 'faq-expiry',
    question: 'What is the policy on reward expiry and voucher validity?',
    category: 'Reward Expiry',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    answer:
      'Direct Bank Cash rewards never expire once credited to your verified primary account or SecurePay wallet. Third-party brand gift vouchers (e.g., Swiggy, Amazon, Zomato) are valid for 12 months from the date of issuance. Digital Gold allocations are vaulted indefinitely in regulated MMTC-PAMP vaults with zero holding fees for the first 5 years.',
    highlights: [
      'Direct bank cash transfers: Never expire',
      'Brand merchant vouchers: 12 months validity from issue',
      'Digital gold allocations: Indefinite vaulting with insured security',
      'Unclaimed promo scratch cards: Valid for 90 days',
    ],
  },
  {
    id: 'faq-limits',
    question: 'Are there any caps or limits on how many friends I can refer?',
    category: 'Referral Terms',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    answer:
      'There is no limit to the number of friends, family members, or colleagues you can invite to SecurePay! All accounts in good standing enjoy unlimited invites. Monthly earnings caps are waived once you achieve the Gold and Platinum tier status.',
    highlights: [
      'Unlimited contacts and share sheet invitations',
      'No cap on lifetime accumulated referral earnings',
      'Transparent verification status for all pending invites',
    ],
  },
  {
    id: 'faq-merchant',
    question: 'Can I refer small business owners or merchant accounts?',
    category: 'Payouts',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    answer:
      'Yes! SecurePay supports merchant referrals. When a shopkeeper, retailer, or business owner registers with your code and accepts their first 5 customer payments via SecurePay QR, you earn a specialized Merchant Onboarding Bonus of ₹500 directly in your account.',
    highlights: [
      '₹500 bonus for each verified business/merchant referral',
      'Merchant must accept 5 QR customer payments',
      'No limit on merchant invitations',
    ],
  },
];

export const ReferEarnModule: React.FC<Props> = ({ user, onLogActivity }) => {
  const referralCode = `${(user?.name || 'USER').split(' ')[0].toUpperCase()}250`;
  const shareUrl = `https://securepay.app/invite/${referralCode}`;
  const whatsappText = `Hey! 👋 Join me on SecurePay with my referral code *${referralCode}* to get *₹101 instant welcome cash* directly to your bank account! 💰\n\nDownload & Register here: ${shareUrl}`;

  // Contact list and invitations
  const [contacts] = useState<ContactItem[]>(MOCK_CONTACTS);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [invitations, setInvitations] = useState<InvitationRecord[]>([
    {
      id: 'inv-1',
      name: 'Vikram Sharma',
      detail: '+91 98765 43210',
      initials: 'VS',
      avatarBg: 'bg-emerald-600',
      status: 'Accepted',
      sentDate: 'Yesterday, 4:30 PM',
      txnsCompleted: 3,
      rewardEarned: 250,
    },
    {
      id: 'inv-2',
      name: 'Ananya Patel',
      detail: '+91 98123 44556',
      initials: 'AP',
      avatarBg: 'bg-indigo-600',
      status: 'Accepted',
      sentDate: '04 Aug 2026',
      txnsCompleted: 3,
      rewardEarned: 250,
    },
    {
      id: 'inv-3',
      name: 'Rahul Verma',
      detail: '+91 97654 88990',
      initials: 'RV',
      avatarBg: 'bg-amber-600',
      status: 'Pending',
      sentDate: 'Today, 10:15 AM',
      txnsCompleted: 2,
    },
    {
      id: 'inv-4',
      name: 'Priya Sundaram',
      detail: '+91 96543 22334',
      initials: 'PS',
      avatarBg: 'bg-violet-600',
      status: 'Pending',
      sentDate: 'Today, 11:45 AM',
      txnsCompleted: 1,
    },
    {
      id: 'inv-5',
      name: 'Karthik Raja',
      detail: 'karthik.r@example.com',
      initials: 'KR',
      avatarBg: 'bg-cyan-600',
      status: 'Sent',
      sentDate: '24 Aug 2026',
    },
  ]);

  // Redemptions
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>(INITIAL_REDEMPTIONS);
  const [redemptionFilter, setRedemptionFilter] = useState<'All' | 'Claimed' | 'Processing' | 'Delivered'>('All');

  // UI Modals & State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'referrals' | 'invitations'>('both');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Accordion FAQ State
  const [expandedFaqIds, setExpandedFaqIds] = useState<string[]>(['faq-terms', 'faq-tiers']);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<'All' | 'Referral Terms' | 'Reward Expiry' | 'Tier Logic' | 'Payouts'>('All');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Dynamic successful referral count (from accepted referrals + historical baseline)
  const successfulReferrals = useMemo(() => {
    const acceptedCount = invitations.filter((i) => i.status === 'Accepted' && (i.txnsCompleted ?? 0) >= 3).length;
    return Math.max(12, 10 + acceptedCount);
  }, [invitations]);

  // Calculate current Tier
  const currentTierIndex = useMemo(() => {
    let idx = 0;
    REWARD_TIERS.forEach((tier, i) => {
      if (successfulReferrals >= tier.requiredReferrals) {
        idx = i;
      }
    });
    return idx;
  }, [successfulReferrals]);

  const currentTier = REWARD_TIERS[currentTierIndex];
  const nextTier = REWARD_TIERS[currentTierIndex + 1] || null;

  const progressToNextTier = useMemo(() => {
    if (!nextTier) return 100;
    const diffNeeded = nextTier.requiredReferrals - currentTier.requiredReferrals;
    const currentProgress = successfulReferrals - currentTier.requiredReferrals;
    return Math.min(100, Math.max(0, Math.round((currentProgress / diffNeeded) * 100)));
  }, [currentTier, nextTier, successfulReferrals]);

  const referralsNeeded = nextTier ? Math.max(0, nextTier.requiredReferrals - successfulReferrals) : 0;

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phone.includes(contactSearch) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase())
    );
  }, [contacts, contactSearch]);

  // Filtered invitations
  const pendingInvitations = useMemo(() => {
    return invitations.filter((i) => i.status === 'Pending' || i.status === 'Sent');
  }, [invitations]);

  // Filtered redemptions
  const filteredRedemptions = useMemo(() => {
    if (redemptionFilter === 'All') return redemptions;
    return redemptions.filter((r) => r.status === redemptionFilter);
  }, [redemptions, redemptionFilter]);

  // Filtered FAQ Items
  const filteredFaqItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = faqCategoryFilter === 'All' || item.category === faqCategoryFilter;
      const matchesSearch =
        item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(faqSearchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [faqCategoryFilter, faqSearchQuery]);

  const toggleFaqItem = (faqId: string) => {
    setExpandedFaqIds((prev) =>
      prev.includes(faqId) ? prev.filter((id) => id !== faqId) : [...prev, faqId]
    );
  };

  const expandAllFaqs = () => {
    setExpandedFaqIds(filteredFaqItems.map((item) => item.id));
  };

  const collapseAllFaqs = () => {
    setExpandedFaqIds([]);
  };

  // Notification helper
  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Toggle contact selection
  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const toggleSelectAllContacts = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    }
  };

  // Open share sheet for selected contacts
  const handleOpenShareSheet = () => {
    if (selectedContactIds.length === 0) {
      showToast('Please select at least one contact to invite.');
      return;
    }
    setIsShareModalOpen(true);
  };

  // Send invitations from share sheet
  const handleConfirmSendInvites = () => {
    const selectedList = contacts.filter((c) => selectedContactIds.includes(c.id));
    if (selectedList.length === 0) return;

    const newInvites: InvitationRecord[] = selectedList.map((contact) => ({
      id: `inv-${Date.now()}-${contact.id}`,
      contactId: contact.id,
      name: contact.name,
      detail: contact.phone || contact.email,
      initials: contact.initials,
      avatarBg: contact.avatarBg,
      status: 'Pending',
      sentDate: 'Just now',
      txnsCompleted: 0,
    }));

    setInvitations((prev) => [...newInvites, ...prev]);
    setIsShareModalOpen(false);
    showToast(`Invitations sent to ${selectedList.length} contacts! Track progress below.`);

    onLogActivity?.(
      'Batch Referral Invitations Sent',
      `Sent invitations to ${selectedList.length} contacts with code ${referralCode}.`,
      'portal'
    );

    setSelectedContactIds([]);
  };

  // Resend invitation
  const handleResendInvite = (inviteId: string) => {
    setInvitations((prev) =>
      prev.map((item) =>
        item.id === inviteId ? { ...item, sentDate: 'Just now', status: 'Sent' } : item
      )
    );
    showToast('Invitation reminder resent successfully.');
    onLogActivity?.(
      'Referral Reminder Resent',
      `Resent referral invite reminder with code ${referralCode}.`,
      'portal'
    );
  };

  // Copy code & link
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`Referral code ${referralCode} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    onLogActivity?.(
      'Referral Link Shared via WhatsApp',
      `Shared referral code ${referralCode} via WhatsApp share sheet.`,
      'portal'
    );
  };

  // Quick Share via Web Share API (native mobile sharing intent) with fallback
  const handleQuickShare = async () => {
    const shareTitle = 'Join SecurePay & Earn ₹101 Instant Welcome Cash!';
    const shareMessage = `Hey! 👋 Use my referral code ${referralCode} on SecurePay to get ₹101 instant welcome cash directly in your bank account! Complete 3 UPI payments to unlock rewards. 💰`;
    
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareMessage}\n\nDownload & Register: ${shareUrl}`,
          url: shareUrl,
        });
        showToast('Shared successfully via native share menu!');
        onLogActivity?.(
          'Quick Share Native Intent Triggered',
          `Shared referral link and code ${referralCode} via native mobile sharing intent.`,
          'portal'
        );
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User dismissed the native share dialog
          return;
        }
      }
    }

    // Fallback: Copy pre-written invitation message with link to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareMessage}\n\nDownload & Register: ${shareUrl}`);
      showToast('Referral invite message & link copied to clipboard!');
    } else {
      handleCopyLink();
    }

    onLogActivity?.(
      'Quick Share Message Copied',
      `Referral invite message with code ${referralCode} copied to clipboard (Native share unsupported).`,
      'portal'
    );
  };

  // Claim/Redeem Reward
  const handleClaimReward = (rewardName: string, pointsVal: string, category: RedemptionRecord['category']) => {
    const newRedemption: RedemptionRecord = {
      id: `rdm-${Date.now()}`,
      rewardName,
      category,
      date: 'Just now',
      pointsOrValue: pointsVal,
      status: 'Processing',
      refNumber: `NPCI-UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    setRedemptions((prev) => [newRedemption, ...prev]);
    setIsRedeemModalOpen(false);
    showToast(`Claimed ${rewardName}! Processing transfer to your primary bank account.`);

    onLogActivity?.(
      `Reward Claimed: ${rewardName}`,
      `Redeemed reward ${pointsVal}. Status: Processing with Ref ${newRedemption.refNumber}.`,
      'bank'
    );
  };

  return (
    <div id="refer-and-earn-dashboard" className="space-y-6 pb-12 text-slate-100 animate-fade-in">
      
      {/* GLOBAL TOAST NOTICE */}
      {notificationMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-500/70 text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-snug">{notificationMsg}</span>
          <button
            onClick={() => setNotificationMsg(null)}
            className="ml-auto p-1 rounded-lg hover:bg-emerald-900/60 text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HERO REWARD BANNER & METRICS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-2xl border border-indigo-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              Referral & Rewards Hub • Direct Bank Credits
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Invite Friends. <span className="text-amber-400 underline decoration-emerald-400">Earn ₹250</span> Cash & Tier Perks!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Share your referral code. When your friends complete their first <strong className="text-emerald-300">3 UPI payments</strong>, you earn <strong className="text-amber-300 font-extrabold">₹250 direct cash</strong> & unlock exclusive reward tiers!
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleQuickShare}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-900/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95 ring-2 ring-indigo-400/30"
                title="Quick Share referral link via native mobile sheet"
              >
                <Share2 className="w-4 h-4" />
                Quick Share
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                Share via WhatsApp
              </button>
              <button
                onClick={() => setIsRedeemModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Gift className="w-4 h-4" />
                Redeem Rewards
              </button>
              <button
                onClick={() => document.getElementById('refer-earn-faq-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="View Referral Program Terms & FAQs"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Program FAQs
              </button>
            </div>
          </div>

          {/* Quick Invite Code Box */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" /> Your Invite Code
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE & UNLIMITED
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-indigo-900/60 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Referral Code</span>
                <span className="text-xl font-black text-amber-400 font-mono tracking-wider">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono truncate max-w-[170px]">{shareUrl}</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleQuickShare}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  title="Share referral link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Successful Referrals</div>
            <div className="text-xl sm:text-2xl font-black text-white">{successfulReferrals}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">+18% this month</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rewards Earned</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">₹{(successfulReferrals * 250).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-400 font-medium">Direct Bank Credits</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Invitations Sent</div>
            <div className="text-xl sm:text-2xl font-black text-white">{invitations.length + 38}</div>
            <div className="text-[11px] text-amber-400 font-semibold">{pendingInvitations.length} Pending Actions</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Tier</div>
            <div className="text-xl sm:text-2xl font-black text-purple-300">{currentTier.name}</div>
            <div className="text-[11px] text-slate-400 font-medium">
              {nextTier ? `${referralsNeeded} more to ${nextTier.name}` : 'Highest Tier Reached'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN: REFERRAL PERFORMANCE CHART & REWARD TIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (7 Cols): Recharts Referral Performance Chart */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Referral Performance Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Activity, invitations & successful conversions over previous month
              </p>
            </div>

            {/* Metric Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveChartMetric('both')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeChartMetric === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveChartMetric('referrals')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeChartMetric === 'referrals' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Referrals
              </button>
              <button
                onClick={() => setActiveChartMetric('invitations')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeChartMetric === 'invitations' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Invitations
              </button>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REFERRAL_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInvites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                {(activeChartMetric === 'both' || activeChartMetric === 'invitations') && (
                  <Area
                    type="monotone"
                    dataKey="invitations"
                    name="Invitations Sent"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorInvites)"
                  />
                )}
                {(activeChartMetric === 'both' || activeChartMetric === 'referrals') && (
                  <Area
                    type="monotone"
                    dataKey="referrals"
                    name="Successful Referrals (₹)"
                    stroke="#34d399"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorReferrals)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Conversion Rate: <strong className="text-emerald-300">54.5%</strong>
            </span>
            <span className="text-emerald-400 font-bold">
              +42% Growth vs Last Month
            </span>
          </div>
        </div>

        {/* RIGHT (5 Cols): Reward Tiers & Progress */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Reward Tiers & Progress
                </h3>
                <p className="text-xs text-slate-400">Unlock higher cashback & VIP perks</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${currentTier.badgeColor}`}>
                {currentTier.name} Tier
              </span>
            </div>

            {/* Current Level Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Current: <strong className="text-white">{successfulReferrals} Referrals</strong>
                </span>
                {nextTier ? (
                  <span className="text-amber-400 font-bold">
                    {nextTier.requiredReferrals} Needed for {nextTier.name}
                  </span>
                ) : (
                  <span className="text-purple-400 font-bold">Max Tier Reached!</span>
                )}
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextTier}%` }}
                />
              </div>

              {nextTier && (
                <p className="text-[11px] text-slate-400 leading-snug">
                  Only <strong className="text-amber-300">{referralsNeeded} more referral{referralsNeeded !== 1 ? 's' : ''}</strong> to unlock <strong className="text-white">{nextTier.name}</strong> perks ({nextTier.bonusPerReferral})!
                </p>
              )}
            </div>

            {/* Tiers List */}
            <div className="space-y-2 mt-4 max-h-56 overflow-y-auto pr-1">
              {REWARD_TIERS.map((tier, idx) => {
                const isUnlocked = successfulReferrals >= tier.requiredReferrals;
                const isCurrent = idx === currentTierIndex;

                return (
                  <div
                    key={tier.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isCurrent
                        ? `bg-slate-950 ${tier.borderColor} border-2 shadow-lg`
                        : isUnlocked
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-slate-950/30 border-slate-900 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isUnlocked ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {tier.name}
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-500 text-white">
                              Active Tier
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tier.requiredReferrals}+ refs
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tier.exclusivePerks.map((perk) => (
                          <span
                            key={perk}
                            className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px]"
                          >
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 4. INVITE CONTACTS COMPONENT (PHONEBOOK SELECTOR) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl space-y-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">Invite Contacts & Friends</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {contacts.length} Phone Contacts
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Select friends to send personalized invitations with your code <strong className="text-amber-400">{referralCode}</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleQuickShare}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              title="Share referral link via native mobile share intent"
            >
              <Share2 className="w-4 h-4" />
              Quick Share
            </button>
            <button
              onClick={handleOpenShareSheet}
              disabled={selectedContactIds.length === 0}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedContactIds.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-lg animate-bounce'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              Invite Selected ({selectedContactIds.length})
            </button>
          </div>
        </div>

        {/* Search & Bulk Select Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Search contacts by name, phone or email..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={toggleSelectAllContacts}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
          >
            {selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>
              {selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0
                ? 'Deselect All Contacts'
                : 'Select All Filtered Contacts'}
            </span>
          </button>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredContacts.map((contact) => {
            const isSelected = selectedContactIds.includes(contact.id);
            return (
              <div
                key={contact.id}
                onClick={() => toggleContact(contact.id)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-400 shadow-md ring-1 ring-indigo-400/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${contact.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                    {contact.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{contact.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{contact.phone}</p>
                    <p className="text-[10px] text-slate-500 truncate">{contact.email}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 5. PENDING INVITATIONS DEDICATED TRACKING SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-amber-400" />
              Pending & Sent Invitations
            </h3>
            <p className="text-xs text-slate-400">
              Track friend status: Pending, Sent, and Accepted with live reminders
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {pendingInvitations.length} Pending Invites
          </span>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No invitations sent yet. Select contacts above to start earning!
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${invite.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                    {invite.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {invite.name}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          invite.status === 'Accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : invite.status === 'Sent'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {invite.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {invite.detail} • Sent: {invite.sentDate}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                  {invite.status === 'Accepted' ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ₹250 Cash Credited
                      </span>
                      <span className="text-[10px] text-slate-400">Completed 3/3 Txns</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {invite.txnsCompleted !== undefined && (
                        <div className="text-right text-xs">
                          <span className="text-amber-400 font-bold block">
                            {invite.txnsCompleted}/3 Txns
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {3 - invite.txnsCompleted} left
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleResendInvite(invite.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Resend Invite Reminder"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. REDEMPTION HISTORY WITH DISTINCT STATUS BADGES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Redemption History
            </h3>
            <p className="text-xs text-slate-400">
              Rewards claimed, cash vouchers & digital gold settlements
            </p>
          </div>

          {/* Filter Status Badges */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['All', 'Delivered', 'Processing', 'Claimed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRedemptionFilter(filter)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  redemptionFilter === filter
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredRedemptions.map((redemption) => (
            <div
              key={redemption.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{redemption.rewardName}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {redemption.date} • Ref: {redemption.refNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-base font-black font-mono text-emerald-400">
                  {redemption.pointsOrValue}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    redemption.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : redemption.status === 'Processing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {redemption.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. ACCORDION-STYLE FAQ SECTION: TERMS, EXPIRY & TIER LOGIC */}
      <div id="refer-earn-faq-section" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">Frequently Asked Questions</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  Terms & Policies
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand referral qualifying criteria, reward expiration rules, and tier upgrades
              </p>
            </div>
          </div>

          {/* Quick Expand / Collapse Actions */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={expandAllFaqs}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllFaqs}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {(['All', 'Referral Terms', 'Reward Expiry', 'Tier Logic', 'Payouts'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFaqCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  faqCategoryFilter === category
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              placeholder="Search FAQ keywords..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {faqSearchQuery && (
              <button
                onClick={() => setFaqSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Accordion FAQ Item List */}
        <div className="space-y-3 pt-2">
          {filteredFaqItems.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No matching FAQ entries found for "{faqSearchQuery}". Try another search term or filter.
            </div>
          ) : (
            filteredFaqItems.map((faq) => {
              const isExpanded = expandedFaqIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-slate-950 border-amber-500/50 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Accordion Header / Trigger Button */}
                  <button
                    onClick={() => toggleFaqItem(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isExpanded
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${faq.badgeColor}`}
                          >
                            {faq.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white sm:text-base leading-snug">
                          {faq.question}
                        </h4>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isExpanded
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Body / Content */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 border-t border-slate-900 space-y-3 animate-fade-in text-xs sm:text-sm">
                      <p className="text-slate-300 leading-relaxed pt-3">
                        {faq.answer}
                      </p>

                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                            Key Policy Highlights:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {faq.highlights.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-slate-300 text-xs">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Support Prompt */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-slate-950 border border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Have additional questions regarding partner commissions or VIP rewards?</span>
          </div>
          <button
            onClick={() => {
              showToast('Connecting you to SecurePay 24x7 Referral Concierge Helpline...');
              onLogActivity?.(
                'Referral Concierge Support Opened',
                'User requested assistance via Refer & Earn FAQ Helpdesk.',
                'portal'
              );
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span>24x7 Rewards Support</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 8. SIMULATED SYSTEM SHARING SHEET MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-950 border-2 border-indigo-500/80 rounded-t-3xl sm:rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  System Sharing Sheet
                </h3>
                <p className="text-xs text-slate-400">
                  Dispatching referral invites to {selectedContactIds.length} selected contacts
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Recipients Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase">Selected Recipients:</span>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-900/80 rounded-2xl border border-slate-800">
                {contacts
                  .filter((c) => selectedContactIds.includes(c.id))
                  .map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-xs font-bold text-indigo-200 flex items-center gap-1.5"
                    >
                      <span>{c.name}</span>
                      <button
                        onClick={() => toggleContact(c.id)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Message Preview</span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {whatsappText}
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickShare}
                className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                title="Open native mobile share intent"
              >
                <Share2 className="w-4 h-4" />
                Quick Share
              </button>
              <button
                onClick={handleConfirmSendInvites}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Send className="w-4 h-4" />
                Send ({selectedContactIds.length}) Invites
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. REDEEM REWARD MODAL */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  Redeem Rewards & Cash
                </h3>
                <p className="text-xs text-slate-400">Instant transfer to primary bank account</p>
              </div>
              <button
                onClick={() => setIsRedeemModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleClaimReward('₹500 Direct Cash Transfer', '₹500.00', 'Direct Bank Cash')}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-amber-300">₹500 Direct Bank Cash</div>
                  <div className="text-xs text-slate-400">Requires 2 Successful Referrals</div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-xl border border-emerald-500/30">
                  Claim Now
                </span>
              </button>

              <button
                onClick={() => handleClaimReward('₹250 Food Voucher (Swiggy)', '₹250.00', 'Shopping Voucher')}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-amber-300">₹250 Swiggy/Zomato Voucher</div>
                  <div className="text-xs text-slate-400">Instant Coupon Code via SMS</div>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-xl border border-amber-500/30">
                  Claim Code
                </span>
              </button>

              <button
                onClick={() => handleClaimReward('0.25g 24K Digital Gold', '₹1,850.00', 'Gold Bonus')}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-amber-300">24K Digital Gold (0.25g)</div>
                  <div className="text-xs text-slate-400">Vaulted in Augmont/MMTC Vault</div>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-black rounded-xl border border-yellow-500/30">
                  Claim Gold
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
