import React, { useState, useEffect, useRef } from "react";
import { Check, Zap, ArrowRight, Monitor, Cpu, HardDrive, Server } from "lucide-react";
import "./SpecForm.css";
import { useRecommendations } from "../../hooks/useRecommendations";

const FIELD_ICONS = {
    gpu: <Monitor size={18} />,
    cpu: <Cpu size={18} />,
    ram: <Server size={18} />,
    storage: <HardDrive size={18} />,
};

const FIELD_COLORS = {
    gpu: "#7c5cfc",
    cpu: "#22c55e",
    ram: "#f59e0b",
    storage: "#e05c2a",
};

// ─── AutocompleteField ───────────────────────────────────────────────────────
// Manages its own open/close state using a mousedown-on-dropdown guard so that
// clicking a list item never triggers the input's onBlur before the selection
// is registered.
function AutocompleteField({ fieldKey, label, placeholder, opts, color, index, value, onChange }) {
    // inputText: what the user is currently typing (may differ from committed value)
    const [inputText, setInputText] = useState(value);
    // isOpen: whether the dropdown is visible
    const [isOpen, setIsOpen] = useState(false);
    // mouseDownOnList: guard flag — set true while the pointer is pressed inside
    // the dropdown so the input's onBlur knows not to close/invalidate yet
    const mouseDownOnList = useRef(false);

    const isFilled = !!value;
    const isFocused = isOpen;

    // Keep local text in sync when parent resets the form
    useEffect(() => {
        setInputText(value);
    }, [value]);

    const filtered = opts.filter(o => o.toLowerCase().includes(inputText.toLowerCase()));

    const handleChange = (e) => {
        setInputText(e.target.value);
        // Typing invalidates any previous confirmed selection
        onChange(fieldKey, "");
        setIsOpen(true);
    };

    const handleFocus = () => setIsOpen(true);

    const handleBlur = () => {
        // If the pointer went down on the list, don't close — the click handler
        // will fire next and complete the selection.
        if (mouseDownOnList.current) return;
        // If the text doesn't exactly match a confirmed value, clear it
        if (!value) setInputText("");
        setIsOpen(false);
    };

    const handleSelect = (option) => {
        onChange(fieldKey, option);
        setInputText(option);
        setIsOpen(false);
        mouseDownOnList.current = false;
    };

    return (
        <div
            className={`sf-field ${isFocused ? "sf-field--focused" : ""} ${isFilled ? "sf-field--filled" : ""}`}
            style={{ animationDelay: `${index * 0.06}s`, "--field-color": color }}
        >
            <div className="sf-field-header">
                <div className="sf-field-icon" style={{ color, background: `${color}18` }}>
                    {FIELD_ICONS[fieldKey]}
                </div>
                <label className="sf-label">{label}</label>
                {isFilled && (
                    <span className="sf-check"><Check size={16} /></span>
                )}
            </div>
            <div className="sf-select-wrap">
                <input
                    type="text"
                    className="sf-input"
                    value={inputText}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                {isOpen && (
                    <div
                        className="sf-dropdown-list"
                        // Set the guard BEFORE the blur fires
                        onMouseDown={() => { mouseDownOnList.current = true; }}
                        // Safety reset in case the pointer is released outside an item
                        onMouseUp={() => { mouseDownOnList.current = false; }}
                    >
                        {filtered.length > 0
                            ? filtered.slice(0, 50).map(o => (
                                <div
                                    key={o}
                                    className="sf-dropdown-item"
                                    onMouseDown={(e) => e.preventDefault()} // prevent input blur entirely
                                    onClick={() => handleSelect(o)}
                                >
                                    {o}
                                </div>
                            ))
                            : (
                                <div
                                    className="sf-dropdown-item"
                                    style={{ color: "rgba(255,255,255,0.4)", cursor: "default" }}
                                >
                                    No se encontraron resultados
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── SelectField ─────────────────────────────────────────────────────────────
// Simple dropdown for fixed-option fields (RAM, Storage) — same visual shell.
function SelectField({ fieldKey, label, placeholder, opts, color, index, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const mouseDownOnList = useRef(false);

    const isFilled = !!value;
    const isFocused = isOpen;

    const handleBlur = () => {
        if (mouseDownOnList.current) return;
        setIsOpen(false);
    };

    const handleSelect = (option) => {
        onChange(fieldKey, option);
        setIsOpen(false);
        mouseDownOnList.current = false;
    };

    return (
        <div
            className={`sf-field ${isFocused ? "sf-field--focused" : ""} ${isFilled ? "sf-field--filled" : ""}`}
            style={{ animationDelay: `${index * 0.06}s`, "--field-color": color }}
        >
            <div className="sf-field-header">
                <div className="sf-field-icon" style={{ color, background: `${color}18` }}>
                    {FIELD_ICONS[fieldKey]}
                </div>
                <label className="sf-label">{label}</label>
                {isFilled && (
                    <span className="sf-check"><Check size={16} /></span>
                )}
            </div>
            <div className="sf-select-wrap">
                <input
                    type="text"
                    className="sf-input"
                    value={value}
                    readOnly
                    onFocus={() => setIsOpen(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    style={{ cursor: "pointer" }}
                    autoComplete="off"
                />
                {isOpen && (
                    <div
                        className="sf-dropdown-list"
                        onMouseDown={() => { mouseDownOnList.current = true; }}
                        onMouseUp={() => { mouseDownOnList.current = false; }}
                    >
                        {opts.map(o => (
                            <div
                                key={o}
                                className="sf-dropdown-item"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelect(o)}
                            >
                                {o}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── SpecForm ─────────────────────────────────────────────────────────────────
export default function SpecForm({ formRef, onDataFetch }) {
    // form stores only *confirmed* values (selected from the list)
    const [form, setForm] = useState({ gpu: "", cpu: "", ram: "", storage: "" });
    const { components, games, loading, error, getRecommendations } = useRecommendations();

    const filledCount = Object.values(form).filter(Boolean).length;
    const valid = filledCount === 4;

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const CPU_OPTIONS = [...new Set(components.cpus.map(c => c.nombre))];
    const GPU_OPTIONS = [...new Set(components.gpus.map(g => g.nombre))];
    const RAM_OPTIONS = ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB", "128 GB"];
    const STORAGE_OPTIONS = ["HDD", "SSD SATA", "NVMe SSD"];

    useEffect(() => {
        if (onDataFetch) {
            onDataFetch({ games, loading: loading.recommendations, error });
        }
    }, [games, loading.recommendations, error, onDataFetch]);

    return (
        <section className="sf-section" ref={formRef}>
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
                            <AutocompleteField
                                fieldKey="gpu"
                                label="Tarjeta gráfica (GPU)"
                                placeholder="Buscá tu GPU"
                                opts={GPU_OPTIONS}
                                color={FIELD_COLORS.gpu}
                                index={0}
                                value={form.gpu}
                                onChange={set}
                            />
                            <AutocompleteField
                                fieldKey="cpu"
                                label="Procesador (CPU)"
                                placeholder="Buscá tu CPU"
                                opts={CPU_OPTIONS}
                                color={FIELD_COLORS.cpu}
                                index={1}
                                value={form.cpu}
                                onChange={set}
                            />
                            <SelectField
                                fieldKey="ram"
                                label="Memoria RAM"
                                placeholder="Seleccioná la cantidad"
                                opts={RAM_OPTIONS}
                                color={FIELD_COLORS.ram}
                                index={2}
                                value={form.ram}
                                onChange={set}
                            />
                            <SelectField
                                fieldKey="storage"
                                label="Almacenamiento"
                                placeholder="Seleccioná el tipo"
                                opts={STORAGE_OPTIONS}
                                color={FIELD_COLORS.storage}
                                index={3}
                                value={form.storage}
                                onChange={set}
                            />
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        className={`sf-submit ${valid ? "sf-submit--ready" : ""}`}
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
                                <span className="sf-submit-icon"><Zap size={20} /></span>
                                <span>Buscar juegos compatibles</span>
                                <span className="sf-submit-arrow"><ArrowRight size={20} /></span>
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
