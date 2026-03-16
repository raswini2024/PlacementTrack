import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { startMockTest, submitMockTest } from '../services/api';

export default function MockTestPage() {
  const { testType } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800);

  useEffect(() => {
    startMockTest(testType)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.questions || [];
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [testType]);

  useEffect(() => {
    if (submitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, loading]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const res = await submitMockTest({ testType, answers });
      setResult(res.data);
    } catch {
      setResult({ score: 0, message: 'Submitted!' });
    }
    setSubmitted(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="loading-wrap"><div className="spinner"></div></div>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h1>Test Completed!</h1>
          <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
            Score: <strong>{result?.score || 0}</strong> / {questions.length}
          </p>
          <button className="btn-primary" onClick={() => navigate('/mock-tests')}>
            Back to Mock Tests
          </button>
        </div>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="empty-state">
          <div className="e-icon">📭</div>
          <h3>No questions available</h3>
          <button className="btn-primary" onClick={() => navigate('/mock-tests')}>Back</button>
        </div>
      </div>
    </div>
  );

  const q = questions[current];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <div>
            <h1>📝 {testType} Mock Test</h1>
            <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>
              Question {current + 1} of {questions.length}
            </p>
          </div>
          <div style={{
            background: timeLeft < 300 ? '#ff4444' : 'var(--primary)',
            color: 'white', padding: '0.5rem 1.5rem',
            borderRadius: '8px', fontWeight: 700, fontSize: '1.2rem'
          }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="topic-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {q.questionText}
            </p>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                style={{
                  padding: '0.8rem 1rem', margin: '0.5rem 0',
                  borderRadius: '8px', cursor: 'pointer',
                  border: answers[q.id] === opt
                    ? '2px solid var(--primary)'
                    : '2px solid var(--border)',
                  background: answers[q.id] === opt
                    ? 'var(--primary-light)' : 'var(--card)',
                  transition: 'all 0.2s'
                }}>
                <strong>{opt}.</strong> {q[`option${opt}`]}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button className="back-btn"
            onClick={() => setCurrent(prev => Math.max(0, prev - 1))}
            disabled={current === 0}>
            ← Previous
          </button>

          {current < questions.length - 1 ? (
            <button className="btn-primary"
              onClick={() => setCurrent(prev => prev + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn-primary"
              onClick={handleSubmit}
              style={{ background: '#00b894' }}>
              ✅ Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}