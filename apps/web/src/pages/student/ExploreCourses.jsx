import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import CourseCard from '../../components/shared/CourseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { getAllCourses } from '../../api/courseApi';
import { getEnrolledCourses } from '../../api/studentApi';

const categories = ['All', 'AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = ['Most Popular', 'Highest Rated', 'Newest'];

const catStyles = {
  AIML: 'bg-primary-500/12 text-primary-300 border-primary-400/30',
  Cloud: 'bg-accent-500/12 text-accent-400 border-accent-400/30',
  DataScience: 'bg-warning-500/12 text-warning-400 border-warning-400/30',
  Cybersecurity: 'bg-error-500/12 text-error-400 border-error-400/30',
};

const CustomSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  return (
    <div ref={ref} className="relative w-full">
      <label className="mb-1.5 block px-1 font-display text-[0.7rem] font-bold uppercase tracking-wide text-text-secondary">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm text-text-primary transition-all sm:py-2.5"
      >
        <span className="truncate">{value === 'All' && label !== 'Sort' ? (label === 'Category' ? 'All Categories' : `All ${label}s`) : value}</span>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="glass-lg absolute z-50 mt-2 w-full overflow-hidden rounded-lg py-1 shadow-strong"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.06] sm:py-2 ${value === opt ? 'bg-primary-500/10 font-bold text-primary-300' : 'text-text-primary'}`}
              >
                {opt === 'All' && label !== 'Sort' ? (label === 'Category' ? 'All Categories' : `All ${label}s`) : opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ExploreCourses() {
  const { user } = useAuth();
  const { favoriteCourseIds } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('Most Popular');
  
  const [enrolledIds, setEnrolledIds] = useState([]);

  // Fetch enrolled courses once on mount to compare
  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await getEnrolledCourses();
        const enrollments = res.data || [];
        const ids = enrollments.map(e => e.course?.id).filter(Boolean);
        setEnrolledIds(ids);
      } catch (err) {
        console.error("Failed to load enrolled IDs", err);
      }
    };
    if (user?.role === 'student') {
      fetchEnrolled();
    }
  }, [user]);

  const checkEnrolled = (courseId) => {
    return enrolledIds.includes(courseId) || 
           user?.profile?.enrolledCourses?.includes(courseId) || 
           user?.enrolledCourses?.includes(courseId);
  };

  // Fetch courses from API when filters change
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const params = {};
        if (category !== 'All') params.category = category;
        if (level !== 'All') params.level = level;
        if (search) params.search = search;
        
        const res = await getAllCourses(params);
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setFetchError('Unable to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 400); // 400ms debounce for typing

    return () => clearTimeout(delayDebounceFn);
  }, [category, level, search]);

  // Client-side Sorting
  const sortedCourses = useMemo(() => {
    let sorted = [...courses];
    if (sort === 'Most Popular') sorted.sort((a, b) => (b.totalEnrollments || 0) - (a.totalEnrollments || 0));
    else if (sort === 'Highest Rated') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === 'Newest') sorted.reverse(); // Or sort by created_at if your backend sends it
    return sorted;
  }, [courses, sort]);

  // Recommended courses (Only makes sense when no filters are applied, so we look at the raw fetched list)
  const recommended = courses.filter(c =>
    (user?.profile?.interests || user?.interests || []).includes(c.category) && !checkEnrolled(c.id)
  );

  const activeFilters = (category !== 'All' || level !== 'All');

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <StudentLayout>
      <div className="max-w-[1600px] mx-auto w-full pb-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="heading-2 mb-2 text-gradient">Explore Courses</h1>
          {loading ? (
             <p className="text-text-secondary">Searching courses...</p>
          ) : (
            <p className="text-text-secondary">
              {courses.length} course{courses.length !== 1 ? 's' : ''} found{search && ` for "${search}"`}
            </p>
          )}
        </motion.div>

        {/* Glassmorphic Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass relative z-30 mb-10 w-full overflow-visible rounded-lg p-4 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Bar - Larger */}
            <div className="md:col-span-5 relative w-full">
              <label className="mb-1.5 block px-1 font-display text-[0.7rem] font-bold uppercase tracking-wide text-text-secondary">
                Search
              </label>
              <div className="relative flex items-center w-full group">
                <Search className="absolute left-4 w-5 h-5 text-text-secondary group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search courses, topics, instructors..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="glass-input w-full rounded-lg py-3 pl-11 pr-10 text-sm text-text-primary outline-none placeholder:text-text-secondary/50 sm:py-2.5"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdowns */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CustomSelect label="Category" value={category} options={categories} onChange={setCategory} />
              <CustomSelect label="Level" value={level} options={levels} onChange={setLevel} />
              <CustomSelect label="Sort" value={sort} options={sortOptions} onChange={setSort} />
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {activeFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex items-center gap-2 flex-wrap overflow-hidden"
              >
                <Filter className="w-4 h-4 text-text-secondary mr-1" />
                {category !== 'All' && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-syne font-bold ${catStyles[category] || catStyles.AIML}`}>
                    {category}
                    <button onClick={() => setCategory('All')} className="hover:text-white hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {level !== 'All' && (
                  <div className="flex items-center gap-1.5 rounded-full border border-warning-400/30 bg-warning-500/10 px-2.5 py-1 font-display text-xs font-bold text-warning-400">
                    {level}
                    <button onClick={() => setLevel('All')} className="hover:text-white hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => { setCategory('All'); setLevel('All'); setSearch(''); }}
                  className="cursor-pointer rounded-full border border-border-subtle px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recommended Section (Only if no active search/filters) */}
        <AnimatePresence>
          {!search && category === 'All' && recommended.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="mb-12"
            >
              <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-text-primary">
                <span className="text-warning-400">Featured</span> Based on Your Interests
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommended.map(course => (
                  <CourseCard
                    key={`rec-${course.id}`}
                    course={course}
                    enrolled={checkEnrolled(course.id)}
                    favorited={favoriteCourseIds.includes(course.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Courses Grid */}
        <div className="w-full">
          <h2 className="mb-6 font-display text-xl font-bold text-text-primary">
            {search ? 'Search Results' : category !== 'All' ? `${category} Courses` : 'All Courses'}
          </h2>

          {fetchError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass flex flex-col items-center justify-center rounded-lg border-error-400/20 bg-error-500/5 py-20"
            >
              <AlertCircle className="mb-4 h-10 w-10 text-error-400" />
              <h3 className="mb-2 font-display text-xl font-bold text-error-400">Error</h3>
              <p className="text-error-400/80">{fetchError}</p>
            </motion.div>
          ) : loading ? (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center py-32"
             >
               <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
               <p className="text-text-secondary">Loading courses...</p>
             </motion.div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass flex flex-col items-center justify-center rounded-lg py-20"
            >
              <div className="text-5xl mb-4 opacity-50">🔍</div>
              <h3 className="mb-2 font-display text-xl font-bold text-text-primary">No courses found</h3>
              <p className="text-text-secondary">Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={() => { setSearch(''); setCategory('All'); setLevel('All'); }}
                className="mt-6 cursor-pointer rounded-lg border border-border-subtle bg-white/5 px-6 py-2.5 font-medium text-text-primary transition-all hover:border-text-secondary hover:bg-white/10 active:scale-95"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {sortedCourses.map(course => (
                  <motion.div
                    key={course.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <CourseCard
                      course={course}
                      enrolled={checkEnrolled(course.id)}
                      favorited={favoriteCourseIds.includes(course.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
