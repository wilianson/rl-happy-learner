import gymnasium as gym
import numpy as np

def get_q_from_v(env, V, state, gamma):
    q = np.zeros(env.action_space.n)
    for action in range(env.action_space.n):
        for prob, next_state, reward, done in env.unwrapped.P[state][action]:
            q[action] += prob * (reward + gamma * V[next_state])
    return q

async def run_value_iteration(config, emit_state):
    env_name = config.get("env_name", "FrozenLake-v1")
    gamma = config.get("gamma", 0.99)
    theta = config.get("theta", 1e-8)
    
    env = gym.make(env_name, render_mode="rgb_array", is_slippery=False)
    env.reset()
    V = np.zeros(env.observation_space.n)
    
    iteration = 0
    while True:
        delta = 0
        for s in range(env.observation_space.n):
            v = V[s]
            V[s] = max(get_q_from_v(env, V, s, gamma))
            delta = max(delta, abs(v - V[s]))
            
        iteration += 1
        
        # Calculate full Q-table to emit
        Q = np.zeros((env.observation_space.n, env.action_space.n))
        for s in range(env.observation_space.n):
            Q[s] = get_q_from_v(env, V, s, gamma)
            
        frame = env.render()
        await emit_state(episode=iteration, step=0, frame=frame, reward=float(delta), q_values=Q.tolist(), done=bool(delta < theta))
        
        if delta < theta:
            break
            
    # Run the optimal policy once to show the agent
    state, _ = env.reset()
    done = False
    step = 0
    while not done:
        action = np.argmax(get_q_from_v(env, V, state, gamma))
        state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated
        frame = env.render()
        step += 1
        await emit_state(episode=iteration, step=step, frame=frame, reward=float(reward), q_values=Q.tolist(), done=bool(done))
        
    env.close()

async def run_policy_iteration(config, emit_state):
    env_name = config.get("env_name", "FrozenLake-v1")
    gamma = config.get("gamma", 0.99)
    theta = config.get("theta", 1e-8)
    
    env = gym.make(env_name, render_mode="rgb_array", is_slippery=False)
    env.reset()
    V = np.zeros(env.observation_space.n)
    policy = np.zeros(env.observation_space.n, dtype=int)
    
    iteration = 0
    while True:
        # Policy Evaluation
        while True:
            delta = 0
            for s in range(env.observation_space.n):
                v = V[s]
                V[s] = sum([prob * (reward + gamma * V[next_state]) 
                           for prob, next_state, reward, _ in env.unwrapped.P[s][policy[s]]])
                delta = max(delta, abs(v - V[s]))
            if delta < theta:
                break
                
        # Policy Improvement
        policy_stable = True
        for s in range(env.observation_space.n):
            old_action = policy[s]
            policy[s] = np.argmax(get_q_from_v(env, V, s, gamma))
            if old_action != policy[s]:
                policy_stable = False
                
        iteration += 1
        
        Q = np.zeros((env.observation_space.n, env.action_space.n))
        for s in range(env.observation_space.n):
            Q[s] = get_q_from_v(env, V, s, gamma)
            
        frame = env.render()
        await emit_state(episode=iteration, step=0, frame=frame, reward=0.0, q_values=Q.tolist(), done=bool(policy_stable))
        
        if policy_stable:
            break
            
    # Run optimal policy
    state, _ = env.reset()
    done = False
    step = 0
    while not done:
        action = policy[state]
        state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated
        frame = env.render()
        step += 1
        await emit_state(episode=iteration, step=step, frame=frame, reward=float(reward), q_values=Q.tolist(), done=bool(done))
        
    env.close()
