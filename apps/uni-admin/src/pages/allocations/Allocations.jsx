import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck, Plus, X,
  Trash2, BookOpen, Users, Clock, AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import '../../styles/shared.css';
import './Allocations.css';

const fmt = (iso) => (
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'
);

const isPast = (iso) => iso && new Date(iso) < new Date();

const getSectionGroupLabel = (section) => `${section.branchName} - ${section.year}`;

const groupByCourse = (allocations) => {
  const map = {};

  allocations.forEach((allocation) => {
    if (!map[allocation.courseId]) {
      map[allocation.courseId] = {
        courseId: allocation.courseId,
        courseTitle: allocation.courseTitle,
        instructorName: allocation.instructorName,
        targetBranch: allocation.targetBranch,
        targetYear: allocation.targetYear,
        finalDeadline: allocation.finalDeadline,
        sections: [],
      };
    }

    map[allocation.courseId].sections.push({
      allocationId: allocation.id,
      sectionId: allocation.sectionId,
      sectionName: allocation.sectionName,
    });
  });

  return Object.values(map);
};

const AllocateModal = ({ onClose, onSuccess }) => {
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, sectionsRes] = await Promise.all([
          api.get('/uni-courses/pool?status=APPROVED'),
          api.get('/uni-courses/sections'),
        ]);

        setApprovedCourses(coursesRes.data);
        setSections(sectionsRes.data);
      } catch {
        setError('Failed to load data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    load();
  }, []);

  const toggleSection = (sectionId) => {
    setSelectedSections((prev) => (
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    ));
  };

  const groupedSections = sections.reduce((acc, section) => {
    const key = getSectionGroupLabel(section);

    if (!acc[key]) acc[key] = [];
    acc[key].push(section);
    return acc;
  }, {});

  const selectedCourseObj = approvedCourses.find((course) => course.id === selectedCourse);

  const visibleSectionGroups = Object.entries(groupedSections).filter(([groupKey]) => {
    if (!selectedCourseObj) return true;

    const branchMatch = !selectedCourseObj.targetBranchName || groupKey.includes(selectedCourseObj.targetBranchName);
    const yearMatch = !selectedCourseObj.targetYear || groupKey.includes(selectedCourseObj.targetYear);

    return branchMatch && yearMatch;
  });

  const handleSubmit = async () => {
    if (!selectedCourse) {
      setError('Select a course.');
      return;
    }

    if (selectedSections.length === 0) {
      setError('Select at least one section.');
      return;
    }

    if (!deadline) {
      setError('Set a completion deadline.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/uni-courses/allocations', {
        courseId: selectedCourse,
        sectionIds: selectedSections,
        finalDeadline: new Date(deadline).toISOString(),
      });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Allocation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="allocation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="allocation-modal__header">
          <div className="allocation-modal__title-wrap">
            <div className="allocation-modal__icon">
              <CalendarCheck size={18} />
            </div>
            <div>
              <div className="allocation-modal__title">Allocate Course</div>
              <div className="allocation-modal__subtitle">Assign an approved course to sections</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="allocation-modal__body">
          {fetching ? (
            <div className="allocation-modal__loading">Loading approved courses...</div>
          ) : (
            <>
              {error && (
                <div className="allocation-modal__error">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <div className="allocation-modal__grid">
                <section className="allocation-panel">
                  <div className="allocation-panel__header">
                    <div>
                      <span className="allocation-panel__eyebrow">Approved Course</span>
                      <h3 className="allocation-panel__title">Choose what gets allocated</h3>
                    </div>
                  </div>

                  {approvedCourses.length === 0 ? (
                    <div className="allocation-empty-state">
                      No approved courses available. Approve courses from the Course Pool first.
                    </div>
                  ) : (
                    <div className="allocation-course-list">
                      {approvedCourses.map((course) => {
                        const selected = selectedCourse === course.id;

                        return (
                          <button
                            key={course.id}
                            className={`allocation-course-option${selected ? ' is-selected' : ''}`}
                            onClick={() => {
                              setSelectedCourse(course.id);
                              setSelectedSections([]);
                            }}
                          >
                            <div className="allocation-course-option__indicator" />
                            <div className="allocation-course-option__content">
                              <div className="allocation-course-option__title">{course.title}</div>
                              <div className="allocation-course-option__meta">
                                {course.instructorName}
                                {course.targetBranchName ? ` · ${course.targetBranchName}` : ''}
                                {course.targetYear ? ` · ${course.targetYear}` : ''}
                              </div>
                            </div>
                            {selected && (
                              <span className="allocation-course-option__badge">Selected</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="allocation-panel allocation-panel--sections">
                  <div className="allocation-panel__header">
                    <div>
                      <span className="allocation-panel__eyebrow">Assign to Sections</span>
                      <h3 className="allocation-panel__title">Select one or more target sections</h3>
                    </div>
                    {selectedSections.length > 0 && (
                      <span className="allocation-selection-count">{selectedSections.length} selected</span>
                    )}
                  </div>

                  {visibleSectionGroups.length === 0 ? (
                    <div className="allocation-empty-state">
                      {Object.keys(groupedSections).length === 0
                        ? 'No sections found. Create sections from Branches & Sections first.'
                        : 'No sections match the selected course filters.'}
                    </div>
                  ) : (
                    <div className="allocation-section-groups">
                      {visibleSectionGroups.map(([groupKey, secs]) => (
                        <div key={groupKey} className="allocation-section-group">
                          <div className="allocation-section-group__title">{groupKey}</div>
                          <div className="allocation-section-group__chips">
                            {secs.map((section) => {
                              const active = selectedSections.includes(section.id);

                              return (
                                <button
                                  key={section.id}
                                  className={`allocation-section-chip${active ? ' is-selected' : ''}`}
                                  onClick={() => toggleSection(section.id)}
                                >
                                  {section.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="allocation-deadline">
                <label className="allocation-field-label">Course Completion Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="allocation-deadline__input"
                />
                <p className="allocation-deadline__hint">
                  Students in the selected sections will see this as the final completion date.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="allocation-modal__footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading || fetching}>
            {loading ? 'Allocating...' : 'Confirm Allocation'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RemoveModal = ({ allocationId, sectionName, courseTitle, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      await api.delete(`/uni-courses/allocations/${allocationId}`);
      onSuccess();
    } catch {
      // no-op
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Remove Allocation</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          Remove <strong style={{ color: 'var(--text-primary)' }}>{sectionName}</strong> from{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{courseTitle}</strong>?
          Students in this section will lose access to the course.
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            onClick={handleRemove}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              background: 'rgba(244,63,94,0.12)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--error-400)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Trash2 size={14} />
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AllocationCard = ({ group, index, onRemoveSection }) => {
  const past = isPast(group.finalDeadline);

  return (
    <div className="glass-panel allocation-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="allocation-card__header">
        <div className="allocation-card__icon">
          <BookOpen size={18} />
        </div>

        <div className="allocation-card__title-block">
          <div className="allocation-card__title">{group.courseTitle}</div>
          <div className="allocation-card__meta">
            <span>{group.instructorName}</span>
            {group.targetBranch && (
              <>
                <span className="allocation-card__meta-dot">·</span>
                <span>{group.targetBranch}</span>
              </>
            )}
            {group.targetYear && (
              <>
                <span className="allocation-card__meta-dot">·</span>
                <span>{group.targetYear}</span>
              </>
            )}
          </div>
        </div>

        <div className={`allocation-card__deadline${past ? ' is-expired' : ''}`}>
          <Clock size={11} color={past ? 'var(--error-400)' : 'var(--warning-400)'} />
          <span className="allocation-card__deadline-text">
            {past ? 'Expired · ' : ''}
            {fmt(group.finalDeadline)}
          </span>
        </div>
      </div>

      <div className="allocation-card__sections">
        <div className="allocation-card__sections-label">
          <Users size={13} color="var(--text-tertiary)" />
          <span>Sections</span>
        </div>

        {group.sections.map((section) => (
          <div key={section.allocationId} className="allocation-card__section-chip">
            <span className="allocation-card__section-name">{section.sectionName}</span>
            <button
              onClick={() => onRemoveSection(section.allocationId, section.sectionName, group.courseTitle)}
              title="Remove section"
              className="allocation-card__remove-chip"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(244,63,94,0.2)';
                e.currentTarget.style.color = 'var(--error-400)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.25)';
              }}
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/uni-courses/allocations');
      setAllocations(res.data);
    } catch {
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const grouped = groupByCourse(allocations);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Course Allocations</h2>
          <p>Assign approved courses to sections with completion deadlines</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAllocateModal(true)}>
          <Plus size={16} />
          Allocate Course
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                height: 110,
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="allocation-empty">
          <div className="allocation-empty__icon">
            <CalendarCheck size={24} color="var(--primary-400)" />
          </div>
          <div className="allocation-empty__title">No allocations yet</div>
          <div className="allocation-empty__text">
            Approve courses from the Course Pool, then allocate them to sections here.
          </div>
          <button className="btn-primary" onClick={() => setShowAllocateModal(true)}>
            <Plus size={16} />
            Allocate a Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {grouped.map((group, index) => (
            <AllocationCard
              key={group.courseId}
              group={group}
              index={index}
              onRemoveSection={(allocationId, sectionName, courseTitle) => (
                setRemoveTarget({ allocationId, sectionName, courseTitle })
              )}
            />
          ))}
        </div>
      )}

      {showAllocateModal && (
        <AllocateModal
          onClose={() => setShowAllocateModal(false)}
          onSuccess={() => {
            setShowAllocateModal(false);
            fetchAllocations();
          }}
        />
      )}

      {removeTarget && (
        <RemoveModal
          allocationId={removeTarget.allocationId}
          sectionName={removeTarget.sectionName}
          courseTitle={removeTarget.courseTitle}
          onClose={() => setRemoveTarget(null)}
          onSuccess={fetchAllocations}
        />
      )}
    </div>
  );
};

export default Allocations;
