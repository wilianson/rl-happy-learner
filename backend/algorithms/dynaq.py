import gymnasium as gym
import numpy as np
import random

async def run_dynaq(config, emit_state):
    env_name = config.get("env_name", "Taxi-v3")
    alpha = config.get("alpha", 0.1)
    gamma = config.get("gamma", 0.99)
    epsilon = config.get("epsilon", 0.1)
    episodes = config.get("episodes", 200)
    n_planning_steps = int(config.get("n_planning_steps", 10))
    
    env = gym.make(env_name, render_mode="rgb_array")
    Q = np.zeros((env.observation_space.n, env.action_space.n))
    
    # Model: Dict[state, Dict[action, Tuple[reward, next_state]]]
    model = {}
    
    for episode in range(episodes):
        state, _ = env.reset()
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            # Epsilon-greedy
            if random.random() < epsilon:
                action = env.action_space.sample()
            else:
                action = np.argmax(Q[state])
                
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            
            # Direct RL update (Q-learning)
            best_next_action = np.argmax(Q[next_state])
            td_target = reward + gamma * Q[next_state, best_next_action] * (1 - int(done))
            Q[state, action] += alpha * (td_target - Q[state, action])
            
            # Model learning
            if state not in model:
                model[state] = {}
            model[state][action] = (reward, next_state)
            
            # Planning steps
            for _ in range(n_planning_steps):
                if not model:
                    break
                p_state = random.choice(list(model.keys()))
                p_action = random.choice(list(model[p_state].keys()))
                p_reward, p_next_state = model[p_state][p_action]
                
                p_best_next_action = np.argmax(Q[p_next_state])
                # We assume terminal states are not in the model as next_states to be planned from,
                # or we just approximate. For simplicity:
                p_td_target = p_reward + gamma * Q[p_next_state, p_best_next_action]
                Q[p_state, p_action] += alpha * (p_td_target - Q[p_state, p_action])
                
            state = next_state
            total_reward += reward
            step += 1
            
            # Emit state for visualization
            if episode == episodes - 1 or step % 10 == 0 or done:
                frame = env.render()
                if frame is not None:
                    await emit_state(episode=episode + 1, step=step, frame=frame, reward=total_reward, q_values=Q.tolist(), done=done)
                    
    env.close()
