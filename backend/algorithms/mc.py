import gymnasium as gym
import numpy as np

async def run_monte_carlo(config, emit_state):
    env_name = config.get("env_name", "Blackjack-v1")
    gamma = config.get("gamma", 1.0)
    epsilon = config.get("epsilon", 0.1)
    episodes = config.get("episodes", 1000)
    
    env = gym.make(env_name, render_mode="rgb_array")
    
    Q = {}
    returns_sum = {}
    returns_count = {}
    
    def get_action(state, Q, epsilon, env):
        if state not in Q:
            Q[state] = np.zeros(env.action_space.n)
        if np.random.random() < epsilon:
            return env.action_space.sample()
        else:
            return np.argmax(Q[state])
            
    for episode in range(episodes):
        state, _ = env.reset()
        episode_data = []
        done = False
        step = 0
        
        while not done:
            action = get_action(state, Q, epsilon, env)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            episode_data.append((state, action, reward))
            state = next_state
            
            # Emit visualization sporadically to save bandwidth
            if episode == episodes - 1 or (episode % 50 == 0 and step == 0) or done:
                frame = env.render()
                if frame is not None:
                    await emit_state(episode=episode + 1, step=step, frame=frame, reward=reward, done=done)
            step += 1
            
        G = 0
        for t in reversed(range(len(episode_data))):
            s, a, r = episode_data[t]
            G = gamma * G + r
            if not any(x[0] == s and x[1] == a for x in episode_data[0:t]):
                state_action = (s, a)
                if state_action not in returns_sum:
                    returns_sum[state_action] = 0
                    returns_count[state_action] = 0
                returns_sum[state_action] += G
                returns_count[state_action] += 1
                Q[s][a] = returns_sum[state_action] / returns_count[state_action]
                
    env.close()
