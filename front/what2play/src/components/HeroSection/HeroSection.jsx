import React from 'react';
import CarouselRow from './CarouselRow';
import StatItem from './StatItem';
import { GAMES } from './gamesData';
import { Link } from 'react-router-dom';
import './HeroSection.css';

export default function HeroSection() {
  const row1 = GAMES.slice(0, 12);
  const row2 = GAMES.slice(6, 18);
  const row3 = GAMES.slice(12, 24);

  return (
    <div className="hero-section">
      {/* Noise texture overlay */}
      <div className="hero-noise" />

      {/* Carousel background */}
      <div className="hero-carousel-bg">
        <CarouselRow games={row1} direction="left" speed={35} />
        <CarouselRow games={row2} direction="right" speed={28} />
        <CarouselRow games={row3} direction="left" speed={40} />
      </div>

      {/* Edge fades */}
      <div className="hero-fade-left" />
      <div className="hero-fade-right" />
      <div className="hero-fade-top" />
      <div className="hero-fade-bottom" />

      {/* Ambient glow */}
      <div className="hero-ambient-glow" />

      {/* Main content */}
      <div className="hero-content">
        {/* Title */}
        <h1 className="hero-title">
          Encontrá tu próximo{" "}
          <span className="hero-title-highlight">
            juego perfecto
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Descubrí títulos que se adaptan a tu estilo, plataforma y estado de ánimo. Más de 12 000 juegos analizados.
        </p>

        {/* CTA */}
        <div className="hero-cta-container">
          <Link to="/recommendations" style={{ textDecoration: 'none' }}>
            <button className="hero-btn-primary">
              Explorar recomendaciones
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats-container">
          {[
            { value: "12K+", label: "Juegos" },
            { value: "50+", label: "Géneros" },
          ].map((s, i) => (
            <div key={i} className="hero-stat-item-wrap">
              <StatItem value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
