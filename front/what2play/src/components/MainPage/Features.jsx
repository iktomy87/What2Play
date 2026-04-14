import React from "react";
import { Monitor, Zap, Target } from "lucide-react";
import "./Features.css";

export default function Features() {
    const items = [
        { icon: <Monitor size={22} color="#7c5cfc" />, color: "#7c5cfc", bg: "rgba(124,92,252,.18)", title: "Análisis de Hardware", desc: "Ingresás tu GPU, CPU, RAM y almacenamiento. El sistema mapea cada componente contra los requisitos reales de cada juego.", delay: 0 },
        { icon: <Zap size={22} color="#f59e0b" />, color: "#f59e0b", bg: "rgba(245,158,11,.18)", title: "Compatibilidad Exacta", desc: "El algoritmo calcula un porcentaje de compatibilidad real ponderando cada componente para que sepas exactamente qué te espera.", delay: .1 },
        { icon: <Target size={22} color="#22c55e" />, color: "#22c55e", bg: "rgba(34,197,94,.18)", title: "Resultados Ordenados", desc: "Los juegos se presentan de mayor a menor compatibilidad, agrupados en categorías claras: corre perfecto, con ajustes, o muy exigente.", delay: .2 },
    ];
    return (
        <section className="wtp-features">
            {/* decorative orbs */}
            <div className="wtp-orb" style={{ width: 400, height: 400, background: "rgba(124,92,252,.12)", top: -100, right: -100, animationDelay: "0s" }} />
            <div className="wtp-orb" style={{ width: 300, height: 300, background: "rgba(34,197,94,.07)", bottom: -80, left: -80, animationDelay: "2.5s" }} />

            <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <span className="wtp-section-eyebrow">Cómo funciona</span>
                    <h2 className="wtp-section-title" style={{ textAlign: "center", maxWidth: "100%" }}>
                        Tres pasos, resultados precisos
                    </h2>
                </div>
                <div className="wtp-feat-grid">
                    {items.map((f, i) => (
                        <div className="wtp-feat-card" key={i} style={{ animationDelay: `${f.delay}s` }}>
                            <div className="wtp-feat-icon-wrap" style={{ background: f.bg }}>
                                <span style={{ fontSize: 22 }}>{f.icon}</span>
                            </div>
                            <div className="wtp-feat-title">{f.title}</div>
                            <div className="wtp-feat-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}