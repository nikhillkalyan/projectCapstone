import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Branches from './pages/branches/Branches';
import Instructors from './pages/instructors/Instructors';
import Students from './pages/students/Students';
import CoursePool from './pages/courses/CoursePool';
import Allocations from './pages/allocations/Allocations';
import MarksReview from './pages/marks/MarksReview';
import Certificates from './pages/certificates/Certificates';
import History from './pages/history/History';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected — all inside the Dashboard Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/students" element={<Students />} />
        <Route path="/course-pool" element={<CoursePool />} />
        <Route path="/allocations" element={<Allocations />} />
        <Route path="/marks-review" element={<MarksReview />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/history" element={<History />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
