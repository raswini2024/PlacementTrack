import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminSidebar = ({ active }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = [
    { label: '📊 Dashboard', path: '/admin/dashboard' },
    { label: '❓ Questions', path: '/admin/questions' },
    { label: '🎓 Students', path: '/admin/students' },
    { label: '🏢 Company Qs', path: '/admin/company-questions' },
    { label: '📄 Exam Papers', path: '/admin/exam-papers' },
  ];
  return (
    <div style={{ width: '240px', background: '#1a1a2e', color: 'white', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #ffffff20' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem' }}>👨‍💼 Admin Panel</h2>
      </div>
      <nav style={{ padding: '1rem 0', flex: 1 }}>
        <p style={{ color: '#ffffff60', fontSize: '0.7rem', padding: '0 1.5rem', marginBottom: '0.5rem' }}>MANAGE</p>
        {items.map(item => (
          <div key={item.path} onClick={() => navigate(item.path)}
            style={{
              padding: '0.8rem 1.5rem', cursor: 'pointer',
              background: active === item.path ? '#ffffff20' : 'transparent',
              color: active === item.path ? 'white' : '#ffffff90'
            }}>
            {item.label}
          </div>
        ))}
        <p style={{ color: '#ffffff60', fontSize: '0.7rem', padding: '1rem 1.5rem 0.5rem' }}>ACCOUNT</p>
        <div onClick={() => { logout(); navigate('/login'); }}
          style={{ padding: '0.8rem 1.5rem', cursor: 'pointer', color: '#ff6b6b' }}>
          🚪 Logout
        </div>
      </nav>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0, totalQuestions: 0,
    totalTopics: 0, totalMockTests: 0
  });

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/dashboard" />
      <div style={{ flex: 1, padding: '2rem', background: '#f8f9fa' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>📊 Admin Dashboard</h1>
          <p style={{ color: '#666' }}>Manage your PlacementTrack platform</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { icon: '🎓', label: 'Total Students', value: stats.totalStudents, color: '#6c63ff' },
            { icon: '❓', label: 'Total Questions', value: stats.totalQuestions, color: '#00b4d8' },
            { icon: '📚', label: 'Total Topics', value: stats.totalTopics, color: '#00b894' },
            { icon: '📝', label: 'Mock Tests Taken', value: stats.totalMockTests, color: '#f77f00' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: '12px',
              padding: '1.5rem', borderTop: `4px solid ${s.color}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2rem' }}>{s.icon}</div>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 700 }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '➕', label: 'Add Questions', desc: 'MCQ questions', path: '/admin/questions' },
            { icon: '👥', label: 'View Students', desc: 'Monitor progress', path: '/admin/students' },
            { icon: '🏢', label: 'Company Qs', desc: 'Manage company questions', path: '/admin/company-questions' },
            { icon: '📄', label: 'Exam Papers', desc: 'Manage papers', path: '/admin/exam-papers' },
          ].map(a => (
            <div key={a.path} onClick={() => navigate(a.path)}
              style={{
                background: 'white', borderRadius: '12px',
                padding: '1.5rem', cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2rem' }}>{a.icon}</div>
              <h3 style={{ marginTop: '0.5rem' }}>{a.label}</h3>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
