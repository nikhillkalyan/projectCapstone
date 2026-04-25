import { useState } from 'react';
import { CheckCircle2, Github, Loader2, Save, UserRound, Key } from 'lucide-react';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

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

export default function InstructorSettings() {
  const { user, updateUser } = useAuth();
  const profile = user?.profile || {};
  const [form, setForm] = useState({
    name: user?.name || '',
    githubUsername: profile.githubUsername || '',
    employeeId: profile.employeeId || '',
    qualification: profile.qualification || '',
    experience: profile.experience || '',
    specialization: profile.specialization || '',
    bio: profile.bio || '',
  });
  const [pat, setPat] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPat, setSavingPat] = useState(false);
  const [saved, setSaved] = useState(false);
  const [patSaved, setPatSaved] = useState(false);
  const [patError, setPatError] = useState('');

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

  const handleSavePat = async () => {
    if (!pat.trim()) { setPatError('Enter a valid PAT'); return; }
    setSavingPat(true);
    setPatError('');
    try {
      await api.put('/project-space/github-pat', { pat: pat.trim() });
      setPatSaved(true);
      setPat('');
      setTimeout(() => setPatSaved(false), 2500);
    } catch (e) {
      setPatError(e.response?.data?.message || 'Failed to save PAT');
    } finally {
      setSavingPat(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="max-w-4xl mx-auto w-full pb-24 space-y-8">
        <section className="rounded-[28px] border border-border-subtle bg-[linear-gradient(135deg,rgba(78,205,196,0.14),rgba(78,205,196,0.02))] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <UserRound className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-3xl font-syne font-bold text-text-primary">Instructor Settings</h1>
              <p className="text-text-secondary mt-2 max-w-2xl">
                Update your public teaching profile, GitHub handle, and faculty identifier.
              </p>
            </div>
          </div>
        </section>

        {/* Profile fields */}
        <section className="rounded-[28px] border border-border-subtle bg-bg-base/70 p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className={`${inputClass} opacity-70`} value={user?.email || ''} disabled />
            </Field>
            <Field label="GitHub Username" hint="Used to identify you as a contributor in project repos.">
              <div className="relative">
                <Github className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input className={`${inputClass} pl-11`} value={form.githubUsername} placeholder="e.g. janedoe" onChange={(e) => setForm({ ...form, githubUsername: e.target.value.replace('@', '') })} />
              </div>
            </Field>
            <Field label="Faculty ID" hint="Add this now if it was not entered before.">
              <input className={inputClass} value={form.employeeId} placeholder="e.g. FAC-204" onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            </Field>
            <Field label="Qualification">
              <input className={inputClass} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            </Field>
            <Field label="Experience">
              <input className={inputClass} value={form.experience} placeholder="e.g. 8 years teaching cloud systems" onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </Field>
            <Field label="Specialization">
              <input className={inputClass} value={form.specialization} placeholder="e.g. AI & Machine Learning" onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            </Field>
          </div>

          <Field label="Bio">
            <textarea rows={5} className={`${inputClass} resize-none`} value={form.bio} placeholder="Write a concise professional summary for students." onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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

        {/* GitHub Integration PAT */}
        <section className="rounded-[28px] border border-border-subtle bg-bg-base/70 p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary font-syne">GitHub Integration</h2>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Add a fine-grained GitHub Personal Access Token (PAT) with <strong>read-only</strong> access to your repositories.
                This lets EduForge display branches, pull requests, and commit activity from your project repos inside the platform.
                Your PAT is stored securely and only used to read repo data.
              </p>
            </div>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-2xl space-y-3">
            <p className="text-xs text-purple-300 leading-relaxed">
              Generate a fine-grained PAT at <span className="font-mono text-purple-200">GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</span>.
              Required permission: <span className="font-mono text-purple-200">Contents: Read-only</span> and <span className="font-mono text-purple-200">Pull requests: Read-only</span>.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Key className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  className={`${inputClass} pl-11 font-mono text-xs`}
                  value={pat}
                  placeholder="github_pat_••••••••••••••••••••••••••••••••••••"
                  onChange={(e) => { setPat(e.target.value); setPatError(''); }}
                />
              </div>
              <button
                onClick={handleSavePat}
                disabled={savingPat || !pat.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 px-5 py-3 text-sm font-bold hover:bg-purple-500/20 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                {savingPat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save PAT
              </button>
            </div>
            {patError && <p className="text-xs text-red-400">{patError}</p>}
            {patSaved && (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> PAT saved successfully
              </div>
            )}
          </div>
        </section>
      </div>
    </InstructorLayout>
  );
}