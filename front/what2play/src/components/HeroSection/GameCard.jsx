import React from 'react';

export default function GameCard({ game }) {
  return (
    <div
      style={{
        width: 90,
        height: 120,
        borderRadius: 10,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "8px 7px",
        backgroundImage: `url(${game.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "#a78bfa",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 2,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {game.genre}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#f0f0f0",
            lineHeight: 1.25,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {game.title}
        </div>
      </div>
    </div>
  );
}
