import { useState } from "react";
import {
  ALGORITHMS,
  ALGORITHM_CATEGORIES,
  type AlgorithmInfo,
} from "../data/algorithms";

interface SidebarProps {
  selectedAlgorithm: AlgorithmInfo;
  onSelectAlgorithm: (algo: AlgorithmInfo) => void;
  paramValues: Record<string, number>;
  onParamChange: (key: string, value: number) => void;
  onStartTraining: () => void;
  onStopTraining: () => void;
  isTraining: boolean;
}

export default function Sidebar({
  selectedAlgorithm,
  onSelectAlgorithm,
  paramValues,
  onParamChange,
  onStartTraining,
  onStopTraining,
  isTraining,
}: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>(
    selectedAlgorithm.category
  );

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'transparent', border: 'none', boxShadow: 'none', overflow: 'hidden', borderRadius: '50%' }}>
          <img src="/assets/happy_1.png" alt="Happy Mascot" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.2)', mixBlendMode: 'multiply' }} />
        </div>
        <div className="sidebar-logo-text">
          <h1 className="sidebar-logo-title">Happy RL</h1>
          <p className="sidebar-logo-subtitle">Trainer · UTEC</p>
        </div>
      </div>

      {/* Algorithm Nav */}
      <nav className="sidebar-nav" id="algorithm-nav">
        <span className="sidebar-section-label">Algoritmos</span>
        {ALGORITHM_CATEGORIES.map((cat) => {
          const algos = ALGORITHMS.filter((a) => a.category === cat.id);
          const isExpanded = expandedCategory === cat.id;

          return (
            <div key={cat.id} className="sidebar-category">
              <button
                className={`sidebar-category-btn ${isExpanded ? "expanded" : ""}`}
                onClick={() =>
                  setExpandedCategory(isExpanded ? "" : cat.id)
                }
                style={
                  { "--cat-color": cat.color } as React.CSSProperties
                }
              >
                <span
                  className="sidebar-category-dot"
                  style={{ background: cat.color }}
                />
                <span className="sidebar-category-label">
                  {cat.label}
                </span>
                <svg
                  className="sidebar-chevron"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isExpanded && (
                <div className="sidebar-category-items">
                  {algos.map((algo) => (
                    <button
                      key={algo.id}
                      id={`algo-btn-${algo.id}`}
                      className={`sidebar-algo-btn ${
                        selectedAlgorithm.id === algo.id ? "active" : ""
                      }`}
                      onClick={() => onSelectAlgorithm(algo)}
                    >
                      <span className="sidebar-algo-icon">
                        {algo.icon}
                      </span>
                      <span className="sidebar-algo-name">
                        {algo.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Params panel */}
      <div className="sidebar-params" id="params-panel">
        <span className="sidebar-section-label">Hiperparámetros</span>
        <div className="sidebar-params-list">
          {selectedAlgorithm.params.map((param) => (
            <div key={param.key} className="param-control">
              <div className="param-header">
                <label className="param-label" htmlFor={`param-${param.key}`}>
                  {param.label}
                </label>
                <span className="param-value">
                  {paramValues[param.key]?.toFixed(
                    param.step < 0.001 ? 8 : param.step < 0.1 ? 2 : 0
                  ) ?? param.default}
                </span>
              </div>
              <input
                id={`param-${param.key}`}
                type="range"
                className="param-slider"
                min={param.min}
                max={param.max}
                step={param.step}
                value={paramValues[param.key] ?? param.default}
                onChange={(e) =>
                  onParamChange(param.key, parseFloat(e.target.value))
                }
                disabled={isTraining}
              />
              <p className="param-desc">{param.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="sidebar-actions">
        {!isTraining ? (
          <button
            id="btn-start-training"
            className="btn-train"
            onClick={onStartTraining}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Entrenar Agente
          </button>
        ) : (
          <button
            id="btn-stop-training"
            className="btn-stop"
            onClick={onStopTraining}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Detener
          </button>
        )}
      </div>

      {/* Footer FiloLabs */}
      <div className="sidebar-footer">
        <div className="powered-by">
          <span>Powered by</span>
          <span className="powered-by-brand">FiloLabs</span>
        </div>
      </div>
    </aside>
  );
}
