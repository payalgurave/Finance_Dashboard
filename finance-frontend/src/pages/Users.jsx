import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../api/users';

const ROLE_STYLES = {
  admin: { badge: 'bg-rose-50 text-rose-700 border border-rose-200', dot: 'bg-rose-500', avatar: 'from-rose-500 to-pink-600' },
  analyst: { badge: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500', avatar: 'from-blue-500 to-indigo-600' },
  viewer: { badge: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400', avatar: 'from-slate-400 to-slate-600' },
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers()
      .then(({ data }) => setUsers(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    await updateUser(id, { role });
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const status = currentStatus === 'active' ? 'inactive' : 'active';
    await updateUser(id, { status });
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status } : u)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading users...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm">{error}</div>
      </div>
    );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const analystCount = users.filter(u => u.role === 'analyst').length;
  const viewerCount = users.filter(u => u.role === 'viewer').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage roles and access control for all users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-indigo-50 text-indigo-700', icon: '👥' },
          { label: 'Active', value: activeCount, color: 'bg-emerald-50 text-emerald-700', icon: '✅' },
          { label: 'Admins', value: adminCount, color: 'bg-rose-50 text-rose-700', icon: '🔑' },
          { label: 'Analysts', value: analystCount, color: 'bg-blue-50 text-blue-700', icon: '📊' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-sm font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="text-sm font-bold text-slate-700">All Users ({users.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ROLE_STYLES[u.role].avatar} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 ${ROLE_STYLES[u.role].badge}`}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleStatusToggle(u._id, u.status)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      u.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {u.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
