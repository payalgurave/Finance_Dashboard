import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Users from './pages/Users';
import Profile from './pages/Profile';
import ActivityLog from './pages/ActivityLog';

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute roles={['analyst', 'admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute roles={['viewer', 'analyst', 'admin']}><Records /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['viewer', 'analyst', 'admin']}><Profile /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute roles={['admin']}><ActivityLog /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={user ? <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} /> : <Navigate to="/login" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
