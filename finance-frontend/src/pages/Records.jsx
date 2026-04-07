import { useEffect, useState, useCallback } from 'react';
import { getRecords, createRecord, updateRecord, deleteRecord, exportRecordsCSV } from '../api/records';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RecordTable from '../components/RecordTable';
import RecordModal from '../components/RecordModal';

const FILTERS_INIT = { type: '', search: '', startDate: '', endDate: '' };

const Records = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const canExport = user?.role === 'admin' || user?.role === 'analyst';

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
    } catch {
      toast('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  const handleSave = async (form) => {
    try {
      if (editRecord) await updateRecord(editRecord._id, form);
      else await createRecord(form);
      setModalOpen(false);
      fetchRecords(pagination.page);
      toast(editRecord ? 'Record updated successfully' : 'Record created successfully');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save record', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      fetchRecords(pagination.page);
      toast('Record deleted successfully');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete record', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const params = Object.fromEntries(Object.entries(applied).filter(([, v]) => v));
      const { data } = await exportRecordsCSV(params);
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'records.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast('Records exported successfully');
    } catch {
      toast('Failed to export records', 'error');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Records</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {pagination.total > 0 ? `${pagination.total} total records` : 'Manage your financial records'}
          </p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <button onClick={handleExport}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm px-4 py-2.5 rounded-xl font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          )}
          {isAdmin && (
            <button onClick={() => { setEditRecord(null); setModalOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Record
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filters</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input placeholder="Search category or notes..."
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 sm:col-span-1" />
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700" />
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setApplied(filters)}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">Apply</button>
          <button onClick={() => { setFilters(FILTERS_INIT); setApplied(FILTERS_INIT); }}
            className="text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Clear</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <RecordTable records={records} onEdit={(r) => { setEditRecord(r); setModalOpen(true); }} onDelete={handleDelete} isAdmin={isAdmin} />
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page === 1} onClick={() => fetchRecords(pagination.page - 1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">← Prev</button>
            <button disabled={pagination.page === pagination.pages} onClick={() => fetchRecords(pagination.page + 1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {modalOpen && <RecordModal record={editRecord} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
};

export default Records;
