# Curso de Aprendizaje por Refuerzo con Gymnasium

Este repositorio contiene un conjunto de scripts en Python diseñados como material de estudio para iniciarse en el Aprendizaje por Refuerzo (Reinforcement Learning) utilizando la biblioteca oficial `gymnasium`.

## Estructura del Material

1. **`01_gymnasium_intro.py`**: Introducción básica a la API de Gymnasium. Muestra cómo instanciar un entorno, obtener observaciones y aplicar acciones aleatorias utilizando el entorno interactivo.
2. **`02_q_learning.py`**: Implementación de **Q-Learning** (Tabular). Resuelve el entorno `CliffWalking-v0` creando y actualizando una tabla discreta de valores Q basados en la Ecuación de Bellman.
3. **`03_dqn.py`**: **Deep Q-Network (DQN)**. Combina el concepto de Q-Learning con Redes Neuronales Profundas (usando PyTorch) para resolver `CartPole-v1`, manejando espacios de estado continuos. Introduce el *Replay Buffer* y la *Target Network*.
4. **`04_reinforce.py`**: Algoritmo **REINFORCE** (Policy Gradient básico). En lugar de estimar el valor de las acciones, optimiza directamente la política (la probabilidad de qué acción tomar) mediante redes neuronales en `CartPole-v1`.

## Requisitos

Para ejecutar estos scripts, necesitas tener instalado Python y las siguientes bibliotecas. Puedes instalarlas ejecutando:

```bash
pip install -r requirements.txt
```

*(Nota: PyTorch puede requerir una instalación específica dependiendo de tu sistema operativo y de si utilizas CUDA. Consulta [pytorch.org](https://pytorch.org/) para el comando exacto).*

## Cómo Ejecutar

Puedes ejecutar cada archivo de forma independiente desde tu terminal para ver el proceso y gráficas de entrenamiento:

```bash
python 01_gymnasium_intro.py
python 02_q_learning.py
python 03_dqn.py
python 04_reinforce.py
```

## Conceptos Clave Implementados

* **Agente y Entorno (Agent & Environment)**: Interacción paso a paso a través de acciones y observaciones.
* **Recompensa (Reward)**: Señal de retroalimentación que el agente intenta maximizar.
* **Política (Policy)**: Estrategia que sigue el agente para decidir acciones a partir de un estado.
* **Funciones de Valor (Value Functions)**: Estimación del retorno esperado a largo plazo (e.g., Q-Values).
* **Exploración vs Explotación (Epsilon-greedy)**: El balance entre descubrir nuevas estrategias aleatorias o usar la mejor conocida.
* **Repetición de Experiencia (Experience Replay)**: Memoria utilizada en DQN para romper la correlación temporal entre las muestras de entrenamiento.
* **Gradiente de Política (Policy Gradient)**: Optimización utilizando logaritmo de probabilidades ponderado por el retorno.
