import { Award, Download } from 'lucide-react';
import '../../styles/shared.css';

const mockCerts = [
  { id: 1, student: 'Rahul Sharma', course: 'Database Management', branch: 'CSE', score: 88, issuedAt: 'Apr 10, 2026' },
  { id: 2, student: 'Ananya Reddy', course: 'Database Management', branch: 'MECH', score: 79, issuedAt: 'Apr 10, 2026' },
  { id: 3, student: 'Vikram Singh', course: 'Digital Signal Processing', branch: 'ECE', score: 91, issuedAt: 'Apr 8, 2026' },
];

const getInitials = (n) => n.split(' ').map(x => x[0]).join('').slice(0, 2);
const avatarColors = ['', 'accent', 'success'];

const Certificates = () => (
  <div>
    <div className="page-header">
      <div className="page-header-left">
        <h2>Certificates</h2>
        <p>All certificates issued under your university</p>
      </div>
    </div>
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Branch</th>
            <th>Final Score</th>
            <th>Issued On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockCerts.map((cert, i) => (
            <tr key={cert.id}>
              <td>
                <div className="avatar-cell">
                  <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>{getInitials(cert.student)}</div>
                  <span className="td-primary">{cert.student}</span>
                </div>
              </td>
              <td>{cert.course}</td>
              <td><span className="badge badge-completed">{cert.branch}</span></td>
              <td>
                <span style={{ fontWeight: 700, color: cert.score >= 85 ? 'var(--success-400)' : 'var(--warning-400)' }}>
                  {cert.score}%
                </span>
              </td>
              <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{cert.issuedAt}</td>
              <td>
                <button className="icon-btn" title="Download certificate"><Download size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Certificates;
