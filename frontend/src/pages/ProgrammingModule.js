import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getTopics, getSubtopics } from '../services/api';

export default function ProgrammingModule() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [subtopics, setSubtopics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopics('PROGRAMMING').then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.content || res.data.data || [];
      setTopics(data);
      setLoading(false);
    }).catch(console.error);
  }, []); // ← இந்த }, [] missing ஆ இருந்துச்சு

  const handleTopicClick = async (topicId) => {
    if (expanded === topicId) { setExpanded(null); return; }
    setExpanded(topicId);
    if (!subtopics[topicId]) {
      const res = await getSubtopics(topicId);
      setSubtopics(prev => ({ ...prev, [topicId]: res.data }));
    }
  };

  const ICONS = { 'Basics': '⚙️', 'Arrays & Strings': '📊', 'Data Structures': '🌲', 'Recursion': '🔄' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div>
            <h1>💻 Programming Module</h1>
            <p style={{color:'var(--mid)',fontSize:'0.9rem'}}>Practice coding concepts from basics to advanced DSA</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner"></div></div>
        ) : (
          <div className="topics-grid">
            {topics.map(topic => (
              <div className="topic-card" key={topic.id}>
                <div className="topic-card-header" onClick={() => handleTopicClick(topic.id)}
                  style={{cursor:'pointer',userSelect:'none'}}>
                  <div className="t-icon">{ICONS[topic.name] || '💡'}</div>
                  <div>
                    <h3>{topic.name}</h3>
                    <p>{topic.description}</p>
                  </div>
                  <span style={{marginLeft:'auto'}}>{expanded === topic.id ? '▲' : '▼'}</span>
                </div>
                {expanded === topic.id && (
                  <div className="topic-card-body">
                    {subtopics[topic.id] ? (
                      <ul className="subtopic-list">
                        {subtopics[topic.id].map(st => (
                          <li key={st.id} className="subtopic-item"
                            onClick={() => navigate(`/practice/${st.id}/${encodeURIComponent(st.name)}`)}>
                            <span className="s-name">🔧 {st.name}</span>
                            <span className={`difficulty-badge diff-${st.difficulty?.toLowerCase()}`}>{st.difficulty}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{padding:'1rem',textAlign:'center'}}>
                        <div className="spinner" style={{margin:'0 auto'}}></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}