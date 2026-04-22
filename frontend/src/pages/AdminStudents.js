import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminSidebar = ({ active }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <div style={{
      width: '240px', background: '#1a1a2e', color: 'white',
      padding: '1.5rem 0', display: 'flex', flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #ffffff20' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem' }}>👨‍💼 Admin Panel</h2>
      </div>
      <nav style={{ padding: '1rem 0', flex: 1 }}>
        <p style={{ color: '#ffffff60', fontSize: '0.7rem', padding: '0 1.5rem', marginBottom: '0.5rem' }}>MANAGE</p>
        {[
          { label: '📊 Dashboard', path: '/admin/dashboard' },
          { label: '❓ Questions', path: '/admin/questions' },
          { label: '🎓 Students', path: '/admin/students' },
        ].map(item => (
          <div key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '0.8rem 1.5rem', cursor: 'pointer',
              background: active === item.path ? '#ffffff20' : 'transparent',
              color: active === item.path ? 'white' : '#ffffff90',
              display: 'flex', alignItems: 'center', gap: '0.7rem'
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

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/students')
      .then(res => { setStudents(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/students" />
      <div style={{ flex: 1, padding: '2rem', background: '#f8f9fa' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>🎓 Students</h1>
          <p style={{ color: '#666' }}>Monitor all registered students</p>
        </div>

        <input
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1.5rem', fontSize: '0.95rem' }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem' }}>📭</div>
            <h3>No students found</h3>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>👥 Total: {filtered.length} students</h3>
            {filtered.map((s, i) => (
              <div key={s.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>{i + 1}. {s.name}</p>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>📧 {s.email}</p>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>
                    🏢 {s.dreamCompany || 'Not set'} | 💼 {s.dreamRole || 'Not set'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: s.profileCompleted ? '#e6fff9' : '#fff3e0',
                    color: s.profileCompleted ? '#00b894' : '#f77f00',
                    padding: '0.3rem 0.8rem', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 600
                  }}>
                    {s.profileCompleted ? '✅ Complete' : '⚠️ Incomplete'}
                  </span>
                  <p style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
