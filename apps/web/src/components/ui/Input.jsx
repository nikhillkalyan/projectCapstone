import { forwardRef } from 'react';

const Input = forwardRef(function Input({
  label,
  error,
  className = '',
  wrapperClassName = '',
  textarea = false,
  ...props
}, ref) {
  const Field = textarea ? 'textarea' : 'input';

  return (
    <label className={`block ${wrapperClassName}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">
          {label}
        </span>
      )}
      <Field
        ref={ref}
        className={`glass-input w-full rounded-lg px-4 py-3 text-sm outline-none ${textarea ? 'min-h-28 resize-y' : 'h-11'} ${className}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs font-semibold text-error-400">{error}</span>}
    </label>
  );
});

export default Input;
