import { useState } from 'react';
import { FolderGit2, Loader2, Plus } from 'lucide-react';
import { createProjectSpace } from './api';

export default function CreateSpaceForm({ courseId, onCreated }) {
  const [form, setForm] = useState({
    groupSize: 4,
    proposalDeadline: '',
    projectDeadline: '',
    projectDescription: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.groupSize || form.groupSize < 1) {
      setError('Group size required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        proposalDeadline: form.proposalDeadline ? new Date(form.proposalDeadline).toISOString() : null,
        projectDeadline: form.projectDeadline ? new Date(form.projectDeadline).toISOString() : null,
      };
      const data = await createProjectSpace(courseId, payload);
      onCreated(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create project space');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <FolderGit2 className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold font-syne text-text-primary mb-2">Set Up Project Space</h3>
        <p className="text-sm text-text-secondary">Configure group formation and deadlines for this course's project evaluation.</p>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Students per Group *</label>
          <input
            type="number"
            min="1"
            max="20"
            value={form.groupSize}
            onChange={e => setForm(current => ({ ...current, groupSize: Number(e.target.value) }))}
            className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Proposal Deadline</label>
            <input
              type="datetime-local"
              value={form.proposalDeadline}
              onChange={e => setForm(current => ({ ...current, proposalDeadline: e.target.value }))}
              className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-xs text-text-primary outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Project Deadline</label>
            <input
              type="datetime-local"
              value={form.projectDeadline}
              onChange={e => setForm(current => ({ ...current, projectDeadline: e.target.value }))}
              className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-xs text-text-primary outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Project Description / Brief</label>
          <textarea
            rows={3}
            value={form.projectDescription}
            onChange={e => setForm(current => ({ ...current, projectDescription: e.target.value }))}
            placeholder="What students are expected to build for this course..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-purple-500/50 transition-all resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Project Space
        </button>
      </div>
    </div>
  );
}
