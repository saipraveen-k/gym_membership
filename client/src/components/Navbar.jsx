import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Menu, X, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initials } from '../utils/format.js';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'text-accent-400' : 'text-zinc-300 hover:text-white'
  }`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="Iron Peak Gym home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white shadow-glow">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            IRON<span className="text-accent-500">PEAK</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/memberships" className={navLinkClass}>
            Memberships
          </NavLink>
          {user && (
            <NavLink to="/my-memberships" className={navLinkClass}>
              My Applications
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Admin Panel
            </NavLink>
          )}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-zinc-600"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500/20 text-[10px] font-bold text-accent-400">
                  {initials(user.name)}
                </span>
                <span className="max-w-[10rem] truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost !px-3 !py-2 text-sm"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-4 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 text-sm">
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/memberships" className={navLinkClass}>
              Memberships
            </NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  Dashboard
                </NavLink>
                <NavLink to="/my-memberships" className={navLinkClass}>
                  My Applications
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  <UserIcon className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  Profile
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Admin Panel
              </NavLink>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <button type="button" onClick={handleLogout} className="btn-secondary w-full">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary w-full">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
