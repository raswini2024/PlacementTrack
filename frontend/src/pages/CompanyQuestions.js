import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getCompanyRoadmap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/api';

const COMPANIES = ['Zoho','TCS','Infosys','Wipro','Accenture','Amazon','Google','Microsoft','Freshworks','Cognizant'];

export default function CompanyQuestions() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    getProfile().then(res => {
      if (res.data?.dreamCompany) setSelectedCompany(res.data.dreamCompany);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      setLoading(true);
      getCompanyRoadmap(selectedCompany).then(res => {
        setRoadmap(res.data);
        setActiveTab('All');
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [selectedCompany]);

  const types = roadmap ? ['All', ...Object.keys(roadmap.questionsByType || {})] : ['All'];

  const getFilteredQuestions = () => {
    if (!roadmap) return [];
    if (activeTab === 'All') {
      return Object.values(roadmap.questionsByType || {}).flat();
    }
    return roadmap.questionsByType?.[activeTab] || [];
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div><h1>🏢 Previous Year Questions</h1><p style={{color:'var(--mid)',fontSize:'0.9rem'}}>Company-specific question banks and interview roadmaps</p></div>
        </div>

        {/* Company Selector */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h3 style={{fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:'700',marginBottom:'1rem'}}>Select Company</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.6rem'}}>
            {COMPANIES.map(c => (
              <button key={c}
                style={{
                  padding:'0.5rem 1rem',
                  borderRadius:'50px',
                  border: selectedCompany===c ? 'none' : '1px solid var(--border)',
                  background: selectedCompany===c ? 'var(--primary)' : 'white',
                  color: selectedCompany===c ? 'white' : 'var(--dark)',
                  fontWeight:'600',fontSize:'0.88rem',cursor:'pointer',transition:'all 0.2s'
                }}
                onClick={() => setSelectedCompany(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="loading-wrap"><div className="spinner"></div></div>}

        {roadmap && !loading && (
          <>
            {/* Roadmap Stages */}
            <div className="card" style={{marginBottom:'1.5rem'}}>
              <div className="card-header">
                <span className="card-title">🗺️ {selectedCompany} Interview Roadmap</span>
                <span style={{fontSize:'0.85rem',color:'var(--mid)'}}>{roadmap.totalQuestions} questions available</span>
              </div>
              {roadmap.stages?.map(stage => (
                <div className="roadmap-stage" key={stage.stage}>
                  <div className="stage-num">{stage.stage}</div>
                  <div>
                    <div style={{fontWeight:'700',marginBottom:'0.25rem'}}>{stage.title}</div>
                    <div style={{fontSize:'0.88rem',color:'var(--mid)'}}>{stage.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Questions */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">❓ Interview Questions</span>
              </div>
              <div className="tabs" style={{borderBottom:'none',marginBottom:'1rem'}}>
                {types.map(t => (
                  <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
              </div>
              {getFilteredQuestions().map((q, idx) => (
                <div className="company-q-card" key={q.id || idx}>
                  <span className={`type-badge type-${q.questionType}`}>{q.questionType}</span>
                  <h4>{q.questionText}</h4>
                  {q.answerHint && <div className="hint">💡 Hint: {q.answerHint}</div>}
                  {q.yearAsked && <div style={{fontSize:'0.78rem',color:'var(--mid)',marginTop:'0.4rem'}}>Asked in: {q.yearAsked}</div>}
                </div>
              ))}
              {getFilteredQuestions().length === 0 && (
                <div className="empty-state">
                  <div className="e-icon">📭</div>
                  <h3>No questions found</h3>
                  <p>Questions for this filter will be added soon.</p>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedCompany && !loading && (
          <div className="empty-state">
            <div className="e-icon">🏢</div>
            <h3>Select a company to begin</h3>
            <p>Choose a company above to see their interview questions and roadmap.</p>
          </div>
        )}
      </div>
    </div>
  );
}
