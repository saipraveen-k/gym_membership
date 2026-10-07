import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Public / user pages
import Home from './pages/Home.jsx';
import Memberships from './pages/Memberships.jsx';
import MembershipDetails from './pages/MembershipDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyMemberships from './pages/MyMemberships.jsx';
import Profile from './pages/Profile.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminMemberships from './pages/admin/AdminMemberships.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminApplications from './pages/admin/AdminApplications.jsx';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* ---------- Public + user routes ---------- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/memberships" element={<Memberships />} />
        <Route path="/memberships/:id" element={<MembershipDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-memberships"
          element={
            <ProtectedRoute>
              <MyMemberships />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ---------- Admin routes (role protected on frontend AND backend) ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="memberships" element={<AdminMemberships />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="applications" element={<AdminApplications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
