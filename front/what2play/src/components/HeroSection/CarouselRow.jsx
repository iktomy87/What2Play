import React from 'react';
import GameCard from './GameCard';

export default function CarouselRow({ games, direction = "left", speed = 32 }) {
  const doubled = [...games, ...games];
  const duration = `${speed}s`;
  const animName = direction === "left" ? "scrollLeft" : "scrollRight";

  return (
    <div style={{ display: "flex", gap: 10, width: "max-content", animation: `${animName} ${duration} linear infinite` }}>
      {doubled.map((g, i) => (
        <GameCard key={i} game={g} />
      ))}
    </div>
  );
}
