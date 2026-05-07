"""
02_q_learning.py

Implementación del algoritmo Q-Learning (Tabular) para resolver
el entorno CliffWalking-v0.
"""
import gymnasium as gym
import numpy as np
import matplotlib.pyplot as plt

def q_learning(env, num_episodes=500, alpha=0.1, gamma=0.99, epsilon=0.1):
    # Inicializar la tabla Q con ceros
    # Q[estado, acción]
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    Q = np.zeros((n_states, n_actions))
    
    rewards_per_episode = []
    
    for episode in range(num_episodes):
        state, info = env.reset()
        terminated = False
        truncated = False
        total_reward = 0
        
        while not (terminated or truncated):
            # Política epsilon-greedy
            if np.random.random() < epsilon:
                action = env.action_space.sample() # Exploración
            else:
                action = np.argmax(Q[state])       # Explotación
                
            next_state, reward, terminated, truncated, info = env.step(action)
            
            # Actualización de Q-Learning (Ecuación de Bellman)
            best_next_action = np.argmax(Q[next_state])
            td_target = reward + gamma * Q[next_state, best_next_action] * (not terminated)
            td_error = td_target - Q[state, action]
            Q[state, action] += alpha * td_error
            
            state = next_state
            total_reward += reward
            
        rewards_per_episode.append(total_reward)
        
    return Q, rewards_per_episode

if __name__ == "__main__":
    env = gym.make("CliffWalking-v0")
    print("Entrenando agente con Q-Learning en CliffWalking-v0...")
    Q_table, rewards = q_learning(env, num_episodes=500)
    print("Entrenamiento finalizado.")
    
    # Suavizar las recompensas para la gráfica
    window = 10
    smoothed_rewards = [np.mean(rewards[max(0, i-window):i+1]) for i in range(len(rewards))]
    
    plt.plot(smoothed_rewards)
    plt.title("Recompensas por Episodio (Suavizado)")
    plt.xlabel("Episodio")
    plt.ylabel("Recompensa")
    plt.savefig("q_learning_cliffwalking.png")
    print("Gráfica guardada como q_learning_cliffwalking.png")
    
    # Demostración del agente entrenado
    print("\nMostrando agente entrenado...")
    test_env = gym.make("CliffWalking-v0", render_mode="human")
    state, _ = test_env.reset()
    terminated = truncated = False
    
    while not (terminated or truncated):
        action = np.argmax(Q_table[state])
        state, reward, terminated, truncated, _ = test_env.step(action)
        
    test_env.close()
