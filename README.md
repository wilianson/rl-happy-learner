# 🎓 Happy RL Trainer — Plataforma Interactiva de Aprendizaje por Refuerzo

> **Powered by FiloLabs** | Identidad UTEC

Plataforma educativa interactiva para aprender Reinforcement Learning (RL) de forma práctica. Incluye un backend FastAPI con WebSockets para entrenamiento en tiempo real y un frontend React/Vite con visualizaciones dinámicas.

## 🚀 Plataforma Web (Happy RL Trainer)

La plataforma incluye **11 algoritmos** organizados en 5 categorías:

| Categoría | Algoritmos | Entorno |
|-----------|-----------|---------|
| Multi-Armed Bandits | Multi-Armed Bandit | Custom |
| Programación Dinámica | Policy Iteration, Value Iteration | FrozenLake-v1 |
| Monte Carlo | Monte Carlo Control | Blackjack-v1 |
| Diferencia Temporal | SARSA, Q-Learning, Dyna-Q | CliffWalking-v1 / Taxi-v3 |
| Aproximación | VFA, DQN, REINFORCE, PPO, A2C | MountainCar / CartPole / LunarLander / Ant |

### Características

- 🎥 **Visualización en tiempo real** del agente en el entorno (vía WebSocket)
- 📈 **Gráfica de recompensa** por episodio en vivo
- 🔥 **Heatmap Q-values** con normalización correcta (azul oscuro → rojo)
- 📐 **Teoría matemática** renderizada con KaTeX para cada algoritmo
- 🎛️ **Hiperparámetros ajustables** mediante sliders interactivos

Para instrucciones de despliegue, ver [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## 📚 Scripts de Estudio (Standalone)

1. **`01_gymnasium_intro.py`**: Introducción básica a la API de Gymnasium.
2. **`02_q_learning.py`**: Q-Learning tabular en `CliffWalking-v1`.
3. **`03_dqn.py`**: Deep Q-Network con PyTorch en `CartPole-v1`.
4. **`04_reinforce.py`**: REINFORCE (Policy Gradient) en `CartPole-v1`.

```bash
pip install -r requirements.txt
python 01_gymnasium_intro.py
```

## 🧪 Tests Automatizados

### Backend (pytest)

```bash
python -m pytest backend/tests/ -v
```

### Frontend (Vitest)

```bash
# En la carpeta frontend/
node node_modules/vitest/vitest.mjs --run
```

Los tests cubren:
- Lógica de decaimiento ε multiplicativo en DQN
- Normalización del heatmap de Q-values (incluyendo el caso de rango cero)
- Interpolación de colores para el heatmap

## ⚙️ DQN — Epsilon Decay

El parámetro `ε Decay` en DQN usa un **factor multiplicativo** (rango 0.90–1.0):

```
ε ← max(ε_end, ε × factor)
```

Un valor de `0.995` reduce ε en 0.5% por paso, produciendo una transición suave de exploración a explotación.

## Conceptos Clave Implementados

* **Agente y Entorno**: Interacción paso a paso a través de acciones y observaciones.
* **Funciones de Valor (Q-Values)**: Estimación del retorno esperado a largo plazo.
* **Exploración vs Explotación (ε-greedy)**: Balance entre descubrir nuevas estrategias o usar la mejor conocida.
* **Experience Replay**: Memoria en DQN para romper correlación temporal.
* **Gradiente de Política**: Optimización directa de la política en REINFORCE.

