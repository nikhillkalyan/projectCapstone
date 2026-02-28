import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { db } = useApp();

    const course = db.courses.find(c => c.id === courseId);

    // If user is already enrolled, they shouldn't really be reading the sales page,
    // but we can allow it or auto-redirect them to the player.
    // For now, let's just render the structural scaffold.

    if (!course) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center">
                    <p className="text-text-secondary">Course not found.</p>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">

                {/* Main Content Column */}
                <div className="flex-1 flex flex-col gap-8">
                    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
                        <h1 className="text-2xl font-syne font-bold text-text-primary">
                            Course Details: Main Content Area Placeholder
                        </h1>
                    </div>
                </div>

                {/* Sidebar / CTA Column */}
                <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 min-h-[300px] flex items-center justify-center sticky top-24">
                        <h2 className="text-lg font-syne font-bold text-text-primary text-center">
                            Sticky CTA / Stats Sidebar Placeholder
                        </h2>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
