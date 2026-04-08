import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ChatProvider } from './context/ChatContext';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/auth/StudentLogin';
import StudentSignup from './pages/auth/StudentSignup';
import InstructorLogin from './pages/auth/InstructorLogin';
import InstructorSignup from './pages/auth/InstructorSignup';

import StudentDashboard from './pages/student/StudentDashboard';
import ExploreCourses from './pages/student/ExploreCourses';
import CourseDetails from './pages/student/CourseDetails';
import CoursePlayer from './pages/student/CoursePlayer';
import StudentProfile from './pages/student/StudentProfile';
import EnrolledCourses from './pages/student/EnrolledCourses';
import FavoriteCourses from './pages/student/FavoriteCourses';
import Certificate from './pages/student/Certificate';
import StudentChat from './pages/student/StudentChat';

import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import ManageCourse from './pages/instructor/ManageCourse';
import InstructorCourses from './pages/instructor/InstructorCourses';
import StudentProgress from './pages/instructor/StudentProgress';
import InstructorChat from './pages/instructor/InstructorChat';
import InstructorProfile from './pages/instructor/InstructorProfile';
import InstructorWaitingRoom from './pages/instructor/InstructorWaitingRoom';

import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorVerification from './pages/admin/InstructorVerification';

function PrivateRoute({ children, role, requireApproval = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  if (requireApproval && user.role === 'instructor' && user.profile?.approvalStatus !== 'APPROVED') {
    return <Navigate to="/instructor/waiting-hall" />;
  }

  return children;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ChatProvider>
          <AppProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/signup" element={<StudentSignup />} />
              <Route path="/instructor/login" element={<InstructorLogin />} />
              <Route path="/instructor/signup" element={<InstructorSignup />} />

              <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
              <Route path="/student/explore" element={<PrivateRoute role="student"><ExploreCourses /></PrivateRoute>} />
              <Route path="/student/course/:courseId" element={<PrivateRoute role="student"><CourseDetails /></PrivateRoute>} />
              <Route path="/student/course/:courseId/learn" element={<PrivateRoute role="student"><CoursePlayer /></PrivateRoute>} />
              <Route path="/student/enrolled" element={<PrivateRoute role="student"><EnrolledCourses /></PrivateRoute>} />
              <Route path="/student/favorites" element={<PrivateRoute role="student"><FavoriteCourses /></PrivateRoute>} />
              <Route path="/student/certificate/:courseId" element={<PrivateRoute role="student"><Certificate /></PrivateRoute>} />
              <Route path="/student/chat" element={<PrivateRoute role="student"><StudentChat /></PrivateRoute>} />
              <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />

              {/* Waiting hall — no approval required, just needs instructor role */}
              <Route path="/instructor/waiting-hall" element={<PrivateRoute role="instructor"><InstructorWaitingRoom /></PrivateRoute>} />

              {/* Profile — accessible without approval so pending instructors can view/edit */}
              <Route path="/instructor/profile" element={<PrivateRoute role="instructor"><InstructorProfile /></PrivateRoute>} />

              {/* All other instructor routes — require approval */}
              <Route path="/instructor" element={<PrivateRoute role="instructor" requireApproval><InstructorDashboard /></PrivateRoute>} />
              <Route path="/instructor/courses" element={<PrivateRoute role="instructor" requireApproval><InstructorCourses /></PrivateRoute>} />
              <Route path="/instructor/create-course" element={<PrivateRoute role="instructor" requireApproval><CreateCourse /></PrivateRoute>} />
              <Route path="/instructor/course/:courseId" element={<PrivateRoute role="instructor" requireApproval><ManageCourse /></PrivateRoute>} />
              <Route path="/instructor/students/:courseId" element={<PrivateRoute role="instructor" requireApproval><StudentProgress /></PrivateRoute>} />
              <Route path="/instructor/chat" element={<PrivateRoute role="instructor" requireApproval><InstructorChat /></PrivateRoute>} />

              <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/verify-instructors" element={<PrivateRoute role="admin"><InstructorVerification /></PrivateRoute>} />
            </Routes>
          </AppProvider>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;