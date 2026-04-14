import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./HowItWorks.css";
import "./Features.css";

export default function HowItWorks() {
    const location = useLocation();
    
    useEffect(() => {
        if (location.hash === '#how-it-works') {
            setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location]);

    const steps = [
        { num: "01", title: "Ingresás tus specs", desc: "GPU, CPU, RAM y tipo de almacenamiento. No hace falta registrarse.", accent: "#7c5cfc" },
        { num: "02", title: "Se cruzan los datos", desc: "Cada componente se compara contra los requisitos mínimos y recomendados de cada juego en la base de datos.", accent: "#22c55e" },
        { num: "03", title: "Se calcula un score", desc: "El algoritmo pondera GPU, CPU y memoria para generar un porcentaje real de compatibilidad por juego.", accent: "#f59e0b" },
        { num: "04", title: "Ves los resultados", desc: "Los juegos aparecen ordenados de más a menos compatible, agrupados para que tomes la decisión más fácil.", accent: "#e05c2a" },
    ];
    return (
        <section id="how-it-works" className="wtp-how-section">
            <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span className="wtp-section-eyebrow">El proceso</span>
                    <h2 className="wtp-section-title" style={{ textAlign: "center" }}>Cómo funciona el algoritmo</h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.35)", fontFamily: "'Nunito Sans',sans-serif", fontWeight: 300, marginTop: 10, maxWidth: 440, margin: "10px auto 0", lineHeight: 1.6 }}>
                        Un proceso transparente basado en datos reales de hardware y requisitos de juegos.
                    </p>
                </div>
                <div className="wtp-steps-grid">
                    {steps.map((s, i) => (
                        <div className="wtp-step-card" key={i} style={{ animationDelay: `${i * .08}s` }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.accent, zIndex: 1 }} />
                            <div className="wtp-step-num">{s.num}</div>
                            <div className="wtp-step-title">{s.title}</div>
                            <div className="wtp-step-desc">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}