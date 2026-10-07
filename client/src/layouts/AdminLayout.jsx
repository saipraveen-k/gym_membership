import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminNavbar from '../components/AdminNavbar.jsx';

/**
 * Admin layout: fixed sidebar (drawer on mobile) + top navbar + content.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
