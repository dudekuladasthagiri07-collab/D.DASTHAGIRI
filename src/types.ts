export type PortalCategory = 'government' | 'private' | 'unsafe';

export type PermissionStatus = 'allowed' | 'denied' | 'permanently_denied' | 'not_requested';

export interface AppPermissionSettings {
  camera: PermissionStatus;
  notifications: PermissionStatus;
  biometrics: PermissionStatus;
  photosMedia: PermissionStatus;
  location: PermissionStatus;
  microphone: PermissionStatus;
}

export interface UserProfile {
  id?: string;
  name: string;
  displayName?: string;
  username?: string;
  phone: string;
  phoneVerified?: boolean;
  email?: string;
  address?: string;
  houseNo?: string;
  street?: string;
  mandal?: string;
  district?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  dateOfBirth?: string;
  gender?: string;
  alternatePhone?: string;
  preferredLanguage?: string;
  theme?: 'dark' | 'light' | 'system';
  accountStatus?: 'active' | 'pending' | 'locked';
  onboardingCompleted?: boolean;
  isLoggedIn: boolean;
  pin: string;
  hasBiometrics: boolean;
  registeredDate: string; // ISO string
  nextReRegistrationDate: string; // 6 months from registered date
  verificationScore: number; // e.g. 92%
  avatarUrl?: string;
  createdDate?: string;
  updatedDate?: string;
  lastLogin?: string;
}

export interface DocumentItem {
  id: string;
  type: 'aadhaar' | 'pan' | 'dl' | '10th' | 'inter' | 'graduation' | 'voter' | 'other';
  title: string;
  documentNumberMasked: string;
  holderName: string;
  issueDate: string;
  expiryDate?: string; // YYYY-MM-DD format (e.g., '2026-09-15')
  validityType?: 'lifetime' | 'periodic' | 'expires';
  renewalPortalName?: string; // e.g. 'UIDAI myAadhaar Portal' or 'Income Tax e-Filing Portal'
  renewalUrl?: string;
  complianceNotice?: string; // e.g. 'UIDAI 10-Year Periodic Re-validation Rule'
  isVerified: boolean;
  verifiedAt?: string;
  frontImage?: string;
  backImage?: string;
  isProtectedByPin: boolean;
  pinProtected?: boolean;
  issuer?: string;
  // Extra fields for Academic, Government & Identity details
  boardOrUniversity?: string;
  schoolOrCollegeName?: string;
  institutionAddress?: string;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  marksOrGpa?: string;
  rollNumber?: string;
  streamOrDegree?: string;
  constituency?: string;
  category?: 'id_card' | 'academic' | 'government';
  pdfFileUrl?: string;
  pdfFileName?: string;
  
  // Date of Birth and Family details
  dateOfBirth?: string;
  dobInWords?: string;
  fatherName?: string;

  // Subject Marks & Grading breakdown
  subjectMarks?: {
    subjectName: string;
    maxMarks: number;
    securedMarks: number;
    theoryMarks?: number;
    oralOrInternalMarks?: number;
    gradeOrStatus: string;
  }[];
  totalMarksSecured?: number;
  totalMaxMarks?: number;
  totalMarksInWords?: string;
  cgpaInWords?: string;
  divisionOrClass?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'savings' | 'current' | 'salary' | 'nre';
  accountNumberMasked: string;
  fullAccountNumber?: string;
  ifscCode: string;
  branchName?: string;
  upiId?: string;
  vpa?: string;
  upiNumber?: string;
  balance?: string;
  rawBalanceNumber?: number;
  isPrimary: boolean;
  verificationStatus: 'verified' | 'pending_bank' | 'failed';
  verificationCode?: string;
  linkedDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  verificationNoticeSent: boolean;
  accountCategory?: 'bank' | 'upi' | 'upi_lite';
  status?: 'connected' | 'pending' | 'disconnected' | 'Linked';
  lastUpdated?: string;
}

export interface PaymentCard {
  id: string;
  cardType: 'visa' | 'mastercard' | 'rupay';
  cardNetwork: 'Visa' | 'RuPay' | 'Mastercard';
  cardNumberMasked: string; // e.g. 'Visa •••• 9012'
  last4: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  bankName?: string;
  isDefault?: boolean;
  cardCategory: 'debit' | 'credit';
}

export interface UpiProfile {
  upiNumberMasked: string; // '98XXXXXX21'
  fullUpiNumber?: string;
  isUpiNumberVerified: boolean;
  primaryVpa: string; // 'dasthagiri@upi'
  linkedVpas: string[]; // ['dasthagiri@upi', 'dasthagiri@sbi', 'dasthagiri@axis']
  qrCodeData?: string;
}

