const variants = {
  primary: 'bg-primary-500/12 text-primary-300 border-primary-400/25',
  accent: 'bg-accent-500/12 text-accent-400 border-accent-400/25',
  success: 'bg-success-500/12 text-success-400 border-success-400/25',
  warning: 'bg-warning-500/12 text-warning-400 border-warning-400/25',
  error: 'bg-error-500/12 text-error-400 border-error-400/25',
  neutral: 'bg-white/[0.05] text-text-secondary border-white/10',
};

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-bold leading-none ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
