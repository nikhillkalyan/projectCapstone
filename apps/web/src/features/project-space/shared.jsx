export const STUDENT_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export const fmtTime = (iso) => iso ? new Date(iso).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}) : '—';

const STATUS_MAP = {
  FORMING: { label: 'Forming', bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400' },
  PROPOSAL_PENDING: { label: 'Proposal Pending', bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400' },
  PROPOSAL_APPROVED: { label: 'Approved', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400' },
  ACTIVE: { label: 'Active', bg: 'bg-primary-500/10', border: 'border-primary-500/25', text: 'text-primary-400' },
  SUBMITTED: { label: 'Submitted', bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400' },
};

export function GroupStatusBadge({ status }) {
  const tone = STATUS_MAP[status] || STATUS_MAP.FORMING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tone.bg} ${tone.border} ${tone.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {tone.label}
    </span>
  );
}
