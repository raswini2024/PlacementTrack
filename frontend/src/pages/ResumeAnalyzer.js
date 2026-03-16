import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const SUGGESTIONS_POOL = [
  { icon: '📁', type: 'warning', text: 'Add more projects — ideally 2-3 projects with clear descriptions and tech stacks.' },
  { icon: '🛠️', type: 'info', text: 'Mention technologies clearly — list all tools, frameworks, and languages used.' },
  { icon: '✍️', type: 'info', text: 'Improve the summary section — it should be 3-4 lines highlighting your key strengths.' },
  { icon: '🎯', type: 'success', text: 'Add quantifiable achievements — e.g., "Reduced load time by 40%" instead of vague statements.' },
  { icon: '🔗', type: 'info', text: 'Include your GitHub/LinkedIn profile links for technical credibility.' },
  { icon: '📄', type: 'warning', text: 'Keep resume to 1 page for freshers and 2 pages for experienced professionals.' },
  { icon: '🧩', type: 'info', text: 'List relevant skills in a dedicated section — separate technical from soft skills.' },
  { icon: '🎓', type: 'success', text: 'Mention your CGPA or percentage if it is above 7.0.' },
  { icon: '⚡', type: 'warning', text: 'Use action verbs — start bullet points with "Developed", "Built", "Designed", "Optimized".' },
  { icon: '📊', type: 'info', text: 'Add relevant certifications from platforms like Coursera, Udemy, or HackerRank.' },
];

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState(0);

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.name.endsWith('.docx'))) {
      setFile(f);
      setAnalyzed(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const analyzeResume = () => {
    if (!file) return;
    setAnalyzing(true);
    // Simulate analysis with a timeout (real backend would parse PDF/DOCX)
    setTimeout(() => {
      const randomSuggestions = [...SUGGESTIONS_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
      const randomScore = Math.floor(Math.random() * 30) + 55; // 55-85
      setSuggestions(randomSuggestions);
      setScore(randomScore);
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2500);
  };

  const getScoreColor = (s) => s >= 75 ? 'var(--success)' : s >= 60 ? 'var(--accent)' : 'var(--danger)';
  const getScoreLabel = (s) => s >= 75 ? 'Strong Resume ✅' : s >= 60 ? 'Good Resume 👍' : 'Needs Improvement ⚠️';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div><h1>📄 Resume Analyzer</h1><p style={{color:'var(--mid)',fontSize:'0.9rem'}}>Get actionable feedback on your resume</p></div>
        </div>

        {/* Upload Area */}
        {!analyzed && (
          <div style={{maxWidth:'600px',margin:'0 auto'}}>
            <div
              className={`resume-upload-box ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}>
              <div className="upload-icon">{file ? '📄' : '☁️'}</div>
              <h3 style={{fontFamily:'var(--font-display)',fontWeight:'700',marginBottom:'0.5rem'}}>
                {file ? file.name : 'Upload Your Resume'}
              </h3>
              <p style={{color:'var(--mid)',fontSize:'0.9rem'}}>
                {file ? `${(file.size/1024).toFixed(1)} KB — Ready to analyze` : 'Drag & drop your PDF or DOCX file here, or click to browse'}
              </p>
              <input id="file-input" type="file" accept=".pdf,.docx" style={{display:'none'}}
                onChange={e => handleFile(e.target.files[0])} />
            </div>

            {file && (
              <button className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center',marginTop:'1rem'}}
                onClick={analyzeResume} disabled={analyzing}>
                {analyzing ? '🔍 Analyzing your resume...' : '🚀 Analyze Resume'}
              </button>
            )}

            {analyzing && (
              <div style={{textAlign:'center',padding:'2rem'}}>
                <div className="spinner" style={{margin:'0 auto 1rem'}}></div>
                <p style={{color:'var(--mid)'}}>Scanning your resume for improvements...</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {analyzed && (
          <div className="fade-in-up">
            <div style={{display:'flex',alignItems:'center',gap:'1.5rem',background:'white',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'1.5rem',marginBottom:'1.5rem'}}>
              <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'linear-gradient(135deg, var(--primary), var(--primary-dark))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:'800',flexShrink:0}}>
                {score}
              </div>
              <div>
                <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',fontWeight:'800',marginBottom:'0.25rem'}}>Resume Score: {score}/100</h2>
                <p style={{color: getScoreColor(score), fontWeight:'600'}}>{getScoreLabel(score)}</p>
                <p style={{color:'var(--mid)',fontSize:'0.88rem',marginTop:'0.25rem'}}>Based on {suggestions.length} key improvement areas identified</p>
              </div>
              <button className="btn btn-outline btn-sm" style={{marginLeft:'auto'}}
                onClick={() => { setFile(null); setAnalyzed(false); }}>
                Upload New
              </button>
            </div>

            <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',fontWeight:'700',marginBottom:'1rem'}}>
              💡 Improvement Suggestions
            </h3>
            <ul className="suggestions-list">
              {suggestions.map((s, i) => (
                <li key={i} className="suggestion-item">
                  <span className="s-icon">{s.icon}</span>
                  <div>
                    <div className="s-text">{s.text}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{background:'var(--primary-light)',border:'1px solid rgba(37,99,235,0.2)',borderRadius:'var(--radius)',padding:'1.25rem',marginTop:'1.5rem'}}>
              <h4 style={{fontFamily:'var(--font-display)',fontWeight:'700',marginBottom:'0.5rem',color:'var(--primary)'}}>
                📌 Quick Checklist
              </h4>
              {['Resume fits in 1-2 pages','Contact info is clearly visible','All dates are consistent','No spelling errors','PDF format used','Used professional email address'].map((item, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.35rem 0',fontSize:'0.9rem'}}>
                  <span style={{color:'var(--success)'}}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
