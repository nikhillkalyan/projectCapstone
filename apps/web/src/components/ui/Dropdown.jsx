export default function Dropdown({ label, value, onChange, options = [], className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">{label}</span>}
      <select
        value={value}
        onChange={onChange}
        className="glass-input h-11 w-full rounded-lg px-4 text-sm outline-none"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option} className="bg-bg-elevated text-text-primary">
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
