import { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, History as HistoryIcon, Loader2 } from 'lucide-react';
import '../../styles/shared.css';
import { getFinalMarksHistory } from '../../services/marksApi';

const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getFinalMarksHistory();
        setItems(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load approved marks history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalCertificates = items.reduce((sum, item) => sum + (item.studentCount || 0), 0);
  const totalPass = items.reduce((sum, item) => sum + (item.passCount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>University History</h2>
          <p>Approved final marks sheets and their issued certificate volume</p>
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
          <span>Loading history...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state glass-panel">
          <div className="empty-state-icon">
            <HistoryIcon size={28} color="var(--primary-400)" />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>No approved records yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420 }}>
            Once final marks sheets are approved, they will move here as part of your permanent course history.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { label: 'Approved Sheets', value: items.length, color: 'var(--primary-300)', bg: 'rgba(99,102,241,0.1)' },
              { label: 'Certificates', value: totalCertificates, color: 'var(--accent-400)', bg: 'rgba(6,182,212,0.1)' },
              { label: 'Passed Students', value: totalPass, color: 'var(--success-400)', bg: 'rgba(16,185,129,0.1)' },
            ].map((card) => (
              <div key={card.label} className="glass-panel" style={{ padding: 'var(--space-5)', background: card.bg }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: card.color, letterSpacing: '-0.03em' }}>{card.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6, color: card.color, opacity: 0.8 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {items.map((item, index) => (
            <div key={item.courseId} className="glass-panel" style={{ animationDelay: `${index * 60}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{item.courseTitle}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {item.targetBranch || '-'} {item.targetYear ? `• ${item.targetYear}` : ''} • {item.instructorName || 'Unknown Instructor'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Approved {fmtDate(item.approvedAt)}{item.approvedByName ? ` by ${item.approvedByName}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Students', value: item.studentCount },
                    { label: 'Average', value: `${item.classAverage?.toFixed(1)}%` },
                    { label: 'Pass', value: item.passCount },
                    { label: 'Fail', value: item.failCount },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: 'center', minWidth: 72 }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{stat.value}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
