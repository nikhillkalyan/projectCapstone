const statusConfig = {
    PENDING: { label: 'Pending', classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    APPROVED: { label: 'Approved', classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
    REJECTED: { label: 'Rejected', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    FLAGGED: { label: 'Flagged', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    REMOVED: { label: 'Removed', classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
            {config.label}
        </span>
    );
};

export default StatusBadge;