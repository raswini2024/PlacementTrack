import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COMPANIES = ['Zoho','TCS','Infosys','Wipro','Accenture','Amazon','Google','Microsoft','Freshworks','Cognizant'];

const AdminSidebar = ({ active }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = [
    { label: '📊 Dashboard', path: '/admin/dashboard' },
    { label: '❓ Questions', path: '/admin/questions' },
    { label: '🎓 Students', path: '/admin/students' },
    { label: '🏢 Company Qs', path: '/admin/company-questions' },
    { label: '📄 Exam Papers', path: '/admin/exam-papers' },
  ];
  return (
    <div style={{ width: '240px', background: '#1a1a2e', color: 'white', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #ffffff20' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem' }}>👨‍💼 Admin Panel</h2>
      </div>
      <nav style={{ padding: '1rem 0', flex: 1 }}>
        <p style={{ color: '#ffffff60', fontSize: '0.7rem', padding: '0 1.5rem', marginBottom: '0.5rem' }}>MANAGE</p>
        {items.map(item => (
          <div key={item.path} onClick={() => navigate(item.path)}
            style={{ padding: '0.8rem 1.5rem', cursor: 'pointer', background: active === item.path ? '#ffffff20' : 'transparent', color: active === item.path ? 'white' : '#ffffff90' }}>
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

export default function AdminExamPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQForm, setShowQForm] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [paperForm, setPaperForm] = useState({
    company: 'TCS', title: '', year: 2024,
    description: '', durationMins: 60, totalQuestions: 0
  });
  const [qForm, setQForm] = useState({
    questionText: '', optionA: '', optionB: '',
    optionC: '', optionD: '', correctAnswer: 'A',
    explanation: '', difficulty: 'Easy'
  });

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = () => {
    api.get('/admin/exam-papers')
      .then(res => { setPapers(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleAddPaper = async () => {
    if (!paperForm.title) { setError('Enter paper title!'); return; }
    try {
      await api.post('/admin/exam-papers', paperForm);
      setSuccess('Paper added! ✅');
      setError('');
      setPaperForm({ company: 'TCS', title: '', year: 2024, description: '', durationMins: 60, totalQuestions: 0 });
      setShowForm(false);
      fetchPapers();
    } catch { setError('Failed!'); }
  };

  const handleAddQuestion = async (paperId) => {
    if (!qForm.questionText) { setError('Enter question!'); return; }
    try {
      await api.post(`/admin/exam-papers/${paperId}/questions`, qForm);
      setSuccess('Question added! ✅');
      setError('');
      setQForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', explanation: '', difficulty: 'Easy' });
      setShowQForm(null);
      fetchPapers();
    } catch { setError('Failed!'); }
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Delete this paper and all its questions?')) return;
    try {
      await api.delete(`/admin/exam-papers/${id}`);
      setSuccess('Deleted! ✅');
      fetchPapers();
    } catch { setError('Failed!'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/exam-papers" />
      <div style={{ flex: 1, padding: '2rem', background: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>📄 Exam Papers</h1>
            <p style={{ color: '#666' }}>Manage company exam papers and questions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: '#6c63ff', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600 }}>
            {showForm ? '✕ Cancel' : '➕ Add Paper'}
          </button>
        </div>

        {error && <div style={{ background: '#ffe6e6', color: '#ff4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ background: '#e6fff9', color: '#00b894', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

        {/* Add Paper Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1rem' }}>➕ Add New Exam Paper</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Company</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={paperForm.company} onChange={e => setPaperForm({ ...paperForm, company: e.target.value })}>
                  {COMPANIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Year</label>
                <input type="number" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={paperForm.year} onChange={e => setPaperForm({ ...paperForm, year: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Duration (mins)</label>
                <input type="number" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={paperForm.durationMins} onChange={e => setPaperForm({ ...paperForm, durationMins: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Total Questions</label>
                <input type="number" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={paperForm.totalQuestions} onChange={e => setPaperForm({ ...paperForm, totalQuestions: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Title</label>
              <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                placeholder="e.g. TCS NQT 2024 Paper"
                value={paperForm.title} onChange={e => setPaperForm({ ...paperForm, title: e.target.value })} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Description</label>
              <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                value={paperForm.description} onChange={e => setPaperForm({ ...paperForm, description: e.target.value })} />
            </div>
            <button onClick={handleAddPaper}
              style={{ background: '#00b894', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600, marginTop: '1rem' }}>
              ✅ Save Paper
            </button>
          </div>
        )}

        {/* Papers List */}
        {loading ? <div>Loading...</div> : papers.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div>
                <h3 style={{ fontWeight: 700 }}>📄 {p.title}</h3>
                <p style={{ color: '#666', fontSize: '0.85rem' }}>
                  🏢 {p.company} · 📅 {p.year} · ⏱ {p.durationMins} mins · ❓ {p.totalQuestions} Qs
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowQForm(showQForm === p.id ? null : p.id)}
                  style={{ background: '#6c63ff', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ➕ Add Question
                </button>
                <button onClick={() => handleDeletePaper(p.id)}
                  style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                  🗑 Delete
                </button>
              </div>
            </div>

            {/* Add Question Form */}
            {showQForm === p.id && (
              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.8rem' }}>Add Question to {p.title}</h4>
                <textarea style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '0.5rem' }}
                  placeholder="Question text..."
                  value={qForm.questionText} onChange={e => setQForm({ ...qForm, questionText: e.target.value })} />
                {['A', 'B', 'C', 'D'].map(opt => (
                  <input key={opt} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '0.5rem' }}
                    placeholder={`Option ${opt}`}
                    value={qForm[`option${opt}`]} onChange={e => setQForm({ ...qForm, [`option${opt}`]: e.target.value })} />
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })}>
                    {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <select style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <input style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '0.5rem' }}
                  placeholder="Explanation..."
                  value={qForm.explanation} onChange={e => setQForm({ ...qForm, explanation: e.target.value })} />
                <button onClick={() => handleAddQuestion(p.id)}
                  style={{ background: '#00b894', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                  ✅ Add Question
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}