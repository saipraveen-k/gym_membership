import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateRegister } from '../utils/validators.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Register() {
  useDocumentTitle('Register');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setServerError(null);
  };

  const redirectTo = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      showToast('Registration successful', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center py-14">
      <div className="w-full max-w-lg">
        <div className="card p-7 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-glow">
              <UserPlus className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Register to apply for gym memberships and track your application status.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormInput
              label="Full name"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Rahul Sharma"
              autoComplete="name"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="e.g. 9876543210"
                autoComplete="tel"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                hint="Minimum 6 characters with a number"
                autoComplete="new-password"
                required
              />
              <FormInput
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full !py-3">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="font-semibold text-accent-400 transition hover:text-accent-300"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
