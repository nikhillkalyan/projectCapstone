import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/dashboard/Dashboard';
import InstructorList from './pages/instructors/InstructorList';
import InstructorReview from './pages/instructors/InstructorReview';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/instructors" element={
            <ProtectedRoute><InstructorList /></ProtectedRoute>
          } />
          <Route path="/instructors/:id" element={
            <ProtectedRoute><InstructorReview /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;