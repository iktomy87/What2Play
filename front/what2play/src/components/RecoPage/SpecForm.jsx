import React, { useState, useEffect, useRef } from "react";
import "./SpecForm.css";
import { useRecommendations } from "../../hooks/useRecommendations";

const FIELD_ICONS = {
    gpu: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
        </svg>
    ),
    cpu: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
        </svg>
    ),
    ram: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 19v-2" /><path d="M10 19v-2" /><path d="M14 19v-2" /><path d="M18 19v-2" /><path d="M8 19h-2a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2h-2" /><path d="M10 5V3" /><path d="M14 5V3" />
        </svg>
    ),
    storage: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
};

const FIELD_COLORS = {
    gpu: "#7c5cfc",
    cpu: "#22c55e",
    ram: "#f59e0b",
    storage: "#e05c2a",
};

export default function SpecForm({ formRef, onDataFetch }) {
    const [form, setForm] = useState({ gpu: "", cpu: "", ram: "", storage: "" });
    const [focusedField, setFocusedField] = useState(null);
    const { components, games, loading, error, getRecommendations } = useRecommendations();
    const filledCount = Object.values(form).filter(Boolean).length;
    const valid = filledCount === 4;
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const CPU_OPTIONS = components.cpus.map(c => c.nombre);
    const GPU_OPTIONS = components.gpus.map(g => g.nombre);
    const RAM_OPTIONS = ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB", "128 GB"];
    const STORAGE_OPTIONS = ["HDD", "SSD SATA", "NVMe SSD"];

    const fields = [
        { key: "gpu", label: "Tarjeta gráfica (GPU)", placeholder: "Seleccioná tu GPU", opts: GPU_OPTIONS },
        { key: "cpu", label: "Procesador (CPU)", placeholder: "Seleccioná tu CPU", opts: CPU_OPTIONS },
        { key: "ram", label: "Memoria RAM", placeholder: "Seleccioná la cantidad", opts: RAM_OPTIONS },
        { key: "storage", label: "Almacenamiento", placeholder: "Seleccioná el tipo", opts: STORAGE_OPTIONS },
    ];

    useEffect(() => {
        if (onDataFetch) {
            onDataFetch({ games, loading: loading.recommendations, error });
        }
    }, [games, loading.recommendations, error, onDataFetch]);

    return (
        <section className="sf-section" ref={formRef}>
            {/* Decorative background elements */}
            <div className="sf-bg-orb sf-bg-orb--purple" />
            <div className="sf-bg-orb sf-bg-orb--green" />

            <div className="sf-inner">
                {/* Header */}
                <div className="sf-header">
                    <span className="sf-eyebrow">
                        <span className="sf-eyebrow-dot" />
                        Especificaciones
                    </span>
                    <h2 className="sf-title">
                        Ingresá los componentes
                        <span className="sf-title-accent"> de tu PC</span>
                    </h2>
                    <p className="sf-subtitle">
                        Usamos los datos exactos de tu hardware para calcular qué juegos van a correr bien en tu equipo.
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="sf-progress-wrap">
                    <div className="sf-progress-bar">
                        <div
                            className="sf-progress-fill"
                            style={{ width: `${(filledCount / 4) * 100}%` }}
                        />
                    </div>
                    <span className="sf-progress-label">{filledCount} de 4 completados</span>
                </div>

                {/* Form card */}
                <div className="sf-card">
                    <div className="sf-card-glow" />

                    {loading.components ? (
                        <div className="sf-loading">
                            <div className="sf-spinner" />
                            <span>Cargando componentes de hardware...</span>
                        </div>
                    ) : (
                        <div className="sf-grid">
                            {fields.map((f, i) => {
                                const color = FIELD_COLORS[f.key];
                                const isFilled = !!form[f.key];
                                const isFocused = focusedField === f.key;

                                return (
                                    <div
                                        className={`sf-field ${isFocused ? 'sf-field--focused' : ''} ${isFilled ? 'sf-field--filled' : ''}`}
                                        key={f.key}
                                        style={{
                                            animationDelay: `${i * 0.06}s`,
                                            '--field-color': color,
                                        }}
                                    >
                                        <div className="sf-field-header">
                                            <div className="sf-field-icon" style={{ color, background: `${color}18` }}>
                                                {FIELD_ICONS[f.key]}
                                            </div>
                                            <label className="sf-label">{f.label}</label>
                                            {isFilled && (
                                                <span className="sf-check">✓</span>
                                            )}
                                        </div>
                                        <div className="sf-select-wrap">
                                            <select
                                                className="sf-select"
                                                value={form[f.key]}
                                                onChange={e => set(f.key, e.target.value)}
                                                onFocus={() => setFocusedField(f.key)}
                                                onBlur={() => setFocusedField(null)}
                                            >
                                                <option value="">{f.placeholder}</option>
                                                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        className={`sf-submit ${valid ? 'sf-submit--ready' : ''}`}
                        disabled={!valid || loading.recommendations}
                        onClick={() => valid && getRecommendations(form, [])}
                    >
                        {loading.recommendations ? (
                            <>
                                <div className="sf-spinner sf-spinner--sm" />
                                <span>Analizando compatibilidad...</span>
                            </>
                        ) : valid ? (
                            <>
                                <span className="sf-submit-icon">⚡</span>
                                <span>Buscar juegos compatibles</span>
                                <span className="sf-submit-arrow">→</span>
                            </>
                        ) : (
                            <span>Completá todas las especificaciones</span>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}