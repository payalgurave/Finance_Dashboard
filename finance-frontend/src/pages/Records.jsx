import { useEffect, useState, useCallback } from 'react';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../api/records';
import { useAuth } from '../context/AuthContext';
import RecordTable from '../components/RecordTable';
import RecordModal from '../components/RecordModal';

const FILTERS_INIT = { type: '', category: '', startDate: '', endDate: '' };

const Records = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState(FILTERS_INIT);
  const [applied, setApplied] = useState(FILTERS_INIT);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(applied).filter(([, v]) => v)) };
      const { data } = await getRecords(params);
      setRecords(data.records);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  const handleSave = async (form) => {
    if (editRecord) await updateRecord(editRecord._id, form);
    else await createRecord(form);
    fetchRecords(pagination.page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await deleteRecord(id);
    fetchRecords(pagination.page);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.total > 0 ? `${pagination.total} total records found` : 'Manage your financial records'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditRecord(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
          <p className="text-sm font-semibold text-slate-700">Filter Records</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 bg-slate-50"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            placeholder="Search category..."
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
          />
          <input type="date" value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 bg-slate-50"
          />
          <input type="date" value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 bg-slate-50"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setApplied(filters)}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium transition-colors">
            Apply
          </button>
          <button onClick={() => { setFilters(FILTERS_INIT); setApplied(FILTERS_INIT); }}
            className="text-sm border border-slate-200 text-slate-600 px-5 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading records...</p>
          </div>
        ) : (
          <RecordTable records={records} onEdit={(r) => { setEditRecord(r); setModalOpen(true); }} onDelete={handleDelete} isAdmin={isAdmin} />
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Showing page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page === 1} onClick={() => fetchRecords(pagination.page - 1)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium">
              ← Previous
            </button>
            <button disabled={pagination.page === pagination.pages} onClick={() => fetchRecords(pagination.page + 1)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium">
              Next →
            </button>
          </div>
        </div>
      )}

      {modalOpen && <RecordModal record={editRecord} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
};

export default Records;
