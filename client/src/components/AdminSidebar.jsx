import { NavLink } from 'react-router-dom';
import {
  Dumbbell,
  LayoutDashboard,
  Package,
  Users,
  FileStack,
  X,
} from 'lucide-react';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/memberships', label: 'Memberships', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/applications', label: 'Applications', icon: FileStack },
];

export default function AdminSidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-accent-500/15 text-accent-400 ring-1 ring-inset ring-accent-500/30'
        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
    }`;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
        <NavLink to="/" className="flex items-center gap-2" aria-label="Back to site">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-white">
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-extrabold tracking-tight text-white">
            IRON<span className="text-accent-500">PEAK</span>
            <span className="ml-1 text-xs font-semibold text-zinc-500">ADMIN</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <NavLink to="/" className={linkClass}>
          ← Back to website
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-800 bg-zinc-950 lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-zinc-800 bg-zinc-950 shadow-card">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
