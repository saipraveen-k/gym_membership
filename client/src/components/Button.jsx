import { Loader2 } from 'lucide-react';

/**
 * Reusable button with variants: primary | secondary | danger | ghost
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/20',
    secondary:
      'border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
