import { useState, useRef, useCallback } from "react";

export interface TrainingUpdate {
  type: "update" | "complete" | "error";
  episode?: number;
  step?: number;
  frame?: string; // base64 JPEG
  reward?: number;
  q_values?: number[][];
  done?: boolean;
  message?: string;
}

export interface TrainingState {
  isRunning: boolean;
  isConnected: boolean;
  currentEpisode: number;
  currentStep: number;
  currentFrame: string | null;
  rewardHistory: { episode: number; reward: number }[];
  qValues: number[][] | null;
  error: string | null;
}

// En producción, VITE_WS_URL se inyecta como variable de entorno en Vercel/Render
// En desarrollo local, apunta a localhost:8001
const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ?? "ws://localhost:8001/ws/train";


export function useTrainingSocket() {
  const [state, setState] = useState<TrainingState>({
    isRunning: false,
    isConnected: false,
    currentEpisode: 0,
    currentStep: 0,
    currentFrame: null,
    rewardHistory: [],
    qValues: null,
    error: null,
  });

  const socketRef = useRef<WebSocket | null>(null);
  const rewardMapRef = useRef<Map<number, number>>(new Map());

  const startTraining = useCallback(
    (algorithmId: string, config: Record<string, number | string>) => {
      // Clean up any existing connection
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Reset state
      rewardMapRef.current = new Map();
      setState({
        isRunning: true,
        isConnected: false,
        currentEpisode: 0,
        currentStep: 0,
        currentFrame: null,
        rewardHistory: [],
        qValues: null,
        error: null,
      });

      const ws = new WebSocket(`${WS_BASE_URL}/${algorithmId}`);
      socketRef.current = ws;

      ws.onopen = () => {
        setState((prev) => ({ ...prev, isConnected: true }));
        ws.send(JSON.stringify(config));
      };

      ws.onmessage = (event) => {
        const data: TrainingUpdate = JSON.parse(event.data);

        if (data.type === "update") {
          // Track per-episode reward (keep latest per episode)
          if (data.episode !== undefined && data.reward !== undefined) {
            rewardMapRef.current.set(data.episode, data.reward);
          }

          const rewardHistory = Array.from(
            rewardMapRef.current.entries()
          )
            .sort(([a], [b]) => a - b)
            .map(([episode, reward]) => ({ episode, reward }));

          setState((prev) => ({
            ...prev,
            currentEpisode: data.episode ?? prev.currentEpisode,
            currentStep: data.step ?? prev.currentStep,
            currentFrame: data.frame
              ? `data:image/jpeg;base64,${data.frame}`
              : prev.currentFrame,
            rewardHistory,
            qValues: data.q_values ?? prev.qValues,
          }));
        } else if (data.type === "complete") {
          setState((prev) => ({
            ...prev,
            isRunning: false,
            isConnected: false,
          }));
        } else if (data.type === "error") {
          setState((prev) => ({
            ...prev,
            isRunning: false,
            isConnected: false,
            error: data.message ?? "Error desconocido",
          }));
        }
      };

      ws.onerror = () => {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          isConnected: false,
          error: "No se pudo conectar al servidor. ¿Está corriendo el backend en localhost:8000?",
        }));
      };

      ws.onclose = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isRunning: false,
        }));
      };
    },
    []
  );

  const stopTraining = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isConnected: false,
    }));
  }, []);

  return { state, startTraining, stopTraining };
}
