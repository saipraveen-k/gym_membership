import { useEffect, useState } from 'react';
import { Eye, SearchX, Users } from 'lucide-react';
import SearchBar from '../../components/SearchBar.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { getUsers, getUserById } from '../../services/adminService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';

export default function AdminUsers() {
  useDocumentTitle('Manage Users');

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [viewing, setViewing] = useState(null); // { ...user, applications: [] }
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({ search: debouncedSearch, role: roleFilter });
      setUsers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, roleFilter]);

  const openView = async (user) => {
    setViewing({ ...user, applications: [] });
    setViewLoading(true);
    setViewError(null);
    try {
      const res = await getUserById(user._id);
      setViewing(res.data);
    } catch (err) {
      setViewError(err.message);
    } finally {
      setViewLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (u) => (
        <div>
          <p className="font-semibold text-white">
            {u.name}
            {u._id === currentUser?._id && (
              <span className="ml-2 text-xs font-medium text-accent-400">(you)</span>
            )}
          </p>
          <p className="text-xs text-zinc-500">{u.email}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email', className: 'hidden xl:table-cell' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role',
      label: 'Role',
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (u) => formatDate(u.createdAt),
    },
    {
      key: 'applications',
      label: 'Applications',
      render: (u) => (
        <span className="font-semibold text-white">{u.applications ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (u) => (
        <button
          type="button"
          onClick={() => openView(u)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 transition hover:border-accent-500 hover:text-accent-400"
          aria-label={`View ${u.name}`}
          title="View user"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">Members</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">User Management</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Everyone who has registered on the platform, with their application counts.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email or phone..."
            label="Search users"
          />
        </div>
        <div>
          <label htmlFor="role-filter" className="sr-only">
            Filter by role
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
          >
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner label="Loading users..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUsers} />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            message={
              search
                ? 'No users match your search.'
                : 'Registered users will appear here.'
            }
            icon={SearchX}
          />
        ) : (
          <DataTable columns={columns} rows={users} />
        )}
      </div>

      {/* User detail modal */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing ? `User: ${viewing.name}` : 'User details'}
        maxWidth="max-w-2xl"
      >
        {viewLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner label="Loading user details..." />
          </div>
        ) : viewError ? (
          <ErrorState message={viewError} />
        ) : viewing ? (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="mt-0.5 font-semibold text-white break-all">{viewing.email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="mt-0.5 font-semibold text-white">{viewing.phone}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Role</p>
                <div className="mt-1">
                  <StatusBadge status={viewing.role} />
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Registered on</p>
                <p className="mt-0.5 font-semibold text-white">
                  {formatDateTime(viewing.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Users className="h-4 w-4 text-accent-500" aria-hidden="true" />
                Applications ({viewing.applications?.length || 0})
              </h3>

              {!viewing.applications?.length ? (
                <p className="mt-3 text-sm text-zinc-500">
                  This user has not applied for any membership yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {viewing.applications.map((app) => (
                    <li
                      key={app._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {app.membership?.name || 'Deleted plan'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatCurrency(app.membership?.price)} · applied{' '}
                          {formatDate(app.appliedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={app.status} />
                        <StatusBadge status={app.paymentStatus} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
