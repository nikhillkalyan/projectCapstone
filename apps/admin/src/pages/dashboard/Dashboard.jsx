import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { useInstructors } from '../../hooks/useInstructors';

const Dashboard = () => {
    const navigate = useNavigate();
    const { instructors, stats, loading, statusFilter, setStatusFilter, search, setSearch } = useInstructors();

    return (
        <AdminLayout title="Dashboard">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Pending Review"
                    value={stats.pending ?? 0}
                    color="yellow"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Approved"
                    value={stats.approved ?? 0}
                    color="green"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Flagged"
                    value={stats.flagged ?? 0}
                    color="indigo"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejected ?? 0}
                    color="red"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">

                {/* Table Header */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <h2 className="text-white font-semibold">Instructor Applications</h2>
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
                        />
                        {/* Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white/60 focus:outline-none focus:border-indigo-500/50 transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="FLAGGED">Flagged</option>
                        </select>
                    </div>
                </div>

                {/* Table Body */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : instructors.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/20 text-sm">No instructor applications found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {['Instructor', 'Email', 'Registered', 'Documents', 'Status', ''].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {instructors.map((instructor) => (
                                <tr
                                    key={instructor.id}
                                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    onClick={() => navigate(`/instructors/${instructor.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 text-sm font-semibold">
                                                {instructor.name?.charAt(0)}
                                            </div>
                                            <span className="text-white text-sm font-medium">{instructor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/50 text-sm">{instructor.email}</td>
                                    <td className="px-6 py-4 text-white/50 text-sm">
                                        {new Date(instructor.registeredAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-white/50 text-sm">
                                        {instructor.documentCount ?? 0} docs
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={instructor.approvalStatus} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                                            Review →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
};

export default Dashboard;