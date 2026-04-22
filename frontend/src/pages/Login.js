import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('STUDENT'); 
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // console-la check panna intha log help pannum
    console.log("Attempting login for:", form.email, "as", role);

    try {
      // Backend-ku clean-ah email matrum password-a mattum anupurathu
      const res = await login({
    email: form.email.trim(),
    password: form.password.trim() // ✅ இதை add பண்ணு
});
      const data = res.data;

      // Role check: Backend-la irunthu vara Role-um namma select panna Role-um match aaganum
      if (data.role !== role) {
        setError(role === 'ADMIN' 
          ? 'Specified account is not an Admin!' 
          : 'Please login using Student credentials!');
        setLoading(false);
        return;
      }

      // AuthContext-la data store panrom
      loginUser({ 
        id: data.studentId, 
        name: data.name, 
        email: data.email, 
        profileCompleted: data.profileCompleted,
        role: data.role 
      }, data.token);

      // Success! Dashboard-ku redirect
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (!data.profileCompleted) {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error("Login Error Details:", err.response);
      // Backend error message illana default message
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or Server error.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <h2>Welcome Back 👋</h2>
        <p className="subtitle">Login to continue your preparation journey</p>

        {/* Role Choice Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid',
              borderColor: role === 'STUDENT' ? 'var(--primary)' : 'var(--border)',
              background: role === 'STUDENT' ? 'var(--primary)' : 'transparent',
              color: role === 'STUDENT' ? 'white' : 'var(--text)',
              fontWeight: 600, cursor: 'pointer'
            }}>
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid',
              borderColor: role === 'ADMIN' ? '#e17055' : 'var(--border)',
              background: role === 'ADMIN' ? '#e17055' : 'transparent',
              color: role === 'ADMIN' ? 'white' : 'var(--text)',
              fontWeight: 600, cursor: 'pointer'
            }}>
            👨‍💼 Admin
          </button>
        </div>

        {error && <div className="error-msg" style={{color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px', marginBottom: '10px'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" 
              placeholder="you@email.com"
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" 
              placeholder="••••••••"
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required />
          </div>
          <button type="submit" className="btn btn-primary" 
            style={{width:'100%', justifyContent:'center', padding:'0.8rem', marginTop: '10px'}} 
            disabled={loading}>
            {loading ? '⏳ Logging in...' : role === 'ADMIN' ? '👨‍💼 Admin Login' : '🚀 Student Login'}
          </button>
        </form>

        {role === 'STUDENT' && (
          <div className="auth-switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        )}
      </div>
    </div>
  );
}