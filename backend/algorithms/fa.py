import gymnasium as gym
import numpy as np

async def run_value_function_approximation(config, emit_state):
    env_name = config.get("env_name", "MountainCar-v0")
    alpha = config.get("alpha", 0.01)
    gamma = config.get("gamma", 0.99)
    epsilon = config.get("epsilon", 0.1)
    episodes = config.get("episodes", 200)
    
    env = gym.make(env_name, render_mode="rgb_array")
    
    state_dim = env.observation_space.shape[0]
    num_actions = env.action_space.n
    weights = np.zeros((num_actions, state_dim))
    
    def get_q(state):
        return np.dot(weights, state)
        
    for episode in range(episodes):
        state, _ = env.reset()
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            q_values = get_q(state)
            if np.random.random() < epsilon:
                action = env.action_space.sample()
            else:
                action = np.argmax(q_values)
                
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            
            next_q = get_q(next_state)
            best_next_q = np.max(next_q)
            
            td_target = reward + gamma * best_next_q * (not done)
            td_error = td_target - q_values[action]
            
            weights[action] += alpha * td_error * state
            
            state = next_state
            total_reward += reward
            step += 1
            
            if episode == episodes - 1 or step % 20 == 0 or done:
                frame = env.render()
                if frame is not None:
                    await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, done=done)
                
    env.close()
