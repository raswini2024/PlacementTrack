import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        📊 Placement<span>Track</span>
      </Link>
      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/dashboard" className="btn btn-primary btn-sm">Launch Dashboard</Link>
          </>
        )}
      </div>
    </nav>
  );
}
