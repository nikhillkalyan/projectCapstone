import { useEffect, useState } from 'react';
import { AlertCircle, Award, Loader2 } from 'lucide-react';
import '../../styles/shared.css';
import { getCertificateRecords } from '../../services/marksApi';

const getInitials = (name) =>
  name ? name.split(' ').map((chunk) => chunk[0]).join('').slice(0, 2).toUpperCase() : '?';

const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export default function Certificates() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getCertificateRecords();
        setRecords(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issued certificates.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Certificates</h2>
          <p>Certificates unlocked from approved final marks sheets across your university</p>
        </div>
      </div>

      {error && (
        <div className="form-error-banner" style={{ marginBottom: 'var(--space-5)' }}>
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loader-center">
          <Loader2 size={28} className="spin" />
          <span>Loading certificates...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state glass-panel">
          <div className="empty-state-icon">
            <Award size={28} color="var(--warning-400)" />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>No certificates issued yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420 }}>
            Once a final marks sheet is approved, each student record appears here as an issued certificate entry.
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Branch / Section</th>
                <th>Instructor</th>
                <th>Final Score</th>
                <th>Grade</th>
                <th>Issued On</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.courseId}-${record.studentId}`}>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar">{getInitials(record.studentName)}</div>
                      <div>
                        <div className="td-primary">{record.studentName}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{record.rollNumber || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{record.courseTitle}</td>
                  <td>
                    <div>{record.branchName || '-'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{record.sectionName || '-'}</div>
                  </td>
                  <td>{record.instructorName || '-'}</td>
                  <td style={{ fontWeight: 800, color: record.finalScore >= 50 ? 'var(--success-400)' : 'var(--error-400)' }}>
                    {record.finalScore?.toFixed(1)}%
                  </td>
                  <td>
                    <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }}>
                      {record.grade}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{fmtDate(record.approvedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
