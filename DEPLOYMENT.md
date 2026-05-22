# 🚀 Guía de Despliegue — Happy RL Trainer

> **Powered by FiloLabs** | Identidad UTEC

Guía paso a paso para compilar, ejecutar y desplegar la plataforma educativa interactiva de Reinforcement Learning.

---

## 📋 Requisitos Previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|----------|
| **Python** | 3.10+ | [python.org](https://python.org) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **pip** | 23+ | Incluido con Python |
| **npm** | 9+ | Incluido con Node.js |

> **Nota**: Para `DQN` se requiere PyTorch. Si no tienes GPU CUDA, PyTorch CPU es suficiente.

---

## 🖥️ Ejecución Local

### 1. Clonar / Descargar el proyecto

```bash
cd rl_course_material
```

### 2. Instalar dependencias del Backend

```bash
cd backend
pip install -r requirements.txt
```

> Para instalar PyTorch CPU (si no tienes CUDA):
> ```bash
> pip install torch --index-url https://download.pytorch.org/whl/cpu
> ```

### 3. Iniciar el servidor Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Windows**: Usa siempre `python -m uvicorn` en lugar de `uvicorn` directamente, ya que la carpeta `Scripts` de Python puede no estar en el PATH.

El servidor WebSocket estará disponible en `ws://localhost:8000/ws/train/{algorithm}`.

### 4. Instalar dependencias del Frontend

```bash
cd frontend
npm install
```

### 5. Iniciar el servidor de desarrollo Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

### 6. ¡Listo!

Abre tu navegador en `http://localhost:5173`. Selecciona un algoritmo, ajusta los hiperparámetros y haz clic en **"Entrenar Agente"**.

---

## 🏗️ Compilación para Producción

### Frontend (Build estático)

```bash
cd frontend
npm run build
```

Esto genera una carpeta `dist/` con los archivos estáticos optimizados.

### Backend

No requiere compilación. Se ejecuta directamente con `uvicorn`.

---

## ☁️ Despliegue en la Nube

### Opción A: Render.com (Recomendado)

#### Backend (Web Service)
1. Crea un **Web Service** en [Render](https://render.com)
2. Conecta tu repositorio
3. Configura:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3
4. Copia la URL del servicio (ej. `https://rl-lab-backend.onrender.com`)

#### Frontend (Static Site)
1. Crea un **Static Site** en Render
2. Configura:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
3. Actualiza la URL del WebSocket en `useTrainingSocket.ts` para apuntar al backend de Render.

### Opción B: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# En el servidor
sudo apt update && sudo apt install python3-pip nodejs npm nginx -y

# Backend con supervisor/systemd
pip3 install -r backend/requirements.txt
nohup python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# Frontend
cd frontend && npm install && npm run build
# Copiar dist/ al directorio de Nginx
sudo cp -r dist/* /var/www/html/
```

### Opción C: Docker (Avanzado)

Ejemplo de `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    command: python -m uvicorn main:app --host 0.0.0.0 --port 8000

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

---

## ⚙️ Variables de Configuración

| Variable | Descripción | Default |
|----------|-------------|---------|
| `WS_BASE_URL` | URL base del WebSocket backend | `ws://localhost:8000/ws/train` |
| `PORT` (backend) | Puerto del servidor FastAPI | `8000` |

Para cambiar la URL del WebSocket, edita `frontend/src/hooks/useTrainingSocket.ts`:

```typescript
const WS_BASE_URL = "wss://tu-dominio.com/ws/train";
```

---

## 🧪 Tests Automatizados

### Backend — pytest

```bash
# Desde la raíz del proyecto
python -m pytest backend/tests/ -v
```

Tests incluidos:
- `test_epsilon_decay_logic`: Verifica que el decaimiento ε multiplicativo funcione correctamente.
- `test_dqn_config_loading`: Verifica la carga de configuración del DQN.

### Frontend — Vitest

```bash
# Desde la carpeta frontend/
node node_modules/vitest/vitest.mjs --run
```

Tests incluidos (5 en total en `src/utils/__tests__/heatmap.test.ts`):
- `normalizeValue`: Rango cero → retorna 0; normalización correcta en [0,1].
- `interpolateColor`: Azul oscuro para 0, rojo brillante para 1, color medio para 0.5.

---

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| `uvicorn` no se reconoce en Windows | Usa `python -m uvicorn` en lugar de `uvicorn` directamente |
| Error de conexión WebSocket | Verifica que el backend esté corriendo en el puerto 8000 |
| `ModuleNotFoundError: gymnasium` | `pip install gymnasium` |
| PyTorch no instala | Usa la URL de CPU: `pip install torch --index-url https://download.pytorch.org/whl/cpu` |
| CORS error en el navegador | El backend ya incluye CORS permisivo (`allow_origins=["*"]`) |
| Gymnasium render falla | Instala `pip install pygame` para entornos que lo requieran |
| `npm` bloqueado en PowerShell | Usa `node node_modules/vitest/vitest.mjs --run` directamente |

---

## 📁 Estructura del Proyecto

```
rl_course_material/
├── backend/
│   ├── main.py                 # Servidor FastAPI + WebSocket
│   ├── requirements.txt        # Dependencias Python
│   ├── algorithms/
│   │   ├── dp.py               # Policy Iteration, Value Iteration
│   │   ├── mc.py               # Monte Carlo Control
│   │   ├── td.py               # SARSA, Q-Learning
│   │   ├── fa.py               # Value Function Approximation
│   │   └── dqn.py              # Deep Q-Network (ε multiplicativo)
│   └── tests/
│       └── test_algorithms.py  # pytest: ε decay + config loading
├── frontend/
│   ├── index.html              # Entry point HTML
│   ├── package.json            # Dependencias Node.js (incluye vitest)
│   ├── vite.config.ts          # Configuración Vite
│   └── src/
│       ├── main.tsx            # React entry point
│       ├── App.tsx             # Componente principal
│       ├── App.css             # Estilos de componentes
│       ├── index.css           # Design system (tokens)
│       ├── data/
│       │   └── algorithms.ts   # Definiciones de algoritmos + teoría
│       ├── hooks/
│       │   └── useTrainingSocket.ts  # Hook de WebSocket
│       ├── components/
│       │   ├── Sidebar.tsx     # Navegación + hiperparámetros
│       │   ├── TheorySection.tsx # Teoría con KaTeX
│       │   └── LiveDashboard.tsx # Video + Chart + Heatmap
│       ├── utils/
│       │   ├── heatmap.ts      # Utilidad: normalización + colores
│       │   └── __tests__/
│       │       └── heatmap.test.ts  # Vitest: 5 tests de heatmap
│       └── types/
│           └── react-katex.d.ts # Tipos para react-katex
├── README.md                   # Documentación principal
└── DEPLOYMENT.md               # Esta guía
```
