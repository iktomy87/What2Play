import React, { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: focused ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${focused ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 14,
        padding: "11px 16px",
        width: 340,
        maxWidth: "100%",
        transition: "all 0.2s ease",
        boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.15)" : "none",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" />
        <path d="M10 10L14 14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Género, plataforma, estado de ánimo..."
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: "rgba(255,255,255,0.9)",
          fontSize: 14,
          flex: 1,
          minWidth: 0,
          fontFamily: "'Outfit', sans-serif",
        }}
      />
      {query && (
        <div
          style={{
            background: "#7c3aed",
            borderRadius: 8,
            padding: "3px 10px",
            fontSize: 12,
            color: "#fff",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Buscar
        </div>
      )}
    </div>
  );
}
