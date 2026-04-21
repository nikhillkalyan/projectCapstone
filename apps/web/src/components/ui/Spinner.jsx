export default function Spinner({ className = 'h-5 w-5' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-primary-300/30 border-t-primary-300 ${className}`}
      aria-label="Loading"
    />
  );
}
