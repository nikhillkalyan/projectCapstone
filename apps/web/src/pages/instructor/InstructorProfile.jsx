import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  BookOpen,
  Building2,
  Github,
  GraduationCap,
  Mail,
  PencilLine,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import { getCoursesByInstructor } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold font-syne text-text-primary">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="py-3 border-b border-border-subtle/60 last:border-b-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className="text-sm font-semibold text-text-primary">{value || 'Not added yet'}</div>
    </div>
  );
}

export default function InstructorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.profile || {};
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.id) return;
      try {
        const response = await getCoursesByInstructor(user.id);
        setCourses(response.data || []);
      } catch {
        setCourses([]);
      }
    };

    loadCourses();
  }, [user?.id]);

  const totalStudents = courses.reduce((sum, course) => sum + (course.totalEnrollments || 0), 0);
  const avgRating = courses.length
    ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
    : '0.0';
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'IN';

  return (
    <InstructorLayout>
      <div className="max-w-5xl mx-auto w-full pb-24 space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(78,205,196,0.15),transparent_28%),linear-gradient(135deg,rgba(14,17,26,0.98),rgba(18,25,30,0.96))] p-6 md:p-8 shadow-2xl">
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-[28px] bg-gradient-to-br from-emerald-500 via-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold font-syne shadow-xl shadow-primary-500/20">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Instructor Profile
                </span>
                {profile.universityName && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.universityName}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary leading-tight">
                {user?.name || 'Instructor'}
              </h1>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => navigate('/instructor/settings')}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-400 transition-all"
                >
                  <PencilLine className="w-4 h-4" />
                  Edit Profile
                </button>
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
                  >
                    <Github className="w-4 h-4" />
                    @{profile.githubUsername}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={BookOpen} label="Courses" value={courses.length} />
          <MetricCard icon={Users} label="Students" value={totalStudents} />
          <MetricCard icon={Star} label="Avg Rating" value={avgRating} />
          <MetricCard icon={GraduationCap} label="Faculty ID" value={profile.employeeId || 'Pending'} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-[28px] border border-border-subtle bg-bg-surface p-6 md:p-7">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-syne font-bold text-text-primary">Professional Summary</h2>
            </div>
            <p className="text-sm leading-7 text-text-secondary">
              {profile.bio || 'No bio added yet. Add a short professional summary from Settings so students understand your background and teaching style.'}
            </p>
          </div>

          <div className="rounded-[28px] border border-border-subtle bg-bg-surface p-6 md:p-7">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-syne font-bold text-text-primary">Profile Details</h2>
            </div>
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Qualification" value={profile.qualification} />
            <InfoRow label="Experience" value={profile.experience} />
            <InfoRow label="Specialization" value={profile.specialization} />
          </div>
        </section>
      </div>
    </InstructorLayout>
  );
}
