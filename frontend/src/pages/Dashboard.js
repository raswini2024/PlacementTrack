import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getProfile, getProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
  RadialBarChart, RadialBar
} from 'recharts';

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

// Company compatibility data
const getCompatibility = (prog) => {
  const apt = prog.aptitudeProgress || 0;
  const code = prog.programmingProgress || 0;
  const interview = prog.interviewProgress || 0;

  return [
    {
      company: 'TCS',
      score: Math.round(apt * 0.5 + code * 0.3 + interview * 0.2),
      color: '#2563eb',
      focus: 'Aptitude Heavy'
    },
    {
      company: 'Zoho',
      score: Math.round(apt * 0.2 + code * 0.6 + interview * 0.2),
      color: '#7c3aed',
      focus: 'Coding Heavy'
    },
    {
      company: 'Infosys',
      score: Math.round(apt * 0.4 + code * 0.3 + interview * 0.3),
      color: '#059669',
      focus: 'Balanced'
    },
    {
      company: 'Wipro',
      score: Math.round(apt * 0.45 + code * 0.25 + interview * 0.3),
      color: '#f59e0b',
      focus: 'Aptitude + HR'
    },
    {
      company: 'Google',
      score: Math.round(apt * 0.1 + code * 0.7 + interview * 0.2),
      color: '#ef4444',
      focus: 'Algorithm Heavy'
    },
    {
      company: 'Startups',
      score: Math.round(apt * 0.1 + code * 0.5 + interview * 0.4),
      color: '#06b6d4',
      focus: 'Speed + Communication'
    },
  ];
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

  const prog = progress || {
    aptitudeProgress: 0,
    programmingProgress: 0,
    interviewProgress: 0,
    overallProgress: 0
  };

  // Radar chart data
  const radarData = [
    { skill: 'Aptitude', value: Math.round(prog.aptitudeProgress || 0) },
    { skill: 'Programming', value: Math.round(prog.programmingProgress || 0) },
    { skill: 'Interview', value: Math.round(prog.interviewProgress || 0) },
    { skill: 'Mock Tests', value: Math.round(prog.overallProgress || 0) },
    { skill: 'Speed', value: Math.round((prog.aptitudeProgress + prog.programmingProgress) / 2 || 0) },
    { skill: 'Accuracy', value: Math.round(prog.overallProgress * 0.9 || 0) },
  ];

  const compatibility = getCompatibility(prog);
  const topCompany = compatibility.reduce((a, b) => a.score > b.score ? a : b);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">

        {/* Ready Banner */}
        {prog.overallProgress >= 100 && (
          <div className="ready-banner" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h2>You are ready to attend your dream company interview!</h2>
            <p style={{ opacity: 0.9 }}>Congratulations! Go ace that interview!</p>
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
          <div style={{
            background: 'var(--accent-light)', border: '1px solid #fde68a',
            borderRadius: 'var(--radius)', padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.3rem' }}>💡</span>
            <span style={{ fontSize: '0.92rem', color: 'var(--dark-3)' }}>{progress.suggestion}</span>
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
              <div className="p-value" style={{ color: p.color }}>{Math.round(p.value)}%</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${p.value}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart + Compatibility Score */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem', marginBottom: '1.5rem'
        }}>

          {/* Radar Chart */}
          <div style={{
            background: 'var(--card)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              📡 Skill Radar Analysis
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name="Skills" dataKey="value"
                  stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip formatter={(val) => [`${val}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              Your skill distribution across all areas
            </p>
          </div>

          {/* Company Compatibility */}
          <div style={{
            background: 'var(--card)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              🏢 Company Compatibility Score
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Best match: <strong style={{ color: topCompany.color }}>
                {topCompany.company} ({topCompany.score}%)
              </strong>
            </p>
            {compatibility.map(c => (
              <div key={c.company} style={{ marginBottom: '0.8rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '0.2rem'
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.company}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.focus}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: c.color }}>
                      {c.score}%
                    </span>
                  </div>
                </div>
                <div style={{
                  height: '6px', background: '#e2e8f0',
                  borderRadius: '999px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', width: `${c.score}%`,
                    background: c.color, borderRadius: '999px',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blind Recruitment — Candidate Power Index */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: 'var(--radius)', padding: '1.5rem',
          marginBottom: '1.5rem', color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                🔍 Candidate Power Index
              </h2>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Skill-based score — Bias free evaluation
              </p>
            </div>
            <div style={{
              background: '#6c63ff', borderRadius: '50%',
              width: '80px', height: '80px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {Math.round(
                  (prog.aptitudeProgress * 0.3) +
                  (prog.programmingProgress * 0.5) +
                  (prog.interviewProgress * 0.2)
                )}
              </span>
              <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>/ 100</span>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem', marginTop: '1rem'
          }}>
            {[
              { label: 'Aptitude', weight: '30%', value: prog.aptitudeProgress, color: '#2563eb' },
              { label: 'Coding', weight: '50%', value: prog.programmingProgress, color: '#7c3aed' },
              { label: 'Communication', weight: '20%', value: prog.interviewProgress, color: '#059669' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px', padding: '0.8rem', textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                  {item.label} ({item.weight})
                </p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color: item.color }}>
                  {Math.round(item.value)}%
                </p>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '0.8rem', opacity: 0.6, marginTop: '1rem', textAlign: 'center'
          }}>
            🔒 Name · College · Gender hidden — Pure skill evaluation
          </p>
        </div>

        {/* Modules */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.25rem',
            fontWeight: '700', marginBottom: '1rem'
          }}>
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