import { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import '../../styles/shared.css';

const mockCourses = [
  { id: 1, title: 'Data Structures & Algorithms', instructor: 'Dr. Priya Verma', branch: 'CSE', year: '2nd Year', status: 'pending', chapters: 12, submittedAt: '2 days ago', weightage: { tests: 30, attendance: 20, liveTests: 20, project: 30 } },
  { id: 2, title: 'Digital Signal Processing', instructor: 'Prof. K. Ramesh', branch: 'ECE', year: '3rd Year', status: 'approved', chapters: 10, submittedAt: '5 days ago', weightage: { tests: 40, attendance: 15, liveTests: 15, project: 30 } },
  { id: 3, title: 'Engineering Mechanics', instructor: 'Dr. S. Kumar', branch: 'MECH', year: '1st Year', status: 'pending', chapters: 8, submittedAt: '1 day ago', weightage: { tests: 50, attendance: 20, liveTests: 10, project: 20 } },
  { id: 4, title: 'Database Management', instructor: 'Dr. A. Patel', branch: 'CSE', year: '3rd Year', status: 'approved', chapters: 14, submittedAt: '1 week ago', weightage: { tests: 35, attendance: 15, liveTests: 20, project: 30 } },
];

const CoursePool = () => {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = mockCourses.filter(c => filter === 'all' || c.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Course Pool</h2>
          <p>Review and approve university courses submitted by instructors</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['all', 'pending', 'approved'].map(f => (
            <button
              key={f}
              className={filter === f ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilter(f)}
              style={{ padding: 'var(--space-2) var(--space-4)' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10, fontSize: 11, padding: '1px 6px' }}>
                  {mockCourses.filter(c => c.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filtered.map((course, i) => (
          <div
            key={course.id}
            className="glass-panel"
            style={{ animationDelay: `${i * 60}ms`, cursor: 'pointer' }}
            onClick={() => setSelected(selected?.id === course.id ? null : course)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)', flexShrink: 0 }}>
                  <BookOpen size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-1)', fontSize: 'var(--text-base)' }}>{course.title}</h4>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    <span>By <strong style={{ color: 'var(--text-secondary)' }}>{course.instructor}</strong></span>
                    <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary-300)' }}>{course.branch}</span>
                    <span>{course.year}</span>
                    <span>{course.chapters} chapters</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> Submitted {course.submittedAt}</div>
                  </div>

                  {selected?.id === course.id && (
                    <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }} className="animate-fade-in">
                      {Object.entries(course.weightage).map(([key, val]) => (
                        <div key={key} style={{ padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary-300)' }}>{val}%</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{key === 'liveTests' ? 'Live Tests' : key.charAt(0).toUpperCase() + key.slice(1)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                <span className={`badge badge-${course.status === 'approved' ? 'active' : 'pending'}`}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </span>
                {course.status === 'pending' && (
                  <>
                    <button className="icon-btn success" title="Approve course" onClick={(e) => { e.stopPropagation(); }}>
                      <CheckCircle size={16} />
                    </button>
                    <button className="icon-btn danger" title="Reject course" onClick={(e) => { e.stopPropagation(); }}>
                      <XCircle size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursePool;
