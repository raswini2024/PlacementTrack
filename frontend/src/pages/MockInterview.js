import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import {
  findInterviewPartner,
  checkSessionStatus,
  submitInterviewFeedback,
  getInterviewHistory,
  cancelSession
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MockInterview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [screen, setScreen] = useState('home'); // home, waiting, active, feedback, history
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [question, setQuestion] = useState('');
  const [role, setRole] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [score, setScore] = useState(7);
  const [feedback, setFeedback] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  // Polling — session status check
  const startPolling = (sid) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await checkSessionStatus(sid);
        const data = res.data;
        if (data.status === 'ACTIVE') {
          clearInterval(pollRef.current);
          setRoomId(data.roomId);
          setQuestion(data.question);
          setRole(data.role);
          setPartnerName(data.partnerName);
          setScreen('active');
          startTimer();
        }
      } catch {}
    }, 2000);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setScreen('feedback');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFindPartner = async () => {
    setLoading(true);
    try {
      const res = await findInterviewPartner();
      const data = res.data;
      setSessionId(data.sessionId);

      if (data.status === 'MATCHED') {
        setRoomId(data.roomId);
        setQuestion(data.question);
        setRole(data.role);
        setPartnerName(data.partnerName);
        setScreen('active');
        startTimer();
      } else {
        setScreen('waiting');
        startPolling(data.sessionId);
      }
    } catch { alert('Failed to find partner!'); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    try {
      if (sessionId) await cancelSession(sessionId);
      clearInterval(pollRef.current);
      setScreen('home');
      setSessionId(null);
    } catch {}
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitInterviewFeedback(sessionId, { score, feedback });
      clearInterval(timerRef.current);
      setScreen('home');
      alert('Feedback submitted! ✅');
    } catch { alert('Failed!'); }
  };

  const loadHistory = async () => {
    try {
      const res = await getInterviewHistory();
      setHistory(Array.isArray(res.data) ? res.data : []);
      setScreen('history');
    } catch {}
  };

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // ===== WAITING SCREEN =====
  if (screen === 'waiting') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in">
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Finding Partner...
            </h1>
            <p style={{ color: 'var(--mid)', marginBottom: '2rem' }}>
              Waiting for another student to join
            </p>

            {/* Animated dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: '#6c63ff',
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>

            <div style={{
              background: 'var(--card)', borderRadius: '12px',
              padding: '1.5rem', maxWidth: '400px',
              margin: '0 auto 2rem', boxShadow: 'var(--shadow)'
            }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--mid)' }}>
                📌 While you wait, prepare yourself!
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--mid)', marginTop: '0.5rem' }}>
                • Think about your introduction<br />
                • Review common HR questions<br />
                • Be ready to ask questions too!
              </p>
            </div>

            <button onClick={handleCancel}
              style={{
                background: '#ff4444', color: 'white', border: 'none',
                borderRadius: '8px', padding: '0.8rem 2rem',
                cursor: 'pointer', fontWeight: 700
              }}>
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ACTIVE SESSION =====
  if (screen === 'active') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in" style={{ padding: '1.5rem' }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '1.5rem'
          }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                🎤 Mock Interview
              </h1>
              <p style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>
                Partner: <strong>{partnerName}</strong> |
                Role: <strong style={{ color: '#6c63ff' }}>{role}</strong>
              </p>
            </div>
            <div style={{
              background: timeLeft < 300 ? '#ff4444' : '#6c63ff',
              color: 'white', padding: '0.5rem 1.2rem',
              borderRadius: '8px', fontWeight: 800, fontSize: '1.2rem'
            }}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Left — Video Call */}
            <div>
              <div style={{
                background: '#1a1a2e', borderRadius: '12px',
                overflow: 'hidden', marginBottom: '1rem'
              }}>
                <div style={{
                  background: '#6c63ff', padding: '0.5rem 1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    📹 Video Call — Room: {roomId}
                  </span>
                  <span style={{
                    background: '#00b894', color: 'white',
                    padding: '0.2rem 0.6rem', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 600
                  }}>● LIVE</span>
                </div>
                <iframe
                  src={`https://meet.jit.si/${roomId}`}
                  style={{
                    width: '100%', height: '400px',
                    border: 'none'
                  }}
                  allow="camera; microphone; fullscreen"
                  title="Video Call"
                />
              </div>
            </div>

            {/* Right — Question + Role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Role Badge */}
              <div style={{
                background: role === 'INTERVIEWER' ? '#6c63ff' : '#00b894',
                borderRadius: '12px', padding: '1rem',
                color: 'white', textAlign: 'center'
              }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
                  {role === 'INTERVIEWER' ? '🎯' : '🎤'}
                </p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  You are the {role === 'INTERVIEWER' ? 'Interviewer' : 'Interviewee'}
                </p>
                <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                  {role === 'INTERVIEWER'
                    ? 'Ask the question below and evaluate the answer'
                    : 'Answer the question clearly and confidently'}
                </p>
              </div>

              {/* Question */}
              <div style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', boxShadow: 'var(--shadow)'
              }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.8rem', color: '#6c63ff' }}>
                  📌 Interview Question:
                </p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>
                  {question}
                </p>
              </div>

              {/* Tips */}
              <div style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', boxShadow: 'var(--shadow)'
              }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                  💡 {role === 'INTERVIEWER' ? 'Evaluation Tips:' : 'Answer Tips:'}
                </p>
                {role === 'INTERVIEWER' ? (
                  <ul style={{ fontSize: '0.85rem', color: 'var(--mid)', paddingLeft: '1rem' }}>
                    <li>Listen carefully to the answer</li>
                    <li>Check for clarity and confidence</li>
                    <li>Note communication skills</li>
                    <li>Rate honestly after session</li>
                  </ul>
                ) : (
                  <ul style={{ fontSize: '0.85rem', color: 'var(--mid)', paddingLeft: '1rem' }}>
                    <li>Use STAR method if behavioral</li>
                    <li>Speak clearly and confidently</li>
                    <li>Give specific examples</li>
                    <li>Keep answer under 2 minutes</li>
                  </ul>
                )}
              </div>

              {/* End Session */}
              <button onClick={() => {
                clearInterval(timerRef.current);
                setScreen('feedback');
              }}
                style={{
                  background: '#ff4444', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0.8rem',
                  cursor: 'pointer', fontWeight: 700, width: '100%'
                }}>
                🏁 End Session & Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== FEEDBACK SCREEN =====
  if (screen === 'feedback') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in">
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem' }}>⭐</div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Rate Your Partner</h1>
              <p style={{ color: 'var(--mid)' }}>
                How did <strong>{partnerName}</strong> perform?
              </p>
            </div>

            <div style={{
              background: 'var(--card)', borderRadius: '16px',
              padding: '2rem', boxShadow: 'var(--shadow)'
            }}>
              {/* Score Slider */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 700 }}>Score</label>
                  <span style={{
                    background: '#6c63ff', color: 'white',
                    padding: '0.2rem 0.8rem', borderRadius: '20px',
                    fontWeight: 800, fontSize: '1.1rem'
                  }}>
                    {score}/10
                  </span>
                </div>
                <input type="range" min="1" max="10" value={score}
                  onChange={e => setScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#6c63ff' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--mid)' }}>
                  <span>1 — Needs improvement</span>
                  <span>10 — Excellent!</span>
                </div>
              </div>

              {/* Score Labels */}
              <div style={{
                background: score >= 8 ? '#e6fff9' : score >= 5 ? '#fff3e0' : '#ffe6e6',
                borderRadius: '8px', padding: '0.8rem', marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{
                  fontWeight: 700,
                  color: score >= 8 ? '#00b894' : score >= 5 ? '#f77f00' : '#ff4444'
                }}>
                  {score >= 8 ? '🌟 Excellent Performance!' :
                   score >= 5 ? '👍 Good Performance!' :
                   '📚 Needs More Practice'}
                </p>
              </div>

              {/* Feedback Text */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Written Feedback (Optional)
                </label>
                <textarea rows={4}
                  placeholder="Share your thoughts about the interview..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem',
                    borderRadius: '8px', border: '1px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text)',
                    fontSize: '0.9rem', resize: 'vertical'
                  }}
                />
              </div>

              <button onClick={handleSubmitFeedback}
                style={{
                  background: '#6c63ff', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0.8rem',
                  cursor: 'pointer', fontWeight: 700,
                  fontSize: '1rem', width: '100%'
                }}>
                ✅ Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== HISTORY SCREEN =====
  if (screen === 'history') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in">
          <div className="page-header">
            <button className="back-btn" onClick={() => setScreen('home')}>← Back</button>
            <h1>📋 Interview History</h1>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <div className="e-icon">📭</div>
              <h3>No interviews yet</h3>
            </div>
          ) : (
            history.map((h, i) => (
              <div key={h.id} style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', marginBottom: '1rem',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 700 }}>
                    {h.role === 'INTERVIEWER' ? '🎯 Interviewer' : '🎤 Interviewee'}
                  </p>
                  <span style={{
                    background: '#6c63ff20', color: '#6c63ff',
                    padding: '0.2rem 0.7rem', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 700
                  }}>
                    Score: {h.myScore || 'N/A'}/10
                  </span>
                </div>
                <p style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>
                  Partner: <strong>{h.partnerName}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  Q: {h.question}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===== HOME SCREEN =====
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div>
            <h1>🎤 Peer Mock Interview</h1>
            <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>
              Practice real interviews with fellow students
            </p>
          </div>
        </div>

        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
          borderRadius: '16px', padding: '2rem',
          color: 'white', marginBottom: '2rem',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                🎯 Real Interview Experience
              </h2>
              <p style={{ opacity: 0.9, marginBottom: '1.5rem', maxWidth: '500px' }}>
                Get matched with another student. One plays interviewer,
                one plays interviewee. Practice with real video call!
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {['📹 Video Call', '⏱ 30 Min Session', '⭐ Rate Each Other', '🎯 Real Questions'].map(f => (
                  <span key={f} style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.3rem 0.8rem', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 600
                  }}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '5rem', opacity: 0.8 }}>🤝</div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>📋 How it works:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { step: '1', icon: '🔍', title: 'Find Partner', desc: 'Click below to find a student to practice with' },
              { step: '2', icon: '🎥', title: 'Video Call', desc: 'Auto-connected via Jitsi video call' },
              { step: '3', icon: '❓', title: 'Interview', desc: 'System gives a question. One asks, one answers' },
              { step: '4', icon: '⭐', title: 'Rate & Learn', desc: 'Rate each other and improve together' },
            ].map(s => (
              <div key={s.step} style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', boxShadow: 'var(--shadow)',
                textAlign: 'center'
              }}>
                <div style={{
                  background: '#6c63ff', color: 'white',
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, margin: '0 auto 0.8rem'
                }}>{s.step}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={handleFindPartner} disabled={loading}
            style={{
              background: '#6c63ff', color: 'white', border: 'none',
              borderRadius: '12px', padding: '1rem 3rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 800, fontSize: '1.1rem',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 15px rgba(108,99,255,0.4)'
            }}>
            {loading ? '⏳ Finding...' : '🔍 Find Interview Partner'}
          </button>
          <button onClick={loadHistory}
            style={{
              background: 'var(--card)', color: 'var(--text)',
              border: '2px solid var(--border)', borderRadius: '12px',
              padding: '1rem 2rem', cursor: 'pointer', fontWeight: 700
            }}>
            📋 My History
          </button>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}