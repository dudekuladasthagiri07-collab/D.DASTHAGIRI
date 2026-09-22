import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Search, ExternalLink, X, Shield, RefreshCw } from 'lucide-react';
import { ConnectedPortal, PortalCategory } from '../types';

interface Props {
  portals: ConnectedPortal[];
  onUpdatePortals: (portals: ConnectedPortal[]) => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
}

export const PortalCategorizationModule: React.FC<Props> = ({ portals, onUpdatePortals, onLogActivity }) => {
  const [filter, setFilter] = useState<'all' | PortalCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortal, setSelectedPortal] = useState<ConnectedPortal | null>(null);

  const filteredPortals = portals.filter((p) => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.serverVerification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const govtCount = portals.filter((p) => p.category === 'government').length;
  const privateCount = portals.filter((p) => p.category === 'private').length;
  const unsafeCount = portals.filter((p) => p.category === 'unsafe').length;

  const handleToggleBlock = (portalId: string) => {
    const updated = portals.map((p) => {
      if (p.id === portalId) {
        const newStatus: 'active' | 'blocked' = p.status === 'blocked' ? 'active' : 'blocked';
        onLogActivity(
          `Portal Access ${newStatus === 'blocked' ? 'Blocked' : 'Restored'}`,
          `Changed status for ${p.name} (${p.category.toUpperCase()}) to ${newStatus}`,
          'portal'
        );
        return { ...p, status: newStatus };
      }
      return p;
    });
    onUpdatePortals(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Portal Classification System</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time server auditing and risk assessment for all external applications connected to your Aadhaar and Banking token.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connected portals..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Security Cards Color Legend & Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 🟢 Government Card */}
        <div
          onClick={() => setFilter(filter === 'government' ? 'all' : 'government')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
            filter === 'government'
              ? 'bg-green-100 border-green-400 ring-2 ring-green-500/20'
              : 'bg-green-50/80 border-green-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" /> 🟢 Government Portal
            </span>
            <span className="text-xl font-bold font-mono text-green-900">{govtCount}</span>
          </div>
          <p className="text-[11px] text-green-800/80">
            Official government servers (UIDAI, ITD, Docpay Vault). Direct secure protocols.
          </p>
        </div>

        {/* 🔵 Private Card */}
        <div
          onClick={() => setFilter(filter === 'private' ? 'all' : 'private')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
            filter === 'private'
              ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-blue-50/80 border-blue-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> 🔵 Private Portal
            </span>
            <span className="text-xl font-bold font-mono text-blue-900">{privateCount}</span>
          </div>
          <p className="text-[11px] text-blue-800/80">
            GST and SEBI verified commercial platforms (Brokers, Utility apps).
          </p>
        </div>

        {/* ⚫ Unsafe Card */}
        <div
          onClick={() => setFilter(filter === 'unsafe' ? 'all' : 'unsafe')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
            filter === 'unsafe'
              ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-500/20'
              : 'bg-rose-50/80 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-rose-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600" /> ⚫ Unsafe / APK Portal
            </span>
            <span className="text-xl font-bold font-mono text-rose-700">{unsafeCount}</span>
          </div>
          <p className="text-[11px] text-rose-800">
            Unverified third-party APK sources or high risk SMS/Contact harvesting apps.
          </p>
        </div>

      </div>

      {/* Filter Reset Button if active */}
      {filter !== 'all' && (
        <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs shadow-sm">
          <span className="text-slate-600">
            Filtering by: <strong className="text-indigo-600 uppercase">{filter}</strong>
          </span>
          <button
            onClick={() => setFilter('all')}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            Show All Portals
          </button>
        </div>
      )}

      {/* Portals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPortals.map((portal) => {
          const isGovt = portal.category === 'government';
          const isPrivate = portal.category === 'private';
          const isUnsafe = portal.category === 'unsafe';

          return (
            <div
              key={portal.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden shadow-sm bg-white ${
                isGovt
                  ? 'border-green-200'
                  : isPrivate
                  ? 'border-blue-200'
                  : 'border-rose-200'
              }`}
            >
              {/* Header Title & Category Badge */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isGovt ? 'bg-green-600' : isPrivate ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    />
                    <h3 className="font-bold text-base text-slate-800">{portal.name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isGovt
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : isPrivate
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {isGovt ? '🟢 Government' : isPrivate ? '🔵 Private' : '⚫ Unsafe / APK'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4">{portal.description}</p>

                {/* Warning notice box for unsafe portals */}
                {portal.warningNotice && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs mb-4 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{portal.warningNotice}</span>
                  </div>
                )}

                {/* Server Verification Info Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2 mb-4">
                  <div className="text-slate-500 text-[10px] uppercase font-sans font-semibold">Server Verification Signature</div>
                  <div className={`text-xs ${isGovt ? 'text-green-700' : isPrivate ? 'text-blue-700' : 'text-rose-700 font-bold'}`}>
                    {portal.serverVerification}
                  </div>

                  {portal.apkSource && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      <span className="text-slate-500 block text-[10px]">APK SOURCE:</span>
                      <span className="text-rose-700 font-mono underline">{portal.apkSource}</span>
                    </div>
                  )}
                </div>

                {/* Risk Score Bar */}
                <div className="mb-4 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Risk Assessment Score</span>
                    <span
                      className={`font-mono font-bold ${
                        portal.riskScore > 60 ? 'text-rose-700' : portal.riskScore > 20 ? 'text-amber-700' : 'text-green-700'
                      }`}
                    >
                      {portal.riskScore}% {portal.riskScore > 60 ? 'HIGH RISK' : portal.riskScore > 20 ? 'MEDIUM' : 'SAFE'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        portal.riskScore > 60
                          ? 'bg-rose-600'
                          : portal.riskScore > 20
                          ? 'bg-amber-500'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${portal.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Permissions tags */}
                <div className="mb-4">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1.5">
                    Granted Permissions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {portal.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          isUnsafe
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Sync: {portal.connectedDate}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPortal(portal)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Inspect Audit
                  </button>

                  <button
                    id={`toggle-block-portal-${portal.id}`}
                    onClick={() => handleToggleBlock(portal.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      portal.status === 'blocked'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    }`}
                  >
                    {portal.status === 'blocked' ? 'Unblock Access' : 'Block & Revoke Access'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Portal Modal */}
      {selectedPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 relative text-slate-800 shadow-xl">
            <button
              onClick={() => setSelectedPortal(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-800">Portal Audit Log • {selectedPortal.name}</h3>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Category Level:</span>
                <span className="text-indigo-700 font-bold uppercase">{selectedPortal.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Status:</span>
                <span className={selectedPortal.status === 'blocked' ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                  {selectedPortal.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Assessment:</span>
                <span className="text-amber-800 font-bold">{selectedPortal.riskScore}% Security Risk Score</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-800 font-sans">
                <strong>Server Host Verification:</strong>
                <p className="text-xs text-slate-600 font-mono mt-1">{selectedPortal.serverVerification}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPortal(null)}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs"
            >
              Close Audit
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
