import { useRef, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { TrainingState } from "../hooks/useTrainingSocket";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface LiveDashboardProps {
  trainingState: TrainingState;
}

export default function LiveDashboard({
  trainingState,
}: LiveDashboardProps) {
  const {
    isRunning,
    currentEpisode,
    currentStep,
    currentFrame,
    rewardHistory,
    qValues,
    error,
  } = trainingState;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render frame to canvas for smooth playback
  useEffect(() => {
    if (!currentFrame || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = currentFrame;
  }, [currentFrame]);

  // Chart data
  const chartData = useMemo(() => {
    const labels = rewardHistory.map((r) => `${r.episode}`);
    return {
      labels,
      datasets: [
        {
          label: "Recompensa acumulada",
          data: rewardHistory.map((r) => r.reward),
          borderColor: "#6c63ff",
          backgroundColor: "rgba(108, 99, 255, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [rewardHistory]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 } as const,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#9ca3b0", font: { family: "Inter", size: 12 } },
        },
        tooltip: {
          backgroundColor: "#1f2028",
          titleColor: "#f0f0f5",
          bodyColor: "#9ca3b0",
          borderColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Episodio", color: "#5a5f72" },
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#5a5f72", maxTicksLimit: 15 },
        },
        y: {
          title: { display: true, text: "Recompensa", color: "#5a5f72" },
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#5a5f72" },
        },
      },
    }),
    []
  );

  // Q-Value Heatmap rendering
  const qHeatmap = useMemo(() => {
    if (!qValues || qValues.length === 0) return null;
    const numStates = qValues.length;

    // Flatten to find min/max
    const flat = qValues.flat();
    const minQ = Math.min(...flat);
    const maxQ = Math.max(...flat);
    const range = maxQ - minQ || 1;

    // For grid-based envs (e.g. 4x4 FrozenLake, or 4x12 CliffWalking)
    let gridCols = Math.ceil(Math.sqrt(numStates));
    if (numStates === 16) gridCols = 4; // FrozenLake
    if (numStates === 48) gridCols = 12; // CliffWalking
    const gridRows = Math.ceil(numStates / gridCols);

    return (
      <div className="heatmap-container">
        <h3 className="heatmap-title">
          Función Q — max<sub>a</sub> Q(s,a)
        </h3>
        <div
          className="heatmap-grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {Array.from({ length: gridRows * gridCols }).map((_, idx) => {
            if (idx >= numStates) {
              return <div key={idx} className="heatmap-cell empty" />;
            }
            const maxQForState = Math.max(...qValues[idx]);
            const normalized = (maxQForState - minQ) / range;

            // Color interpolation: dark purple → cyan
            const r = Math.round(30 + (0 - 30) * normalized);
            const g = Math.round(20 + (212 - 20) * normalized);
            const b = Math.round(60 + (255 - 60) * normalized);

            return (
              <div
                key={idx}
                className="heatmap-cell"
                style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                title={`s=${idx}, max Q=${maxQForState.toFixed(3)}`}
              >
                <span className="heatmap-cell-value">
                  {maxQForState.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="heatmap-legend">
          <span className="heatmap-legend-min">{minQ.toFixed(2)}</span>
          <div className="heatmap-legend-bar" />
          <span className="heatmap-legend-max">{maxQ.toFixed(2)}</span>
        </div>
      </div>
    );
  }, [qValues]);

  return (
    <section className="live-dashboard" id="live-dashboard">
      {/* Status bar */}
      <div className="dashboard-status">
        <div className="status-group">
          <div className={`status-dot ${isRunning ? "running" : ""}`} />
          <span className="status-label">
            {isRunning
              ? "Entrenando..."
              : rewardHistory.length > 0
                ? "Completado"
                : "Esperando inicio"}
          </span>
        </div>
        <div className="status-metrics">
          <div className="status-metric">
            <span className="status-metric-label">Episodio</span>
            <span className="status-metric-value">{currentEpisode}</span>
          </div>
          <div className="status-metric">
            <span className="status-metric-label">Paso</span>
            <span className="status-metric-value">{currentStep}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="dashboard-error" id="training-error">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Grid layout */}
      <div className="dashboard-grid">
        {/* Video frame */}
        <div className="dashboard-card video-card" id="video-panel">
          <h3 className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Visualización del Entorno
          </h3>
          <div className="video-container">
            {currentFrame ? (
              <canvas ref={canvasRef} className="video-canvas" />
            ) : (
              <div className="video-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p>Inicia el entrenamiento para ver al agente</p>
              </div>
            )}
          </div>
        </div>

        {/* Reward chart */}
        <div className="dashboard-card chart-card" id="chart-panel">
          <h3 className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Recompensa vs. Episodio
          </h3>
          <div className="chart-container">
            {rewardHistory.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="chart-placeholder">
                <p>Los datos de recompensa se graficarán aquí en tiempo real</p>
              </div>
            )}
          </div>
        </div>

        {/* Q-value heatmap (if data present) */}
        {qValues && qValues.length > 0 && (
          <div className="dashboard-card heatmap-card" id="heatmap-panel">
            {qHeatmap}
          </div>
        )}
      </div>
    </section>
  );
}
