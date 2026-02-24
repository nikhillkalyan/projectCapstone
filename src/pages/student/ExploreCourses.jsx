import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import CourseCard from '../../components/shared/CourseCard';
import { Search, Filter, X } from 'lucide-react';

const categories = ['All', 'AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = ['Most Popular', 'Highest Rated', 'Newest'];

export default function ExploreCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('Most Popular');

  const filtered = useMemo(() => {
    let courses = [...db.courses];

    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q)) ||
        c.instructorName.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') courses = courses.filter(c => c.category === category);
    if (level !== 'All') courses = courses.filter(c => c.level === level);

    if (sort === 'Most Popular') courses.sort((a, b) => b.enrolledCount - a.enrolledCount);
    else if (sort === 'Highest Rated') courses.sort((a, b) => b.rating - a.rating);

    return courses;
  }, [db.courses, search, category, level, sort]);

  // Recommended based on interests
  const interests = user?.interests || [];
  const recommended = db.courses.filter(c => 
    interests.includes(c.category) && !user?.enrolledCourses?.includes(c.id)
  );

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content p-8">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
            Explore Courses
          </h1>
          <p style={{ color: 'var(--steel)' }}>
            {filtered.length} courses found{search && ` for "${search}"`}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="glass rounded-2xl p-5 mb-8 animate-fadeInUp delay-100">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-60">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--steel)' }} />
              <input
                className="input-field pl-12"
                placeholder="Search courses, topics, instructors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--steel)' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category */}
            <select className="input-field" style={{ width: 'auto', minWidth: '140px', appearance: 'none' }}
              value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            {/* Level */}
            <select className="input-field" style={{ width: 'auto', minWidth: '130px', appearance: 'none' }}
              value={level} onChange={e => setLevel(e.target.value)}>
              {levels.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
            </select>

            {/* Sort */}
            <select className="input-field" style={{ width: 'auto', minWidth: '140px', appearance: 'none' }}
              value={sort} onChange={e => setSort(e.target.value)}>
              {sortOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Active filters */}
          {(category !== 'All' || level !== 'All' || search) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {category !== 'All' && (
                <span className="badge badge-aiml flex items-center gap-1">
                  {category} <button onClick={() => setCategory('All')}><X size={10} /></button>
                </span>
              )}
              {level !== 'All' && (
                <span className="badge" style={{ background: 'rgba(212, 168, 67, 0.2)', color: '#D4A843', border: '1px solid rgba(212, 168, 67, 0.3)' }}>
                  {level} <button onClick={() => setLevel('All')} className="ml-1"><X size={10} /></button>
                </span>
              )}
              <button onClick={() => { setCategory('All'); setLevel('All'); setSearch(''); }} 
                className="text-xs" style={{ color: 'var(--steel)' }}>Clear all</button>
            </div>
          )}
        </div>

        {/* Recommended section (when no search) */}
        {!search && category === 'All' && recommended.length > 0 && (
          <section className="mb-10 animate-fadeInUp delay-200">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
              ⚡ Based on Your Interests
            </h2>
            <div className="grid grid-cols-3 gap-5">
              {recommended.slice(0, 3).map(course => (
                <CourseCard key={course.id} course={course}
                  enrolled={user?.enrolledCourses?.includes(course.id)}
                  favorited={user?.favoriteCourses?.includes(course.id)} />
              ))}
            </div>
          </section>
        )}

        {/* All courses */}
        <section className="animate-fadeInUp delay-300">
          <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
            {search ? 'Search Results' : category !== 'All' ? `${category} Courses` : 'All Courses'}
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>No courses found</h3>
              <p style={{ color: 'var(--steel)' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filtered.map(course => (
                <CourseCard key={course.id} course={course}
                  enrolled={user?.enrolledCourses?.includes(course.id)}
                  favorited={user?.favoriteCourses?.includes(course.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}