import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getHrQuestions } from '../services/api';

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hr');

  useEffect(() => {
    getHrQuestions().then(res => {
      setQuestions(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const TIPS = [
    { icon: '🤝', title: 'Research the Company', desc: 'Know their products, culture, recent news, and values before the interview.' },
    { icon: '⭐', title: 'Use STAR Method', desc: 'Situation, Task, Action, Result — structure your answers for behavioral questions.' },
    { icon: '👔', title: 'Dress Professionally', desc: 'First impressions matter. Dress one level above the company dress code.' },
    { icon: '🎯', title: 'Prepare Questions', desc: 'Always have 3-4 thoughtful questions for the interviewer about the role and team.' },
    { icon: '⏰', title: 'Arrive Early', desc: 'Aim to arrive 10-15 minutes before your scheduled interview time.' },
    { icon: '📱', title: 'Follow Up', desc: 'Send a thank-you email within 24 hours mentioning key discussion points.' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div><h1>🎤 Interview Preparation</h1><p style={{color:'var(--mid)',fontSize:'0.9rem'}}>HR questions, tips, and strategies</p></div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab==='hr'?'active':''}`} onClick={() => setActiveTab('hr')}>HR Questions</button>
          <button className={`tab ${activeTab==='tips'?'active':''}`} onClick={() => setActiveTab('tips')}>Interview Tips</button>
        </div>

        {activeTab === 'hr' && (
          loading ? (
            <div className="loading-wrap"><div className="spinner"></div></div>
          ) : (
            <>
              <p style={{color:'var(--mid)',fontSize:'0.9rem',marginBottom:'1.25rem'}}>
                Practice these common HR questions. Click to expand sample answer.
              </p>
              {questions.map((q, idx) => (
                <div className="hr-card" key={q.id}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
                    onClick={() => setExpanded(expanded===q.id ? null : q.id)}>
                    <h3>Q{idx+1}. {q.questionText}</h3>
                    <span style={{fontSize:'1rem',color:'var(--mid)',marginLeft:'1rem'}}>{expanded===q.id?'▲':'▼'}</span>
                  </div>
                  {q.category && (
                    <span style={{fontSize:'0.75rem',background:'var(--primary-light)',color:'var(--primary)',padding:'0.2rem 0.6rem',borderRadius:'50px',fontWeight:'600'}}>
                      {q.category}
                    </span>
                  )}
                  {expanded === q.id && (
                    <div style={{marginTop:'0.75rem'}}>
                      {q.sampleAnswer && (
                        <div className="answer-box">
                          <strong style={{display:'block',marginBottom:'0.25rem',fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>💬 Sample Answer</strong>
                          {q.sampleAnswer}
                        </div>
                      )}
                      {q.tips && (
                        <div className="tip-box">
                          <strong style={{display:'block',marginBottom:'0.25rem',fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>💡 Pro Tip</strong>
                          {q.tips}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )
        )}

        {activeTab === 'tips' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.25rem'}}>
            {TIPS.map(t => (
              <div className="feature-card" key={t.title}>
                <div className="feature-icon">{t.icon}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
