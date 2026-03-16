import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COMPANIES = ['Zoho','TCS','Infosys','Wipro','Accenture','Amazon','Google','Microsoft','Freshworks','Cognizant'];
const ROLES = ['Software Developer','Full Stack Developer','Backend Developer','Data Analyst','Frontend Developer','DevOps Engineer'];

export default function ProfileSetup() {
  const [form, setForm] = useState({
    preferredLanguage: '',
    dreamCompany: '',
    dreamRole: '',
    skillLevel: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.preferredLanguage || !form.dreamCompany || !form.dreamRole || !form.skillLevel) {
      setError('Please fill all fields.'); return;
    }
    setLoading(true);
    try {
      await saveProfile(form);
      setUser({ ...user, profileCompleted: true });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completedFields = Object.values(form).filter(Boolean).length;

  return (
    <div className="profile-form-page">
      <div className="profile-form-card fade-in-up">
        <div className="form-steps">
          {[0,1,2,3].map(i => (
            <div key={i} className={`step-dot ${i < completedFields ? 'active' : ''}`} />
          ))}
        </div>
        <h2>Setup Your Profile 🚀</h2>
        <p className="subtitle" style={{color:'var(--mid)',marginBottom:'1.75rem'}}>
          Help us personalize your preparation journey. This takes less than a minute.
        </p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>⭐ Preferred Programming Language</label>
            <select className="form-control" value={form.preferredLanguage}
              onChange={e => setForm({...form, preferredLanguage: e.target.value})}>
              <option value="">Select language</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="Cpp">C++</option>
            </select>
          </div>
          <div className="form-group">
            <label>🏢 Dream Company</label>
            <select className="form-control" value={form.dreamCompany}
              onChange={e => setForm({...form, dreamCompany: e.target.value})}>
              <option value="">Select company</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>💼 Dream Role</label>
            <select className="form-control" value={form.dreamRole}
              onChange={e => setForm({...form, dreamRole: e.target.value})}>
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>📈 Current Programming Skill Level</label>
            <select className="form-control" value={form.skillLevel}
              onChange={e => setForm({...form, skillLevel: e.target.value})}>
              <option value="">Select level</option>
              <option value="Beginner">🌱 Beginner</option>
              <option value="Intermediate">🔥 Intermediate</option>
              <option value="Advanced">⚡ Advanced</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary"
            style={{width:'100%',justifyContent:'center',padding:'0.85rem',marginTop:'0.5rem'}} disabled={loading}>
            {loading ? '⏳ Saving...' : '🎯 Start My Preparation Journey'}
          </button>
        </form>
      </div>
    </div>
  );
}
