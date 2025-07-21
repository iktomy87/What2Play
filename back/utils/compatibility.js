const isCompatible = (userSpecs, gameRequirements) => {
  // Si los requisitos del juego son desconocidos, asumimos compatibilidad
  if (gameRequirements.cpu === "Desconocido" && gameRequirements.gpu === "Desconocido") {
    return true;
  }

  // Comparar RAM
  const userRam = parseInt(userSpecs.ram) || 0;
  const gameRam = parseInt(gameRequirements.ram) || 0;
  if (userRam < gameRam) return false;

  // Comparar CPU
  if (gameRequirements.cpu !== "Desconocido") {
    const userCpuLevel = getCpuLevel(userSpecs.cpu);
    const gameCpuLevel = getCpuLevel(gameRequirements.cpu);
    if (userCpuLevel < gameCpuLevel) return false;
  }

  // Comparar GPU
  if (gameRequirements.gpu !== "Desconocido") {
    const userGpuLevel = getGpuLevel(userSpecs.gpu);
    const gameGpuLevel = getGpuLevel(gameRequirements.gpu);
    if (userGpuLevel < gameGpuLevel) return false;
  }

  return true;
};

// Funciones auxiliares para determinar niveles de hardware
const getCpuLevel = (cpuName) => {
  const cpu = cpuName.toLowerCase();
  if (cpu.includes('i9') || cpu.includes('ryzen 9')) return 5;
  if (cpu.includes('i7') || cpu.includes('ryzen 7')) return 4;
  if (cpu.includes('i5') || cpu.includes('ryzen 5')) return 3;
  if (cpu.includes('i3') || cpu.includes('ryzen 3')) return 2;
  return 1;
};

const getGpuLevel = (gpuName) => {
  const gpu = gpuName.toLowerCase();
  if (gpu.includes('rtx 4090')) return 9;
  if (gpu.includes('rtx 3080')) return 8;
  if (gpu.includes('rtx 3070')) return 7;
  if (gpu.includes('rtx 3060')) return 6;
  if (gpu.includes('rtx 2060')) return 5;
  if (gpu.includes('gtx 1660')) return 4;
  if (gpu.includes('gtx 1060')) return 3;
  if (gpu.includes('gtx 960')) return 2;
  return 1;
};

module.exports = { isCompatible };