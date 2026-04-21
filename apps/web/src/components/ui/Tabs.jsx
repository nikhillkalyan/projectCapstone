export default function Tabs({ tabs = [], active, onChange, className = '' }) {
  return (
    <div className={`glass-sm inline-flex rounded-lg p-1 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const id = tab.value ?? tab;
        const selected = id === active;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange?.(id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${selected ? 'bg-primary-500 text-white shadow-glow' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {tab.label ?? tab}
          </button>
        );
      })}
    </div>
  );
}
