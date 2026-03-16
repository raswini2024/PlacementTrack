import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getQuestions, submitAnswer, getSubtopicProgress } from '../services/api';

export default function PracticeQuestions() {
  const { subtopicId, subtopicName } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState({});
  const [feedback, setFeedback] = useState({});
  const [stats, setStats] = useState({ totalAttempts: 0, correctAnswers: 0, accuracy: 0 });

  useEffect(() => {
    Promise.all([
      getQuestions(subtopicId),
      getSubtopicProgress(subtopicId)
    ]).then(([qRes, pRes]) => {
      setQuestions(qRes.data);
      if (pRes.data && pRes.data.totalAttempts) setStats(pRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [subtopicId]);

  const handleAnswer = async (questionId, option) => {
    if (answered[questionId]) return;
    setAnswered(prev => ({ ...prev, [questionId]: option }));
    try {
      const res = await submitAnswer({ questionId, selectedAnswer: option });
      const data = res.data;
      setFeedback(prev => ({ ...prev, [questionId]: data }));
      setStats({ totalAttempts: (stats.totalAttempts||0)+1, correctAnswers: (stats.correctAnswers||0)+(data.correct?1:0), accuracy: 0 });
    } catch (err) { console.error(err); }
  };

  const OPTIONS = ['A','B','C','D'];
  const OPT_MAP = { A: 'optionA', B: 'optionB', C: 'optionC', D: 'optionD' };

  const correctCount = Object.values(feedback).filter(f => f.correct).length;
  const totalAnswered = Object.keys(answered).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1>📌 {decodeURIComponent(subtopicName)}</h1>
            <p style={{color:'var(--mid)',fontSize:'0.9rem'}}>Practice questions — select the correct answer</p>
          </div>
        </div>

        {/* Stats tracker */}
        <div className="progress-tracker">
          <div className="tracker-stat">
            <div className="t-num">{questions.length}</div>
            <div className="t-label">Total Questions</div>
          </div>
          <div className="tracker-stat">
            <div className="t-num">{totalAnswered}</div>
            <div className="t-label">Attempted</div>
          </div>
          <div className="tracker-stat">
            <div className="t-num" style={{color:'var(--success)'}}>{correctCount}</div>
            <div className="t-label">Correct</div>
          </div>
          <div className="tracker-stat">
            <div className="t-num" style={{color: accuracy >= 75 ? 'var(--success)' : accuracy >= 50 ? 'var(--accent)' : 'var(--danger)'}}>{accuracy}%</div>
            <div className="t-label">Accuracy</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.8rem',color:'var(--mid)',marginBottom:'4px'}}>Progress</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{width:`${questions.length>0?(totalAnswered/questions.length*100):0}%`,background:'var(--primary)'}} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner"></div></div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <div className="e-icon">📭</div>
            <h3>No questions yet</h3>
            <p>Questions for this subtopic will be added soon.</p>
          </div>
        ) : (
          <div className="question-page">
            {questions.map((q, idx) => {
              const ans = answered[q.id];
              const fb = feedback[q.id];
              return (
                <div className="question-card" key={q.id}>
                  <div className="question-meta">
                    <span className="q-counter">Q{idx + 1}</span>
                    <span className={`difficulty-badge diff-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                    {ans && (
                      <span style={{fontSize:'0.85rem',fontWeight:'600',color: fb?.correct ? 'var(--success)' : 'var(--danger)'}}>
                        {fb?.correct ? '✅ Correct' : '❌ Incorrect'}
                      </span>
                    )}
                  </div>
                  <div className="question-text">{q.questionText}</div>
                  <div className="options-grid">
                    {OPTIONS.map(opt => {
                      const optText = q[OPT_MAP[opt]];
                      if (!optText) return null;
                      let cls = 'option-btn';
                      if (ans) {
                        if (opt === fb?.correctAnswer) cls += ' correct';
                        else if (opt === ans && !fb?.correct) cls += ' wrong';
                        else cls += ' selected-dim';
                      }
                      return (
                        <button key={opt} className={cls}
                          onClick={() => handleAnswer(q.id, opt)}
                          disabled={!!ans}>
                          <span className="option-label">{opt}</span>
                          <span>{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                  {fb && (
                    <div className={`answer-feedback ${fb.correct ? 'feedback-correct' : 'feedback-wrong'}`}>
                      <div className="feedback-title">{fb.correct ? '✅ Correct!' : `❌ Incorrect. Correct answer: ${fb.correctAnswer}`}</div>
                      {fb.explanation && <div className="explanation">💡 {fb.explanation}</div>}
                      {fb.suggestion && <div className="suggestion">📊 {fb.suggestion}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
