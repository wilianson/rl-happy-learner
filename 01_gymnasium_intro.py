"""
01_gymnasium_intro.py

Este script es una introducción a cómo funcionan los entornos de Gymnasium.
Muestra el ciclo básico de interacción entre un agente (en este caso, aleatorio)
y el entorno.
"""
import gymnasium as gym

def run_random_agent(env_name="CartPole-v1", episodes=3):
    # Crear el entorno
    # render_mode="human" permite ver la simulación en una ventana interactiva.
    env = gym.make(env_name, render_mode="human")
    
    for episode in range(episodes):
        # Reiniciar el entorno al inicio de cada episodio
        observation, info = env.reset()
        terminated = False
        truncated = False
        total_reward = 0
        
        print(f"--- Iniciando Episodio {episode + 1} ---")
        
        # El ciclo termina si el agente llega al estado final (terminated)
        # o si se alcanza el límite de tiempo (truncated)
        while not (terminated or truncated):
            # Muestrear una acción aleatoria del espacio de acciones
            action = env.action_space.sample()
            
            # Aplicar la acción en el entorno
            observation, reward, terminated, truncated, info = env.step(action)
            
            total_reward += reward
            
        print(f"Episodio {episode + 1} finalizado con recompensa total: {total_reward}")
        
    # Cerrar el entorno al terminar
    env.close()

if __name__ == "__main__":
    print("Ejecutando Agente Aleatorio en CartPole-v1...")
    run_random_agent()
