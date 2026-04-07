import { useEffect, useState } from 'react';
import { getActivityLogs } from '../api/activity';

const ACTION_STYLES = {
  CREATE_RECORD: { color: 'bg-emerald-50 text-emerald-700', icon: '➕' },
  UPDATE_RECORD: { color: 'bg-blue-50 text-blue-700', icon: '✏️' },
  DELETE_RECORD: { color: 'bg-rose-50 text-rose-700', icon: '🗑️' },
  EXPORT_CSV:    { color: 'bg-indigo-50 text-indigo-700', icon: '📥' },
  UPDATE_USER:   { color: 'bg-amber-50 text-amber-700', icon: '👤' },
  DELETE_USER:   { color: 'bg-rose-50 text-rose-700', icon: '❌' },
  LOGIN:         { color: 'bg-slate-100 text-slate-600', icon: '🔐' },
  REGISTER:      { color: 'bg-purple-50 text-purple-700', icon: '🆕' },
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getActivityLogs()
      .then(({ data }) => setLogs(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm">{error}</div>
      </div>
    );

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit trail of all system actions — last 50 entries</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {logs.map((log) => {
              const style = ACTION_STYLES[log.action] || { color: 'bg-slate-50 text-slate-600', icon: '📋' };
              return (
                <div key={log._id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="text-xl mt-0.5">{style.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.color}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">by</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{log.user?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        log.user?.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                        log.user?.role === 'analyst' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}>{log.user?.role}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
