const StatCard = ({ title, value, icon, color, trend }) => {
    const colors = {
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
        green: 'bg-green-500/10 border-green-500/20 text-green-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                {trend !== undefined && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-white/40 text-sm">{title}</p>
        </div>
    );
};

export default StatCard;