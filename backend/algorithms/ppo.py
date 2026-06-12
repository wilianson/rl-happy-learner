import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.distributions import Normal

class PPOActorCritic(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(PPOActorCritic, self).__init__()
        self.actor = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, action_dim)
        )
        self.actor_log_std = nn.Parameter(torch.zeros(1, action_dim))
        
        self.critic = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 1)
        )
        
    def forward(self, x):
        mean = self.actor(x)
        std = self.actor_log_std.exp().expand_as(mean)
        value = self.critic(x)
        return mean, std, value

async def run_ppo(config, emit_state):
    env_name = config.get("env_name", "InvertedPendulum-v4")
    episodes = config.get("episodes", 200)
    lr = config.get("lr", 3e-4)
    gamma = config.get("gamma", 0.99)
    clip_epsilon = config.get("clip_epsilon", 0.2)
    ppo_epochs = config.get("ppo_epochs", 4)
    update_timestep = config.get("update_timestep", 2000)
    
    env = gym.make(env_name, render_mode="rgb_array")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]
    
    device = torch.device("cpu")
    model = PPOActorCritic(state_dim, action_dim).to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    time_step = 0
    
    # Storage for PPO
    memory = {"states": [], "actions": [], "logprobs": [], "rewards": [], "is_terminals": []}
    
    for episode in range(episodes):
        state, _ = env.reset()
        done = False
        step = 0
        total_reward = 0
        
        while not done:
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(device)
            with torch.no_grad():
                mean, std, _ = model(state_tensor)
                dist = Normal(mean, std)
                action = dist.sample()
                logprob = dist.log_prob(action).sum(dim=-1)
                
            action_np = torch.clamp(action, env.action_space.low[0], env.action_space.high[0]).squeeze(0).numpy()
            
            next_state, reward, terminated, truncated, _ = env.step(action_np)
            done = terminated or truncated
            
            # Save data
            memory["states"].append(state)
            memory["actions"].append(action_np)
            memory["logprobs"].append(logprob.item())
            memory["rewards"].append(reward)
            memory["is_terminals"].append(done)
            
            state = next_state
            total_reward += reward
            step += 1
            time_step += 1
            
            # PPO Update
            if time_step % update_timestep == 0:
                old_states = torch.FloatTensor(np.array(memory["states"])).to(device)
                old_actions = torch.FloatTensor(np.array(memory["actions"])).to(device)
                old_logprobs = torch.FloatTensor(memory["logprobs"]).to(device)
                
                # Monte Carlo estimate of state rewards
                rewards = []
                discounted_reward = 0
                for r, is_term in zip(reversed(memory["rewards"]), reversed(memory["is_terminals"])):
                    if is_term:
                        discounted_reward = 0
                    discounted_reward = r + (gamma * discounted_reward)
                    rewards.insert(0, discounted_reward)
                    
                rewards = torch.FloatTensor(rewards).to(device)
                rewards = (rewards - rewards.mean()) / (rewards.std() + 1e-7)
                
                for _ in range(ppo_epochs):
                    mean, std, values = model(old_states)
                    dist = Normal(mean, std)
                    logprobs = dist.log_prob(old_actions).sum(dim=-1)
                    dist_entropy = dist.entropy().sum(dim=-1)
                    
                    advantages = rewards - values.squeeze(-1).detach()
                    
                    ratios = torch.exp(logprobs - old_logprobs)
                    surr1 = ratios * advantages
                    surr2 = torch.clamp(ratios, 1 - clip_epsilon, 1 + clip_epsilon) * advantages
                    
                    loss = -torch.min(surr1, surr2) + 0.5 * nn.MSELoss()(values.squeeze(-1), rewards) - 0.01 * dist_entropy
                    
                    optimizer.zero_grad()
                    loss.mean().backward()
                    optimizer.step()
                
                # Clear memory
                memory = {"states": [], "actions": [], "logprobs": [], "rewards": [], "is_terminals": []}
                
            if episode == episodes - 1 or step % 20 == 0 or done:
                frame = env.render()
                if frame is not None:
                    await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, done=done)
                    
    env.close()
