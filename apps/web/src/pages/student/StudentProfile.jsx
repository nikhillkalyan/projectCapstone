import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  BookOpen,
  Building2,
  Github,
  GraduationCap,
  Mail,
  PencilLine,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';

function InfoCard({ icon: Icon, label, value, muted = false }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-semibold ${muted ? 'text-text-secondary' : 'text-text-primary'}`}>
        {value || 'Not added yet'}
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.profile || {};
  const displayCollege = profile.college || profile.universityName || null;
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto w-full pb-24 space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(108,127,216,0.18),transparent_35%),linear-gradient(135deg,rgba(14,17,26,0.98),rgba(20,25,36,0.96))] p-6 md:p-8 shadow-2xl">
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-[28px] bg-gradient-to-br from-primary-500 via-accent-500 to-primary-700 flex items-center justify-center text-white text-3xl md:text-4xl font-bold font-syne shadow-xl shadow-primary-500/20">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-300">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Student Profile
                </span>
                {profile.universityName && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.universityName}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary leading-tight">
                {user?.name || 'Student'}
              </h1>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => navigate('/student/settings')}
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

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard icon={Mail} label="Email" value={user?.email} />
          <InfoCard icon={GraduationCap} label="Roll Number" value={profile.rollNumber} muted={!profile.rollNumber} />
          <InfoCard icon={Building2} label="College" value={displayCollege} muted={!displayCollege} />
          <InfoCard icon={BookOpen} label="Year Of Study" value={profile.yearOfStudy} muted={!profile.yearOfStudy} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="rounded-[28px] border border-border-subtle bg-bg-surface p-6 md:p-7">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-syne font-bold text-text-primary">About</h2>
            </div>
            <p className="text-sm leading-7 text-text-secondary">
              {profile.bio || 'No bio added yet. Add a short introduction from Settings so instructors and teammates can know more about you.'}
            </p>
          </div>

          <div className="rounded-[28px] border border-border-subtle bg-bg-surface p-6 md:p-7">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-syne font-bold text-text-primary">Interests</h2>
            </div>
            {profile.interests?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1.5 text-xs font-bold text-primary-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-text-secondary">
                No interests added yet. Add a few from Settings to personalize your profile.
              </p>
            )}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