export type PaymentMethodType = 'primary_bank' | 'linked_bank' | 'upi' | 'wallet' | 'card';

export interface PaymentMethodOption {
  id: string;
  type: PaymentMethodType;
  title: string;
  subtitle: string;
  maskedInfo: string;
  badge?: string;
  isPrimary?: boolean;
  balance?: number;
  icon?: string;
  bankId?: string;
  cardId?: string;
  vpa?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  refId: string;
}

export interface WalletData {
  balance: number; // 12450.00
  isAutoAddEnabled: boolean;
  autoAddThreshold: number; // 1000
  autoAddAmount: number; // 2000
  linkedSourceBankId?: string;
  history: WalletTransaction[];
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  category: 'public' | 'private' | 'payments' | 'small_finance' | 'rrb' | 'Public Sector' | 'Private' | 'Payments Bank' | 'Small Finance Bank' | 'Regional Rural Bank';
  categoryLabel?: 'Public Sector' | 'Private' | 'Payments Bank' | 'Small Finance Bank' | 'Regional Rural Bank' | string;
  categoryTag?: 'Public Sector' | 'Private' | 'Payments Bank';
  ifscPrefix: string;
  defaultPinLength?: number;
  popular?: boolean;
  supportsUpi: boolean;
  defaultBranch?: string;
  defaultIfsc?: string;
  headquarters?: string;
  foundedYear?: number;
  rating?: number;
  upiHandles?: string[];
  tagline?: string;
  netBankingUrl?: string;
}

export interface LinkedAccount {
  id: string;
  bankName: string;
  accountType: 'savings' | 'current' | 'salary' | 'nre';
  accountNumberMasked: string;
  upiId?: string;
  balance: string;
  rawBalanceNumber: number;
  isPrimary: boolean;
  status: 'connected' | 'pending' | 'disconnected';
  lastUpdated: string;
  accountCategory: 'bank' | 'upi' | 'upi_lite';
}

export interface UPIAccount {
  id: string;
  upiId: string;
  holderName: string;
  linkedBankName: string;
  status: 'active' | 'inactive';
  isPrimary: boolean;
}

export interface UPILiteAccount {
  id: string;
  balance: string;
  rawBalanceNumber: number;
  linkedBankName: string;
  maxLimit: number;
  status: 'active' | 'disabled';
}

export interface BankTransaction {
  id: string;
  type: 'send' | 'receive' | 'self_transfer';
  fromBankId?: string;
  fromBankName?: string;
  toBankId?: string;
  toBankName?: string;
  recipientName?: string;
  recipientUpiOrPhone?: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  utrNumber: string;
  note?: string;
  category?: string;
  isRecurring?: boolean;
  recurringInterval?: 'Monthly' | 'Weekly' | 'Quarterly' | 'Yearly';
}

export interface RecurringBill {
  id: string;
  billerName: string;
  category: string;
  amount: number;
  dueDate: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  isAutoPayEnabled: boolean;
  autoPayBankId?: string;
  autoPayBankName?: string;
  reminderDaysBefore: number;
  reminderChannel: 'Push & SMS' | 'Push Only' | 'Email & Push' | 'Off';
  status: 'Upcoming' | 'Paid' | 'Overdue';
  lastPaidDate?: string;
  upiIdOrConsumerNo?: string;
}

