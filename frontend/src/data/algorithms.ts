export interface AlgorithmParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  shortName: string;
  category: string;
  envName: string;
  envLabel: string;
  icon: string;
  description: string;
  params: AlgorithmParam[];
  theory: {
    title: string;
    sections: { heading: string; text: string; equation?: string }[];
  };
}

export const ALGORITHM_CATEGORIES = [
  { id: "bandit", label: "Multi-Armed Bandits", color: "#f59e0b" },
  { id: "dp", label: "Programación Dinámica", color: "#6c63ff" },
  { id: "mc", label: "Monte Carlo", color: "#00d4ff" },
  { id: "td", label: "Diferencia Temporal", color: "#34d399" },
  { id: "approx", label: "Aproximación", color: "#ff6bac" },
];

export const ALGORITHMS: AlgorithmInfo[] = [
  // ══════════════════════════════════════════════
  // DYNAMIC PROGRAMMING
  // ══════════════════════════════════════════════
  {
    id: "policy_iteration",
    name: "Policy Iteration",
    shortName: "PI",
    category: "dp",
    envName: "FrozenLake-v1",
    envLabel: "FrozenLake 4×4",
    icon: "",
    description:
      "Alterna entre evaluar una política (encontrando su función de valor) y mejorarla (haciendo greedy sobre el valor encontrado) hasta convergencia.",
    params: [
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento para recompensas futuras",
      },
      {
        key: "theta",
        label: "θ (Umbral)",
        min: 0.0000001,
        max: 0.01,
        step: 0.0000001,
        default: 0.00000001,
        description: "Umbral de convergencia para la evaluación",
      },
    ],
    theory: {
      title: "Policy Iteration (Sutton & Barto, Cap. 4)",
      sections: [
        {
          heading: "Idea Central",
          text: "Policy Iteration resuelve un MDP alternando dos pasos: **Evaluación de Política** (calcular $V^{\\pi}$) y **Mejora de Política** (construir $\\pi'$ greedy sobre $V^{\\pi}$). Se garantiza convergencia a la política óptima $\\pi^*$.",
        },
        {
          heading: "1. Evaluación de Política",
          text: "Dado una política π, calculamos su función de valor V^π usando la ecuación de Bellman iterativamente:",
          equation:
            "V^{\\pi}(s) = \\sum_a \\pi(a|s) \\sum_{s',r} p(s',r|s,a) \\left[ r + \\gamma V^{\\pi}(s') \\right]",
        },
        {
          heading: "2. Mejora de Política",
          text: "Construimos una nueva política greedy seleccionando en cada estado la acción que maximiza el valor Q:",
          equation:
            "\\pi'(s) = \\arg\\max_a \\sum_{s',r} p(s',r|s,a) \\left[ r + \\gamma V^{\\pi}(s') \\right]",
        },
        {
          heading: "Teorema de Mejora de Política",
          text: "Si $q^{\\pi}(s, \\pi'(s)) \\geq V^{\\pi}(s)$ para todo $s$, entonces $V^{\\pi'} \\geq V^{\\pi}$. El proceso termina cuando $\\pi = \\pi'$ (política estable = política óptima).",
          equation: "q^{\\pi}(s, \\pi'(s)) \\geq V^{\\pi}(s) \\implies V^{\\pi'}(s) \\geq V^{\\pi}(s)",
        },
      ],
    },
  },
  {
    id: "value_iteration",
    name: "Value Iteration",
    shortName: "VI",
    category: "dp",
    envName: "FrozenLake-v1",
    envLabel: "FrozenLake 4×4",
    icon: "",
    description:
      "Combina evaluación y mejora en un solo paso de actualización usando el operador de optimalidad de Bellman. Más eficiente que Policy Iteration.",
    params: [
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento para recompensas futuras",
      },
      {
        key: "theta",
        label: "θ (Umbral)",
        min: 0.0000001,
        max: 0.01,
        step: 0.0000001,
        default: 0.00000001,
        description: "Umbral de convergencia",
      },
    ],
    theory: {
      title: "Value Iteration (Sutton & Barto, Cap. 4)",
      sections: [
        {
          heading: "Idea Central",
          text: "Value Iteration simplifica Policy Iteration al **combinar la evaluación y mejora en una sola actualización**. En cada barrido, aplicamos directamente el operador de optimalidad de Bellman.",
        },
        {
          heading: "Ecuación de Optimalidad de Bellman",
          text: "La actualización de Value Iteration aplica el max directamente:",
          equation:
            "V_{k+1}(s) = \\max_a \\sum_{s',r} p(s',r|s,a) \\left[ r + \\gamma V_k(s') \\right]",
        },
        {
          heading: "Convergencia",
          text: "Iteramos hasta que el cambio máximo Δ = max_s |V_{k+1}(s) - V_k(s)| sea menor que un umbral θ. Al converger, extraemos la política óptima:",
          equation:
            "\\pi^*(s) = \\arg\\max_a \\sum_{s',r} p(s',r|s,a) \\left[ r + \\gamma V^*(s') \\right]",
        },
      ],
    },
  },

  // ══════════════════════════════════════════════
  // MONTE CARLO
  // ══════════════════════════════════════════════
  {
    id: "monte_carlo",
    name: "Monte Carlo Control",
    shortName: "MC",
    category: "mc",
    envName: "Blackjack-v1",
    envLabel: "Blackjack",
    icon: "",
    description:
      "Aprende directamente de episodios completos de experiencia. No requiere conocer la dinámica del entorno (model-free). Usa promedios de retornos para estimar Q.",
    params: [
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 1.0,
        description: "Factor de descuento",
      },
      {
        key: "epsilon",
        label: "ε (Exploración)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Probabilidad de exploración ε-greedy",
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 100,
        max: 5000,
        step: 100,
        default: 1000,
        description: "Número total de episodios a entrenar",
      },
    ],
    theory: {
      title: "Métodos de Monte Carlo (Sutton & Barto, Cap. 5)",
      sections: [
        {
          heading: "Idea Central",
          text: "Los métodos de Monte Carlo estiman funciones de valor promediando **retornos completos** observados tras visitar cada estado. A diferencia de DP, **no requieren un modelo** del entorno.",
        },
        {
          heading: "Retorno",
          text: "El retorno G_t es la suma de recompensas descontadas desde el paso t hasta el final del episodio:",
          equation: "G_t = R_{t+1} + \\gamma R_{t+2} + \\gamma^2 R_{t+3} + \\dots = \\sum_{k=0}^{T-t-1} \\gamma^k R_{t+k+1}",
        },
        {
          heading: "First-Visit MC",
          text: "La primera vez que se visita un par (s, a) en un episodio, promediamos el retorno observado:",
          equation: "Q(s,a) \\leftarrow \\text{promedio}(\\text{Retornos}(s,a))",
        },
        {
          heading: "Política ε-greedy",
          text: "Para garantizar exploración, usamos una política ε-greedy que selecciona la acción greedy con probabilidad 1-ε y una acción aleatoria con probabilidad ε:",
          equation:
            "\\pi(a|s) = \\begin{cases} 1 - \\varepsilon + \\frac{\\varepsilon}{|\\mathcal{A}|} & \\text{si } a = \\arg\\max_{a'} Q(s,a') \\\\ \\frac{\\varepsilon}{|\\mathcal{A}|} & \\text{en otro caso} \\end{cases}",
        },
      ],
    },
  },

  // ══════════════════════════════════════════════
  // TEMPORAL DIFFERENCE
  // ══════════════════════════════════════════════
  {
    id: "sarsa",
    name: "SARSA",
    shortName: "SARSA",
    category: "td",
    envName: "CliffWalking-v1",
    envLabel: "Cliff Walking",
    icon: "",
    description:
      "Método TD on-policy que actualiza Q(s,a) usando la siguiente acción realmente tomada (S,A,R,S',A'). Tiende a aprender políticas más conservadoras.",
    params: [
      {
        key: "alpha",
        label: "α (Tasa de aprendizaje)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Tamaño del paso de actualización",
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento",
      },
      {
        key: "epsilon",
        label: "ε (Exploración)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Probabilidad de exploración",
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 10,
        max: 500,
        step: 10,
        default: 100,
        description: "Número de episodios",
      },
    ],
    theory: {
      title: "SARSA: On-Policy TD Control (Sutton & Barto, Cap. 6)",
      sections: [
        {
          heading: "Idea Central",
          text: "SARSA es un algoritmo **on-policy** de diferencia temporal. Actualiza Q usando la transición completa (S, A, R, S', A') donde A' es la acción que **realmente se toma** bajo la política actual.",
        },
        {
          heading: "Regla de Actualización SARSA",
          text: "El nombre SARSA viene de los cinco elementos de la tupla de transición (S_t, A_t, R_{t+1}, S_{t+1}, A_{t+1}):",
          equation:
            "Q(S_t, A_t) \\leftarrow Q(S_t, A_t) + \\alpha \\left[ R_{t+1} + \\gamma Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t) \\right]",
        },
        {
          heading: "Error TD",
          text: "El error de diferencia temporal δ mide la discrepancia entre la estimación actual y el target bootstrap:",
          equation:
            "\\delta_t = R_{t+1} + \\gamma Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t)",
        },
        {
          heading: "On-policy vs. Off-policy",
          text: "SARSA evalúa y mejora la **misma política** que está usando para tomar decisiones. Esto hace que sea más conservador en entornos con penalizaciones severas (ej. Cliff Walking), ya que considera las acciones exploratorias del ε-greedy.",
        },
      ],
    },
  },
  {
    id: "q_learning",
    name: "Q-Learning",
    shortName: "QL",
    category: "td",
    envName: "CliffWalking-v1",
    envLabel: "Cliff Walking",
    icon: "",
    description:
      "Método TD off-policy que actualiza Q(s,a) usando la mejor acción posible en el estado siguiente, independientemente de la acción realmente tomada. Converge a la política óptima.",
    params: [
      {
        key: "alpha",
        label: "α (Tasa de aprendizaje)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Tamaño del paso de actualización",
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento",
      },
      {
        key: "epsilon",
        label: "ε (Exploración)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Probabilidad de exploración",
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 10,
        max: 500,
        step: 10,
        default: 100,
        description: "Número de episodios",
      },
    ],
    theory: {
      title: "Q-Learning: Off-Policy TD Control (Sutton & Barto, Cap. 6)",
      sections: [
        {
          heading: "Idea Central",
          text: "Q-Learning es un algoritmo **off-policy** que aprende directamente la función de valor-acción óptima Q*, independientemente de la política que se esté siguiendo para explorar.",
        },
        {
          heading: "Regla de Actualización Q-Learning",
          text: "A diferencia de SARSA, Q-Learning usa **max** sobre las acciones del siguiente estado en vez de la acción realmente tomada:",
          equation:
            "Q(S_t, A_t) \\leftarrow Q(S_t, A_t) + \\alpha \\left[ R_{t+1} + \\gamma \\max_a Q(S_{t+1}, a) - Q(S_t, A_t) \\right]",
        },
        {
          heading: "Diferencia con SARSA",
          text: "El target de Q-Learning usa max_a Q(S', a) (off-policy), mientras SARSA usa Q(S', A') donde A' es la acción del ε-greedy (on-policy). Esto hace que Q-Learning encuentre la política óptima pero sea más \"agresivo\" cerca de precipicios.",
          equation:
            "\\underbrace{R + \\gamma \\max_a Q(S',a)}_{\\text{Q-Learning}} \\quad vs \\quad \\underbrace{R + \\gamma Q(S', A')}_{\\text{SARSA}}",
        },
      ],
    },
  },

  // ══════════════════════════════════════════════
  // APPROXIMATION
  // ══════════════════════════════════════════════
  {
    id: "vfa",
    name: "Value Function Approximation",
    shortName: "VFA",
    category: "approx",
    envName: "MountainCar-v0",
    envLabel: "Mountain Car",
    icon: "",
    description:
      "Extiende Q-Learning a espacios de estados continuos usando una aproximación lineal de la función de valor con pesos entrenables.",
    params: [
      {
        key: "alpha",
        label: "α (Tasa de aprendizaje)",
        min: 0.001,
        max: 0.1,
        step: 0.001,
        default: 0.01,
        description: "Tasa de aprendizaje para los pesos",
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento",
      },
      {
        key: "epsilon",
        label: "ε (Exploración)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Probabilidad de exploración",
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 50,
        max: 1000,
        step: 50,
        default: 200,
        description: "Número de episodios",
      },
    ],
    theory: {
      title: "Aproximación de la Función de Valor (Sutton & Barto, Cap. 9-10)",
      sections: [
        {
          heading: "¿Por qué Aproximar?",
          text: "Cuando el espacio de estados es continuo o muy grande (como Mountain Car con posición y velocidad), **no podemos usar una tabla Q**. Necesitamos parametrizar Q con un vector de pesos **w**.",
        },
        {
          heading: "Aproximación Lineal",
          text: "La forma más simple de aproximación usa un producto punto entre los pesos y el vector de estado (features):",
          equation: "\\hat{q}(s, a, \\mathbf{w}) = \\mathbf{w}_a^\\top \\mathbf{x}(s)",
        },
        {
          heading: "Actualización por Gradiente",
          text: "Los pesos se actualizan minimizando el error TD al cuadrado usando descenso de gradiente semi-estocástico:",
          equation:
            "\\mathbf{w} \\leftarrow \\mathbf{w} + \\alpha \\left[ R + \\gamma \\max_a \\hat{q}(S', a, \\mathbf{w}) - \\hat{q}(S, A, \\mathbf{w}) \\right] \\nabla_\\mathbf{w} \\hat{q}(S, A, \\mathbf{w})",
        },
        {
          heading: "Deadly Triad",
          text: "La combinación de (1) aproximación de funciones, (2) bootstrapping y (3) aprendizaje off-policy puede causar inestabilidad - conocida como la **Tríada Mortal** (Deadly Triad). Métodos como DQN abordan esto con técnicas como target networks y experience replay.",
        },
      ],
    },
  },
  {
    id: "dqn",
    name: "Deep Q-Network",
    shortName: "DQN",
    category: "approx",
    envName: "CartPole-v1",
    envLabel: "CartPole",
    icon: "",
    description:
      "Usa una red neuronal profunda para aproximar Q*. Incorpora Experience Replay y Target Network para estabilizar el entrenamiento.",
    params: [
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento para recompensas futuras",
      },
      {
        key: "lr",
        label: "Learning Rate",
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        default: 0.001,
        description: "Tasa de aprendizaje del optimizador Adam",
      },
      {
        key: "batch_size",
        label: "Batch Size",
        min: 16,
        max: 256,
        step: 16,
        default: 64,
        description: "Número de muestras para cada paso de entrenamiento",
      },
      {
        key: "target_update",
        label: "Target Update",
        min: 1,
        max: 50,
        step: 1,
        default: 5,
        description: "Frecuencia (en episodios) para actualizar la red objetivo",
      },
      {
        key: "epsilon_decay",
        label: "ε Decay (factor)",
        min: 0.9,
        max: 1.0,
        step: 0.001,
        default: 0.995,
        description: "Factor multiplicativo de decaimiento por paso",
      },
      {
        key: "memory_size",
        label: "Memory Size",
        min: 1000,
        max: 20000,
        step: 1000,
        default: 5000,
        description: "Capacidad del buffer de Experience Replay",
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 50,
        max: 1000,
        step: 10,
        default: 200,
        description: "Número total de episodios",
      },
    ],
    theory: {
      title: "Deep Q-Networks (Mnih et al., 2015)",
      sections: [
        {
          heading: "Idea Central",
          text: "DQN combina Q-Learning con una **red neuronal profunda** como aproximador de la función Q. Fue el primer método en alcanzar rendimiento sobrehumano en juegos de Atari directamente desde píxeles.",
        },
        {
          heading: "Red Neuronal Q",
          text: "Una red neuronal θ mapea estados a valores Q para cada acción. El loss se calcula contra un target que usa una red separada θ⁻:",
          equation:
            "\\mathcal{L}(\\theta) = \\mathbb{E} \\left[ \\left( r + \\gamma \\max_{a'} Q(s', a'; \\theta^-) - Q(s, a; \\theta) \\right)^2 \\right]",
        },
        {
          heading: "Experience Replay",
          text: "Las transiciones (s, a, r, s', done) se almacenan en un **buffer de replay** D. En cada paso de entrenamiento, se muestrea un mini-batch aleatorio para romper la correlación temporal:",
          equation:
            "\\theta \\leftarrow \\theta - \\alpha \\nabla_\\theta \\mathcal{L}(\\theta) \\quad \\text{con } (s,a,r,s') \\sim \\text{Uniform}(D)",
        },
        {
          heading: "Target Network",
          text: "La red objetivo θ⁻ se actualiza periódicamente copiando los pesos de la red principal θ. Esto **estabiliza** el entrenamiento evitando que el target cambie con cada actualización.",
          equation: "\\theta^- \\leftarrow \\theta \\quad \\text{cada } C \\text{ pasos}",
        },
        {
          heading: "Decaimiento ε",
          text: "La exploración decae exponencialmente desde ε_start hasta ε_end:",
          equation:
            "\\varepsilon = \\varepsilon_{\\text{end}} + (\\varepsilon_{\\text{start}} - \\varepsilon_{\\text{end}}) \\cdot e^{-\\frac{\\text{steps}}{\\tau}}",
        },
      ],
    },
  },
  {
    id: "reinforce",
    name: "REINFORCE (Policy Gradient)",
    shortName: "PG",
    category: "approx",
    envName: "LunarLander-v3",
    envLabel: "Lunar Lander",
    icon: "🚀",
    description:
      "Aprende una política estocástica directamente maximizando la recompensa esperada mediante ascenso de gradiente, utilizando el teorema de gradiente de política.",
    params: [
      {
        key: "lr",
        label: "Learning Rate",
        min: 0.0001,
        max: 0.05,
        step: 0.0001,
        default: 0.01,
        description: "Tasa de aprendizaje del optimizador Adam para la red de política",
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.9,
        max: 1.0,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento para recompensas futuras",
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 50,
        max: 5000,
        step: 50,
        default: 500,
        description: "Número total de episodios",
      },
    ],
    theory: {
      title: "REINFORCE: Algoritmos de Gradiente de Política (Sutton & Barto, Cap. 13)",
      sections: [
        {
          heading: "Idea Central",
          text: "En lugar de aprender una función de valor para derivar una política, REINFORCE parametriza la política directamente con una red neuronal $\\pi(a|s, \\boldsymbol{\\theta})$ y optimiza los parámetros $\\boldsymbol{\\theta}$ por ascenso de gradiente para maximizar la recompensa total.",
        },
        {
          heading: "Teorema de Gradiente de Política",
          text: "El gradiente del objetivo esperado de recompensa $J(\\boldsymbol{\\theta})$ es proporcional a la expectativa del retorno por el gradiente del logaritmo de la política:",
          equation:
            "\\nabla J(\\boldsymbol{\\theta}) \\propto \\mathbb{E}_{\\pi} \\left[ G_t \\nabla_\\boldsymbol{\\theta} \\ln \\pi(A_t | S_t, \\boldsymbol{\\theta}) \\right]",
        },
        {
          heading: "Regla de Actualización",
          text: "Muestreamos episodios completos. Para cada paso $t$, actualizamos los pesos $\\boldsymbol{\\theta}$ usando el retorno empírico $G_t$ a partir del tiempo $t$:",
          equation:
            "\\boldsymbol{\\theta} \\leftarrow \\boldsymbol{\\theta} + \\alpha G_t \\nabla_\\boldsymbol{\\theta} \\ln \\pi(A_t | S_t, \\boldsymbol{\\theta})",
        },
        {
          heading: "Reducción de Varianza (Baseline)",
          text: "REINFORCE sufre de alta varianza empírica. Restar una media móvil (baseline) de los retornos $G_t$ reduce la varianza sin sesgar el gradiente esperado, haciendo el aprendizaje mucho más estable.",
        },
      ],
    },
  },
  {
    id: "bandit",
    name: "Multi-Armed Bandit",
    shortName: "MAB",
    category: "bandit",
    envName: "Custom",
    envLabel: "10-Armed Bandit",
    icon: "🎰",
    description: "Algoritmo básico para explorar y explotar en problemas de un solo estado.",
    params: [
      {
        key: "k_arms",
        label: "K (Brazos)",
        min: 2,
        max: 100,
        step: 1,
        default: 10,
        description: "Número de acciones posibles"
      },
      {
        key: "epsilon",
        label: "ε (Exploración)",
        min: 0.0,
        max: 1.0,
        step: 0.01,
        default: 0.1,
        description: "Probabilidad de exploración"
      },
      {
        key: "episodes",
        label: "Pasos",
        min: 100,
        max: 10000,
        step: 100,
        default: 1000,
        description: "Número de pasos de interacción"
      }
    ],
    theory: {
      title: "Multi-Armed Bandits (Sutton & Barto, Cap. 2)",
      sections: [
        {
          heading: "Idea Central",
          text: "El problema del Multi-Armed Bandit modela situaciones de toma de decisión de un solo paso donde cada acción (brazo) tiene una distribución de recompensa desconocida."
        }
      ]
    }
  },
  {
    id: "dynaq",
    name: "Dyna-Q",
    shortName: "Dyna-Q",
    category: "td",
    envName: "Taxi-v3",
    envLabel: "Taxi",
    icon: "🚕",
    description: "Método de aprendizaje basado en modelos que integra Q-Learning directo con planificación utilizando un modelo simulado del entorno.",
    params: [
      {
        key: "alpha",
        label: "α (Tasa de aprendizaje)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Tamaño del paso de actualización"
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento"
      },
      {
        key: "epsilon",
        label: "ε (Exploración)",
        min: 0.01,
        max: 1,
        step: 0.01,
        default: 0.1,
        description: "Probabilidad de exploración"
      },
      {
        key: "planning_steps",
        label: "Pasos de Planificación",
        min: 0,
        max: 100,
        step: 1,
        default: 10,
        description: "Número de actualizaciones de planificación por paso real"
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 10,
        max: 1000,
        step: 10,
        default: 200,
        description: "Número de episodios"
      }
    ],
    theory: {
      title: "Arquitectura Dyna (Sutton & Barto, Cap. 8)",
      sections: [
        {
          heading: "Idea Central",
          text: "Dyna-Q aprende simultáneamente un modelo del entorno y una política. Por cada paso real, el algoritmo realiza múltiples pasos simulados ('planificación') a partir de experiencias pasadas para acelerar el aprendizaje."
        }
      ]
    }
  },
  {
    id: "ppo",
    name: "Proximal Policy Optimization",
    shortName: "PPO",
    category: "approx",
    envName: "LunarLanderContinuous-v3",
    envLabel: "Lunar Lander Cont.",
    icon: "🎯",
    description: "Algoritmo de gradiente de política avanzado que usa una función de pérdida acortada (clipped) para evitar actualizaciones destructivamente grandes de la política.",
    params: [
      {
        key: "lr",
        label: "Learning Rate",
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        default: 0.0003,
        description: "Tasa de aprendizaje"
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.9,
        max: 1.0,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento"
      },
      {
        key: "epsilon_clip",
        label: "ε (Clip)",
        min: 0.1,
        max: 0.3,
        step: 0.01,
        default: 0.2,
        description: "Rango de clipping para la política"
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 50,
        max: 5000,
        step: 50,
        default: 500,
        description: "Número total de episodios"
      }
    ],
    theory: {
      title: "Proximal Policy Optimization (Schulman et al., 2017)",
      sections: [
        {
          heading: "Idea Central",
          text: "PPO busca la estabilidad de Trust Region Policy Optimization (TRPO) pero con una implementación mucho más simple al acortar la probabilidad de las acciones para que no cambien demasiado en una sola actualización."
        }
      ]
    }
  },
  {
    id: "a2c",
    name: "Advantage Actor-Critic",
    shortName: "A2C",
    category: "approx",
    envName: "Ant-v4",
    envLabel: "Ant",
    icon: "🐜",
    description: "Combina gradiente de política (Actor) con aproximación de función de valor (Critic) usando la Ventaja (Advantage) para reducir varianza.",
    params: [
      {
        key: "lr",
        label: "Learning Rate",
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        default: 0.0003,
        description: "Tasa de aprendizaje"
      },
      {
        key: "gamma",
        label: "γ (Descuento)",
        min: 0.9,
        max: 1.0,
        step: 0.01,
        default: 0.99,
        description: "Factor de descuento"
      },
      {
        key: "entropy_coef",
        label: "Coef. Entropía",
        min: 0.001,
        max: 0.1,
        step: 0.001,
        default: 0.01,
        description: "Fomenta la exploración"
      },
      {
        key: "episodes",
        label: "Episodios",
        min: 50,
        max: 2000,
        step: 50,
        default: 200,
        description: "Número total de episodios"
      }
    ],
    theory: {
      title: "Advantage Actor-Critic",
      sections: [
        {
          heading: "Idea Central",
          text: "El Actor actualiza la política en la dirección sugerida por el Critic. El Critic estima el valor del estado para calcular la Ventaja (Advantage), reduciendo enormemente la varianza comparado con REINFORCE."
        }
      ]
    }
  }
];

export function getAlgorithmById(id: string): AlgorithmInfo | undefined {
  return ALGORITHMS.find((a) => a.id === id);
}

export function getAlgorithmsByCategory(
  categoryId: string
): AlgorithmInfo[] {
  return ALGORITHMS.filter((a) => a.category === categoryId);
}
