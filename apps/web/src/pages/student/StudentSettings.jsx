import { useState } from 'react';
import { CheckCircle2, Github, Loader2, Save, UserRound } from 'lucide-react';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import { useAuth } from '../../context/AuthContext';

const INTEREST_OPTIONS = ['AIML', 'Cloud', 'DataScience', 'Cybersecurity', 'WebDev', 'Mobile'];
const inputClass = 'w-full rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary-500/50 focus:bg-bg-elevated';

function Field({ label, children, hint }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export default function StudentSettings() {
  const { user, updateUser } = useAuth();
  const profile = user?.profile || {};
  const [form, setForm] = useState({
    name: user?.name || '',
    githubUsername: profile.githubUsername || '',
    rollNumber: profile.rollNumber || '',
    college: profile.college || '',
    yearOfStudy: profile.yearOfStudy || '',
    bio: profile.bio || '',
    interests: profile.interests || [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleInterest = (interest) => {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const result = await updateUser(form);
    setSaving(false);
    if (result?.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto w-full pb-24 space-y-8">
        <section className="rounded-[28px] border border-border-subtle bg-[linear-gradient(135deg,rgba(108,127,216,0.14),rgba(108,127,216,0.02))] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
              <UserRound className="w-6 h-6 text-primary-300" />
            </div>
            <div>
              <h1 className="text-3xl font-syne font-bold text-text-primary">Profile Settings</h1>
              <p className="text-text-secondary mt-2 max-w-2xl">
                Update only what matters: core identity, GitHub handle, roll number, and academic details.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-border-subtle bg-bg-base/70 p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className={`${inputClass} opacity-70`} value={user?.email || ''} disabled />
            </Field>
            <Field label="GitHub Username" hint="Important for upcoming project-space and repo integrations.">
              <div className="relative">
                <Github className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input className={`${inputClass} pl-11`} value={form.githubUsername} placeholder="e.g. johndoe" onChange={(e) => setForm({ ...form, githubUsername: e.target.value.replace('@', '') })} />
              </div>
            </Field>
            <Field label="Roll Number" hint="You can add this now if it was missed earlier.">
              <input className={inputClass} value={form.rollNumber} placeholder="e.g. 22CSE104" onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
            </Field>
            <Field label="College">
              <input className={inputClass} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            </Field>
            <Field label="Year Of Study">
              <input className={inputClass} value={form.yearOfStudy} placeholder="e.g. 3rd Year" onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })} />
            </Field>
          </div>

          <Field label="Bio">
            <textarea rows={5} className={`${inputClass} resize-none`} value={form.bio} placeholder="Write a short introduction about yourself." onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>

          <Field label="Interests">
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-3.5 py-2 text-xs font-bold border transition-all ${
                      selected
                        ? 'border-primary-500/30 bg-primary-500/12 text-primary-300'
                        : 'border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Saved successfully
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-400 disabled:opacity-60 transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
