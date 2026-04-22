import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import AptitudeModule from './pages/AptitudeModule';
import ProgrammingModule from './pages/ProgrammingModule';
import PracticeQuestions from './pages/PracticeQuestions';
import MockTests from './pages/MockTests';
import CodingModule from './pages/CodingModule';
import InterviewPrep from './pages/InterviewPrep';
import CompanyQuestions from './pages/CompanyQuestions';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Navbar from './components/layout/Navbar';
import MockTestPage from './pages/MockTestPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestions from './pages/AdminQuestions';
import AdminStudents from './pages/AdminStudents';
import AdminCompanyQuestions from './pages/AdminCompanyQuestions';
import AdminExamPapers from './pages/AdminExamPapers';

import MockInterview from './pages/MockInterview';
// Student Private Route
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (!user.profileCompleted) return <Navigate to="/profile-setup" replace />;
  return children;
};

// Profile Route
const ProfileRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin Private Route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/profile-setup" element={<ProfileRoute><ProfileSetup /></ProfileRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/aptitude" element={<PrivateRoute><AptitudeModule /></PrivateRoute>} />
          <Route path="/programming" element={<PrivateRoute><ProgrammingModule /></PrivateRoute>} />
          <Route path="/practice/:subtopicId/:subtopicName" element={<PrivateRoute><PracticeQuestions /></PrivateRoute>} />
          <Route path="/mock-tests" element={<PrivateRoute><MockTests /></PrivateRoute>} />
          <Route path="/mock-test/:testType" element={<PrivateRoute><MockTestPage /></PrivateRoute>} />
          <Route path="/interview-prep" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
          <Route path="/company-questions" element={<PrivateRoute><CompanyQuestions /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute><ResumeAnalyzer /></PrivateRoute>} />
          <Route path="/coding" element={<PrivateRoute><CodingModule /></PrivateRoute>} />
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
          <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
          <Route path="/admin/company-questions" element={<AdminRoute><AdminCompanyQuestions /></AdminRoute>} />
          <Route path="/admin/exam-papers" element={<AdminRoute><AdminExamPapers /></AdminRoute>} />
          {/* Fallback */}
          <Route path="/mock-interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;