import { useState, useEffect } from 'react';
import { fetchComponents, fetchRecommendations as apiFetchRecommendations } from '../api/recommendation';

export const useRecommendations = () => {
  const [components, setComponents] = useState({ cpus: [], gpus: [] });
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState({ components: true, recommendations: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadComponents = async () => {
      try {
        const { data } = await fetchComponents();
        if (isMounted) {
          setComponents({
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
    return () => { isMounted = false; };
  }, []);

  const getRecommendations = async (specs, genres) => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    setError(null);
    setGames([]);

    try {
      const { data } = await apiFetchRecommendations({
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

  return { components, games, loading, error, getRecommendations };
};
