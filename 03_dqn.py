"""
03_dqn.py

Implementación básica de Deep Q-Network (DQN) utilizando PyTorch
para resolver CartPole-v1.
"""
import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
import matplotlib.pyplot as plt

# 1. Definición de la Red Neuronal (Q-Network)
class DQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_dim)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# 2. Replay Buffer para almacenar experiencias pasadas
class ReplayBuffer:
    def __init__(self, capacity):
        self.buffer = deque(maxlen=capacity)
        
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
        
    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        state, action, reward, next_state, done = map(np.stack, zip(*batch))
        return state, action, reward, next_state, done
        
    def __len__(self):
        return len(self.buffer)

# 3. Ciclo de Entrenamiento
def train_dqn():
    env = gym.make("CartPole-v1")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Red de Política y Red Objetivo (Target Network) para estabilidad
    policy_net = DQN(state_dim, action_dim).to(device)
    target_net = DQN(state_dim, action_dim).to(device)
    target_net.load_state_dict(policy_net.state_dict())
    
    optimizer = optim.Adam(policy_net.parameters(), lr=1e-3)
    memory = ReplayBuffer(10000)
    
    batch_size = 64
    gamma = 0.99
    epsilon_start = 1.0
    epsilon_end = 0.01
    epsilon_decay = 500
    
    episodes = 250
    rewards_history = []
    steps_done = 0
    
    for episode in range(episodes):
        state, _ = env.reset()
        total_reward = 0
        done = False
        
        while not done:
            # Estrategia Epsilon-greedy con decaimiento
            epsilon = epsilon_end + (epsilon_start - epsilon_end) * \
                      np.exp(-1. * steps_done / epsilon_decay)
            steps_done += 1
            
            if random.random() > epsilon:
                with torch.no_grad():
                    state_t = torch.FloatTensor(state).unsqueeze(0).to(device)
                    action = policy_net(state_t).argmax().item()
            else:
                action = env.action_space.sample()
                
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            
            # Guardar transición en el replay buffer
            memory.push(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            
            # Paso de Entrenamiento
            if len(memory) > batch_size:
                states, actions, rewards, next_states, dones = memory.sample(batch_size)
                
                states = torch.FloatTensor(states).to(device)
                actions = torch.LongTensor(actions).unsqueeze(1).to(device)
                rewards = torch.FloatTensor(rewards).unsqueeze(1).to(device)
                next_states = torch.FloatTensor(next_states).to(device)
                dones = torch.FloatTensor(dones).unsqueeze(1).to(device)
                
                # Valores Q actuales
                q_values = policy_net(states).gather(1, actions)
                
                # Valores Q objetivo utilizando la target_net
                with torch.no_grad():
                    max_next_q_values = target_net(next_states).max(1)[0].unsqueeze(1)
                    target_q_values = rewards + gamma * max_next_q_values * (1 - dones)
                    
                loss = nn.MSELoss()(q_values, target_q_values)
                
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                
        # Actualizar la red objetivo copiando los pesos de la red de política
        if episode % 10 == 0:
            target_net.load_state_dict(policy_net.state_dict())
            
        rewards_history.append(total_reward)
        if (episode + 1) % 25 == 0:
            print(f"Episodio {episode + 1}/{episodes}, Recompensa: {total_reward}, Epsilon: {epsilon:.2f}")
            
    # Guardar gráfica
    plt.plot(rewards_history)
    plt.title("Aprendizaje DQN - CartPole-v1")
    plt.xlabel("Episodio")
    plt.ylabel("Recompensa")
    plt.savefig("dqn_cartpole.png")
    print("Gráfica guardada como dqn_cartpole.png")
    
    return policy_net

if __name__ == "__main__":
    print("Entrenando DQN en CartPole-v1...")
    model = train_dqn()
    print("Entrenamiento completado.")
