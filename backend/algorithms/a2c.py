import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.distributions import Normal

class ActorCritic(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(ActorCritic, self).__init__()
        # Shared feature extractor
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        
        # Actor head
        self.actor_mean = nn.Linear(128, action_dim)
        self.actor_log_std = nn.Parameter(torch.zeros(1, action_dim))
        
        # Critic head
        self.critic = nn.Linear(128, 1)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        
        mean = self.actor_mean(x)
        std = self.actor_log_std.exp().expand_as(mean)
        value = self.critic(x)
        
        return mean, std, value

async def run_a2c(config, emit_state):
    env_name = config.get("env_name", "Ant-v4")
    episodes = config.get("episodes", 200)
    lr = config.get("lr", 3e-4)
    gamma = config.get("gamma", 0.99)
    entropy_coef = config.get("entropy_coef", 0.01)
    
    # We use healthy_reward=0 to simplify Ant if needed, but default is fine.
    env = gym.make(env_name, render_mode="rgb_array")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]
    
    device = torch.device("cpu")
    model = ActorCritic(state_dim, action_dim).to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    for episode in range(episodes):
        state, _ = env.reset()
        done = False
        step = 0
        total_reward = 0
        
        while not done:
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(device)
            mean, std, value = model(state_tensor)
            
            dist = Normal(mean, std)
            action = dist.sample()
            
            # Clip action to environment bounds
            action_np = torch.clamp(action, env.action_space.low[0], env.action_space.high[0]).squeeze(0).numpy()
            
            next_state, reward, terminated, truncated, _ = env.step(action_np)
            done = terminated or truncated
            
            next_state_tensor = torch.FloatTensor(next_state).unsqueeze(0).to(device)
            _, _, next_value = model(next_state_tensor)
            
            # Calculate Advantage and TD Target
            td_target = reward + gamma * next_value.detach() * (1 - int(done))
            advantage = td_target - value
            
            # Critic loss (MSE)
            critic_loss = advantage.pow(2)
            
            # Actor loss
            log_prob = dist.log_prob(action).sum(dim=-1, keepdim=True)
            actor_loss = -(log_prob * advantage.detach())
            
            # Entropy bonus to encourage exploration
            entropy = dist.entropy().sum(dim=-1, keepdim=True)
            
            # Total loss
            loss = (critic_loss + actor_loss - entropy_coef * entropy).mean()
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            state = next_state
            total_reward += reward
            step += 1
            
            # Only send occasional frames for MuJoCo to avoid freezing frontend
            if episode == episodes - 1 or step % 50 == 0 or done:
                frame = env.render()
                if frame is not None:
                    await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, done=done)
                
    env.close()
