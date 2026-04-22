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

export default function AdminCompanyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCompany, setFilterCompany] = useState('All');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company: 'TCS',
    questionText: '',
    questionType: 'TECHNICAL',
    yearAsked: 2024,
    difficulty: 'Easy',
    answerHint: ''
  });

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = () => {
    api.get('/admin/company-questions')
      .then(res => { setQuestions(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.questionText || !form.answerHint) { setError('Fill all fields!'); return; }
    try {
      await api.post('/admin/company-questions', form);
      setSuccess('Question added! ✅');
      setError('');
      setForm({ company: 'TCS', questionText: '', questionType: 'TECHNICAL', yearAsked: 2024, difficulty: 'Easy', answerHint: '' });
      setShowForm(false);
      fetchQuestions();
    } catch { setError('Failed!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/admin/company-questions/${id}`);
      setSuccess('Deleted! ✅');
      fetchQuestions();
    } catch { setError('Failed!'); }
  };

  const filtered = filterCompany === 'All' ? questions : questions.filter(q => q.company === filterCompany);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/company-questions" />
      <div style={{ flex: 1, padding: '2rem', background: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>🏢 Company Questions</h1>
            <p style={{ color: '#666' }}>Manage company-specific interview questions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: '#6c63ff', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600 }}>
            {showForm ? '✕ Cancel' : '➕ Add Question'}
          </button>
        </div>

        {error && <div style={{ background: '#ffe6e6', color: '#ff4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ background: '#e6fff9', color: '#00b894', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1rem' }}>➕ Add Company Question</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Company</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Question Type</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={form.questionType} onChange={e => setForm({ ...form, questionType: e.target.value })}>
                  <option>TECHNICAL</option>
                  <option>CODING</option>
                  <option>HR</option>
                  <option>APTITUDE</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Year</label>
                <input type="number" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  value={form.yearAsked} onChange={e => setForm({ ...form, yearAsked: e.target.value })} />
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
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Question</label>
              <textarea style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }}
                value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Answer / Hint</label>
              <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                value={form.answerHint} onChange={e => setForm({ ...form, answerHint: e.target.value })} />
            </div>
            <button onClick={handleSubmit}
              style={{ background: '#00b894', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600, marginTop: '1rem' }}>
              ✅ Save Question
            </button>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {['All', ...COMPANIES].map(c => (
            <button key={c} onClick={() => setFilterCompany(c)}
              style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', border: '2px solid', borderColor: filterCompany === c ? '#6c63ff' : '#ddd', background: filterCompany === c ? '#6c63ff' : 'white', color: filterCompany === c ? 'white' : '#333', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              {c}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center' }}>Loading...</div> : (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>📋 {filtered.length} Questions</h3>
            {filtered.map((q, i) => (
              <div key={q.id} style={{ background: 'white', borderRadius: '10px', padding: '1rem', marginBottom: '0.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ background: '#6c63ff20', color: '#6c63ff', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>{q.company}</span>
                    <span style={{ background: '#f0f0f0', color: '#666', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem' }}>{q.questionType}</span>
                    <span style={{ background: '#fff3e0', color: '#f77f00', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem' }}>{q.yearAsked}</span>
                  </div>
                  <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{i + 1}. {q.questionText}</p>
                  <p style={{ color: '#00b894', fontSize: '0.82rem' }}>💡 {q.answerHint}</p>
                </div>
                <button onClick={() => handleDelete(q.id)}
                  style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', marginLeft: '1rem' }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}