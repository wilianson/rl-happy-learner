import { useState, useCallback, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import TheorySection from "./components/TheorySection";
import LiveDashboard from "./components/LiveDashboard";
import { ALGORITHMS, type AlgorithmInfo } from "./data/algorithms";
import { useTrainingSocket } from "./hooks/useTrainingSocket";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmInfo>(
    ALGORITHMS[0]
  );
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ALGORITHMS[0].params.forEach((p) => {
      initial[p.key] = p.default;
    });
    return initial;
  });

  const { state: trainingState, startTraining, stopTraining } =
    useTrainingSocket();

  // When algorithm changes, reset params to defaults
  const handleSelectAlgorithm = useCallback(
    (algo: AlgorithmInfo) => {
      if (trainingState.isRunning) return; // Don't switch while training
      setSelectedAlgorithm(algo);
      const defaults: Record<string, number> = {};
      algo.params.forEach((p) => {
        defaults[p.key] = p.default;
      });
      setParamValues(defaults);
    },
    [trainingState.isRunning]
  );

  const handleParamChange = useCallback((key: string, value: number) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStartTraining = useCallback(() => {
    const config: Record<string, number | string> = {
      env_name: selectedAlgorithm.envName,
      ...paramValues,
    };
    startTraining(selectedAlgorithm.id, config);
  }, [selectedAlgorithm, paramValues, startTraining]);

  const handleStopTraining = useCallback(() => {
    stopTraining();
  }, [stopTraining]);

  // Keyboard shortcut: Enter to start training
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !trainingState.isRunning) {
        handleStartTraining();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleStartTraining, trainingState.isRunning]);

  return (
    <>
      <Sidebar
        selectedAlgorithm={selectedAlgorithm}
        onSelectAlgorithm={handleSelectAlgorithm}
        paramValues={paramValues}
        onParamChange={handleParamChange}
        onStartTraining={handleStartTraining}
        onStopTraining={handleStopTraining}
        isTraining={trainingState.isRunning}
      />
      <main className="main-content" id="main-content">
        {/* Decorative background glow */}
        <div className="bg-glow" />

        <div className="content-scroll">
          <TheorySection algorithm={selectedAlgorithm} />
          <LiveDashboard trainingState={trainingState} />
        </div>
      </main>
    </>
  );
}

export default App;
