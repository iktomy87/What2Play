import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Stars from './BackgroundEffects/Stars';
import FloatingElements from './BackgroundEffects/FloatingElements';
import styles from './styles/HomePage.module.css';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import { Cpu, Zap, Goal } from 'lucide-react';

const HomePage = () => {
  // Funciones de interacción
  const startRecommendation = () => {
    alert('¡Función de recomendación iniciada! Aquí se abriría el wizard de preferencias.');
  };

  const analyzePC = () => {
    alert('¡Análisis de PC completado! Se detectaron las especificaciones y capacidades.');
  };

  const openFeature = (feature) => {
    const features = {
      'ai': 'Función de IA: Algoritmos de machine learning para recomendaciones personalizadas',
      'performance': 'Análisis de rendimiento: Optimización automática basada en tu hardware',
      'community': 'Comunidad: Reviews, ratings y recomendaciones de otros usuarios'
    };
    alert(features[feature] || 'Función no disponible');
  };

  const quickStart = (type) => {
    const options = {
      'genre': 'Navegación por géneros de juegos',
      'mood': 'Recomendaciones basadas en tu estado de ánimo actual',
      'specs': 'Juegos optimizados para tu configuración de hardware',
      'trending': 'Juegos más populares y tendencias actuales'
    };
    alert('Iniciando: ' + (options[type] || 'Función no disponible'));
  };

  return (
    <div className={styles.container}>
      <HeroSection />
      <Stars />
      <FloatingElements />


      <div className={styles.features}>
        <div className={styles.featureCard} onClick={() => openFeature('ai')}>
          <div className={styles.featureIcon}>🤖</div>
          <h3>IA Avanzada</h3>
          <p>Algoritmos inteligentes que aprenden de tus preferencias y patrones de juego para ofrecerte recomendaciones cada vez más precisas.</p>
        </div>

        <div className={styles.featureCard} onClick={() => openFeature('performance')}>
          <div className={styles.featureIcon}>⚡</div>
          <h3>Optimización de Rendimiento</h3>
          <p>Analizamos tu hardware y te recomendamos juegos que funcionarán perfectamente, con configuraciones optimizadas para tu sistema.</p>
        </div>

        <div className={styles.featureCard} onClick={() => openFeature('community')}>
          <div className={styles.featureIcon}>👥</div>
          <h3>Comunidad Activa</h3>
          <p>Conecta con otros gamers, comparte experiencias y descubre qué están jugando usuarios con gustos similares a los tuyos.</p>
        </div>
      </div>

      <div className={styles.quickStart}>
        <h2>¿Por dónde empezamos?</h2>
        <p>Elige tu enfoque preferido para descubrir juegos increíbles</p>

        <div className={styles.quickOptions}>
          <div className={styles.quickOption} onClick={() => quickStart('genre')}>
            <h4>🎯 Por Género</h4>
            <p>Explora por categorías: RPG, FPS, Estrategia, Indie y más</p>
          </div>

          <div className={styles.quickOption} onClick={() => quickStart('mood')}>
            <h4>🌟 Por Estado de Ánimo</h4>
            <p>¿Buscas relajarte, competir o vivir aventuras épicas?</p>
          </div>

          <div className={styles.quickOption} onClick={() => quickStart('specs')}>
            <h4>🔧 Por Hardware</h4>
            <p>Juegos perfectos para tu configuración específica</p>
          </div>

          <div className={styles.quickOption} onClick={() => quickStart('trending')}>
            <h4>🔥 Tendencias</h4>
            <p>Descubre qué está jugando la comunidad ahora mismo</p>
          </div>
        </div>
      </div>

      <div className={styles.pcStatus}>
        <span className={styles.statusIndicator}></span>
        PC detectada: Gaming Ready | GPU: RTX 4060 | RAM: 16GB
      </div>
    </div>
  );
};

export default HomePage;