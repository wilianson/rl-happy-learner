import gymnasium as gym
import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np
from collections import deque

class DQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_dim, 64)
        self.fc2 = nn.Linear(64, 64)
        self.fc3 = nn.Linear(64, action_dim)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

async def run_dqn(config, emit_state):
    env_name = config.get("env_name", "CartPole-v1")
    episodes = config.get("episodes", 150)
    gamma = config.get("gamma", 0.99)
    batch_size = int(config.get("batch_size", 64))
    lr = config.get("lr", 1e-3)
    memory_size = int(config.get("memory_size", 5000))
    target_update = int(config.get("target_update", 5))
    epsilon_decay = config.get("epsilon_decay", 0.995)
    
    env = gym.make(env_name, render_mode="rgb_array")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    
    device = torch.device("cpu")
    policy_net = DQN(state_dim, action_dim).to(device)
    target_net = DQN(state_dim, action_dim).to(device)
    target_net.load_state_dict(policy_net.state_dict())
    
    optimizer = optim.Adam(policy_net.parameters(), lr=lr)
    memory = deque(maxlen=memory_size)
    
    epsilon = 1.0
    epsilon_end = 0.01
    
    for episode in range(episodes):
        state, _ = env.reset()
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            # Epsilon decay (multiplicative)
            epsilon = max(epsilon_end, epsilon * epsilon_decay)
            
            if random.random() > epsilon:
                with torch.no_grad():
                    state_t = torch.FloatTensor(state).unsqueeze(0).to(device)
                    action = policy_net(state_t).argmax().item()
            else:
                action = env.action_space.sample()
                
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            
            memory.append((state, action, reward, next_state, done))
            state = next_state
            total_reward += reward
            step += 1
            
            if len(memory) > batch_size:
                batch = random.sample(memory, batch_size)
                s, a, r, n_s, d = map(np.stack, zip(*batch))
                
                s = torch.FloatTensor(s).to(device)
                a = torch.LongTensor(a).unsqueeze(1).to(device)
                r = torch.FloatTensor(r).unsqueeze(1).to(device)
                n_s = torch.FloatTensor(n_s).to(device)
                d = torch.FloatTensor(d).unsqueeze(1).to(device)
                
                q_values = policy_net(s).gather(1, a)
                with torch.no_grad():
                    max_next_q_values = target_net(n_s).max(1)[0].unsqueeze(1)
                    target_q_values = r + gamma * max_next_q_values * (1 - d)
                    
                loss = nn.MSELoss()(q_values, target_q_values)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                
            # Only send occasional frames or done to save websocket bandwidth
            if episode == episodes - 1 or step % 10 == 0 or done:
                frame = env.render()
                if frame is not None:
                    await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, done=done)
                
        if episode % target_update == 0:
            target_net.load_state_dict(policy_net.state_dict())
            
    env.close()
