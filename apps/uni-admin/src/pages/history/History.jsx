import { History as HistoryIcon, BookOpen } from 'lucide-react';
import '../../styles/shared.css';

const mockHistory = [
  { id: 1, semester: 'Sem I — 2025-26', courses: 8, students: 420, completed: 'Jan 2026', certs: 390 },
  { id: 2, semester: 'Sem II — 2024-25', courses: 10, students: 380, completed: 'Dec 2025', certs: 355 },
  { id: 3, semester: 'Sem I — 2024-25', courses: 9, students: 350, completed: 'Jun 2025', certs: 340 },
];

const History = () => (
  <div>
    <div className="page-header">
      <div className="page-header-left">
        <h2>University History</h2>
        <p>A complete record of all past semesters, courses, and certificates</p>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {mockHistory.map((h, i) => (
        <div key={h.id} className="glass-panel" style={{ animationDelay: `${i * 80}ms` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                <HistoryIcon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{h.semester}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Completed {h.completed}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              {[
                { label: 'Courses', value: h.courses },
                { label: 'Students', value: h.students },
                { label: 'Certificates', value: h.certs },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{stat.value}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default History;
