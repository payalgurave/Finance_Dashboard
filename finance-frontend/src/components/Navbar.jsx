import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', roles: ['analyst', 'admin'] },
  { to: '/records', label: 'Records', roles: ['viewer', 'analyst', 'admin'] },
  { to: '/users', label: 'Users', roles: ['admin'] },
];

const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700',
  analyst: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-indigo-600">FinanceApp</span>
        {NAV.filter((n) => n.roles.includes(user?.role)).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
              location.pathname === n.to
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {n.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_BADGE[user?.role]}`}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
