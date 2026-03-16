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
import InterviewPrep from './pages/InterviewPrep';
import CompanyQuestions from './pages/CompanyQuestions';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Navbar from './components/layout/Navbar';
import MockTestPage from './pages/MockTestPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.profileCompleted) return <Navigate to="/profile-setup" replace />;
  return children;
};

const ProfileRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile-setup" element={<ProfileRoute><ProfileSetup /></ProfileRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/aptitude" element={<PrivateRoute><AptitudeModule /></PrivateRoute>} />
          <Route path="/programming" element={<PrivateRoute><ProgrammingModule /></PrivateRoute>} />
          <Route path="/practice/:subtopicId/:subtopicName" element={<PrivateRoute><PracticeQuestions /></PrivateRoute>} />
          <Route path="/mock-tests" element={<PrivateRoute><MockTests /></PrivateRoute>} />
          <Route path="/interview-prep" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
          <Route path="/company-questions" element={<PrivateRoute><CompanyQuestions /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute><ResumeAnalyzer /></PrivateRoute>} />
          <Route path="/mock-test/:testType" element={<PrivateRoute><MockTestPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
