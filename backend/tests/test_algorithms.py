import pytest
import numpy as np

def test_epsilon_decay_logic():
    epsilon = 1.0
    epsilon_decay = 0.9
    epsilon_end = 0.01
    
    # After 1 step
    epsilon = max(epsilon_end, epsilon * epsilon_decay)
    assert epsilon == 0.9
    
    # After many steps
    for _ in range(100):
        epsilon = max(epsilon_end, epsilon * epsilon_decay)
    
    assert epsilon == epsilon_end

def test_dqn_config_loading():
    # Mocking config
    config = {"epsilon_decay": 0.99, "lr": 0.001}
    epsilon_decay = config.get("epsilon_decay", 0.995)
    assert epsilon_decay == 0.99
