import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Editor from '@monaco-editor/react';
import api from '../services/api';

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';

// Judge0 Language IDs
const LANGUAGE_IDS = {
  java: 62,
  python: 71,
  cpp: 54,
  javascript: 63
};

const LANGUAGES = [
  {
    id: 'java', label: '☕ Java',
    template: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}`
  },
  {
    id: 'python', label: '🐍 Python',
    template: `# Write your code here\n\n`
  },
  {
    id: 'cpp', label: '⚡ C++',
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
  },
  {
    id: 'javascript', label: '🌐 JavaScript',
    template: `// Write your code here\n`
  }
];

const DIFF_STYLE = {
  Easy:   { bg: '#e6fff9', color: '#00b894' },
  Medium: { bg: '#fff3e0', color: '#f77f00' },
  Hard:   { bg: '#ffe6e6', color: '#ff4444' }
};

// Judge0 API call — compile + run

 // AllPages.jsx la CodingPage function la ithை add pannu:
const runCode = async (code, lang, stdin = '') => {
  const langMap = {
    java: { language: 'java', version: '15.0.2' },
    python: { language: 'python', version: '3.10.0' },
    cpp: { language: 'c++', version: '10.2.0' },
    javascript: { language: 'javascript', version: '18.15.0' }
  };
  const { language, version } = langMap[lang] || langMap.python;
  
  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language, version,
      files: [{ name: 'solution', content: code }],
      stdin
    })
  });
  const data = await res.json();
  if (data.run?.stdout) return data.run.stdout.trim();
  if (data.run?.stderr) return '❌ Error:\n' + data.run.stderr.trim();
  return 'No output';
};
export default function CodingModule() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [questionDetail, setQuestionDetail] = useState(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [filter, setFilter] = useState('All');
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    api.get('/coding/questions')
      .then(res => {
        setQuestions(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const saved = JSON.parse(localStorage.getItem('solvedCoding') || '[]');
    setSolvedIds(new Set(saved));
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(lang.template);
    setResults(null);
    setRunOutput('');
  };

  const handleQuestionSelect = async (q) => {
    setSelected(q);
    setResults(null);
    setRunOutput('');
    setCode(language.template);
    setSubmitStatus('');
    try {
      const res = await api.get(`/coding/questions/${q.id}`);
      setQuestionDetail(res.data);
    } catch {
      setQuestionDetail(q);
    }
  };

  // Run code against sample test case
  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setRunOutput('⏳ Running...');

    const sampleInput = questionDetail?.testCases?.[0]?.input || '';
    const output = await runCode(code, language.id, sampleInput);
    if (output) {
      setRunOutput(output.trim());
    } else {
      setRunOutput('❌ Execution failed. Check your code!');
    }
    setRunning(false);
  };

  // Submit — run against all test cases
  const handleSubmit = async () => {
    if (!selected || !code.trim()) return;
    setSubmitting(true);
    setResults(null);
    setSubmitStatus('⏳ Running all test cases...');

    const allTestCases = questionDetail?.testCases || [];
    // Also need hidden test cases count
    const totalHidden = 3;
    const totalCases = allTestCases.length + totalHidden;

    let passed = 0;
    let resultsList = [];

    // Run visible test cases
    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      setSubmitStatus(`⏳ Running test case ${i + 1}/${totalCases}...`);

      const output = await runCode(code, language.id, tc.input);
      const actualOutput = (output || '').trim();
      const expectedOutput = tc.expectedOutput.trim();
      const isPassed = actualOutput === expectedOutput;

      if (isPassed) passed++;

      resultsList.push({
        testCase: i + 1,
        passed: isPassed,
        input: tc.input,
        expected: expectedOutput,
        got: actualOutput,
        isHidden: false
      });
    }

    // Submit to backend for hidden test cases check
    try {
      const backendRes = await api.post(`/coding/submit/${selected.id}`, {
        output: resultsList[0]?.got || '',
        language: language.id,
        code: code
      });

      // Hidden test cases results
      const backendResults = backendRes.data.results || [];
      const hiddenResults = backendResults.filter(r => r.input === 'Hidden');

      hiddenResults.forEach((r, i) => {
        if (r.passed) passed++;
        resultsList.push({
          testCase: allTestCases.length + i + 1,
          passed: r.passed,
          input: 'Hidden',
          expected: 'Hidden',
          got: r.passed ? 'Correct' : 'Wrong',
          isHidden: true
        });
      });

    } catch {}

    const verdict = passed === totalCases ? 'ALL_PASSED' :
                   passed > 0 ? 'PARTIAL' : 'FAILED';

    setResults({
      passed,
      total: resultsList.length,
      verdict,
      results: resultsList,
      message: verdict === 'ALL_PASSED' ?
        '🎉 All test cases passed! Excellent!' :
        passed > 0 ?
        `⚠️ ${passed}/${resultsList.length} test cases passed. Keep trying!` :
        '❌ No test cases passed. Check your logic!'
    });

    if (verdict === 'ALL_PASSED') {
      const newSolved = new Set([...solvedIds, selected.id]);
      setSolvedIds(newSolved);
      localStorage.setItem('solvedCoding', JSON.stringify([...newSolved]));
    }

    setSubmitStatus('');
    setSubmitting(false);
  };

  const handleNextQuestion = () => {
    const currentIndex = questions.findIndex(q => q.id === selected.id);
    if (currentIndex < questions.length - 1) {
      handleQuestionSelect(questions[currentIndex + 1]);
    } else {
      setSelected(null);
    }
  };

  const filtered = filter === 'All'
    ? questions
    : questions.filter(q => q.difficulty === filter);

  const solvedCount = questions.filter(q => solvedIds.has(q.id)).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in" style={{ padding: '1.5rem' }}>

        {!selected ? (
          <>
            <div className="page-header">
              <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
              <div>
                <h1>⌨️ Coding Challenges</h1>
                <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>
                  Write code → Auto compile → Test cases check!
                </p>
              </div>
            </div>

            {/* Progress */}
            <div style={{
              background: 'var(--card)', borderRadius: '12px',
              padding: '1rem 1.5rem', marginBottom: '1.5rem',
              boxShadow: 'var(--shadow)',
              display: 'flex', alignItems: 'center', gap: '1.5rem'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700 }}>✅ Solved: {solvedCount}/{questions.length}</span>
                  <span style={{ color: '#6c63ff', fontWeight: 700 }}>
                    {questions.length > 0 ? Math.round((solvedCount / questions.length) * 100) : 0}%
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px' }}>
                  <div style={{
                    height: '100%',
                    width: `${questions.length > 0 ? (solvedCount / questions.length) * 100 : 0}%`,
                    background: '#6c63ff', borderRadius: '999px'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <span key={d} style={{ color: DIFF_STYLE[d].color, fontWeight: 600 }}>
                    {d}: {questions.filter(q => q.difficulty === d && solvedIds.has(q.id)).length}/
                    {questions.filter(q => q.difficulty === d).length}
                  </span>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '20px',
                    border: '2px solid',
                    borderColor: filter === f ? '#6c63ff' : 'var(--border)',
                    background: filter === f ? '#6c63ff' : 'transparent',
                    color: filter === f ? 'white' : 'var(--text)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="loading-wrap"><div className="spinner"></div></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="e-icon">📭</div>
                <h3>No questions found</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 100px',
                  padding: '0.5rem 1rem',
                  color: 'var(--mid)', fontSize: '0.8rem', fontWeight: 600
                }}>
                  <span>#</span><span>Title</span>
                  <span>Difficulty</span><span>Company</span><span>Status</span>
                </div>

                {filtered.map((q, i) => (
                  <div key={q.id} onClick={() => handleQuestionSelect(q)}
                    style={{
                      display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 100px',
                      background: 'var(--card)', borderRadius: '10px',
                      padding: '0.9rem 1rem', cursor: 'pointer',
                      boxShadow: 'var(--shadow)', alignItems: 'center',
                      border: solvedIds.has(q.id) ? '1px solid #00b89440' : '1px solid var(--border)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                    <span style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>{i + 1}</span>
                    <span style={{ fontWeight: 600 }}>{q.title}</span>
                    <span style={{
                      background: DIFF_STYLE[q.difficulty]?.bg,
                      color: DIFF_STYLE[q.difficulty]?.color,
                      padding: '0.2rem 0.6rem', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 600, display: 'inline-block'
                    }}>{q.difficulty}</span>
                    <span style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>
                      🏢 {q.company || 'General'}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      color: solvedIds.has(q.id) ? '#00b894' : 'var(--mid)'
                    }}>
                      {solvedIds.has(q.id) ? '✅ Solved' : '⭕ Todo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Editor View
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem', height: 'calc(100vh - 3rem)'
          }}>

            {/* Left — Question */}
            <div style={{ overflowY: 'auto' }}>
              <button className="back-btn"
                onClick={() => { setSelected(null); setResults(null); }}
                style={{ marginBottom: '1rem' }}>
                ← All Problems
              </button>

              <div style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '1.5rem', boxShadow: 'var(--shadow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    {solvedIds.has(selected.id) ? '✅ ' : ''}{selected.title}
                  </h2>
                  <span style={{
                    background: DIFF_STYLE[selected.difficulty]?.bg,
                    color: DIFF_STYLE[selected.difficulty]?.color,
                    padding: '0.2rem 0.7rem', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 600
                  }}>{selected.difficulty}</span>
                </div>

                <p style={{ color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  🏢 {selected.company} · 📌 {selected.topic}
                </p>

                <div style={{
                  background: 'var(--bg)', borderRadius: '8px',
                  padding: '1rem', marginBottom: '1rem',
                  fontSize: '0.9rem', lineHeight: 1.7
                }}>
                  {selected.description}
                </div>

                {selected.inputFormat && (
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>📥 Input Format:</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--mid)' }}>{selected.inputFormat}</p>
                  </div>
                )}
                {selected.outputFormat && (
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>📤 Output Format:</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--mid)' }}>{selected.outputFormat}</p>
                  </div>
                )}
                {selected.constraintsText && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>⚠️ Constraints:</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--mid)' }}>{selected.constraintsText}</p>
                  </div>
                )}

                {/* Test Cases */}
                {questionDetail?.testCases?.length > 0 && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      🧪 Sample Test Cases:
                    </p>
                    {questionDetail.testCases.map((tc, i) => (
                      <div key={i} style={{
                        background: '#f8f9fa', borderRadius: '8px',
                        padding: '0.8rem', marginBottom: '0.5rem',
                        border: '1px solid var(--border)'
                      }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sample {i + 1}:</p>
                        <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#2563eb' }}>
                          Input: {tc.input}
                        </p>
                        <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#00b894' }}>
                          Expected: {tc.expectedOutput}
                        </p>
                      </div>
                    ))}
                    <div style={{
                      background: '#1a1a2e15', borderRadius: '8px',
                      padding: '0.6rem', textAlign: 'center',
                      fontSize: '0.8rem', color: 'var(--mid)'
                    }}>
                      🔒 3 Hidden test cases checked on Submit
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>

              {/* Language Selector */}
              <div style={{
                background: 'var(--card)', borderRadius: '12px',
                padding: '0.8rem 1rem', boxShadow: 'var(--shadow)',
                display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', marginRight: '0.5rem' }}>
                  Language:
                </span>
                {LANGUAGES.map(lang => (
                  <button key={lang.id} onClick={() => handleLanguageChange(lang)}
                    style={{
                      padding: '0.35rem 0.8rem', borderRadius: '6px',
                      border: '2px solid',
                      borderColor: language.id === lang.id ? '#6c63ff' : 'var(--border)',
                      background: language.id === lang.id ? '#6c63ff' : 'transparent',
                      color: language.id === lang.id ? 'white' : 'var(--text)',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                    }}>
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Monaco Editor */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <Editor
                  height="300px"
                  language={language.id}
                  value={code}
                  onChange={val => setCode(val)}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Run + Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={handleRun} disabled={running}
                  style={{
                    background: '#00b894', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '0.7rem 1.5rem',
                    cursor: running ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '0.9rem', flex: 1,
                    opacity: running ? 0.7 : 1
                  }}>
                  {running ? '⏳ Running...' : '▶ Run Code'}
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{
                    background: '#6c63ff', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '0.7rem 1.5rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '0.9rem', flex: 1,
                    opacity: submitting ? 0.7 : 1
                  }}>
                  {submitting ? '⏳ Checking...' : '🚀 Submit'}
                </button>
              </div>

              {/* Submit Status */}
              {submitStatus && (
                <div style={{
                  background: '#6c63ff15', borderRadius: '8px',
                  padding: '0.8rem', textAlign: 'center',
                  color: '#6c63ff', fontWeight: 600
                }}>
                  {submitStatus}
                </div>
              )}

              {/* Run Output */}
              {runOutput && (
                <div style={{
                  background: '#1a1a2e', borderRadius: '8px',
                  padding: '1rem', fontFamily: 'monospace',
                  fontSize: '0.9rem', color: '#00ff88'
                }}>
                  <p style={{ color: '#ffffff80', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Output:
                  </p>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{runOutput}</pre>
                </div>
              )}

              {/* Results */}
              {results && (
                <div style={{
                  background: results.verdict === 'ALL_PASSED' ? '#e6fff9' :
                    results.verdict === 'PARTIAL' ? '#fff3e0' : '#ffe6e6',
                  border: `2px solid ${results.verdict === 'ALL_PASSED' ? '#00b894' :
                    results.verdict === 'PARTIAL' ? '#f77f00' : '#ff4444'}`,
                  borderRadius: '12px', padding: '1rem',
                  boxShadow: 'var(--shadow)'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>
                      {results.verdict === 'ALL_PASSED' ? '🎉' :
                       results.verdict === 'PARTIAL' ? '⚠️' : '❌'}
                    </div>
                    <p style={{
                      fontWeight: 800, fontSize: '1.1rem',
                      color: results.verdict === 'ALL_PASSED' ? '#00b894' :
                        results.verdict === 'PARTIAL' ? '#f77f00' : '#ff4444'
                    }}>
                      {results.message}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--mid)' }}>
                      {results.passed}/{results.total} test cases passed
                    </p>
                  </div>

                  {results.results?.map((r, i) => (
                    <div key={i} style={{
                      background: r.passed ? '#00b89415' : '#ff444415',
                      borderRadius: '8px', padding: '0.6rem 1rem',
                      marginBottom: '0.4rem',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', fontSize: '0.85rem'
                    }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>
                          {r.passed ? '✅' : '❌'} Test {r.testCase}
                        </span>
                        {!r.isHidden && (
                          <span style={{ color: 'var(--mid)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                            Input: <code>{r.input}</code> |
                            Expected: <code>{r.expected}</code> |
                            Got: <code style={{ color: r.passed ? '#00b894' : '#ff4444' }}>{r.got}</code>
                          </span>
                        )}
                        {r.isHidden && (
                          <span style={{ color: 'var(--mid)', marginLeft: '0.5rem' }}>
                            🔒 Hidden test case
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: r.passed ? '#00b894' : '#ff4444' }}>
                        {r.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}

                  {results.verdict === 'ALL_PASSED' && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <p style={{ color: '#00b894', fontWeight: 700, marginBottom: '0.8rem' }}>
                        🏆 Problem Solved! Move to next!
                      </p>
                      <button onClick={handleNextQuestion}
                        style={{
                          background: '#00b894', color: 'white', border: 'none',
                          borderRadius: '8px', padding: '0.7rem 2rem',
                          cursor: 'pointer', fontWeight: 700
                        }}>
                        Next Problem →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}