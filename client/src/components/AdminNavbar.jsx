import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initials } from '../utils/format.js';

export default function AdminNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin menu"
          className="rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white">Admin Panel</p>
          <p className="text-xs text-zinc-500">Manage memberships, users and applications</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/20 text-[10px] font-bold text-accent-400">
              {initials(user?.name)}
            </span>
            <div className="hidden text-left sm:block">
              <p className="max-w-[10rem] truncate text-xs font-semibold text-white">
                {user?.name}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost !px-3 !py-2 text-sm"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
