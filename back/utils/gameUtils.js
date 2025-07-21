// utils/gameUtils.js
const extractRequirements = (apiGame) => {
  // Implementación existente de extractRequirements
  return {
    cpu: apiGame.platforms?.[0]?.requirements?.minimum || "Desconocido",
    gpu: apiGame.platforms?.[0]?.requirements?.minimum || "Desconocido",
    ram: "8 GB" // Valor por defecto
  };
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