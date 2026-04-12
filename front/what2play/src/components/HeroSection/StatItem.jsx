import React from 'react';

export default function StatItem({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#f8f8ff", fontFamily: "'Outfit', sans-serif", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>
        {label}
      </div>
    </div>
  );
}
