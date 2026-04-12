import React, { useState, useRef } from 'react';
import GameCard from '../components/RecoPage/GameCard';
import './styles/RecoPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import Stars from './BackgroundEffects/Stars';
import FloatingElements from './BackgroundEffects/FloatingElements';
import homeStyles from './styles/HomePage.module.css';
import recoStyles from './styles/RecoPage.module.css';

import SpecForm from '../components/RecoPage/SpecForm';

const RecoPage = () => {
  const [results, setResults] = useState({ games: [], loading: false, error: null });
  const formRef = useRef(null);

  return (
    <div className={homeStyles.container}>
      <Navbar />
      <Stars />

      <div className={recoStyles.recoContent}>
        <SpecForm formRef={formRef} onDataFetch={setResults} />

        {results.error && <div className={recoStyles.errorMessage}>{results.error}</div>}

        <div className={recoStyles.gameList}>
          {results.games && results.games.length > 0 && (
            <h3>Juegos Compatibles Encontrados: {results.games.length}</h3>
          )}

          {results.loading ? (
            <p style={{ color: 'white', marginTop: '20px' }}>Obteniendo recomendaciones...</p>
          ) : results.games && results.games.length > 0 ? (
            results.games.map((game) => (
              <GameCard key={game.nombre} game={game} />
            ))
          ) : (
            !results.error && (
              <p className="no-games">
                Completa el formulario para ver qué juegos puedes correr en tu PC.
              </p>
            )
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecoPage;