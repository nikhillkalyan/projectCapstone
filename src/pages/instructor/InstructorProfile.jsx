import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import {
  Camera,
  Library,
  Users,
  Star,
  CheckCircle2,
  Save
} from 'lucide-react';

const specializationList = [
  { key: 'AIML', label: 'AI & Machine Learning', icon: '🤖', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'Cloud', label: 'Cloud Computing', icon: '☁️', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'Cybersecurity', label: 'Cybersecurity', icon: '🔒', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

// Custom Input Field Wrapper
const InputField = ({ label, type = "text", value, onChange, placeholder, disabled = false, multiline = false }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
      {label}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-text-secondary/50"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-11 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-text-secondary/50"
      />
    )}
  </div>
);

export default function InstructorProfile() {
  const { user, updateUser } = useAuth();
  const { db } = useApp();

  // Form State
  const [form, setForm] = useState({
    name: user?.name || '',
    qualification: user?.qualification || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    specialization: user?.specialization || '',
  });
  const [saved, setSaved] = useState(false);

  const myCourses = db.courses.filter(c => c.instructorId === user?.id);
  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((s, c) => s + (c.rating || 0), 0) / myCourses.length).toFixed(1)
    : '—';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'I';

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const currentSpec = specializationList.find(s => s.key === user?.specialization);

  return (
    <InstructorLayout>
      <div className="max-w-4xl mx-auto w-full pb-24">

        {/* 1. Header Section */}
        <div className="animate-fade-in-up mb-10 text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary mb-2">My Profile</h1>
          <p className="text-text-secondary font-dmsans">Manage your academic and professional details.</p>
        </div>

        {/* Top Stats Grid */}
        <div className="animate-fade-in-up grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: Library, label: 'Courses Created', value: myCourses.length, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
            { icon: Users, label: 'Total Students', value: totalStudents, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
            { icon: Star, label: 'Average Rating', value: avgRating, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 border ${stat.border}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-bold font-syne text-text-primary leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-text-muted uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-12">

          {/* Overall Profile Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
            {/* 2. Avatar Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-border-subtle/50 pb-10">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-3xl font-syne font-bold text-white shadow-xl transition-transform duration-300 group-hover:scale-105">
                  {initials}
                </div>
                <div className="absolute inset-0 rounded-[2rem] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white/90" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                <h2 className="text-2xl font-syne font-bold text-text-primary mb-1">{user?.name}</h2>
                <p className="text-text-secondary text-sm mb-4">{user?.email}</p>

                {currentSpec && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${currentSpec.bg} ${currentSpec.color} ${currentSpec.border}`}>
                    <span>{currentSpec.icon}</span>
                    {currentSpec.label}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Main Form Grid */}
            <div className="pt-8">
              <h3 className="text-lg font-syne font-bold text-text-primary flex items-center gap-2 mb-6">
                Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField
                  label="Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dr. Jane Doe"
                />

                {/* Disabled Email */}
                <InputField
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  disabled={true}
                  onChange={() => { }}
                />

                <InputField
                  label="Qualification"
                  value={form.qualification}
                  onChange={e => setForm({ ...form, qualification: e.target.value })}
                  placeholder="PhD in Computer Science, IIT Delhi"
                />

                <InputField
                  label="Experience"
                  value={form.experience}
                  onChange={e => setForm({ ...form, experience: e.target.value })}
                  placeholder="8 years as Cloud Architect at AWS"
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Bio"
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell students about your expertise and teaching style..."
                    multiline={true}
                  />
                </div>
              </div>
            </div>

            {/* Specializations Grid */}
            <div className="pt-10">
              <h3 className="text-lg font-syne font-bold text-text-primary flex items-center gap-2 mb-2">
                Specialization
              </h3>
              <p className="text-text-secondary text-sm mb-6">Select your primary area of academic expertise.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {specializationList.map((spec) => {
                  const isSelected = form.specialization === spec.key;
                  return (
                    <button
                      key={spec.key}
                      onClick={() => setForm({ ...form, specialization: spec.key })}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200 ${isSelected
                          ? `${spec.bg} ${spec.border} ring-1 ring-inset ${spec.color.replace('text-', 'ring-')}/50`
                          : 'bg-bg-elevated border-border-subtle hover:border-border-strong text-text-secondary'
                        }`}
                    >
                      <span className="text-3xl mb-2 block">{spec.icon}</span>
                      <span className={`text-xs font-bold mt-1 ${isSelected ? spec.color : 'text-text-primary'}`}>
                        {spec.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-12 flex justify-end pt-6 border-t border-border-subtle/50 relative">
              <button
                onClick={handleSave}
                className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <Save className={`w-4 h-4 transition-transform ${saved ? 'scale-0' : 'scale-100'}`} />
                <span className={`transition-opacity ${saved ? 'opacity-0' : 'opacity-100'}`}>Save Changes</span>

                {/* Save Success Overlay */}
                <div
                  className={`absolute inset-0 bg-teal-500 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all duration-300 ${saved ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Saved!</span>
                </div>
              </button>
            </div>

          </div>

          <div className="flex justify-center text-text-muted text-xs py-8">
            <p>Your profile information is public to students enrolled in your courses.</p>
          </div>

        </div>
      </div>
    </InstructorLayout>
  );
}