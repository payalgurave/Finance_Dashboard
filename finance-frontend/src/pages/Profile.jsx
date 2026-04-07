import { useAuth } from '../context/AuthContext';

const ROLE_STYLES = {
  admin: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', gradient: 'from-rose-500 to-pink-600' },
  analyst: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', gradient: 'from-blue-500 to-indigo-600' },
  viewer: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', gradient: 'from-slate-500 to-slate-600' },
};

const ROLE_PERMISSIONS = {
  admin: ['View financial records', 'Access dashboard & analytics', 'Create, edit & delete records', 'Export records as CSV', 'Manage all users'],
  analyst: ['View financial records', 'Access dashboard & analytics', 'Export records as CSV'],
  viewer: ['View financial records'],
};

const Profile = () => {
  const { user } = useAuth();
  const style = ROLE_STYLES[user?.role] || ROLE_STYLES.viewer;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your account details and permissions</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-3xl font-black shadow-lg`}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
          <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full capitalize ${style.bg} ${style.text}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Details</h3>
        {[
          { label: 'Full Name', value: user?.name },
          { label: 'Email Address', value: user?.email },
          { label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
          { label: 'User ID', value: user?.id },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 font-mono">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Permissions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Your Permissions</h3>
        <div className="space-y-2">
          {ROLE_PERMISSIONS[user?.role]?.map((perm) => (
            <div key={perm} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              {perm}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
