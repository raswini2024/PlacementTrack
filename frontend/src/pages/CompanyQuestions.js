import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getCompanyRoadmap, getProfile, getExamPapers, getPaperQuestions, submitPaper } from '../services/api';

const COMPANIES = ['Zoho','TCS','Infosys','Wipro','Accenture','Amazon','Google','Microsoft','Freshworks','Cognizant'];

export default function CompanyQuestions() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');

  // Practice mode
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Exam mode
  const [examMode, setExamMode] = useState(false);
  const [examPaper, setExamPaper] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examResults, setExamResults] = useState(null);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    getProfile()
      .then(res => { if (res.data?.dreamCompany) setSelectedCompany(res.data.dreamCompany); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      setLoading(true);
      Promise.all([
        getCompanyRoadmap(selectedCompany),
        getExamPapers(selectedCompany)
      ])
        .then(([roadmapRes, papersRes]) => {
          setRoadmap(roadmapRes.data);
          setPapers(Array.isArray(papersRes.data) ? papersRes.data : []);
          setActiveTab('questions');
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [selectedCompany]);

  // Timer for exam
  useEffect(() => {
    if (!examMode || examResults) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleExamSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examMode, examResults]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startExam = async (paper) => {
    try {
      const res = await getPaperQuestions(paper.id);
      setExamPaper(paper);
      setExamQuestions(Array.isArray(res.data) ? res.data : []);
      setExamAnswers({});
      setExamResults(null);
      setTimeLeft(paper.durationMins * 60);
      setExamMode(true);
    } catch { alert('Failed to load paper!'); }
  };

  const handleExamSubmit = async () => {
    if (examSubmitting) return;
    setExamSubmitting(true);
    try {
      const res = await submitPaper(examPaper.id, examAnswers);
      setExamResults(res.data);
    } catch {
      setExamResults({ correct: 0, total: examQuestions.length, percentage: 0, message: 'Submitted!' });
    } finally {
      setExamSubmitting(false);
    }
  };

  const getFilteredQuestions = () => {
    if (!roadmap) return [];
    return Object.values(roadmap.questionsByType || {}).flat();
  };

  const startPractice = () => {
    const qs = getFilteredQuestions();
    if (qs.length === 0) { alert('No questions!'); return; }
    setPracticeQuestions(qs);
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore(0);
    setFinished(false);
    setPracticeMode(true);
  };

  const handleAnswer = (knew) => {
    if (knew) setScore(s => s + 1);
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowAnswer(false);
    } else {
      setFinished(true);
    }
  };

  // ===== EXAM MODE =====
  if (examMode) {
    if (examResults) {
      return (
        <div className="app-layout">
          <Sidebar />
          <div className="main-content fade-in">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '4rem' }}>
                  {examResults.percentage >= 70 ? '🎉' : examResults.percentage >= 40 ? '💪' : '📚'}
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Exam Completed!</h1>
                <p style={{ color: 'var(--mid)', marginBottom: '2rem' }}>{examPaper?.title}</p>
                <div style={{
                  display: 'inline-block', background: 'var(--card)',
                  borderRadius: '16px', padding: '2rem 3rem',
                  boxShadow: 'var(--shadow)', marginBottom: '2rem'
                }}>
                  <p style={{
                    fontSize: '3rem', fontWeight: 800,
                    color: examResults.percentage >= 70 ? '#00b894' :
                      examResults.percentage >= 40 ? '#f77f00' : '#ff4444'
                  }}>
                    {examResults.correct}/{examResults.total}
                  </p>
                  <p style={{ color: 'var(--mid)' }}>{examResults.percentage}% Score</p>
                </div>
                <p style={{ fontWeight: 600, color: '#6c63ff', marginBottom: '2rem' }}>
                  {examResults.message}
                </p>
              </div>

              {/* Answer Review */}
              <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>📋 Answer Review:</h3>
              {examResults.results?.map((r, i) => (
                <div key={i} style={{
                  background: r.isCorrect ? '#e6fff9' : '#ffe6e6',
                  border: `1px solid ${r.isCorrect ? '#00b894' : '#ff4444'}`,
                  borderRadius: '10px', padding: '1rem', marginBottom: '0.8rem'
                }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                    {r.isCorrect ? '✅' : '❌'} Q{i + 1}: {r.questionText}
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>
                    Your Answer: <strong>{r.userAnswer || 'Not answered'}</strong> |
                    Correct: <strong style={{ color: '#00b894' }}>{r.correctAnswer}</strong>
                  </p>
                  {r.explanation && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: '0.3rem' }}>
                      💡 {r.explanation}
                    </p>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button onClick={() => startExam(examPaper)}
                  style={{
                    background: '#6c63ff', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '0.8rem 2rem',
                    cursor: 'pointer', fontWeight: 700
                  }}>
                  🔄 Retry Exam
                </button>
                <button onClick={() => { setExamMode(false); setExamResults(null); }}
                  style={{
                    background: 'var(--card)', color: 'var(--text)',
                    border: '2px solid var(--border)', borderRadius: '8px',
                    padding: '0.8rem 2rem', cursor: 'pointer', fontWeight: 700
                  }}>
                  ← Back to Papers
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Exam Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.5rem'
            }}>
              <div>
                <h2 style={{ fontWeight: 800 }}>📄 {examPaper?.title}</h2>
                <p style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>
                  {examQuestions.length} Questions
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

            {/* Progress */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '0.3rem' }}>
                Answered: {Object.keys(examAnswers).length}/{examQuestions.length}
              </p>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px' }}>
                <div style={{
                  height: '100%',
                  width: `${(Object.keys(examAnswers).length / examQuestions.length) * 100}%`,
                  background: '#6c63ff', borderRadius: '999px'
                }} />
              </div>
            </div>

            {/* Questions */}
            {examQuestions.map((q, i) => (
              <div key={q.id} style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', marginBottom: '1rem',
                boxShadow: 'var(--shadow)',
                border: examAnswers[q.id] ? '2px solid #6c63ff' : '1px solid var(--border)'
              }}>
                <p style={{ fontWeight: 700, marginBottom: '1rem' }}>
                  Q{i + 1}. {q.questionText}
                </p>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}
                    onClick={() => setExamAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    style={{
                      padding: '0.7rem 1rem', marginBottom: '0.5rem',
                      borderRadius: '8px', cursor: 'pointer',
                      border: '2px solid',
                      borderColor: examAnswers[q.id] === opt ? '#6c63ff' : 'var(--border)',
                      background: examAnswers[q.id] === opt ? '#6c63ff15' : 'var(--bg)',
                      transition: 'all 0.2s', fontSize: '0.9rem'
                    }}>
                    <strong>{opt}.</strong> {q[`option${opt}`]}
                  </div>
                ))}
              </div>
            ))}

            <button onClick={handleExamSubmit} disabled={examSubmitting}
              style={{
                background: '#00b894', color: 'white', border: 'none',
                borderRadius: '8px', padding: '1rem', width: '100%',
                cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem',
                marginBottom: '2rem'
              }}>
              {examSubmitting ? '⏳ Submitting...' : '✅ Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PRACTICE MODE =====
  if (practiceMode && finished) {
    const total = practiceQuestions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem' }}>{pct >= 70 ? '🎉' : '💪'}</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Practice Complete!</h1>
            <p style={{ color: 'var(--mid)', marginBottom: '2rem' }}>{selectedCompany} Questions</p>
            <div style={{
              display: 'inline-block', background: 'var(--card)',
              borderRadius: '16px', padding: '2rem 3rem',
              boxShadow: 'var(--shadow)', marginBottom: '2rem'
            }}>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: pct >= 70 ? '#00b894' : '#f77f00' }}>
                {score}/{total}
              </p>
              <p style={{ color: 'var(--mid)' }}>{pct}% Accuracy</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={startPractice}
                style={{
                  background: '#6c63ff', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0.8rem 2rem',
                  cursor: 'pointer', fontWeight: 700
                }}>🔄 Practice Again</button>
              <button onClick={() => { setPracticeMode(false); setFinished(false); }}
                style={{
                  background: 'var(--card)', color: 'var(--text)',
                  border: '2px solid var(--border)', borderRadius: '8px',
                  padding: '0.8rem 2rem', cursor: 'pointer', fontWeight: 700
                }}>← Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (practiceMode) {
    const q = practiceQuestions[currentIndex];
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content fade-in">
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <button className="back-btn" onClick={() => setPracticeMode(false)}>← Exit</button>
              <p style={{ fontWeight: 700, color: '#6c63ff' }}>
                {currentIndex + 1}/{practiceQuestions.length} | Score: {score}
              </p>
            </div>
            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', marginBottom: '1.5rem' }}>
              <div style={{
                height: '100%',
                width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%`,
                background: '#6c63ff', borderRadius: '999px'
              }} />
            </div>
            <div style={{
              background: 'var(--card)', borderRadius: '16px',
              padding: '2rem', boxShadow: 'var(--shadow)', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{
                  background: '#6c63ff20', color: '#6c63ff',
                  padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
                }}>{q.questionType}</span>
                <span style={{
                  background: '#f0f0f0', color: '#666',
                  padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem'
                }}>{q.difficulty || 'Medium'}</span>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Q{currentIndex + 1}. {q.questionText}
              </h2>
              {!showAnswer ? (
                <button onClick={() => setShowAnswer(true)}
                  style={{
                    background: '#6c63ff', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '0.7rem 1.5rem',
                    cursor: 'pointer', fontWeight: 700, width: '100%'
                  }}>💡 Show Answer</button>
              ) : (
                <div style={{
                  background: '#e6fff9', border: '1px solid #00b894',
                  borderRadius: '10px', padding: '1rem', marginBottom: '1rem'
                }}>
                  <p style={{ fontWeight: 700, color: '#00b894' }}>💡 Answer:</p>
                  <p>{q.answerHint || 'No hint available'}</p>
                </div>
              )}
            </div>
            {showAnswer && (
              <div style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', boxShadow: 'var(--shadow)', textAlign: 'center'
              }}>
                <p style={{ fontWeight: 700, marginBottom: '1rem' }}>Did you know this?</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => handleAnswer(true)}
                    style={{
                      background: '#00b894', color: 'white', border: 'none',
                      borderRadius: '8px', padding: '0.7rem 2rem',
                      cursor: 'pointer', fontWeight: 700
                    }}>✅ Yes!</button>
                  <button onClick={() => handleAnswer(false)}
                    style={{
                      background: '#ff4444', color: 'white', border: 'none',
                      borderRadius: '8px', padding: '0.7rem 2rem',
                      cursor: 'pointer', fontWeight: 700
                    }}>❌ No</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div>
            <h1>🏢 Previous Year Questions</h1>
            <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>
              Company papers, roadmap & practice
            </p>
          </div>
        </div>

        {/* Company Selector */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Select Company</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {COMPANIES.map(c => (
              <button key={c}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '50px',
                  border: selectedCompany === c ? 'none' : '1px solid var(--border)',
                  background: selectedCompany === c ? 'var(--primary)' : 'white',
                  color: selectedCompany === c ? 'white' : 'var(--dark)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setSelectedCompany(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="loading-wrap"><div className="spinner"></div></div>}

        {selectedCompany && !loading && (
          <>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
              <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}>
                ❓ Interview Questions
              </button>
              <button className={`tab ${activeTab === 'papers' ? 'active' : ''}`}
                onClick={() => setActiveTab('papers')}>
                📄 Exam Papers
              </button>
              <button className={`tab ${activeTab === 'roadmap' ? 'active' : ''}`}
                onClick={() => setActiveTab('roadmap')}>
                🗺️ Roadmap
              </button>
            </div>

            {/* Interview Questions Tab */}
            {activeTab === 'questions' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="card-title">❓ {selectedCompany} Interview Questions</span>
                  <button onClick={startPractice}
                    style={{
                      background: '#6c63ff', color: 'white', border: 'none',
                      borderRadius: '8px', padding: '0.6rem 1.5rem',
                      cursor: 'pointer', fontWeight: 700
                    }}>
                    🚀 Start Practice
                  </button>
                </div>
                {getFilteredQuestions().map((q, idx) => (
                  <div className="company-q-card" key={q.id || idx}>
                    <span className={`type-badge type-${q.questionType}`}>{q.questionType}</span>
                    <h4>{q.questionText}</h4>
                    {q.answerHint && <div className="hint">💡 {q.answerHint}</div>}
                    {q.yearAsked && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--mid)', marginTop: '0.3rem' }}>
                        Asked in: {q.yearAsked}
                      </div>
                    )}
                  </div>
                ))}
                {getFilteredQuestions().length === 0 && (
                  <div className="empty-state">
                    <div className="e-icon">📭</div>
                    <h3>No questions found</h3>
                  </div>
                )}
              </div>
            )}

            {/* Exam Papers Tab */}
            {activeTab === 'papers' && (
              <div>
                {papers.length === 0 ? (
                  <div className="empty-state">
                    <div className="e-icon">📭</div>
                    <h3>No exam papers yet</h3>
                    <p>Admin will add papers soon!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {papers.map(p => (
                      <div key={p.id} style={{
                        background: 'var(--card)', borderRadius: '12px',
                        padding: '1.5rem', boxShadow: 'var(--shadow)',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>📄 {p.title}</h3>
                          <span style={{
                            background: '#6c63ff20', color: '#6c63ff',
                            padding: '0.2rem 0.6rem', borderRadius: '20px',
                            fontSize: '0.75rem', fontWeight: 700
                          }}>{p.year}</span>
                        </div>
                        <p style={{ color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          {p.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--mid)', marginBottom: '1rem' }}>
                          <span>⏱ {p.durationMins} mins</span>
                          <span>❓ {p.totalQuestions} questions</span>
                        </div>
                        <button onClick={() => startExam(p)}
                          style={{
                            background: '#6c63ff', color: 'white', border: 'none',
                            borderRadius: '8px', padding: '0.6rem 1.5rem',
                            cursor: 'pointer', fontWeight: 700, width: '100%'
                          }}>
                          📝 Start Exam
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && roadmap && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🗺️ {selectedCompany} Interview Roadmap</span>
                </div>
                {roadmap.stages?.map(stage => (
                  <div className="roadmap-stage" key={stage.stage}>
                    <div className="stage-num">{stage.stage}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{stage.title}</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--mid)' }}>{stage.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!selectedCompany && (
          <div className="empty-state">
            <div className="e-icon">🏢</div>
            <h3>Select a company to begin</h3>
          </div>
        )}
      </div>
    </div>
  );
}