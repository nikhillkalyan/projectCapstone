import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import CourseCard from '../../components/shared/CourseCard';
import { BookOpen, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EnrolledCourses() {
  const { user } = useAuth();
  const { db, getCourseProgress } = useApp();
  const navigate = useNavigate();

  const enrolled = useMemo(() => 
    db.courses.filter(c => user?.enrolledCourses?.includes(c.id)),
    [user, db.courses]
  );

  const inProgress = enrolled.filter(c => { const p = getCourseProgress(c.id); return p > 0 && p < 100; });
  const notStarted = enrolled.filter(c => getCourseProgress(c.id) === 0);
  const completed = user?.completedCourses?.map(cc => db.courses.find(c => c.id === cc.courseId)).filter(Boolean) || [];

  const Section = ({ title, courses, empty }) => (
    <section className="mb-10 animate-fadeInUp">
      <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{title}</h2>
      {courses.length === 0 ? (
        <p style={{ color: 'var(--steel)' }}>{empty}</p>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {courses.map(course => (
            <CourseCard key={course.id} course={course}
              enrolled={true}
              favorited={user?.favoriteCourses?.includes(course.id)} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content p-8">
        <div className="flex items-center justify-between mb-10 animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>My Courses</h1>
            <p style={{ color: 'var(--steel)' }}>{enrolled.length} courses enrolled</p>
          </div>
          <button onClick={() => navigate('/student/explore')} className="btn-sand px-5 py-3 rounded-2xl flex items-center gap-2">
            <Compass size={18} /> Explore More
          </button>
        </div>

        {enrolled.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 animate-float">📚</div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>No enrolled courses yet</h2>
            <p className="mb-8" style={{ color: 'var(--steel)' }}>Start your learning journey today!</p>
            <button onClick={() => navigate('/student/explore')} className="btn-sand px-8 py-4 rounded-2xl">Explore Courses</button>
          </div>
        ) : (
          <>
            {inProgress.length > 0 && <Section title="📖 In Progress" courses={inProgress} empty="" />}
            {notStarted.length > 0 && <Section title="🆕 Not Started" courses={notStarted} empty="" />}
            {completed.length > 0 && <Section title="✅ Completed" courses={completed} empty="" />}
          </>
        )}
      </div>
    </div>
  );
}

export function FavoriteCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const favorites = useMemo(() =>
    db.courses.filter(c => user?.favoriteCourses?.includes(c.id)),
    [user, db.courses]
  );

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content p-8">
        <div className="mb-10 animate-fadeInUp">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
            ❤️ Favorite Courses
          </h1>
          <p style={{ color: 'var(--steel)' }}>{favorites.length} course{favorites.length !== 1 ? 's' : ''} saved</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 animate-float">💝</div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>No favorites yet</h2>
            <p className="mb-8" style={{ color: 'var(--steel)' }}>Add courses to your favorites by clicking the heart icon</p>
            <button onClick={() => navigate('/student/explore')} className="btn-sand px-8 py-4 rounded-2xl">Explore Courses</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 animate-fadeInUp">
            {favorites.map(course => (
              <CourseCard key={course.id} course={course}
                enrolled={user?.enrolledCourses?.includes(course.id)}
                favorited={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnrolledCourses;