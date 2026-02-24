import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';

// Auth Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/auth/StudentLogin';
import StudentSignup from './pages/auth/StudentSignup';
import InstructorLogin from './pages/auth/InstructorLogin';
import InstructorSignup from './pages/auth/InstructorSignup';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExploreCourses from './pages/student/ExploreCourses';
import CoursePlayer from './pages/student/CoursePlayer';
import StudentProfile from './pages/student/StudentProfile';
import EnrolledCourses from './pages/student/EnrolledCourses';
import FavoriteCourses from './pages/student/FavoriteCourses';
import Certificate from './pages/student/Certificate';
import StudentChat from './pages/student/StudentChat';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import ManageCourse from './pages/instructor/ManageCourse';
import InstructorCourses from './pages/instructor/InstructorCourses';
import StudentProgress from './pages/instructor/StudentProgress';
import InstructorChat from './pages/instructor/InstructorChat';
import InstructorProfile from './pages/instructor/InstructorProfile';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route path="/instructor/login" element={<InstructorLogin />} />
            <Route path="/instructor/signup" element={<InstructorSignup />} />

            {/* Student Routes */}
            <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/explore" element={<PrivateRoute role="student"><ExploreCourses /></PrivateRoute>} />
            <Route path="/student/course/:courseId" element={<PrivateRoute role="student"><CoursePlayer /></PrivateRoute>} />
            <Route path="/student/enrolled" element={<PrivateRoute role="student"><EnrolledCourses /></PrivateRoute>} />
            <Route path="/student/favorites" element={<PrivateRoute role="student"><FavoriteCourses /></PrivateRoute>} />
            <Route path="/student/certificate/:courseId" element={<PrivateRoute role="student"><Certificate /></PrivateRoute>} />
            <Route path="/student/chat" element={<PrivateRoute role="student"><StudentChat /></PrivateRoute>} />
            <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />

            {/* Instructor Routes */}
            <Route path="/instructor" element={<PrivateRoute role="instructor"><InstructorDashboard /></PrivateRoute>} />
            <Route path="/instructor/courses" element={<PrivateRoute role="instructor"><InstructorCourses /></PrivateRoute>} />
            <Route path="/instructor/create-course" element={<PrivateRoute role="instructor"><CreateCourse /></PrivateRoute>} />
            <Route path="/instructor/course/:courseId" element={<PrivateRoute role="instructor"><ManageCourse /></PrivateRoute>} />
            <Route path="/instructor/students/:courseId" element={<PrivateRoute role="instructor"><StudentProgress /></PrivateRoute>} />
            <Route path="/instructor/chat" element={<PrivateRoute role="instructor"><InstructorChat /></PrivateRoute>} />
            <Route path="/instructor/profile" element={<PrivateRoute role="instructor"><InstructorProfile /></PrivateRoute>} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;