import { useId } from 'react';

/**
 * Labeled form input with error message.
 * props: label, type, value, onChange(name/value handled by parent), error, hint, required, ...rest
 */
export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder,
  autoComplete,
  ...rest
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-accent-500" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
            : 'border-zinc-700 focus:border-accent-500 focus:ring-accent-500/30'
        }`}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
