import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, Upload, CheckCircle2, Clock, Send, ShieldCheck, Key, Lock, Phone } from 'lucide-react';
import { FraudIncident, UserProfile } from '../types';
import { FaceAuthSimulator } from './FaceAuthSimulator';

interface Props {
  user: UserProfile;
  incidents: FraudIncident[];
  onAddIncident: (incident: FraudIncident) => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
  onTriggerNotification?: (params: {
    title: string;
    message: string;
    type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
    status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
    category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
    actionLabel?: string;
    actionTab?: string;
  }) => void;
}

export const FraudSecurityModule: React.FC<Props> = ({
  user,
  incidents,
  onAddIncident,
  onLogActivity,
  onTriggerNotification,
}) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [formStep, setFormStep] = useState<'details' | 'uploads' | 'biometric' | 'complete'>('details');

  // Form Inputs
  const [incidentType, setIncidentType] = useState('Unauthorized Banking Transaction / SMS OTP Spoofing');
  const [description, setDescription] = useState('');
  const [nocFileName, setNocFileName] = useState('');
  const [policeFileName, setPoliceFileName] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const handleTriggerSuspiciousActivity = () => {
    if (onTriggerNotification) {
      onTriggerNotification({
        title: '🚨 Suspicious Activity Detected',
        message: 'High-risk unauthorized access attempt from IP 103.22.140.12 (Kolkata). Banking OTP interception blocked by Security Shield.',
        type: 'security',
        status: 'warning',
        actionLabel: 'Review Security',
        actionTab: 'fraud',
      });
    }
    onLogActivity(
      'Suspicious Activity Detected',
      'High-risk IP address attempted OTP interception. Device flagged and blocked.',
      'security'
    );
  };

  const handleStartReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    setFormStep('uploads');
  };

  const handleUploadsComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('biometric');
  };

  const handleBiometricSuccess = () => {
    const code = `FRD-NOC-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingCode(code);

    const newIncident: FraudIncident = {
      id: `incident-${Date.now()}`,
      reportedDate: new Date().toISOString().split('T')[0],
      incidentType,
      description,
      nocDocumentName: nocFileName || 'NOC_Bank_Declaration.pdf',
      policeComplaintName: policeFileName || 'CyberCell_Police_FIR_Copy.pdf',
      status: 'submitted',
      processingTimelineDays: 3,
      trackingCode: code,
    };

    onAddIncident(newIncident);
    onLogActivity(
      'Fraud Incident Submitted',
      `Filed fraud report with NOC & Police FIR proof. Tracking ID: ${code}. Simulated alert dispatched to Bank Security Officer.`,
      'security'
    );
    if (onTriggerNotification) {
      onTriggerNotification({
        title: '🚨 Security Alert: Fraud Report Filed',
        message: `High-priority fraud investigation initiated (${incidentType}). Tracking ID: ${code}. Bank Cyber Cell dispatched.`,
        type: 'security',
        status: 'warning',
        actionLabel: 'Track Incident',
        actionTab: 'fraud',
      });
    }
    setFormStep('complete');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-800">Security & Fraud Handling System</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Report suspicious banking attempts, upload NOC & Police FIR proofs, and track automated emergency resolution timelines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="simulate-suspicious-alert-btn"
            onClick={handleTriggerSuspiciousActivity}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Simulate suspicious activity detection"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Simulate Threat Alert
          </button>

          <button
            id="report-fraud-btn"
            onClick={() => {
              setShowReportForm(true);
              setFormStep('details');
              setDescription('');
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" /> Report Suspicious Activity
          </button>
        </div>
      </div>

      {/* Emergency Phone Warning Box */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-rose-950">National Cyber Crime Helpline: 1930</h4>
            <p className="text-[11px] text-rose-800">
              Never share OTPs, passwords, or banking PINs with unverified calls or unknown APK apps.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 font-mono text-[11px] self-start md:self-auto font-semibold">
          24/7 Active Shield
        </span>
      </div>

      {/* Active Reported Incidents List */}
      <div>
        <h3 className="font-bold text-base text-slate-800 mb-4">Reported Security Incidents & NOC Filings</h3>

        {incidents.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No Suspicious Activity Filed</p>
            <p className="text-xs text-slate-500">Your accounts and connected portals are currently operating under normal risk thresholds.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-4 shadow-sm text-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase block">
                      TRACKING ID: {incident.trackingCode}
                    </span>
                    <h4 className="font-bold text-base text-slate-800">{incident.incidentType}</h4>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5" /> Resolution Timeline: {incident.processingTimelineDays} Days
                  </span>
                </div>

                <p className="text-xs text-slate-600">{incident.description}</p>

                {/* Uploaded Documents List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-500 text-[10px] block">NOC CERTIFICATE</span>
                      <span className="text-slate-800 font-semibold truncate">{incident.nocDocumentName}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-500 text-[10px] block">POLICE FIR PROOF</span>
                      <span className="text-slate-800 font-semibold truncate">{incident.policeComplaintName}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Bank Notification Timeline Tracker */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Automated Processing Timeline (1–6 Days Workflow)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-green-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <div>
                        <strong className="block">Day 1: Filed</strong>
                        <span className="text-[10px] text-green-800">NOC & FIR Validated</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      <div>
                        <strong className="block">Days 2–3: Bank Sync</strong>
                        <span className="text-[10px] text-amber-800">Bank Nodal Audit</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <strong className="block">Days 4–6: Clearance</strong>
                        <span className="text-[10px]">Restoration Token</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Fraud Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 relative text-slate-800 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-800">Report Suspicious Fraud & File NOC</h3>
              </div>
              <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {/* STEP 1: Details */}
            {formStep === 'details' && (
              <form onSubmit={handleStartReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Classification</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                  >
                    <option value="Unauthorized Banking Transaction / SMS OTP Spoofing">
                      Unauthorized Banking Transaction / SMS OTP Spoofing
                    </option>
                    <option value="Suspicious APK Permission Hijack">Suspicious APK Permission Hijack</option>
                    <option value="Phishing Portal Identity Theft Attempt">Phishing Portal Identity Theft Attempt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Summary & Details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe suspicious SMS messages, fraudulent transaction amounts, or unknown APK behavior..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  Proceed to Upload Proof Documents (NOC & FIR)
                </button>
              </form>
            )}

            {/* STEP 2: Document Proof Uploads */}
            {formStep === 'uploads' && (
              <form onSubmit={handleUploadsComplete} className="space-y-4">
                <div className="text-center mb-2">
                  <h4 className="font-bold text-sm text-slate-800">Upload Mandatory Proof Documents</h4>
                  <p className="text-xs text-slate-500">Required by banking nodal officers for freeze actions</p>
                </div>

                {/* NOC Upload */}
                <div
                  onClick={() => setNocFileName('NOC_Bank_Declaration_Signed.pdf')}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50"
                >
                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    {nocFileName ? `Attached: ${nocFileName}` : '1. Upload No Objection Certificate (NOC)'}
                  </p>
                </div>

                {/* Police Complaint Upload */}
                <div
                  onClick={() => setPoliceFileName('CyberCrime_Police_FIR_Receipt.pdf')}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50"
                >
                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    {policeFileName ? `Attached: ${policeFileName}` : '2. Upload Police Complaint / FIR Copy'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  Proceed to Biometric Authorization
                </button>
              </form>
            )}

            {/* STEP 3: Biometric Authorization */}
            {formStep === 'biometric' && (
              <div>
                <FaceAuthSimulator
                  onSuccess={handleBiometricSuccess}
                  title="Biometric Signature for Fraud Filing"
                  subtitle="Verify face to digitally authorize bank notification & NOC submission"
                />
              </div>
            )}

            {/* STEP 4: Complete */}
            {formStep === 'complete' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="font-bold text-base text-slate-800">Fraud Report Filed Successfully!</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                  <span className="text-slate-500 block">Incident Tracking Code</span>
                  <span className="text-emerald-700 font-bold text-base">{trackingCode}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Simulated emergency notification dispatched to bank nodal security officer. Resolution timeline: 1–6 Days.
                </p>

                <button
                  onClick={() => setShowReportForm(false)}
                  className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs"
                >
                  Return to Security Hub
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
