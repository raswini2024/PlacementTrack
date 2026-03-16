import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🧮', title: 'Aptitude Training', desc: 'Master quantitative, logical, and verbal sections with structured topic-wise practice.' },
  { icon: '💻', title: 'Programming Practice', desc: 'Solve real coding problems on arrays, strings, DSA, and more — level up daily.' },
  { icon: '🎤', title: 'Interview Preparation', desc: 'Practice common HR and technical questions. Understand what top companies really ask.' },
  { icon: '📄', title: 'Resume Analyzer', desc: 'Get actionable feedback on your resume: projects, skills, clarity, and ATS-readiness.' },
  { icon: '📝', title: 'Mock Tests', desc: 'Full-length aptitude, programming, and mixed mock tests to simulate real interview conditions.' },
  { icon: '🏢', title: 'Company-Specific Prep', desc: 'Deep-dive preparation roadmaps for Zoho, Google, Amazon, TCS, Infosys and more.' },
];

const COMPANIES = ['Zoho','TCS','Infosys','Wipro','Accenture','Amazon','Google','Microsoft','Freshworks','Cognizant'];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => navigate(user ? '/dashboard' : '/register');

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">🚀 Your Placement Journey Starts Here</div>
        <h1>
          Unlock Your <span className="highlight">True Potential</span>
        </h1>
        <p>
          A smart, guided platform that helps students master aptitude, coding, and interviews — 
          step by step — for their dream company placements.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            🎯 Start Preparation
          </button>
          <a href="#features" className="btn btn-outline btn-lg">
            👀 See How It Works
          </a>
        </div>
        <div className="hero-stats">
          {[['10+', 'Top Companies'], ['200+', 'Practice Questions'], ['6', 'Modules'], ['100%', 'Free to Use']].map(([num, label]) => (
            <div className="hero-stat" key={label}>
              <div className="num">{num}</div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-header">
          <h2>Everything You Need to Get Placed</h2>
          <p>A complete preparation ecosystem — from basics to interview-ready.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card fade-in-up" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPANIES */}
      <section className="companies">
        <div className="section-header">
          <h2>Prepare for Top Companies</h2>
          <p>Company-specific question banks and roadmaps</p>
        </div>
        <div className="company-logos">
          {COMPANIES.map(c => (
            <div className="company-chip" key={c}>{c}</div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="features" style={{background:'var(--light)'}}>
        <div className="section-header">
          <h2>How PlacementTrack Works</h2>
          <p>Follow a proven 4-step path to interview readiness</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '1️⃣', title: 'Create Your Profile', desc: 'Tell us your dream company, role, and programming language to get a personalized plan.' },
            { icon: '2️⃣', title: 'Practice Daily', desc: 'Work through aptitude, coding, and interview questions at your own pace.' },
            { icon: '3️⃣', title: 'Track Progress', desc: 'Our smart system tracks your accuracy and shows you exactly where to improve.' },
            { icon: '4️⃣', title: 'Get Interview-Ready', desc: 'Hit 100% overall progress and get notified that you\'re ready for your dream company interview!' },
          ].map(s => (
            <div className="feature-card" key={s.title}>
              <div className="feature-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Crack Your Dream Company?</h2>
        <p>Join thousands of students who use PlacementTrack to prepare smarter.</p>
        <button className="btn btn-accent btn-lg" onClick={handleStart}>
          🚀 Get Started for Free
        </button>
      </section>
    </div>
  );
}
