"""
04_reinforce.py

Implementación del algoritmo REINFORCE (Policy Gradient clásico)
utilizando PyTorch para resolver CartPole-v1.
"""
import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.distributions import Categorical
import matplotlib.pyplot as plt

# 1. Definición de la Red de Política
class PolicyNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, action_dim)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        # Usamos softmax para obtener una distribución de probabilidad sobre las acciones
        return torch.softmax(self.fc2(x), dim=-1)

def train_reinforce():
    env = gym.make("CartPole-v1")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    policy_net = PolicyNetwork(state_dim, action_dim).to(device)
    optimizer = optim.Adam(policy_net.parameters(), lr=1e-2)
    
    episodes = 500
    gamma = 0.99
    rewards_history = []
    
    for episode in range(episodes):
        state, _ = env.reset()
        log_probs = []
        rewards = []
        done = False
        
        # 2. Generar una trayectoria (un episodio completo)
        while not done:
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(device)
            probs = policy_net(state_tensor)
            
            # Crear una distribución categórica para muestrear la acción
            m = Categorical(probs)
            action = m.sample()
            
            next_state, reward, terminated, truncated, _ = env.step(action.item())
            done = terminated or truncated
            
            # Guardar el logaritmo de la probabilidad de la acción tomada
            log_probs.append(m.log_prob(action))
            rewards.append(reward)
            state = next_state
            
        # 3. Calcular los retornos descontados (G_t)
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + gamma * G
            returns.insert(0, G)
            
        returns = torch.tensor(returns).to(device)
        # Normalizar retornos (Baseline trick) para estabilizar el entrenamiento
        returns = (returns - returns.mean()) / (returns.std() + 1e-9)
        
        # 4. Calcular la pérdida (Policy Loss) y actualizar los pesos
        policy_loss = []
        for log_prob, G in zip(log_probs, returns):
            # La pérdida es el gradiente negativo log-verosimilitud ponderado por el retorno
            policy_loss.append(-log_prob * G)
            
        optimizer.zero_grad()
        policy_loss = torch.cat(policy_loss).sum()
        policy_loss.backward()
        optimizer.step()
        
        total_reward = sum(rewards)
        rewards_history.append(total_reward)
        
        if (episode + 1) % 50 == 0:
            print(f"Episodio {episode + 1}/{episodes}, Recompensa promedio (últimos 50): {np.mean(rewards_history[-50:]):.2f}")
            
    # Guardar gráfica
    plt.plot(rewards_history)
    plt.title("Aprendizaje REINFORCE - CartPole-v1")
    plt.xlabel("Episodio")
    plt.ylabel("Recompensa")
    plt.savefig("reinforce_cartpole.png")
    print("Gráfica guardada como reinforce_cartpole.png")

if __name__ == "__main__":
    print("Entrenando REINFORCE en CartPole-v1...")
    train_reinforce()
    print("Entrenamiento completado.")
