import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../assets/logo.png';

export default function Navbar({ onStart }) {
  return (
    <nav className="wtp-nav">
      <div className="wtp-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoImage} alt="Logo" className="wtp-logo-img" />
        </Link>
      </div>
      <div className="wtp-nav-links">
        <Link to="/" className="wtp-nav-link" style={{ textDecoration: 'none' }}>Inicio</Link>
        <Link 
          to="/#how-it-works" 
          className="wtp-nav-link" 
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            if (window.location.pathname === '/' || window.location.pathname === '') {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Cómo funciona
        </Link>
      </div>
      <button className="wtp-nav-cta" onClick={onStart}>Analizar mi PC</button>
    </nav>
  );
}