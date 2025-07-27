import React, { useState, useEffect, useRef } from 'react';
import { fetchComponents, fetchRecommendations } from '../api/recommendation';
import GameCard from '../components/GameCard';
import './styles/RecoPage.css';
import Header from '../components/Header';
import Stars from './BackgroundEffects/Stars';
import FloatingElements from './BackgroundEffects/FloatingElements';
import homeStyles from './styles/HomePage.module.css'; // Estilos base y de botones
import recoStyles from './styles/RecoPage.module.css';

const GENRE_OPTIONS = ['Action', 'Adventure', 'RPG', 'Strategy', 'Horror', 'Shooter', 'Indie', 'Simulation', 'Open World', 'Survival'];

const RecoPage = () => {
  // Estados
  const [specs, setSpecs] = useState({ cpu: '', gpu: '', ram: '' });
  const [genres, setGenres] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState({
    components: true,
    recommendations: false,
  });
  const [error, setError] = useState(null);
  const [components, setComponents] = useState({
    cpus: [],
    gpus: [],
  });
  const [filteredComponents, setFilteredComponents] = useState({
    cpus: [],
    gpus: [],
  });
  const [dropdownVisibility, setDropdownVisibility] = useState({
    cpu: false,
    gpu: false,
  });

  // Refs
  const cpuDropdownRef = useRef(null);
  const gpuDropdownRef = useRef(null);

  // Cargar componentes al montar
  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones en componentes desmontados

    const loadComponents = async () => {
      try {
        const { data } = await fetchComponents();
        
        if (isMounted) {
          setComponents({
            cpus: data.cpus.map(nombre => ({ nombre })),
            gpus: data.gpus.map(nombre => ({ nombre })),
          });
          setFilteredComponents({
            cpus: data.cpus.map(nombre => ({ nombre })),
            gpus: data.gpus.map(nombre => ({ nombre })),
          });
          setLoading(prev => ({ ...prev, components: false }));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading components:', err);
          setError('Error al cargar los componentes. Por favor, recarga la página.');
          setLoading(prev => ({ ...prev, components: false }));
        }
      }
    };

    loadComponents();

    // Limpieza
    return () => {
      isMounted = false;
    };
  }, []);

  // Manejadores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSpecs(prev => ({ ...prev, [name]: value }));
    
    if (name === 'cpu') {
      const filtered = components.cpus.filter(cpu => 
        cpu.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredComponents(prev => ({ ...prev, cpus: filtered }));
      setDropdownVisibility({ cpu: true, gpu: false });
    } else if (name === 'gpu') {
      const filtered = components.gpus.filter(gpu => 
        gpu.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredComponents(prev => ({ ...prev, gpus: filtered }));
      setDropdownVisibility({ cpu: false, gpu: true });
    }
  };

  const handleComponentSelect = (type, name) => {
    setSpecs(prev => ({ ...prev, [type]: name }));
    setDropdownVisibility(prev => ({ ...prev, [type]: false }));
  };

  const handleGenreChange = (e) => {
    const { value } = e.target;
    setGenres(prev => 
      prev.includes(value) 
        ? prev.filter(genre => genre !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, recommendations: true }));
    setError(null);
    setGames([]);

    try {
      const { data } = await fetchRecommendations({
        cpu: specs.cpu,
        gpu: specs.gpu,
        ram: specs.ram,
        genres
      });

      setGames(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Error al obtener recomendaciones');
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  // Renderizado
    return (
    // Usa el contenedor principal de la home page para el fondo y estilos base
    <div className={homeStyles.container}>
      <Stars />
      <FloatingElements />
      <Header />

      <div className={recoStyles.recoContent}>
        <h2>Encuentra juegos para tu PC</h2>
        <p>Usa nuestro motor de recomendaciones para descubrir juegos perfectamente optimizados para tu hardware.</p>

        {error && <div className={recoStyles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={recoStyles.form}>
            {/* Campo CPU */}
            <div className={recoStyles.formGroup}>
              <label>Procesador (CPU)</label>
              <div className={recoStyles.autocompleteWrapper} ref={cpuDropdownRef}>
                <input
                  type="text"
                  name="cpu"
                  value={specs.cpu}
                  onChange={handleInputChange}
                onFocus={() => {
                  setDropdownVisibility({ cpu: true, gpu: false });
                  setFilteredComponents(prev => ({ ...prev, cpus: components.cpus }));
                }}
                placeholder="Escribe o selecciona un procesador"
                autoComplete="off"
                required
                disabled={loading.components}
              />
              {dropdownVisibility.cpu && filteredComponents.cpus.length > 0 && (
                <div className="autocomplete-dropdown">
                  {filteredComponents.cpus.slice(0, 50).map((cpu, index) => (
                    <div
                      key={`cpu-${index}`}
                      className="dropdown-item"
                      onClick={() => handleComponentSelect('cpu', cpu.nombre)}
                    >
                      {cpu.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
        

        {/* Campo GPU */}
        <div className={recoStyles.formGroup}>
          <label>Tarjeta Gráfica (GPU)</label>
          <div className={recoStyles.autocompleteWrapper} ref={gpuDropdownRef}>
          {loading.components ? (
            <div className="loading-indicator">Cargando tarjetas gráficas...</div>
          ) : (
            <div className="autocomplete-wrapper" ref={gpuDropdownRef}>
              <input
                type="text"
                name="gpu"
                value={specs.gpu}
                onChange={handleInputChange}
                onFocus={() => {
                  setDropdownVisibility({ cpu: false, gpu: true });
                  setFilteredComponents(prev => ({ ...prev, gpus: components.gpus }));
                }}
                placeholder="Escribe o selecciona una tarjeta gráfica"
                autoComplete="off"
                required
                disabled={loading.components}
              />
              {dropdownVisibility.gpu && filteredComponents.gpus.length > 0 && (
                <div className="autocomplete-dropdown">
                  {filteredComponents.gpus.slice(0, 50).map((gpu, index) => (
                    <div
                      key={`gpu-${index}`}
                      className="dropdown-item"
                      onClick={() => handleComponentSelect('gpu', gpu.nombre)}
                    >
                      {gpu.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Campo RAM */}
       <div className={recoStyles.formGroup}>
          <label>RAM (GB)</label>
          <input 
            type="number" 
            name="ram" 
            value={specs.ram} 
            onChange={(e) => setSpecs(prev => ({ ...prev, ram: e.target.value }))} 
            min="4"
            max="128"
            placeholder="Ej: 8"
            required 
          />
        </div>

        {/* Selector de géneros */}
        <fieldset className={recoStyles.formGroup}>
          <legend>Géneros preferidos (opcional)</legend>
          <div className={recoStyles.genreCheckboxes}>
            {GENRE_OPTIONS.map((genre) => (
                  <label key={genre} className={recoStyles.checkboxLabel}>
                    <input type="checkbox" value={genre} onChange={handleGenreChange} checked={genres.includes(genre)} />
                    <span className={recoStyles.checkboxCustom}></span>
                    {genre}
                  </label>
                ))}
              </div>
        </fieldset>

        {/* Botón de submit */}
         <button
              type="submit"
              className={`${homeStyles.btn} ${homeStyles.btnPrimary}`}
              disabled={loading.components || loading.recommendations}
            >
              {loading.recommendations ? 'Buscando...' : '🎮 Obtener Recomendaciones'}
            </button>
        </form>

      {/* Resultados */}
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