import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import SectionShell from '../../components/shared/SectionShell';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UserCircle, Save, Bell, Shield,
  BookOpen, CheckCircle2, TrendingUp, Camera, Edit2
} from 'lucide-react';

const interestList = [
  { key: 'AIML', label: 'AI & ML', icon: '🤖' },
  { key: 'Cloud', label: 'Cloud Computing', icon: '☁️' },
  { key: 'DataScience', label: 'Data Science', icon: '📊' },
  { key: 'Cybersecurity', label: 'Security', icon: '🔒' },
  { key: 'WebDev', label: 'Web Development', icon: '💻' },
  { key: 'Mobile', label: 'Mobile Apps', icon: '📱' },
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

// Custom Toggle Component
const CustomToggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-text-primary font-medium text-sm">{label}</p>
      {description && <p className="text-text-secondary text-xs mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-1 focus:ring-offset-[#09090b] ${checked ? 'bg-primary-500' : 'bg-bg-surface border border-border-subtle'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  </div>
);

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
        className="glass-input w-full resize-none rounded-lg px-4 py-3 text-sm text-text-primary outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-text-secondary/50"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="glass-input h-11 w-full rounded-lg px-4 text-sm text-text-primary outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-text-secondary/50"
      />
    )}
  </div>
);

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const { db, getCourseProgress } = useApp();

  // Form State
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    year: user?.year || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    emailNotifs: true,
    learningReminders: false,
    darkMode: true
  });
  const [saved, setSaved] = useState(false);

  const toggleInterest = (key) => {
    setForm(p => ({
      ...p,
      interests: p.interests.includes(key) ? p.interests.filter(i => i !== key) : [...p.interests, key]
    }));
  };

  const handleSave = () => {
    updateUser({
      name: form.name,
      college: form.college,
      year: form.year,
      bio: form.bio,
      interests: form.interests
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Derived Stats
  const enrolled = db.courses.filter(c => user?.enrolledCourses?.includes(c.id));
  const completed = user?.completedCourses || [];
  const avgProgress = enrolled.length > 0 ? Math.round(enrolled.reduce((s, c) => s + getCourseProgress(c.id), 0) / enrolled.length) : 0;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto w-full pb-24">

        {/* 1. Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center sm:text-left"
        >
          <h1 className="heading-2 mb-2 text-gradient">Account Settings</h1>
          <p className="text-text-secondary">Manage your profile, preferences, and security.</p>
        </motion.div>

        <div className="space-y-12">

          {/* Overall Profile Card */}
          <div className="glass relative overflow-hidden rounded-lg p-6 sm:p-10">
            {/* 2. Avatar Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-border-subtle/50 pb-10">
              <div className="relative group cursor-pointer">
                <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gradient-accent font-display text-3xl font-bold text-white shadow-glow transition-transform duration-300 group-hover:scale-105">
                  {initials}
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Camera className="w-8 h-8 text-white/90" />
                </div>
                {/* Status Dot */}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg-base">
                  <div className="h-4 w-4 rounded-full bg-success-500 shadow-glow-accent" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                <h2 className="mb-1 font-display text-2xl font-bold text-text-primary">{user?.name}</h2>
                <p className="text-text-secondary text-sm mb-4">{user?.email}</p>

                {/* Quick Stats */}
                <div className="flex items-center justify-center sm:justify-start gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold font-syne text-primary-400">{enrolled.length}</span>
                    <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Enrolled</span>
                  </div>
                  <div className="h-8 w-px bg-border-subtle" />
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-bold text-success-400">{completed.length}</span>
                    <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Completed</span>
                  </div>
                  <div className="h-8 w-px bg-border-subtle" />
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-bold text-primary-300">{avgProgress}%</span>
                    <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Avg Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Account Information Form */}
            <div className="pt-10">
              <div className="flex items-center gap-3 mb-6">
                <UserCircle className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-syne font-bold text-text-primary">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField
                  label="Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  disabled={true}
                />
                <InputField
                  label="University / College"
                  value={form.college}
                  onChange={e => setForm({ ...form, college: e.target.value })}
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
                    Academic Year
                  </label>
                  <div className="relative">
                    <select
                      value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })}
                      className="glass-input h-11 w-full cursor-pointer appearance-none rounded-lg px-4 text-sm text-text-primary outline-none"
                    >
                      <option value="" disabled className="bg-bg-base">Select your year</option>
                      {years.map(y => <option key={y} value={y} className="bg-bg-base">{y}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="Short Bio"
                    multiline={true}
                    placeholder="Tell other students and instructors a bit about yourself..."
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Interests / Skills */}
            <div className="pt-10">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-syne font-bold text-text-primary">Learning Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {interestList.map(int => {
                  const isSelected = form.interests.includes(int.key);
                  return (
                    <button
                      key={int.key}
                      onClick={() => toggleInterest(int.key)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${isSelected
                          ? 'border-primary-400/50 bg-primary-500/10 text-white shadow-glow'
                          : 'bg-white/[0.02] border-border-subtle border-transparent text-text-secondary hover:text-text-primary hover:border-border-muted'
                        }`}
                    >
                      <span>{int.icon}</span>
                      {int.label}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-400 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Preferences & Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preferences */}
            <div className="glass rounded-lg p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-syne font-bold text-text-primary">Preferences</h3>
              </div>
              <div className="space-y-6">
                <CustomToggle
                  label="Email Notifications"
                  description="Receive updates on course announcements and grades."
                  checked={form.emailNotifs}
                  onChange={() => setForm({ ...form, emailNotifs: !form.emailNotifs })}
                />
                <div className="h-px w-full bg-border-subtle/50" />
                <CustomToggle
                  label="Learning Reminders"
                  description="Get weekly push notifications to keep your streak alive."
                  checked={form.learningReminders}
                  onChange={() => setForm({ ...form, learningReminders: !form.learningReminders })}
                />
                <div className="h-px w-full bg-border-subtle/50" />
                <CustomToggle
                  label="Force Dark Mode"
                  description="Override system settings and always use dark mode."
                  checked={form.darkMode}
                  onChange={() => setForm({ ...form, darkMode: !form.darkMode })}
                />
              </div>
            </div>

            {/* Security */}
            <div className="glass rounded-lg p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-syne font-bold text-text-primary">Security</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-text-primary font-medium text-sm mb-1">Password</p>
                  <p className="text-text-secondary text-xs mb-3">Last changed 3 months ago</p>
                  <button className="text-sm font-medium text-text-primary bg-white/[0.03] border border-border-subtle hover:bg-white/[0.08] px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    Update Password
                  </button>
                </div>
                <div className="h-px w-full bg-border-subtle/50" />
                <div>
                  <p className="text-text-primary font-medium text-sm mb-1">Two-Factor Authentication</p>
                  <p className="text-text-secondary text-xs mb-3">Add an extra layer of security to your account.</p>
                  <button className="text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Save Action Area */}
          <div className="flex items-center justify-end pt-4 border-t border-border-subtle/50">
            <button
              onClick={handleSave}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-primary px-8 py-3 font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-95"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>

        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-lg fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-lg p-4 shadow-strong"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-500/20">
              <CheckCircle2 className="h-5 w-5 text-success-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Profile Updated</p>
              <p className="text-xs text-text-secondary">Your changes have been saved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}
