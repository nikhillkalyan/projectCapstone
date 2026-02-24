import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import { User, Save, BookOpen, Award, TrendingUp } from 'lucide-react';

const interests = ['AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const { db, getCourseProgress } = useApp();
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', year: user?.year || '', bio: user?.bio || '', interests: user?.interests || [] });
  const [saved, setSaved] = useState(false);

  const toggleInterest = (key) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(key) ? prev.interests.filter(i => i !== key) : [...prev.interests, key]
    }));
  };

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enrolled = db.courses.filter(c => user?.enrolledCourses?.includes(c.id));
  const completed = user?.completedCourses || [];
  const avgProgress = enrolled.length > 0
    ? Math.round(enrolled.reduce((s, c) => s + getCourseProgress(c.id), 0) / enrolled.length)
    : 0;

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black mb-8 animate-fadeInUp" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>My Profile</h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8 animate-fadeInUp delay-100">
            {[
              { icon: BookOpen, label: 'Enrolled', value: enrolled.length, color: '#6B7FD4' },
              { icon: Award, label: 'Completed', value: completed.length, color: '#4ECDC4' },
              { icon: TrendingUp, label: 'Avg. Progress', value: `${avgProgress}%`, color: '#D4A843' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}20` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="text-2xl font-black" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--steel)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Profile form */}
          <div className="glass rounded-3xl p-8 animate-fadeInUp delay-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                style={{ background: 'linear-gradient(135deg, #6B7FD4, #8FA4E8)', fontFamily: 'Syne', color: 'white' }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{user?.name}</h2>
                <p className="text-sm" style={{ color: 'var(--steel)' }}>{user?.email}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--accent-light)' }}>{user?.college} • {user?.year}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Full Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>College</label>
                <input className="input-field" value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Year</label>
                <select className="input-field" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} style={{ appearance: 'none' }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Bio</label>
              <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." />
            </div>

            <div className="mb-8">
              <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--sand)' }}>Interests</label>
              <div className="flex flex-wrap gap-3">
                {interests.map(int => {
                  const icons = { AIML: '🤖', Cloud: '☁️', DataScience: '📊', Cybersecurity: '🔒' };
                  const sel = form.interests.includes(int);
                  return (
                    <button key={int} onClick={() => toggleInterest(int)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                      style={{
                        background: sel ? 'rgba(107, 127, 212, 0.2)' : 'rgba(48, 54, 79, 0.4)',
                        border: `1.5px solid ${sel ? 'rgba(107, 127, 212, 0.5)' : 'rgba(172, 186, 196, 0.15)'}`
                      }}>
                      <span>{icons[int]}</span>
                      <span className="text-sm font-semibold" style={{ fontFamily: 'Syne', color: sel ? 'var(--cream)' : 'var(--steel)' }}>{int}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleSave} className="btn-sand px-8 py-3 rounded-2xl flex items-center gap-2">
              {saved ? '✓ Saved!' : (<><Save size={18} /> Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}