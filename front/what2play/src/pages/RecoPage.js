import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import './styles/RecoPage.css';
import Header from '../components/Header';
import Stars from './BackgroundEffects/Stars';
import FloatingElements from './BackgroundEffects/FloatingElements';
import homeStyles from './styles/HomePage.module.css';
import recoStyles from './styles/RecoPage.module.css';

import { useRecommendations } from '../hooks/useRecommendations';
import AutocompleteInput from '../components/AutocompleteInput';
import GenreSelector from '../components/GenreSelector';

const GENRE_OPTIONS = ['Action', 'Adventure', 'RPG', 'Strategy', 'Horror', 'Shooter', 'Indie', 'Simulation', 'Open World', 'Survival'];

const RecoPage = () => {
  const [specs, setSpecs] = useState({ cpu: '', gpu: '', ram: '' });
  const [genres, setGenres] = useState([]);

  const { components, games, loading, error, getRecommendations } = useRecommendations();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSpecs(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentSelect = (name, value) => {
    setSpecs(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (e) => {
    const { value } = e.target;
    setGenres(prev => 
      prev.includes(value) 
        ? prev.filter(genre => genre !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getRecommendations(specs, genres);
  };

  return (
    <div className={homeStyles.container}>
      <Stars />
      <FloatingElements />
      <Header />

      <div className={recoStyles.recoContent}>
        <h2>Encuentra juegos para tu PC</h2>
        <p>Usa nuestro motor de recomendaciones para descubrir juegos perfectamente optimizados para tu hardware.</p>

        {error && <div className={recoStyles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={recoStyles.form}>
          <AutocompleteInput
            label="Procesador (CPU)"
            name="cpu"
            value={specs.cpu}
            data={components.cpus}
            onSelect={handleComponentSelect}
            onChange={handleInputChange}
            placeholder="Escribe o selecciona un procesador"
            loading={loading.components}
            required
          />

          <AutocompleteInput
            label="Tarjeta Gráfica (GPU)"
            name="gpu"
            value={specs.gpu}
            data={components.gpus}
            onSelect={handleComponentSelect}
            onChange={handleInputChange}
            placeholder="Escribe o selecciona una tarjeta gráfica"
            loading={loading.components}
            required
          />

          <div className={recoStyles.formGroup}>
            <label>RAM (GB)</label>
            <input 
              type="number" 
              name="ram" 
              value={specs.ram} 
              onChange={handleInputChange} 
              min="4"
              max="128"
              placeholder="Ej: 8"
              required 
            />
          </div>

          <GenreSelector
            options={GENRE_OPTIONS}
            selectedGenres={genres}
            onChange={handleGenreChange}
            recoStyles={recoStyles}
          />

          <button
            type="submit"
            className={`${homeStyles.btn} ${homeStyles.btnPrimary}`}
            disabled={loading.components || loading.recommendations}
          >
            {loading.recommendations ? 'Buscando...' : '🎮 Obtener Recomendaciones'}
          </button>
        </form>

        <div className={recoStyles.gameList}>
          {games.length > 0 && (
            <h3>Juegos Compatibles Encontrados: {games.length}</h3>
          )}
          
          {games.length > 0 ? (
            games.map((game) => (
              <GameCard key={game.nombre} game={game} />
            ))
          ) : (
            !loading.recommendations && !error && (
              <p className="no-games">
                Completa el formulario para ver qué juegos puedes correr en tu PC.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoPage;