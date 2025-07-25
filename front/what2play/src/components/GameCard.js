// components/GameCard.js
import React from 'react';
import '../pages/styles/GameCard.css'; // Asegúrate de tener los estilos adecuados

const GameCard = ({ game }) => {
  // Maneja diferentes nombres de propiedades
  const gameName = game.nombre || 'Nombre no disponible';
  const gameGenres = game.generos || [];
  
  return (
    <div className="game-card">
      <div className="game-info">
        <h3>{gameName}</h3>
        {gameGenres.length > 0 && (
          <div className="game-genres">
            <strong>Géneros:</strong> {gameGenres.join(', ')}
          </div>
        )}
        {game.requisitos_minimos && (
          <div className="game-requirements">
            <h4>Requisitos mínimos:</h4>
            <ul>
              {game.requisitos_minimos.Processor && (
                <li><strong>CPU:</strong> {game.requisitos_minimos.Processor}</li>
              )}
              {game.requisitos_minimos.Graphics && (
                <li><strong>GPU:</strong> {game.requisitos_minimos.Graphics}</li>
              )}
              {game.requisitos_minimos.Memory && (
                <li><strong>RAM:</strong> {game.requisitos_minimos.Memory}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;