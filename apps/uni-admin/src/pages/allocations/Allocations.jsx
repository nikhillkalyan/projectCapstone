import { CalendarCheck, Plus, X } from 'lucide-react';
import '../../styles/shared.css';

const mockAllocations = [
  { id: 1, course: 'Data Structures & Algorithms', branch: 'CSE', year: '2nd Year', sections: ['Section A', 'Section B'], instructor: 'Dr. Priya Verma', deadline: 'Jun 30, 2026' },
  { id: 2, course: 'Digital Signal Processing', branch: 'ECE', year: '3rd Year', sections: ['Section A'], instructor: 'Prof. K. Ramesh', deadline: 'Jul 15, 2026' },
  { id: 3, course: 'Database Management', branch: 'CSE', year: '3rd Year', sections: ['Section C'], instructor: 'Dr. A. Patel', deadline: 'Aug 1, 2026' },
];

const Allocations = () => (
  <div>
    <div className="page-header">
      <div className="page-header-left">
        <h2>Course Allocations</h2>
        <p>Manage which sections are assigned which courses this semester</p>
      </div>
      <button className="btn-primary" id="allocate-course-btn">
        <Plus size={16} />
        Allocate Course
      </button>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {mockAllocations.map((alloc, i) => (
        <div key={alloc.id} className="glass-panel" style={{ animationDelay: `${i * 80}ms` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{alloc.course}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>by {alloc.instructor}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary-300)' }}>{alloc.branch}</span>
                <span className="badge badge-completed">{alloc.year}</span>
                {alloc.sections.map(s => (
                  <span key={s} className="badge" style={{ background: 'rgba(6,182,212,0.08)', color: 'var(--accent-400)' }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Completion Deadline</div>
              <div style={{ fontWeight: 700, color: 'var(--warning-400)', fontSize: 'var(--text-sm)' }}>{alloc.deadline}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Allocations;
