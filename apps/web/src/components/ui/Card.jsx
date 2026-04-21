export default function Card({ className = '', children, hover = true, as: Component = 'div', ...props }) {
  return (
    <Component
      className={`${hover ? 'glass-card' : 'glass'} rounded-lg ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
