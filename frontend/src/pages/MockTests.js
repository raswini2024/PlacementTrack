import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getMockTestHistory, startMockTest } from '../services/api';

export default function MockTests() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMockTestHistory()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setHistory(data);
      })
      .catch(() => setHistory([]));
  }, []);

  const handleStart = async (testType) => {
    setLoading(true);
    try {
      await startMockTest(testType);
      navigate(`/mock-test/${testType}`);
    } catch (err) {
      alert('Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const TEST_TYPES = [
    { type: 'APTITUDE', label: 'Aptitude Test', icon: '🧮', desc: '30 mins • 20 questions', color: '#6c63ff' },
    { type: 'PROGRAMMING', label: 'Programming Test', icon: '💻', desc: '45 mins • 15 questions', color: '#00b4d8' },
    { type: 'MIXED', label: 'Mixed Test', icon: '🎯', desc: '60 mins • 30 questions', color: '#f77f00' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div>
            <h1>📝 Mock Tests</h1>
            <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>
              Test your knowledge with timed mock exams
            </p>
          </div>
        </div>

        <div className="topics-grid" style={{ marginBottom: '2rem' }}>
          {TEST_TYPES.map(t => (
            <div className="topic-card" key={t.type}
              style={{ cursor: 'pointer', borderTop: `4px solid ${t.color}` }}
              onClick={() => handleStart(t.type)}>
              <div className="topic-card-header">
                <div className="t-icon">{t.icon}</div>
                <div>
                  <h3>{t.label}</h3>
                  <p>{t.desc}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: t.color, fontWeight: 700 }}>
                  {loading ? '...' : 'Start →'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ marginBottom: '1rem' }}>📊 Test History</h2>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="e-icon">📭</div>
            <h3>No tests taken yet</h3>
            <p>Start a mock test above!</p>
          </div>
        ) : (
          <div className="topics-grid">
            {history.map((h, i) => (
              <div className="topic-card" key={i}>
                <div className="topic-card-header">
                  <div className="t-icon">📋</div>
                  <div>
                    <h3>{h.testType}</h3>
                    <p>Score: {h.score} • {h.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}