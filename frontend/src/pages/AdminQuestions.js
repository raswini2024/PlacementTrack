import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminSidebar = ({ active }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <div style={{
      width: '240px', background: '#1a1a2e', color: 'white',
      padding: '1.5rem 0', display: 'flex', flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #ffffff20' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem' }}>👨‍💼 Admin Panel</h2>
      </div>
      <nav style={{ padding: '1rem 0', flex: 1 }}>
        <p style={{ color: '#ffffff60', fontSize: '0.7rem', padding: '0 1.5rem', marginBottom: '0.5rem' }}>MANAGE</p>
        {[
          { label: '📊 Dashboard', path: '/admin/dashboard' },
          { label: '❓ Questions', path: '/admin/questions' },
          { label: '🎓 Students', path: '/admin/students' },
        ].map(item => (
          <div key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '0.8rem 1.5rem', cursor: 'pointer',
              background: active === item.path ? '#ffffff20' : 'transparent',
              color: active === item.path ? 'white' : '#ffffff90',
              display: 'flex', alignItems: 'center', gap: '0.7rem'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ffffff15'}
            onMouseLeave={e => e.currentTarget.style.background = active === item.path ? '#ffffff20' : 'transparent'}>
            {item.label}
          </div>
        ))}
        <p style={{ color: '#ffffff60', fontSize: '0.7rem', padding: '1rem 1.5rem 0.5rem' }}>ACCOUNT</p>
        <div onClick={() => { logout(); navigate('/login'); }}
          style={{ padding: '0.8rem 1.5rem', cursor: 'pointer', color: '#ff6b6b' }}>
          🚪 Logout
        </div>
      </nav>
    </div>
  );
};

export default function AdminQuestions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [form, setForm] = useState({
    subtopicId: '', questionText: '',
    optionA: '', optionB: '', optionC: '', optionD: '',
    correctAnswer: 'A', explanation: '', difficulty: 'Easy'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
    api.get('/admin/topics')
      .then(res => setTopics(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const fetchQuestions = () => {
    api.get('/admin/questions')
      .then(res => { setQuestions(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchSubtopics = (topicId) => {
    setSelectedTopic(topicId);
    api.get(`/questions/subtopics/${topicId}`)
      .then(res => setSubtopics(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  const handleSubmit = async () => {
    if (!form.subtopicId || !form.questionText || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      setError('Please fill all fields!'); return;
    }
    try {
      await api.post('/admin/questions', form);
      setSuccess('Question added! ✅');
      setError('');
      setForm({ subtopicId: '', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', explanation: '', difficulty: 'Easy' });
      setShowForm(false);
      fetchQuestions();
    } catch { setError('Failed to add question!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setSuccess('Deleted! ✅');
      fetchQuestions();
    } catch { setError('Failed to delete!'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/questions" />
      <div style={{ flex: 1, padding: '2rem', background: '#f8f9fa' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>❓ Manage Questions</h1>
            <p style={{ color: '#666' }}>Add, view, delete questions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: '#6c63ff', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600 }}>
            {showForm ? '✕ Cancel' : '➕ Add Question'}
          </button>
        </div>

        {error && <div style={{ background: '#ffe6e6', color: '#ff4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ background: '#e6fff9', color: '#00b894', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

        {/* Add Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1rem' }}>➕ Add New Question</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Topic</label>
              <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={e => fetchSubtopics(e.target.value)} value={selectedTopic}>
                <option value="">Select Topic</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Subtopic</label>
              <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                value={form.subtopicId} onChange={e => setForm({ ...form, subtopicId: e.target.value })}>
                <option value="">Select Subtopic</option>
                {subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Question</label>
              <textarea style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }}
                placeholder="Enter question..." value={form.questionText}
                onChange={e => setForm({ ...form, questionText: e.target.value })} />
            </div>

            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Option {opt}</label>
                <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  placeholder={`Option ${opt}`} value={form[`option${opt}`]}
                  onChange={e => setForm({ ...form, [`option${opt}`]: e.target.value })} />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Correct Answer</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })}>
                  {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Difficulty</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Explanation</label>
              <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                placeholder="Explain the answer..." value={form.explanation}
                onChange={e => setForm({ ...form, explanation: e.target.value })} />
            </div>

            <button onClick={handleSubmit}
              style={{ background: '#00b894', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600 }}>
              ✅ Save Question
            </button>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem' }}>📭</div>
            <h3>No questions yet</h3>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>📋 All Questions ({questions.length})</h3>
            {questions.map((q, i) => (
              <div key={q.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{i + 1}. {q.questionText}</p>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>
                    A: {q.optionA} | B: {q.optionB} | C: {q.optionC} | D: {q.optionD}
                  </p>
                  <p style={{ color: '#00b894', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    ✅ Answer: {q.correctAnswer} | 🎯 {q.difficulty}
                  </p>
                </div>
                <button onClick={() => handleDelete(q.id)}
                  style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}