import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, Plus, Shuffle, UserPlus, Users, X } from 'lucide-react';
import { fetchInstructorCourseStudents, formGroupsManually, formGroupsRandomly } from './api';

export default function GroupFormation({ courseId, space, onRefresh }) {
  const [mode, setMode] = useState(null);
  const [manualGroups, setManualGroups] = useState([{ name: 'Group 1', studentIds: [] }]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [forming, setForming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'manual') return;

    setLoadingStudents(true);
    fetchInstructorCourseStudents(courseId)
      .then(data => setEnrolledStudents(data || []))
      .catch(() => setEnrolledStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [courseId, mode]);

  const handleRandom = async () => {
    setForming(true);
    setError('');
    try {
      await formGroupsRandomly(courseId, { groupSize: space.groupSize });
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to form groups');
    } finally {
      setForming(false);
    }
  };

  const addGroup = () => setManualGroups(groups => [...groups, { name: `Group ${groups.length + 1}`, studentIds: [] }]);
  const removeGroup = (index) => setManualGroups(groups => groups.filter((_, itemIndex) => itemIndex !== index));

  const toggleStudent = (groupIndex, studentId) => {
    setManualGroups(groups => groups.map((group, index) => {
      if (index !== groupIndex) return group;

      const nextIds = group.studentIds.includes(studentId)
        ? group.studentIds.filter(id => id !== studentId)
        : [...group.studentIds, studentId];

      return { ...group, studentIds: nextIds };
    }));
  };

  const isAssigned = (studentId) => manualGroups.some(group => group.studentIds.includes(studentId));

  const handleManual = async () => {
    const invalid = manualGroups.find(group => !group.name.trim() || group.studentIds.length === 0);
    if (invalid) {
      setError('All groups need a name and at least one student');
      return;
    }

    setForming(true);
    setError('');
    try {
      await formGroupsManually(courseId, {
        groups: manualGroups.map(group => ({ name: group.name, studentIds: group.studentIds })),
      });
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to form groups');
    } finally {
      setForming(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(150deg,rgba(15,23,42,0.96),rgba(8,15,32,0.92))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-purple-200">
              <Users className="w-3.5 h-3.5" />
              Formation Engine
            </div>
            <h4 className="mt-4 text-xl font-bold font-syne text-white">Form Project Groups</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Build balanced teams for the course, either with a fast random allocation or handpicked manual grouping.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 min-w-[160px]">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Target Size</div>
            <div className="mt-2 text-3xl font-bold font-syne text-white">{space.groupSize}</div>
            <div className="text-xs text-slate-300 mt-1">students per team</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 mb-4">
          <button
            onClick={() => setMode('random')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${mode === 'random' ? 'border-purple-400/40 bg-purple-500/12 shadow-[0_16px_40px_rgba(168,85,247,0.12)]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-400/15 flex items-center justify-center shrink-0">
              <Shuffle className="w-5 h-5 text-purple-300 shrink-0" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Random Allocation</div>
              <div className="text-xs text-slate-300">Auto-shuffle students into evenly sized project teams</div>
            </div>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${mode === 'manual' ? 'border-purple-400/40 bg-purple-500/12 shadow-[0_16px_40px_rgba(168,85,247,0.12)]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/15 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-sky-300 shrink-0" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Manual Curation</div>
              <div className="text-xs text-slate-300">Select students yourself for tighter academic or skill balancing</div>
            </div>
          </button>
        </div>

        {mode === 'random' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">Students will be shuffled and split into groups of {space.groupSize}. This cannot be undone.</p>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleRandom}
              disabled={forming}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50"
            >
              {forming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              Form Groups Randomly
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-sm text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading students...</div>
            ) : (
              <>
                {manualGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={group.name}
                        onChange={e => setManualGroups(groups => groups.map((item, index) => index === groupIndex ? { ...item, name: e.target.value } : item))}
                        className="flex-1 h-10 bg-bg-surface/80 border border-white/10 rounded-xl px-3 text-sm font-bold text-text-primary outline-none focus:border-purple-500/50 transition-all"
                      />
                      {manualGroups.length > 1 && (
                        <button onClick={() => removeGroup(groupIndex)} className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {enrolledStudents.map(student => {
                        const inThisGroup = group.studentIds.includes(student.studentId);
                        const inOtherGroup = !inThisGroup && isAssigned(student.studentId);

                        return (
                          <button
                            key={student.studentId}
                            disabled={inOtherGroup}
                            onClick={() => toggleStudent(groupIndex, student.studentId)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                              inThisGroup ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                : inOtherGroup ? 'bg-bg-surface border-border-subtle text-text-muted opacity-40 cursor-not-allowed'
                                  : 'bg-bg-surface/70 border-white/10 text-text-secondary hover:border-purple-500/30 hover:text-purple-400'
                            }`}
                          >
                            {inThisGroup && <Check className="w-3 h-3 inline mr-1" />}
                            {student.studentName}
                            {student.rollNumber && <span className="opacity-60 ml-1">· {student.rollNumber}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-xs text-text-muted">{group.studentIds.length} student{group.studentIds.length !== 1 ? 's' : ''} selected</div>
                  </div>
                ))}
                <button onClick={addGroup} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Group
                </button>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  onClick={handleManual}
                  disabled={forming}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50"
                >
                  {forming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirm Groups
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
