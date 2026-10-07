import { useEffect, useMemo, useState } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import SearchBar from '../../components/SearchBar.jsx';
import DataTable from '../../components/DataTable.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import FormInput from '../../components/FormInput.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  createMembership,
  deleteMembership,
  getAdminMemberships,
  updateMembership,
} from '../../services/membershipService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateMembership } from '../../utils/validators.js';
import useDebounce from '../../hooks/useDebounce.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { formatCurrency, formatDuration } from '../../utils/format.js';

const CATEGORIES = ['Basic', 'Standard', 'Premium', 'Gold', 'Annual', 'Student', 'Elite'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  duration: '',
  durationUnit: 'months',
  category: 'Basic',
  features: '',
  isActive: true,
};

export default function AdminMemberships() {
  useDocumentTitle('Manage Memberships');
  const { showToast } = useToast();

  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // membership being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  // Admin list endpoint returns ALL plans (including inactive).
  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminMemberships();
      setMemberships(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const filtered = useMemo(() => {
    let list = memberships;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.category.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((m) =>
        statusFilter === 'active' ? m.isActive : !m.isActive
      );
    }
    return list;
  }, [memberships, debouncedSearch, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (membership) => {
    setEditing(membership);
    setForm({
      name: membership.name,
      description: membership.description,
      price: membership.price,
      duration: membership.duration,
      durationUnit: membership.durationUnit || 'months',
      category: membership.category,
      features: (membership.features || []).join('\n'),
      isActive: membership.isActive,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFormErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errs = validateMembership(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
      durationUnit: form.durationUnit,
      category: form.category.trim(),
      features: form.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      isActive: Boolean(form.isActive),
    };

    setSaving(true);
    try {
      if (editing) {
        const res = await updateMembership(editing._id, payload);
        showToast('Membership updated successfully', 'success');
        setMemberships((list) =>
          list.map((m) => (m._id === editing._id ? res.data : m))
        );
      } else {
        const res = await createMembership(payload);
        showToast('Membership created successfully', 'success');
        setMemberships((list) => [res.data, ...list]);
      }
      setFormOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingId(deleting._id);
    try {
      const res = await deleteMembership(deleting._id);
      showToast(res.message || 'Membership deleted successfully', 'success');
      await fetchMemberships();
      setDeleting(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Membership',
      render: (m) => (
        <div>
          <p className="font-semibold text-white">{m.name}</p>
          <p className="max-w-xs truncate text-xs text-zinc-500">{m.description}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (m) => <span className="font-semibold text-white">{formatCurrency(m.price)}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (m) => formatDuration(m.duration, m.durationUnit),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (m) => <StatusBadge status={m.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (m) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openEdit(m)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 transition hover:border-accent-500 hover:text-accent-400"
            aria-label={`Edit ${m.name}`}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(m)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 transition hover:border-red-500 hover:text-red-400"
            aria-label={`Delete ${m.name}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
            Catalog
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Membership Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Create, edit and delete gym membership packages.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add membership
        </Button>
      </div>

      {/* Search + filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search memberships..."
            label="Search memberships"
          />
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner label="Loading memberships..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMemberships} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No memberships found"
            message={
              memberships.length === 0
                ? 'Create your first membership package to get started.'
                : 'Try a different search or filter.'
            }
            icon={Package}
            action={
              memberships.length === 0 ? (
                <Button onClick={openCreate} className="mt-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add membership
                </Button>
              ) : null
            }
          />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit: ${editing.name}` : 'Add new membership'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} noValidate className="space-y-4">
          <FormInput
            label="Membership name"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            error={formErrors.name}
            placeholder="e.g. Premium Membership"
            required
          />

          <div>
            <label htmlFor="membership-description" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Description<span className="ml-1 text-accent-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="membership-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe what this membership includes..."
              aria-invalid={Boolean(formErrors.description)}
              className={`w-full rounded-xl border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 ${
                formErrors.description
                  ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-zinc-700 focus:border-accent-500 focus:ring-accent-500/30'
              }`}
            />
            {formErrors.description && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
                {formErrors.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleFormChange}
              error={formErrors.price}
              placeholder="e.g. 4999"
              required
            />
            <FormInput
              label="Duration"
              name="duration"
              type="number"
              min="1"
              value={form.duration}
              onChange={handleFormChange}
              error={formErrors.duration}
              placeholder="e.g. 3"
              required
            />
            <div>
              <label htmlFor="membership-unit" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Duration unit
              </label>
              <select
                id="membership-unit"
                name="durationUnit"
                value={form.durationUnit}
                onChange={(e) => handleFormChange('durationUnit', e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="membership-category" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Category<span className="ml-1 text-accent-500" aria-hidden="true">*</span>
              </label>
              <input
                id="membership-category"
                name="category"
                list="category-options"
                value={form.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                placeholder="e.g. Premium"
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 ${
                  formErrors.category
                    ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-zinc-700 focus:border-accent-500 focus:ring-accent-500/30'
                }`}
              />
              <datalist id="category-options">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {formErrors.category && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
                  {formErrors.category}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  className="h-4 w-4 accent-orange-500"
                />
                <span className="text-sm text-zinc-300">
                  Active (visible to users){' '}
                  <StatusBadge status={form.isActive ? 'active' : 'inactive'} />
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="membership-features" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Features (one per line)
            </label>
            <textarea
              id="membership-features"
              name="features"
              rows={4}
              value={form.features}
              onChange={(e) => handleFormChange('features', e.target.value)}
              placeholder={'Unlimited Gym Access\nPersonal Trainer\nCardio Area'}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Each line becomes a feature shown on the membership card.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Create membership'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleting?._id}
        title="Delete membership"
        message={
          deleting
            ? `Are you sure you want to delete "${deleting.name}"? If this membership has existing applications it will be deactivated instead of deleted.`
            : ''
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
