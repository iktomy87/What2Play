const extractRequirements = (apiGame) => {
  const defaultRequirements = {
    cpu: 'Desconocido',
    gpu: 'Desconocido',
    ram: '8GB'
  };

  if (!apiGame.platforms || apiGame.platforms.length === 0) {
    return defaultRequirements;
  }

  const pcPlatform = apiGame.platforms.find(p => p.platform.name === 'PC');
  if (!pcPlatform) {
    return defaultRequirements;
  }

  const requirementsText = pcPlatform.requirements?.minimum || pcPlatform.requirements_en?.minimum || '';
  if (!requirementsText) {
    return defaultRequirements;
  }

  const extractValue = (key, defaultValue) => {
    const regex = new RegExp(`${key}:\\s*([^\\n]+)`, 'i');
    const match = requirementsText.match(regex);
    return match ? match[1].trim() : defaultValue;
  };

  return {
    cpu: extractValue('Processor', defaultRequirements.cpu),
    gpu: extractValue('Graphics', defaultRequirements.gpu),
    ram: extractValue('Memory', defaultRequirements.ram)
      .replace(/RAM/i, '')
      .trim()
      .replace(/(\d+)\s*([GM]B)/i, '$1 $2')
  };
};


const isCompatible = (userSpecs, gameRequirements) => {
  if (gameRequirements.cpu === 'Desconocido' || gameRequirements.gpu === 'Desconocido') {
    return true; // Si no hay info, asumir que es compatible
  }

  const cpuMatch = compareComponents(userSpecs.cpu, gameRequirements.cpu);
  const gpuMatch = compareComponents(userSpecs.gpu, gameRequirements.gpu);
  const ramMatch = parseInt(userSpecs.ram) >= parseInt(gameRequirements.ram);

  return cpuMatch && gpuMatch && ramMatch;
};

const compareComponents = (userComponent, gameComponent) => {
  const user = userComponent.toLowerCase();
  const game = gameComponent.toLowerCase();
  return user.includes(game) || game.includes(user);
};

module.exports = {
  extractRequirements,
  isCompatible,
  compareComponents
};
