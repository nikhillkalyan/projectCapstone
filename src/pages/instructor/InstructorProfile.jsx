import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import { Save, Star, Users, BookOpen, Award } from 'lucide-react';

const specializations = ['AIML', 'Cloud', 'DataScience', 'Cybersecurity'];

export default function InstructorProfile() {
  const { user, updateUser } = useAuth();
  const { db } = useApp();
  const [form, setForm] = useState({ name: user?.name || '', qualification: user?.qualification || '', experience: user?.experience || '', bio: user?.bio || '', specialization: user?.specialization || '' });
  const [saved, setSaved] = useState(false);

  const myCourses = db.courses.filter(c => c.instructorId === user?.id);
  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
  const avgRating = myCourses.length > 0 ? (myCourses.reduce((s, c) => s + (c.rating || 0), 0) / myCourses.length).toFixed(1) : '0.0';

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black mb-8 animate-fadeInUp" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>My Profile</h1>

          <div className="grid grid-cols-3 gap-5 mb-8 animate-fadeInUp delay-100">
            {[
              { icon: BookOpen, label: 'Courses', value: myCourses.length, color: '#6B7FD4' },
              { icon: Users, label: 'Students', value: totalStudents.toLocaleString(), color: '#4ECDC4' },
              { icon: Star, label: 'Avg Rating', value: avgRating, color: '#D4A843' },
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

          <div className="glass rounded-3xl p-8 animate-fadeInUp delay-200">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black"
                style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)', fontFamily: 'Syne', color: 'var(--navy)' }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{user?.name}</h2>
                <p className="text-sm" style={{ color: 'var(--steel)' }}>{user?.email}</p>
                <span className={`badge badge-${user?.specialization?.toLowerCase() || 'aiml'} mt-2`}>{user?.specialization || 'Instructor'}</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Full Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Qualification</label>
                <input className="input-field" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} placeholder="PhD in CS, IIT Delhi" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Experience</label>
                <input className="input-field" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="8 years as Cloud Architect" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Bio</label>
                <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell students about yourself..." />
              </div>
              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--sand)' }}>Specialization</label>
                <div className="flex flex-wrap gap-3">
                  {specializations.map(s => {
                    const icons = { AIML: '🤖', Cloud: '☁️', DataScience: '📊', Cybersecurity: '🔒' };
                    const sel = form.specialization === s;
                    return (
                      <button key={s} onClick={() => setForm(p => ({ ...p, specialization: s }))}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                        style={{
                          background: sel ? 'rgba(212, 168, 67, 0.2)' : 'rgba(48, 54, 79, 0.4)',
                          border: `1.5px solid ${sel ? 'rgba(212, 168, 67, 0.5)' : 'rgba(172, 186, 196, 0.15)'}`,
                          color: sel ? 'var(--cream)' : 'var(--steel)'
                        }}>
                        <span>{icons[s]}</span>
                        <span className="text-sm font-semibold" style={{ fontFamily: 'Syne' }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="btn-sand px-8 py-3 rounded-2xl flex items-center gap-2 mt-8">
              {saved ? '✓ Saved!' : (<><Save size={18} /> Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}