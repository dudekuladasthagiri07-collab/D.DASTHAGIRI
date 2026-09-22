import React, { useState } from 'react';
import {
  INITIAL_USER,
  INITIAL_DOCUMENTS,
  INITIAL_BANKS,
  INITIAL_PORTALS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_CARDS,
  INITIAL_UPI_PROFILE,
  INITIAL_WALLET,
} from './mock/initialData';
import {
  UserProfile,
  DocumentItem,
  BankAccount,
  ConnectedPortal,
  ActivityLog,
  NotificationItem,
  FraudIncident,
  BankTransaction,
  AppPermissionSettings,
  InAppToast,
  PaymentCard,
  UpiProfile,
  WalletData,
} from './types';

// Components
import { SimulationNotice } from './components/SimulationNotice';
import { HeaderNav } from './components/HeaderNav';
import { Dashboard } from './components/Dashboard';
import { DocumentModule } from './components/DocumentModule';
import { BankModule } from './components/BankModule';
import { PaymentMethodsModule } from './components/payment-methods/PaymentMethodsModule';
import { BankRemovalModal } from './components/BankRemovalModal';
import { PortalCategorizationModule } from './components/PortalCategorizationModule';
import { FraudSecurityModule } from './components/FraudSecurityModule';
import { AuthModal } from './components/AuthModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { QrScannerModal } from './components/QrScannerModal';
import { ActivityLogsModal } from './components/ActivityLogsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ToastNotificationStack } from './components/ToastNotificationStack';
import { playNotificationChime } from './utils/soundEffects';
import { BankingOperationsModal } from './components/BankingOperationsModal';
import { HistoryPaymentsModule } from './components/HistoryPaymentsModule';
import { ReferEarnModule } from './components/ReferEarnModule';
import { MobileRechargeModule } from './components/MobileRechargeModule';
import { HelpSupportModal } from './components/HelpSupportModal';
import { LogoutModal } from './components/LogoutModal';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { AutopayManagementModule } from './components/AutopayManagementModule';
import { SearchModule } from './components/SearchModule';
import { QuickUnlockModal } from './components/QuickUnlockModal';
import { AuthTransitionOverlay } from './components/AuthTransitionOverlay';
import { FirstTimePermissionModal } from './components/FirstTimePermissionModal';
import { PermissionsCenterModal } from './components/PermissionsCenterModal';
import { BiometricSetupModal } from './components/BiometricSetupModal';
import { CheckBalanceFlowModal } from './components/CheckBalanceFlowModal';
import { SendMoneyFlowModal } from './components/SendMoneyFlowModal';
import { AnimatePresence } from 'motion/react';

