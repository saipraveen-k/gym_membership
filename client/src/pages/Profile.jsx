import { useState } from 'react';
import { KeyRound, Save, UserCog } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { changePassword, updateProfile } from '../services/authService.js';
import { validateChangePassword, validateProfile } from '../utils/validators.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  useDocumentTitle('Profile');

  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (name, value) => {
    setProfile((p) => ({ ...p, [name]: value }));
    setProfileErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handlePasswordChange = (name, value) => {
    setPasswords((p) => ({ ...p, [name]: value }));
    setPasswordErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile(profile);
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: profile.name.trim(), phone: profile.phone.trim() });
      updateUser(res.data);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validateChangePassword(passwords);
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      showToast(res.message || 'Password changed successfully', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Profile settings
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Update your personal information and account password.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Account summary */}
        <aside className="card h-fit p-6 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/15 text-base font-extrabold text-accent-400">
              {(user?.name || '?')
                .split(' ')
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()}
            </span>
            <div>
              <p className="font-bold text-white">{user?.name}</p>
              <p className="break-all text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-zinc-800 pt-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Role</dt>
              <dd>
                <StatusBadge status={user?.role} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Member since</dt>
              <dd className="font-medium text-zinc-200">{formatDate(user?.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Email</dt>
              <dd className="truncate font-medium text-zinc-200">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Phone</dt>
              <dd className="font-medium text-zinc-200">{user?.phone}</dd>
            </div>
          </dl>

          <p className="mt-5 rounded-xl bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-500">
            Your account role cannot be changed from this page. Contact an administrator for
            role changes.
          </p>
        </aside>

        {/* Forms */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6" aria-labelledby="personal-info-heading">
            <h2
              id="personal-info-heading"
              className="flex items-center gap-2 text-lg font-bold text-white"
            >
              <UserCog className="h-5 w-5 text-accent-500" aria-hidden="true" />
              Personal information
            </h2>

            <form onSubmit={handleProfileSubmit} noValidate className="mt-5 space-y-4">
              <FormInput
                label="Full name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                error={profileErrors.name}
                autoComplete="name"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={() => {}}
                  hint="Email cannot be changed"
                  disabled
                />
                <FormInput
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  error={profileErrors.phone}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={savingProfile}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </form>
          </section>

          <section className="card p-6" aria-labelledby="change-password-heading">
            <h2
              id="change-password-heading"
              className="flex items-center gap-2 text-lg font-bold text-white"
            >
              <KeyRound className="h-5 w-5 text-accent-500" aria-hidden="true" />
              Change password
            </h2>

            <form onSubmit={handlePasswordSubmit} noValidate className="mt-5 space-y-4">
              <FormInput
                label="Current password"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                autoComplete="current-password"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="New password"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.newPassword}
                  hint="Minimum 6 characters with a number"
                  autoComplete="new-password"
                  required
                />
                <FormInput
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" loading={savingPassword}>
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Change password
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
