import { useEffect, useState } from 'react';
import { getSummary } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import useCountUp from '../hooks/useCountUp';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtShort = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-4 py-3 shadow-2xl">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize text-slate-400">{p.name}:</span>
          <span className="font-bold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const AnimatedStatCard = ({ label, value, icon, gradient }) => {
  const animated = useCountUp(value);
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${gradient} shadow-lg`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
          {icon}
        </div>
        <p className="text-2xl font-black tracking-tight mb-1">
          ₹{animated.toLocaleString('en-IN')}
        </p>
        <p className="text-white/70 text-sm font-medium">{label}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSummary()
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = () => {
    if (!data) return;
    const savingsRate = data.totalIncome > 0 ? Math.round((data.netBalance / data.totalIncome) * 100) : 0;
    const topCategories = data.categoryTotals.slice(0, 5)
      .map((c) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9">${c._id.category}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-transform:capitalize">${c._id.type}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-weight:700">₹${c.total.toLocaleString('en-IN')}</td></tr>`)
      .join('');

    const html = `
      <html><head><title>Finance Report</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b}h1{color:#4f46e5;margin-bottom:4px}
      .subtitle{color:#94a3b8;font-size:13px;margin-bottom:32px}
      .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px}
      .card{padding:20px;border-radius:12px;color:white}
      .green{background:linear-gradient(135deg,#10b981,#0d9488)}
      .red{background:linear-gradient(135deg,#f43f5e,#db2777)}
      .indigo{background:linear-gradient(135deg,#6366f1,#7c3aed)}
      .card-label{font-size:12px;opacity:0.8;margin-bottom:4px}
      .card-value{font-size:22px;font-weight:900}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#f8fafc;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#94a3b8;letter-spacing:0.05em}
      .footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center}
      .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;background:#eef2ff;color:#4f46e5}
      </style></head>
      <body>
        <h1>₹ FinanceApp — Financial Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; Prepared for: ${user?.name} &nbsp;|&nbsp; Role: <span class="badge">${user?.role}</span></p>
        <div class="cards">
          <div class="card green"><div class="card-label">Total Income</div><div class="card-value">₹${data.totalIncome.toLocaleString('en-IN')}</div></div>
          <div class="card red"><div class="card-label">Total Expenses</div><div class="card-value">₹${data.totalExpenses.toLocaleString('en-IN')}</div></div>
          <div class="card indigo"><div class="card-label">Net Balance</div><div class="card-value">₹${data.netBalance.toLocaleString('en-IN')}</div></div>
        </div>
        <p style="margin-bottom:16px">Savings Rate: <strong>${savingsRate}%</strong> &nbsp;${savingsRate >= 20 ? '🎉 Excellent savings!' : savingsRate >= 0 ? '💡 Aim for 20%+' : '⚠️ Expenses exceed income'}</p>
        <h3 style="margin-bottom:12px;color:#475569">Top Categories</h3>
        <table><thead><tr><th>Category</th><th>Type</th><th>Total</th></tr></thead><tbody>${topCategories}</tbody></table>
        <div class="footer">This report was auto-generated by FinanceApp &nbsp;•&nbsp; Confidential</div>
      </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm">{error}</div>
      </div>
    );

  const monthlyMap = {};
  data.monthlyTrends.forEach(({ _id, total }) => {
    const key = `${MONTHS[_id.month]} ${_id.year}`;
    if (!monthlyMap[key]) monthlyMap[key] = { name: key, income: 0, expense: 0 };
    monthlyMap[key][_id.type] = total;
  });
  const monthlyData = Object.values(monthlyMap).reverse();
  const pieData = data.categoryTotals.slice(0, 6).map((c) => ({ name: c._id.category, value: c.total }));
  const savingsRate = data.totalIncome > 0 ? Math.round((data.netBalance / data.totalIncome) * 100) : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's your financial overview</p>
        </div>
        <button onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Report
        </button>
      </div>

      {/* Animated Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <AnimatedStatCard label="Total Income" value={data.totalIncome} gradient="from-emerald-500 to-teal-600"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
        />
        <AnimatedStatCard label="Total Expenses" value={data.totalExpenses} gradient="from-rose-500 to-pink-600"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
        />
        <AnimatedStatCard label="Net Balance" value={Math.abs(data.netBalance)} gradient={data.netBalance >= 0 ? 'from-indigo-500 to-purple-600' : 'from-orange-500 to-red-600'}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Savings Rate Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Savings Rate: {savingsRate}%</p>
            <p className="text-slate-400 text-sm">{savingsRate >= 20 ? "🎉 Great job! You're saving well." : savingsRate >= 0 ? '💡 Try to save at least 20% of income.' : '⚠️ Expenses exceed income this period.'}</p>
          </div>
        </div>
        <div className="hidden sm:block w-32">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-1 text-right">{savingsRate}% saved</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Monthly Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">Income vs Expenses trend</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />Expense</span>
            </div>
          </div>
          {monthlyData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" name="Income" dot={{ fill: '#10b981', r: 4 }} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expenseGrad)" name="Expense" dot={{ fill: '#f43f5e', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">By Category</h2>
          <p className="text-xs text-slate-400 mb-5">Spending breakdown</p>
          {pieData.length ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={45} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-24">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fmtShort(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest 5 financial entries</p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">{data.recentActivity.length} entries</span>
        </div>
        {data.recentActivity.length ? (
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {data.recentActivity.map((r) => (
              <div key={r._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    {r.type === 'income'
                      ? <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                      : <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.category}</p>
                    <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-slate-300 text-sm">No transactions yet</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