export default function App() {
  // Main State
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [banks, setBanks] = useState<BankAccount[]>(INITIAL_BANKS);
  const [transactions, setTransactions] = useState<BankTransaction[]>(INITIAL_TRANSACTIONS);
  const [portals, setPortals] = useState<ConnectedPortal[]>(INITIAL_PORTALS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('docpay_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [upiProfile, setUpiProfile] = useState<UpiProfile>(INITIAL_UPI_PROFILE);
  const [wallet, setWallet] = useState<WalletData>(INITIAL_WALLET);
  const [toasts, setToasts] = useState<InAppToast[]>([]);
  const [incidents, setIncidents] = useState<FraudIncident[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [previousTab, setPreviousTab] = useState<string>('dashboard');
  const [autopaySubTab, setAutopaySubTab] = useState<'active' | 'setup' | 'upcoming' | 'history'>('active');

  const handleOpenSearch = () => {
    setPreviousTab(activeTab === 'search' ? 'dashboard' : activeTab);
    setActiveTab('search');
  };

  const handleCloseSearch = () => {
    setActiveTab(previousTab || 'dashboard');
  };

  // Keyboard shortcut Ctrl+K or Cmd+K to open Search Page
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleNavigateAutopay = (subtab: 'active' | 'setup' | 'upcoming' | 'history' = 'active') => {
    setAutopaySubTab(subtab);
    setActiveTab('autopay');
  };

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showHelpSupport, setShowHelpSupport] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);
  const [showActivityLogs, setShowActivityLogs] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [bankToRemove, setBankToRemove] = useState<BankAccount | null>(null);

  // App Permissions & Privacy State
  const [appPermissions, setAppPermissions] = useState<AppPermissionSettings>(() => {
    const saved = localStorage.getItem('docpay_app_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      camera: 'not_requested',
      notifications: 'not_requested',
      biometrics: 'allowed',
      photosMedia: 'not_requested',
      location: 'not_requested',
      microphone: 'not_requested',
    };
  });

  const [showFirstTimePermissionFlow, setShowFirstTimePermissionFlow] = useState<boolean>(() => {
    const completed = localStorage.getItem('docpay_first_login_permission_completed');
    return completed !== 'true';
  });

  const [showBiometricSetupPrompt, setShowBiometricSetupPrompt] = useState<boolean>(false);
  const [showPermissionsCenter, setShowPermissionsCenter] = useState<boolean>(false);

  // Security Lock & Onboarding State
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem('docpay_privacy_mode') === 'true';
  });

  // Network Connection / Offline State
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOffline = isOffline || isSimulatedOffline;

  const handleTogglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem('docpay_privacy_mode', String(next));
      logActivity(
        'Privacy Mode Updated',
        `Privacy Mode set to ${next ? 'ACTIVE (Sensitive financial balances blurred)' : 'OFF (Financial balances visible)'}`,
        'security'
      );
      return next;
    });
  };

  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);
  const [authModalMode, setAuthModalMode] = useState<'quick_unlock' | 'login_flow'>(
    INITIAL_USER.isLoggedIn && INITIAL_USER.onboardingCompleted ? 'quick_unlock' : 'login_flow'
  );
  const [showAuthTransition, setShowAuthTransition] = useState<boolean>(false);
  const [loginSessionCount, setLoginSessionCount] = useState<number>(0);

  const handleUnlockSuccess = () => {
    setShowAuthTransition(true);
  };

  const handleAuthModalUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setShowAuthModal(false);
    setShowAuthTransition(true);
  };

  // Banking Operations Modal, Check Balance Flow & Send Money Flow
  const [showBankingOps, setShowBankingOps] = useState<boolean>(false);
  const [bankingOpsTab, setBankingOpsTab] = useState<'balance' | 'send' | 'receive' | 'self_transfer'>('balance');
  const [showCheckBalanceFlow, setShowCheckBalanceFlow] = useState<boolean>(false);
  const [showSendMoneyFlow, setShowSendMoneyFlow] = useState<boolean>(false);
  const [sendMoneyInitialBankId, setSendMoneyInitialBankId] = useState<string | undefined>(undefined);

  const handleOpenBankingOps = (
    tab: 'balance' | 'send' | 'receive' | 'self_transfer',
    bankId?: string
  ) => {
    if (tab === 'balance') {
      setShowCheckBalanceFlow(true);
    } else if (tab === 'send') {
      setSendMoneyInitialBankId(bankId);
      setShowSendMoneyFlow(true);
    } else {
      setBankingOpsTab(tab);
      setShowBankingOps(true);
    }
  };

  // Activity Logger Helper
  const logActivity = (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type,
      title,
      description,
      status: type === 'security' ? 'danger' : 'success',
      ipAddress: '103.22.140.12',
      device: 'Mobile / Chrome Client',
    };
    setActivities((prev) => [newLog, ...prev]);
  };

  // Bank Removal Confirmation Handler
  const handleConfirmBankRemoval = (bankId: string, trackingId: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== bankId));
    logActivity(
      'Bank Account Delinked',
      `Delinked account ID ${bankId} using multi-step security removal. Tracking ID: ${trackingId}`,
      'bank'
    );
  };

  // Logout Confirmation Handler
  const handleConfirmLogout = () => {
    setUser((prev) => ({ ...prev, isLoggedIn: false }));
    setShowLogoutModal(false);
    setAuthModalMode('login_flow');
    setIsAppLocked(true);
    logActivity(
      'User Session Terminated',
      'User logged out securely. Docpay Verified vault, bank transaction tokens, and biometric session locked.',
      'auth'
    );
  };

  // In-App Notification Dispatcher
  const triggerNotification = (params: {
    title: string;
    message: string;
    type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
    status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
    category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
    actionLabel?: string;
    actionTab?: string;
    details?: string;
  }) => {
    const status = params.status || 'success';
    const category = params.category || (
      params.type === 'otp' ? 'otp' :
      params.type === 'bank' ? 'bank' :
      params.type === 'document' ? 'document' :
      params.type === 'security' ? 'security' : 'system'
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: params.title,
      message: params.message,
      timestamp: 'Just now',
      type: params.type,
      status,
      category,
      read: false,
      actionLabel: params.actionLabel,
      actionTab: params.actionTab,
      details: params.details,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('docpay_notifications', JSON.stringify(updated.slice(0, 50)));
      } catch (e) {}
      return updated;
    });

    // Spawn animated floating toast
    const newToast: InAppToast = {
      id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      notification: newNotif,
      createdAt: Date.now(),
      durationMs: 6000,
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Play subtle audio chime
    playNotificationChime(status === 'failed' ? 'failed' : status === 'warning' ? 'warning' : status === 'pending' ? 'pending' : 'success');
  };

  // Toast Dismiss Handlers
  const handleDismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleDismissAllToasts = () => {
    setToasts([]);
  };

  // Notification Drawer Dismiss Handlers
  const handleDismissNotification = (notifId: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notifId);
      try {
        localStorage.setItem('docpay_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setToasts((prev) => prev.filter((t) => t.notification.id !== notifId));
  };

  const handleDismissAllNotifications = () => {
    setNotifications([]);
    setToasts([]);
    try {
      localStorage.removeItem('docpay_notifications');
    } catch (e) {}
  };

  // Notification Mark All Read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('docpay_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Pre-configured Test Event Simulator
  const handleTriggerTestEvent = (eventType: 'otp_success' | 'doc_upload' | 'bank_pending' | 'bank_success' | 'bank_failed' | 'security_alert') => {
    switch (eventType) {
      case 'otp_success':
        triggerNotification({
          title: 'Mobile OTP Verification Successful',
          message: 'Aadhaar / Mobile OTP was successfully verified for session 9390240130. High-security session established.',
          type: 'otp',
          status: 'success',
          category: 'otp',
          actionLabel: 'View Account',
          actionTab: 'dashboard',
        });
        logActivity('Mobile OTP Verified', 'Aadhaar & Mobile OTP authentication verified successfully', 'auth');
        break;

      case 'doc_upload':
        triggerNotification({
          title: 'Document Upload Confirmed',
          message: '10th SSC Board Marks Memo (•••• 4821) successfully uploaded, virus scanned, and encrypted into Docpay Vault.',
          type: 'document',
          status: 'success',
          category: 'document',
          actionLabel: 'Open Vault',
          actionTab: 'documents',
        });
        logActivity('Document Upload Confirmed', '10th Marks Memo encrypted into verified vault', 'document');
        break;

      case 'bank_pending':
        triggerNotification({
          title: 'Bank Account Linking Pending',
          message: 'Verification initiated for State Bank of India (•••• 9012). Waiting for NPCI DBT mandate clearance.',
          type: 'bank',
          status: 'pending',
          category: 'bank',
          actionLabel: 'Check Status',
          actionTab: 'banks',
        });
        logActivity('Bank Linking Initiated', 'NPCI DBT linking verification request sent to SBI', 'bank');
        break;

      case 'bank_success':
        triggerNotification({
          title: 'Bank Account Linked Successfully',
          message: 'HDFC Bank (•••• 9810) has been verified and set as your primary bank account for instant UPI & DBT transfers.',
          type: 'bank',
          status: 'success',
          category: 'bank',
          actionLabel: 'Manage Banks',
          actionTab: 'banks',
        });
        logActivity('Bank Account Linked', 'HDFC Bank successfully linked and verified via NPCI', 'bank');
        break;

      case 'bank_failed':
        triggerNotification({
          title: 'Bank Account Linking Failed',
          message: 'Verification failed for Axis Bank: Account holder name mismatch against Aadhaar KYC record. Please re-verify IFSC.',
          type: 'bank',
          status: 'failed',
          category: 'bank',
          actionLabel: 'Retry Link',
          actionTab: 'banks',
        });
        logActivity('Bank Linking Failed', 'Axis Bank linking rejected due to name mismatch against KYC', 'bank');
        break;

      case 'security_alert':
        triggerNotification({
          title: '🚨 Suspicious Activity Detected',
          message: 'High-risk unverified IP source (103.22.140.12) attempted to intercept banking SMS OTP. Immediate security shield lockdown activated.',
          type: 'security',
          status: 'warning',
          category: 'security',
          actionLabel: 'Review Security',
          actionTab: 'fraud',
        });
        logActivity('Suspicious Activity Blocked', 'High-risk access attempt blocked by Security Shield', 'security');
        break;
    }
  };

  const govtCount = portals.filter((p) => p.category === 'government').length;
  const privateCount = portals.filter((p) => p.category === 'private').length;
  const unsafeCount = portals.filter((p) => p.category === 'unsafe').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 antialiased relative overflow-x-hidden">
      
      {/* Background Gold & White Ambient Shine Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Right Gold Shine Aura */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-transparent blur-3xl" />
        {/* Top Left White Shine Aura */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-white/10 via-slate-200/5 to-transparent blur-3xl" />
        {/* Bottom Center Gold-White Metallic Reflection */}
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-96 rounded-full bg-gradient-to-t from-amber-500/10 via-white/5 to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Educational Simulation Banner */}
      <SimulationNotice />

      {/* Top Fixed Header Navigation */}
      <HeaderNav
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        banks={banks}
        setBanks={setBanks}
        portals={portals}
        onOpenSearch={handleOpenSearch}
        onOpenBankingOps={handleOpenBankingOps}
        onOpenBillService={(service) => {
          if (service === 'MOBILE_RECHARGE') {
            setActiveTab('recharge');
          } else {
            setActiveTab('dashboard');
          }
        }}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenHelpSupport={() => setShowHelpSupport(true)}
        onOpenQrScanner={() => setShowQrScanner(true)}
        onOpenActivityLogs={() => setShowActivityLogs(true)}
        onOpenLogoutModal={() => setShowLogoutModal(true)}
        govtCount={govtCount}
        privateCount={privateCount}
        unsafeCount={unsafeCount}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={handleTogglePrivacyMode}
        isOffline={effectiveOffline}
        onToggleSimulatedOffline={() => setIsSimulatedOffline((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-24">
        {activeTab === 'search' && (
          <SearchModule
            user={user}
            banks={banks}
            portals={portals}
            onBack={handleCloseSearch}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
            }}
            onOpenBankingOps={handleOpenBankingOps}
            onOpenBillService={(service) => {
              if (service === 'MOBILE_RECHARGE') {
                setActiveTab('recharge');
              } else {
                setActiveTab('dashboard');
              }
            }}
            onOpenQrScanner={() => setShowQrScanner(true)}
            onOpenActivityLogs={() => setShowActivityLogs(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenHelpSupport={() => setShowHelpSupport(true)}
            onOpenProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {activeTab === 'dashboard' && !isAppLocked && (
          <Dashboard
            key={`dashboard-session-${loginSessionCount}`}
            user={user}
            documents={documents}
            banks={banks}
            portals={portals}
            activities={activities}
            notifications={notifications}
            setActiveTab={setActiveTab}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onOpenQrScanner={() => setShowQrScanner(true)}
            onOpenActivityLogs={() => setShowActivityLogs(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenHelpSupport={() => setShowHelpSupport(true)}
            onOpenBankingOps={handleOpenBankingOps}
            onNavigateAutopay={handleNavigateAutopay}
            onUpdateDocuments={setDocuments}
            onLogActivity={logActivity}
            isPrivacyMode={isPrivacyMode}
            onTogglePrivacyMode={handleTogglePrivacyMode}
            isOffline={effectiveOffline}
          />
        )}

        {activeTab === 'autopay' && (
          <AutopayManagementModule
            bankAccounts={banks}
            user={user}
            isPrivacyMode={isPrivacyMode}
            initialTab={autopaySubTab}
            onLogActivity={logActivity}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentModule
            documents={documents}
            user={user}
            portals={portals}
            onUpdateDocuments={setDocuments}
            onUpdatePortals={setPortals}
            onLogActivity={logActivity}
            initialTab="documents"
            onTriggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'recharge' && (
          <MobileRechargeModule
            user={user}
            banks={banks}
            onLogActivity={logActivity}
          />
        )}

        {activeTab === 'banks' && (
          <PaymentMethodsModule
            banks={banks}
            cards={cards}
            upiProfile={upiProfile}
            wallet={wallet}
            user={user}
            isPrivacyMode={isPrivacyMode}
            onUpdateBanks={setBanks}
            onUpdateCards={setCards}
            onUpdateUpiProfile={setUpiProfile}
            onUpdateWallet={setWallet}
            onOpenLinkBankWizard={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open_link_bank_wizard'));
              }
              handleOpenBankingOps('self_transfer');
            }}
            onOpenBankScanner={() => setShowQrScanner(true)}
            onOpenBankingOps={handleOpenBankingOps}
            onLogActivity={logActivity}
            onTriggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'refer' && (
          <ReferEarnModule
            user={user}
            onLogActivity={logActivity}
          />
        )}

        {activeTab === 'portals' && (
          <DocumentModule
            documents={documents}
            user={user}
            portals={portals}
            onUpdateDocuments={setDocuments}
            onUpdatePortals={setPortals}
            onLogActivity={logActivity}
            initialTab="portals"
            onTriggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPaymentsModule
            transactions={transactions}
            activities={activities}
            banks={banks}
            user={user}
            onOpenBankingOps={handleOpenBankingOps}
            onOpenQrScanner={() => setShowQrScanner(true)}
            onLogActivity={logActivity}
            isPrivacyMode={isPrivacyMode}
            onTogglePrivacyMode={handleTogglePrivacyMode}
          />
        )}

        {activeTab === 'fraud' && (
          <FraudSecurityModule
            user={user}
            incidents={incidents}
            onAddIncident={(inc) => setIncidents((prev) => [inc, ...prev])}
            onLogActivity={logActivity}
            onTriggerNotification={triggerNotification}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenLogoutModal={() => setShowLogoutModal(true)}
      />

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQrScanner={() => setShowQrScanner(true)}
        notifications={notifications}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* SECURITY UNLOCK / ONBOARDING FLOW FOR APP OPEN */}
      {isAppLocked && (
        <>
          {authModalMode === 'quick_unlock' && user.isLoggedIn && user.onboardingCompleted ? (
            <QuickUnlockModal
              user={user}
              onUnlockSuccess={handleUnlockSuccess}
              onOpenFullLogin={() => setAuthModalMode('login_flow')}
              onLogActivity={logActivity}
            />
          ) : (
            <AuthModal
              user={user}
              onUpdateUser={handleAuthModalUpdateUser}
              onClose={() => {
                if (user.isLoggedIn && user.onboardingCompleted) {
                  setIsAppLocked(false);
                  setLoginSessionCount((c) => c + 1);
                }
              }}
              onLogActivity={logActivity}
              onTriggerNotification={triggerNotification}
            />
          )}
        </>
      )}

      {/* SUCCESSFUL AUTHENTICATION TRANSITION MOTION OVERLAY */}
      <AnimatePresence>
        {showAuthTransition && (
          <AuthTransitionOverlay
            userName={user.displayName || user.name}
            onComplete={() => {
              setShowAuthTransition(false);
              setIsAppLocked(false);
              setLoginSessionCount((c) => c + 1);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODALS */}

      {/* FIRST-TIME LOGIN PERMISSION & PRIVACY FLOW */}
      {showFirstTimePermissionFlow && !isAppLocked && (
        <FirstTimePermissionModal
          initialPermissions={appPermissions}
          onComplete={(updatedPerms) => {
            setAppPermissions(updatedPerms);
            setShowFirstTimePermissionFlow(false);
            // Trigger Biometric setup prompt modal right after permission flow
            const bioDone = localStorage.getItem('docpay_biometric_registered');
            if (bioDone !== 'true') {
              setShowBiometricSetupPrompt(true);
            }
          }}
          onLogActivity={logActivity}
        />
      )}

      {/* BIOMETRIC SETUP PROMPT MODAL */}
      {showBiometricSetupPrompt && !isAppLocked && (
        <BiometricSetupModal
          onComplete={() => setShowBiometricSetupPrompt(false)}
          onSkip={() => setShowBiometricSetupPrompt(false)}
          onLogActivity={logActivity}
        />
      )}

      {/* PERMISSIONS & PRIVACY CENTER MODAL */}
      {showPermissionsCenter && (
        <PermissionsCenterModal
          permissions={appPermissions}
          onUpdatePermissions={setAppPermissions}
          onClose={() => setShowPermissionsCenter(false)}
          onLogActivity={logActivity}
        />
      )}

      {/* Auth / Re-registration Modal (When manually opened from header/footer) */}
      {showAuthModal && !isAppLocked && (
        <AuthModal
          user={user}
          onUpdateUser={handleAuthModalUpdateUser}
          onClose={() => setShowAuthModal(false)}
          onLogActivity={logActivity}
          onTriggerNotification={triggerNotification}
        />
      )}

      {/* Profile & Photo Edit Modal */}
      {showProfileModal && (
        <ProfileEditModal
          user={user}
          onUpdateUser={setUser}
          onClose={() => setShowProfileModal(false)}
          onLogActivity={logActivity}
          onOpenLogoutModal={() => setShowLogoutModal(true)}
          onOpenHelpSupport={() => setShowHelpSupport(true)}
          onOpenPermissionsCenter={() => setShowPermissionsCenter(true)}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={handleTogglePrivacyMode}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal
          user={user}
          onConfirmLogout={handleConfirmLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}

      {/* 24x7 Help & Wrong Payment Refund Modal */}
      {showHelpSupport && (
        <HelpSupportModal
          user={user}
          onClose={() => setShowHelpSupport(false)}
          onLogActivity={logActivity}
        />
      )}

      {/* Check Balance Dedicated Secure PIN & Accounts Flow */}
      {showCheckBalanceFlow && (
        <CheckBalanceFlowModal
          banks={banks}
          user={user}
          onUpdateBanks={setBanks}
          onClose={() => setShowCheckBalanceFlow(false)}
          onLogActivity={logActivity}
          onOpenSendMoney={(bankId) => {
            setShowCheckBalanceFlow(false);
            setSendMoneyInitialBankId(bankId);
            setShowSendMoneyFlow(true);
          }}
        />
      )}

      {/* Send Money Dedicated Multi-Step Flow Modal */}
      {showSendMoneyFlow && (
        <SendMoneyFlowModal
          banks={banks}
          user={user}
          initialBankId={sendMoneyInitialBankId}
          onUpdateBanks={setBanks}
          onAddTransaction={(tx) => setTransactions((prev) => [tx, ...prev])}
          onClose={() => {
            setShowSendMoneyFlow(false);
            setSendMoneyInitialBankId(undefined);
          }}
          onLogActivity={logActivity}
        />
      )}

      {/* Banking Operations Modal (Receive, Self Transfer, Logs) */}
      {showBankingOps && (
        <BankingOperationsModal
          banks={banks}
          transactions={transactions}
          user={user}
          initialTab={bankingOpsTab}
          onUpdateBanks={setBanks}
          onAddTransaction={(tx) => setTransactions((prev) => [tx, ...prev])}
          onClose={() => setShowBankingOps(false)}
          onLogActivity={logActivity}
          onOpenSendMoney={(bankId) => {
            setShowBankingOps(false);
            setSendMoneyInitialBankId(bankId);
            setShowSendMoneyFlow(true);
          }}
          onOpenCheckBalance={() => {
            setShowBankingOps(false);
            setShowCheckBalanceFlow(true);
          }}
        />
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrScannerModal
          banks={banks}
          user={user}
          onAddTransaction={(tx) => setTransactions((prev) => [tx, ...prev])}
          onClose={() => setShowQrScanner(false)}
          onLogActivity={logActivity}
        />
      )}

      {/* Activity Logs Modal */}
      {showActivityLogs && (
        <ActivityLogsModal
          logs={activities}
          onClose={() => setShowActivityLogs(false)}
        />
      )}

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onMarkAllRead={handleMarkNotificationsRead}
          onDismissNotification={handleDismissNotification}
          onDismissAllNotifications={handleDismissAllNotifications}
          onTriggerTestEvent={handleTriggerTestEvent}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setShowNotifications(false);
          }}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Multi-Step Bank Removal Modal */}
      {bankToRemove && (
        <BankRemovalModal
          bank={bankToRemove}
          user={user}
          onClose={() => setBankToRemove(null)}
          onConfirmRemoval={handleConfirmBankRemoval}
          onLogActivity={logActivity}
        />
      )}

      {/* In-App Floating Toast Notification Stack (Dismissible) */}
      <ToastNotificationStack
        toasts={toasts}
        onDismiss={handleDismissToast}
        onDismissAll={handleDismissAllToasts}
        onSelectNotification={(notif) => {
          if (notif.actionTab) {
            setActiveTab(notif.actionTab);
          }
          setShowNotifications(true);
        }}
      />

      </div>
    </div>
  );
}
