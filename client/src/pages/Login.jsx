import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, LogIn } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateLogin } from '../utils/validators.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Login() {
  useDocumentTitle('Login');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
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

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const user = await login(values.email.trim(), values.password);
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
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
      <div className="w-full max-w-md">
        <div className="card p-7 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-glow">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Login to apply for memberships and track your applications.
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
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <Button type="submit" loading={submitting} className="w-full !py-3">
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              className="font-semibold text-accent-400 transition hover:text-accent-300"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center text-xs text-zinc-500">
          <Dumbbell className="mr-1.5 inline h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
          Looking for the admin login? Use the admin credentials from the README.
        </div>
      </div>
    </div>
  );
}
