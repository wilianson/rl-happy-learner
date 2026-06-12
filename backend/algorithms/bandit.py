import numpy as np

async def run_bandit(config, emit_state):
    k_arms = int(config.get("k_arms", 10))
    episodes = config.get("episodes", 1000)
    epsilon = config.get("epsilon", 0.1)
    
    # True reward means for each arm
    q_true = np.random.normal(0, 1, k_arms)
    
    # Estimated values
    Q = np.zeros(k_arms)
    N = np.zeros(k_arms)
    
    total_reward = 0
    
    for step in range(1, episodes + 1):
        if np.random.random() < epsilon:
            action = np.random.randint(0, k_arms)
        else:
            action = np.argmax(Q)
            
        # Get reward from true distribution
        reward = np.random.normal(q_true[action], 1)
        total_reward += reward
        
        # Update estimates
        N[action] += 1
        Q[action] += (1.0 / N[action]) * (reward - Q[action])
        
        # Emit state periodically
        # We don't have a real frame, we just emit Q values. 
        # The frontend can handle it if frame is missing.
        if step % 10 == 0 or step == episodes:
            # We send Q as a 1xK matrix so frontend generic Q-value table can show it
            q_matrix = [Q.tolist()]
            await emit_state(episode=1, step=step, frame=None, reward=total_reward, q_values=q_matrix, done=(step==episodes))
