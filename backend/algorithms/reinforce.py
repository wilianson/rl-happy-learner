import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.distributions import Categorical

class PolicyNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, action_dim)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        # Usamos softmax para obtener una distribución de probabilidad sobre las acciones
        return torch.softmax(self.fc2(x), dim=-1)

async def run_reinforce(config, emit_state):
    env_name = config.get("env_name", "LunarLander-v3")
    episodes = config.get("episodes", 500)
    lr = config.get("lr", 1e-2)
    gamma = config.get("gamma", 0.99)
    
    env = gym.make(env_name, render_mode="rgb_array")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    policy_net = PolicyNetwork(state_dim, action_dim).to(device)
    optimizer = optim.Adam(policy_net.parameters(), lr=lr)
    
    for episode in range(episodes):
        state, _ = env.reset()
        log_probs = []
        rewards = []
        done = False
        step = 0
        
        while not done:
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(device)
            probs = policy_net(state_tensor)
            
            m = Categorical(probs)
            action = m.sample()
            
            next_state, reward, terminated, truncated, _ = env.step(action.item())
            done = terminated or truncated
            
            log_probs.append(m.log_prob(action))
            rewards.append(reward)
            state = next_state
            
            step += 1
            
            # Emitir frame y estadísticas cada X pasos si es necesario, 
            # pero enviar todos los frames permite ver el video de forma fluida.
            # LunarLander puede durar muchos steps, pero el sleep del WebSocket evitará bloqueos.
            if step % 2 == 0:  # Enviar 1 de cada 2 frames para optimizar la red
                frame = env.render()
                await emit_state(
                    episode=episode + 1, 
                    step=step, 
                    frame=frame, 
                    reward=float(sum(rewards)), 
                    q_values=None, 
                    done=False
                )
            
        # Calcular los retornos descontados (G_t)
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + gamma * G
            returns.insert(0, G)
            
        returns = torch.tensor(returns).to(device)
        # Normalizar retornos (Baseline trick) para estabilizar el entrenamiento
        if len(returns) > 1:
            returns = (returns - returns.mean()) / (returns.std() + 1e-9)
        
        # Calcular la pérdida (Policy Loss) y actualizar los pesos
        policy_loss = []
        for log_prob, G in zip(log_probs, returns):
            policy_loss.append(-log_prob * G)
            
        optimizer.zero_grad()
        policy_loss = torch.cat(policy_loss).sum()
        policy_loss.backward()
        optimizer.step()
        
        # Al final del episodio, emitir una última vez para asegurar gráfico completo
        frame = env.render()
        await emit_state(
            episode=episode + 1, 
            step=step, 
            frame=frame, 
            reward=float(sum(rewards)), 
            q_values=None, 
            done=False
        )
        
    env.close()
