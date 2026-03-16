import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { section: 'Main', items: [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  ]},
  { section: 'Practice', items: [
    { path: '/aptitude', icon: '🧮', label: 'Aptitude' },
    { path: '/programming', icon: '💻', label: 'Programming' },
    { path: '/mock-tests', icon: '📝', label: 'Mock Tests' },
  ]},
  { section: 'Interview', items: [
    { path: '/interview-prep', icon: '🎤', label: 'Interview Prep' },
    { path: '/company-questions', icon: '🏢', label: 'Previous Year Qs' },
  ]},
  { section: 'Tools', items: [
    { path: '/resume', icon: '📄', label: 'Resume Analyzer' },
  ]},
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      {navItems.map(group => (
        <div key={group.section}>
          <div className="sidebar-label">{group.section}</div>
          <div className="sidebar-section">
            {group.items.map(item => (
              <button
                key={item.path}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="sidebar-label" style={{marginTop:'1rem'}}>Account</div>
      <div className="sidebar-section">
        <button className="sidebar-item" onClick={() => { logout(); navigate('/'); }}>
          <span className="icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
