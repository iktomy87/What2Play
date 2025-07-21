// utils/gameUtils.js
const extractRequirements = (apiGame) => {
  // Extrae los requisitos manteniendo el formato original
  const requirements = {
    cpu: apiGame.platforms?.[0]?.requirements?.minimum || "Desconocido",
    gpu: apiGame.platforms?.[0]?.requirements?.minimum || "Desconocido",
    ram: apiGame.platforms?.[0]?.requirements?.minimum?.match(/\d+\s?GB/i)?.[0] || "8GB" // Mantiene formato "XGB"
  };
  return requirements;
};

const isCompatible = (userSpecs, gameRequirements) => {
  if (gameRequirements.cpu === "Desconocido" || gameRequirements.gpu === "Desconocido") {
    return true;
  }

  // Lógica simple de comparación (mejorable)
  const cpuMatch = compareComponents(userSpecs.cpu, gameRequirements.cpu);
  const gpuMatch = compareComponents(userSpecs.gpu, gameRequirements.gpu);
  const ramMatch = parseInt(userSpecs.ram) >= parseInt(gameRequirements.ram);

  return cpuMatch && gpuMatch && ramMatch;
};

const compareComponents = (userComponent, gameComponent) => {
  // Implementación básica - mejorar con comparación real de componentes
  return userComponent.toLowerCase().includes(gameComponent.toLowerCase()) || 
         gameComponent.toLowerCase().includes(userComponent.toLowerCase());
};

module.exports = {
  extractRequirements,
  isCompatible,
  compareComponents
};