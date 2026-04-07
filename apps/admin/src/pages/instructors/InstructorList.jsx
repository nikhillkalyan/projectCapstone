import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import { useInstructors } from '../../hooks/useInstructors';

const InstructorList = () => {
    const navigate = useNavigate();
    const { instructors, loading, statusFilter, setStatusFilter, search, setSearch } = useInstructors();

    return (
        <AdminLayout title="Instructors">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <h2 className="text-white font-semibold">All Applications</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
                        />
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

                {/* Table */}
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
                                {['Instructor', 'Qualification', 'Experience', 'Registered', 'Status', ''].map((h) => (
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
                                            <div className="w-9 h-9 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-semibold text-sm">
                                                {instructor.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{instructor.name}</p>
                                                <p className="text-white/40 text-xs">{instructor.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/50 text-sm">{instructor.qualification}</td>
                                    <td className="px-6 py-4 text-white/50 text-sm">{instructor.experience}</td>
                                    <td className="px-6 py-4 text-white/50 text-sm">
                                        {instructor.registeredAt ? new Date(instructor.registeredAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        }) : '—'}
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

export default InstructorList;