export interface AutopayMandate {
  id: string;
  userId: string;
  name: string;
  payeeId: string;
  payeeName: string;
  sourceAccountId: string;
  sourceAccountName: string;
  sourceAccountMasked: string;
  amount: number;
  currency: string;
  frequency: 'One-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  startDate: string;
  scheduledTime: string;
  nextExecutionAt: string;
  endDate?: string;
  maxPayments?: number;
  completedPaymentsCount: number;
  status: 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  lastExecutionAt?: string;
  lastExecutionStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'NONE';
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface AutopayExecution {
  id: string;
  autopayId: string;
  autopayName: string;
  payeeName: string;
  scheduledAt: string;
  executedAt: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  providerTransactionId: string;
  failureCode?: string;
  failureMessage?: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface ConnectedPortal {
  id: string;
  name: string;
  category: PortalCategory;
  description: string;
  status: 'active' | 'suspended' | 'blocked';
  serverVerification: string; // e.g., "Official Govt Server (UIDAI/ITD)", "GST Registered (GSTIN: 27AABC...)", "Unverified APK Source"
  connectedDate: string;
  riskScore: number; // 0 to 100
  permissions: string[];
  apkSource?: string;
  warningNotice?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'auth' | 'document' | 'bank' | 'portal' | 'security';
  title: string;
  description: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  ipAddress?: string;
  device?: string;
}

export interface FraudIncident {
  id: string;
  reportedDate: string;
  incidentType: string;
  description: string;
  nocDocumentName?: string;
  policeComplaintName?: string;
  status: 'submitted' | 'under_review' | 'bank_notified' | 'resolved';
  processingTimelineDays: number; // 1 to 6
  trackingCode: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
  read: boolean;
  status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
  category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
  actionLabel?: string;
  actionTab?: string;
  details?: string;
}

export interface InAppToast {
  id: string;
  notification: NotificationItem;
  createdAt: number;
  durationMs?: number;
}

// ==================== DOCUMENT SCANNER MODULE TYPES ====================

export type DocumentCategoryType = 
  | 'Personal'
  | 'Government'
  | 'Education'
  | 'Medical'
  | 'Financial'
  | 'Legal'
  | 'Office'
  | 'Business'
  | 'Bills'
  | 'Receipts'
  | 'Others';

export type ImageFilterType = 
  | 'Original'
  | 'Auto'
  | 'Color'
  | 'Black & White'
  | 'Grayscale'
  | 'High Contrast'
  | 'Magic Color'
  | 'Document'
  | 'Photo';

export interface ScanPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  rotation: number; // 0, 90, 180, 270
  flippedHorizontal: boolean;
  flippedVertical: boolean;
  filter: ImageFilterType;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  sharpness: number; // 0 to 100
  shadowRemoval: boolean;
  noiseReduction: boolean;
  cropCorners?: { x: number; y: number }[];
  ocrText?: string;
}

export interface ScannedDocumentItem {
  id: string;
  documentId: string;
  name: string;
  folder: string;
  category: DocumentCategoryType;
  tags: string[];
  description?: string;
  pages: ScanPage[];
  pageCount: number;
  fileSize: string;
  resolution: '150 DPI' | '300 DPI' | '600 DPI';
  colorMode: 'Full Color' | 'Grayscale' | 'Black & White';
  format: 'PDF' | 'JPG' | 'PNG' | 'ZIP' | 'Multiple PDFs';
  ocrStatus: 'Completed' | 'Pending' | 'Failed' | 'Disabled';
  ocrText?: string;
  scanSource: 'Camera Device' | 'Gallery Upload' | 'Hardware Scanner';
  cameraDevice?: string;
  uploadSource?: string;
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
  version: string;
  remarks?: string;
  permissions: {
    admin: boolean;
    manager: boolean;
    employee: boolean;
    viewer: boolean;
  };
  encrypted: boolean;
  thumbnailUrl?: string;
  fileUrl?: string;
}

export interface DocumentScanHistoryItem {
  scanId: string;
  documentId: string;
  documentName: string;
  scanDate: string;
  scanTime: string;
  user: string;
  pages: number;
  format: string;
  status: 'Completed' | 'Draft' | 'Archived' | 'Failed';
  storageLocation: string;
  fileSize: string;
  createdOn: string;
  updatedOn: string;
}

export interface DocumentAuditLogItem {
  logId: string;
  user: string;
  action: 'Scan' | 'Edit' | 'Delete' | 'Share' | 'Download' | 'OCR' | 'Export' | 'Merge' | 'Split' | 'Permission Change';
  document: string;
  scanTime: string;
  device: string;
  ipAddress: string;
  status: 'Success' | 'Denied' | 'Warning' | 'Failed';
  remarks?: string;
}


export interface MobileContact {
  id: string;
  name: string;
  phone: string;
  provider: 'Jio' | 'Airtel' | 'BSNL' | 'Vi';
  type: 'prepaid' | 'postpaid';
  avatar?: string;
  relationship: 'Self' | 'Family' | 'Friend' | 'Work';
}

export interface RechargePlan {
  id: string;
  provider: 'Jio' | 'Airtel' | 'BSNL' | 'Vi';
  category: 'popular' | 'monthly' | 'yearly' | 'offers' | 'unlimited' | 'data' | 'talktime' | 'sms' | 'entertainment' | 'roaming' | 'annual';
  amount: number;
  originalPrice?: number;
  discountPercent?: number;
  offerTag?: string;
  name: string;
  validityDays: number;
  validityText: string;
  dailyData: string;
  voiceCalling: string;
  smsBenefits: string;
  ottBenefits?: string;
  description: string;
  recommendedBadge?: 'Popular' | 'Best Value' | 'Trending' | 'Super Saver' | 'Yearly Pack' | 'Monthly Pack' | 'Special Offer' | '50% Off' | 'Double Data' | 'Bumper Offer';
}

export interface MobileRechargeLog {
  id: string; // Recharge ID e.g. RCH-2026-98101
  transactionId: string; // TXN-884920
  mobileNumber: string;
  contactName?: string;
  networkProvider: 'Jio' | 'Airtel' | 'BSNL' | 'Vi';
  rechargeType: 'prepaid' | 'postpaid';
  planCategory: string;
  planName: string;
  planAmount: number;
  validity: string;
  validityDays: number;
  rechargeDate: string;
  planStartDate: string;
  planExpiryDate: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet';
  paymentStatus: 'Success' | 'Failed' | 'Pending';
  rechargeStatus: 'Completed' | 'Processing' | 'Failed';
  referenceNumber: string;
  createdBy: string;
  createdOn: string;
  lastUpdated: string;
  remarks?: string;
}

// ==================== UNIFIED PAYMENTS & BILL PAYMENT ENGINE TYPES ====================

export type PaymentService =
  | 'MOBILE_RECHARGE'
  | 'DTH_CABLE'
  | 'ELECTRICITY'
  | 'WATER'
  | 'PIPED_GAS'
  | 'BROADBAND'
  | 'LPG'
  | 'FASTAG'
  | 'LOAN_EMI'
  | 'INSURANCE'
  | 'EDUCATION_FEE'
  | 'SEND_MONEY'
  | 'RECEIVE_MONEY'
  | 'SCAN_AND_PAY';

export type PaymentStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESS'
  | 'BILL_PAYMENT_PENDING'
  | 'SUCCESS'
  | 'PAYMENT_FAILED'
  | 'BILL_PAYMENT_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type ServiceGroupCategory =
  | 'Recharge'
  | 'Bills'
  | 'Financial Payments'
  | 'UPI';

export interface ServiceDefinition {
  id: PaymentService;
  name: string;
  category: ServiceGroupCategory;
  description: string;
  iconName: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierRegex?: string;
  identifierMinLength?: number;
  identifierMaxLength?: number;
  helperText?: string;
  requiresState?: boolean;
  requiresCity?: boolean;
  requiresCircle?: boolean;
  isPlanBased?: boolean;
  popular?: boolean;
  badge?: string;
}

export interface Biller {
  id: string;
  name: string;
  code: string;
  serviceType: PaymentService;
  category: ServiceGroupCategory;
  state?: string;
  city?: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierRegex?: string;
  identifierMinLength?: number;
  identifierMaxLength?: number;
  helperText?: string;
  logoUrl?: string;
  supportsPartialPayment?: boolean;
  supportsFetchBill?: boolean;
  requiresStateSelection?: boolean;
  requiresCitySelection?: boolean;
  requiresCircleSelection?: boolean;
  bbpsEnabled?: boolean;
  popular?: boolean;
  description?: string;
}

export interface BillFetchDetails {
  billId: string;
  billerId: string;
  billerName: string;
  serviceType: PaymentService;
  customerReference: string;
  customerReferenceMasked: string;
  customerName: string;
  amount: number; // In Rupees
  amountPaise: number; // In Paise (e.g. 124500)
  currency: string;
  dueDate: string;
  billDate: string;
  billPeriod?: string;
  status: 'DUE' | 'PAID' | 'EXPIRED' | 'PARTIAL';
  minimumAmount?: number;
  fineOrLateFee?: number;
  billNumber?: string;
  address?: string;
}

export interface PaymentOrder {
  id: string;
  serviceType: PaymentService;
  billerId?: string;
  billerName?: string;
  customerReference: string;
  customerReferenceMasked: string;
  customerName?: string;
  amount: number; // In Rupees
  amountPaise: number; // In Paise (Long)
  currency: string;
  paymentMethod: 'UPI' | 'Linked Bank Account' | 'UPI Lite' | 'Net Banking' | 'Debit Card';
  sourceAccountId?: string;
  sourceAccountMasked?: string;
  status: PaymentStatus;
  idempotencyKey: string;
  providerReference?: string;
  bbpsReference?: string;
  utrNumber?: string;
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
  failureReason?: string;
}

export interface UnifiedTransactionRecord {
  id: string;
  orderId: string;
  serviceType: PaymentService;
  serviceCategory: ServiceGroupCategory;
  title: string;
  billerOrRecipientName: string;
  customerReferenceMasked: string;
  amount: number; // Rupees
  amountPaise: number; // Paise
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  providerReference: string;
  utrNumber: string;
  timestamp: string;
  createdAt: string;
  dueDate?: string;
  receiptId?: string;
  note?: string;
  sourceAccountMasked?: string;
}

export interface AdminDashboardMetrics {
  totalTransactions: number;
  totalAmountPaise: number;
  totalAmountRupees: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  refundPendingCount: number;
  refundedCount: number;
  serviceBreakdown: Record<string, { count: number; amount: number }>;
  recentTransactions: UnifiedTransactionRecord[];
  pendingReconciliation: number;
}

