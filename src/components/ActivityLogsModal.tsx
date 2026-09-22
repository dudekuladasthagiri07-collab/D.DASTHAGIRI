import React, { useState } from 'react';
import { History, ShieldCheck, Filter, X, Smartphone, Globe } from 'lucide-react';
import { ActivityLog } from '../types';

interface Props {
  logs: ActivityLog[];
  onClose: () => void;
}

export const ActivityLogsModal: React.FC<Props> = ({ logs, onClose }) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => (typeFilter === 'all' ? true : log.type === typeFilter));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 relative text-slate-800 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <History className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-800">System Security Activity Audit Log</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 text-xs shrink-0 no-scrollbar">
          {['all', 'auth', 'document', 'bank', 'portal', 'security'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg uppercase font-semibold text-[10px] tracking-wider transition-all ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Audit Timeline List */}
        <div className="overflow-y-auto space-y-3 pr-1 text-xs flex-1">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={`font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    log.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : log.status === 'danger'
                      ? 'bg-rose-100 text-rose-800'
                      : log.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-slate-500 font-mono">{log.timestamp}</span>
              </div>

              <h4 className="font-bold text-slate-800 text-xs">{log.title}</h4>
              <p className="text-[11px] text-slate-600">{log.description}</p>

              {log.ipAddress && (
                <div className="pt-1 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>IP: {log.ipAddress}</span>
                  <span>{log.device}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs shrink-0"
        >
          Close Audit Log
        </button>

      </div>
    </div>
  );
};
