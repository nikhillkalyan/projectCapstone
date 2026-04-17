import { CheckCircle, XCircle, Eye } from 'lucide-react';
import '../../styles/shared.css';

const mockMarks = [
  { id: 1, course: 'Database Management', instructor: 'Dr. A. Patel', branch: 'CSE', section: 'Section C', students: 42, avgScore: 78.4, status: 'pending_review', submittedAt: '1 day ago' },
  { id: 2, course: 'Digital Signal Processing', instructor: 'Prof. K. Ramesh', branch: 'ECE', section: 'Section A', students: 38, avgScore: 82.1, status: 'approved', submittedAt: '3 days ago' },
];

const MarksReview = () => (
  <div>
    <div className="page-header">
      <div className="page-header-left">
        <h2>Marks Review</h2>
        <p>Approve instructor-submitted internal marks sheets before certificates are issued</p>
      </div>
    </div>
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Instructor</th>
            <th>Branch / Section</th>
            <th>Students</th>
            <th>Avg Score</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockMarks.map((m) => (
            <tr key={m.id}>
              <td className="td-primary">{m.course}</td>
              <td>{m.instructor}</td>
              <td>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{m.branch}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{m.section}</div>
              </td>
              <td style={{ fontWeight: 600 }}>{m.students}</td>
              <td>
                <span style={{ fontWeight: 700, color: m.avgScore >= 80 ? 'var(--success-400)' : 'var(--warning-400)' }}>{m.avgScore}%</span>
              </td>
              <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{m.submittedAt}</td>
              <td>
                <span className={`badge badge-${m.status === 'approved' ? 'active' : 'pending'}`}>
                  {m.status === 'pending_review' ? 'Pending Review' : 'Approved'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  <button className="icon-btn" title="View marks sheet"><Eye size={14} /></button>
                  {m.status === 'pending_review' && (
                    <>
                      <button className="icon-btn success" title="Approve"><CheckCircle size={14} /></button>
                      <button className="icon-btn danger" title="Return for correction"><XCircle size={14} /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MarksReview;
