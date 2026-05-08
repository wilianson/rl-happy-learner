import gymnasium as gym
import numpy as np

async def run_sarsa(config, emit_state):
    env_name = config.get("env_name", "CliffWalking-v1")
    alpha = config.get("alpha", 0.1)
    gamma = config.get("gamma", 0.99)
    epsilon = config.get("epsilon", 0.1)
    episodes = config.get("episodes", 100)
    
    env = gym.make(env_name, render_mode="rgb_array")
    Q = np.zeros((env.observation_space.n, env.action_space.n))
    
    for episode in range(episodes):
        state, _ = env.reset()
        
        # Epsilon-greedy action selection
        if np.random.random() < epsilon:
            action = env.action_space.sample()
        else:
            action = np.argmax(Q[state])
            
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            
            # Next action
            if np.random.random() < epsilon:
                next_action = env.action_space.sample()
            else:
                next_action = np.argmax(Q[next_state])
                
            # SARSA update
            td_target = reward + gamma * Q[next_state, next_action] * (not done)
            Q[state, action] += alpha * (td_target - Q[state, action])
            
            state = next_state
            action = next_action
            total_reward += reward
            step += 1
            
            # Emit last few steps or if done to save bandwidth, but for visual we can emit periodically
            if episode == episodes - 1 or step % 5 == 0 or done:
                frame = env.render()
                await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, q_values=Q.tolist(), done=done)
                
    env.close()

async def run_q_learning(config, emit_state):
    env_name = config.get("env_name", "CliffWalking-v1")
    alpha = config.get("alpha", 0.1)
    gamma = config.get("gamma", 0.99)
    epsilon = config.get("epsilon", 0.1)
    episodes = config.get("episodes", 100)
    
    env = gym.make(env_name, render_mode="rgb_array")
    Q = np.zeros((env.observation_space.n, env.action_space.n))
    
    for episode in range(episodes):
        state, _ = env.reset()
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            if np.random.random() < epsilon:
                action = env.action_space.sample()
            else:
                action = np.argmax(Q[state])
                
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            
            # Q-Learning update
            best_next_action = np.argmax(Q[next_state])
            td_target = reward + gamma * Q[next_state, best_next_action] * (not done)
            Q[state, action] += alpha * (td_target - Q[state, action])
            
            state = next_state
            total_reward += reward
            step += 1
            
            if episode == episodes - 1 or step % 5 == 0 or done:
                frame = env.render()
                await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, q_values=Q.tolist(), done=done)
                
    env.close()
