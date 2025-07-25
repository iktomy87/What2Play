const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error en la respuesta del servidor');
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('La respuesta no es JSON válido');
  }

  return response.json();
};

export const fetchComponents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations/components`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en fetchComponents:', error);
    throw error;
  }
};

export const fetchRecommendations = async ({ cpu, gpu, ram, genres = [] }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpu,
        gpu,
        ram: parseInt(ram, 10),
        genres,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en fetchRecommendations:', error);
    throw error;
  }
};