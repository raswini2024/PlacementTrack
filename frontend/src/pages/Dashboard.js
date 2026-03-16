import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getProfile, getProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RadialBarChart, RadialBar, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const MODULES = [
  { path: '/aptitude', icon: '🧮', title: 'Aptitude', desc: 'Quant · Logic · Verbal' },
  { path: '/programming', icon: '💻', title: 'Programming', desc: 'Loops · Arrays · DSA' },
  { path: '/interview-prep', icon: '🎤', title: 'Interview Prep', desc: 'HR · Technical Qs' },
  { path: '/mock-tests', icon: '📝', title: 'Mock Tests', desc: 'Full-length tests' },
  { path: '/company-questions', icon: '🏢', title: 'Previous Year Qs', desc: 'Company-wise questions' },
  { path: '/resume', icon: '📄', title: 'Resume Analyzer', desc: 'Get resume feedback' },
];

const PROGRESS_COLORS = {
  aptitude: '#2563eb',
  programming: '#7c3aed',
  interview: '#059669',
  overall: '#f59e0b'
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getProgress()])
      .then(([profileRes, progressRes]) => {
        setProfile(profileRes.data);
        setProgress(progressRes.data);
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  if (loadingProfile) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="loading-wrap"><div className="spinner"></div></div>
      </div>
    </div>
  );

  const prog = progress || { aptitudeProgress: 0, programmingProgress: 0, interviewProgress: 0, overallProgress: 0 };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        {/* Ready Banner */}
        {prog.overallProgress >= 100 && (
          <div className="ready-banner" style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🎉</div>
            <h2>You are ready to attend your dream company interview!</h2>
            <p style={{opacity:0.9}}>Congratulations! You've mastered all sections. Go ace that interview!</p>
          </div>
        )}

        {/* Profile Banner */}
        <div className="profile-banner">
          <div className="profile-info">
            <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'S'}</div>
            <div className="profile-detail">
              <h2>Hi, {user?.name || 'Student'}! 👋</h2>
              <p>Your personalized placement preparation dashboard</p>
            </div>
          </div>
          <div className="profile-chips">
            {profile && <>
              <span className="chip">🏢 {profile.dreamCompany}</span>
              <span className="chip">💼 {profile.dreamRole}</span>
              <span className="chip">💻 {profile.preferredLanguage}</span>
              <span className="chip">📈 {profile.skillLevel}</span>
            </>}
          </div>
        </div>

        {/* Suggestion Box */}
        {progress?.suggestion && (
          <div style={{background:'var(--accent-light)',border:'1px solid #fde68a',borderRadius:'var(--radius)',padding:'0.9rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <span style={{fontSize:'1.3rem'}}>💡</span>
            <span style={{fontSize:'0.92rem',color:'var(--dark-3)'}}>{progress.suggestion}</span>
          </div>
        )}

        {/* Progress Cards */}
        <div className="progress-grid">
          {[
            { label: 'Aptitude', value: prog.aptitudeProgress, color: PROGRESS_COLORS.aptitude, icon: '🧮' },
            { label: 'Programming', value: prog.programmingProgress, color: PROGRESS_COLORS.programming, icon: '💻' },
            { label: 'Interview Prep', value: prog.interviewProgress, color: PROGRESS_COLORS.interview, icon: '🎤' },
            { label: 'Overall Progress', value: prog.overallProgress, color: PROGRESS_COLORS.overall, icon: '⭐' },
          ].map(p => (
            <div className="progress-card" key={p.label}>
              <div className="p-label">{p.icon} {p.label}</div>
              <div className="p-value" style={{color: p.color}}>{Math.round(p.value)}%</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{width:`${p.value}%`, background: p.color}} />
              </div>
            </div>
          ))}
        </div>

        {/* Modules */}
        <div style={{marginBottom:'1rem'}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',fontWeight:'700',marginBottom:'1rem'}}>
            📚 Preparation Modules
          </h2>
          <div className="modules-grid">
            {MODULES.map(m => (
              <div className="module-card" key={m.path} onClick={() => navigate(m.path)}>
                <div className="m-icon">{m.icon}</div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
