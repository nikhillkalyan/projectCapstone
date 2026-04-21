import { forwardRef } from 'react';

const variants = {
  primary: 'bg-gradient-primary text-white shadow-glow hover:shadow-glow-accent border border-primary-400/20',
  secondary: 'glass-sm text-text-primary hover:bg-white/[0.07]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/[0.06]',
  danger: 'bg-error-500/12 text-error-400 border border-error-500/25 hover:bg-error-500/18',
  success: 'bg-success-500/12 text-success-400 border border-success-500/25 hover:bg-success-500/18',
};

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
};

const Button = forwardRef(function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  children,
  ...props
}, ref) {
  return (
    <Component
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Button;
