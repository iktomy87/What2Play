import React from 'react';
import './Navbar.css';
import logoImage from '../assets/logo.png';

export default function Navbar({ onStart }) {
  return (
    <nav className="wtp-nav">
      <div className="wtp-logo">
        <img src={logoImage} alt="Logo" className="wtp-logo-img" />
      </div>
      <div className="wtp-nav-links">
        <span className="wtp-nav-link">Inicio</span>
        <span className="wtp-nav-link">Cómo funciona</span>
      </div>
      <button className="wtp-nav-cta" onClick={onStart}>Analizar mi PC</button>
    </nav>
  );
}