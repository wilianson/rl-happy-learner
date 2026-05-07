import asyncio
import json
import base64
from io import BytesIO
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import gymnasium as gym

from algorithms.dp import run_policy_iteration, run_value_iteration
from algorithms.mc import run_monte_carlo
from algorithms.td import run_sarsa, run_q_learning
from algorithms.fa import run_value_function_approximation
from algorithms.dqn import run_dqn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def frame_to_base64(frame):
    img = Image.fromarray(frame)
    buffered = BytesIO()
    img.save(buffered, format="JPEG", quality=70)
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

@app.websocket("/ws/train/{algorithm}")
async def websocket_endpoint(websocket: WebSocket, algorithm: str):
    await websocket.accept()
    
    # Callback to emit state from the training loop
    async def emit_state(episode, step, frame, reward, q_values=None, done=False):
        data = {
            "type": "update",
            "episode": episode,
            "step": step,
            "reward": reward,
            "done": done
        }
        if frame is not None:
            data["frame"] = frame_to_base64(frame)
        if q_values is not None:
            data["q_values"] = q_values
            
        await websocket.send_json(data)
        # Yield control to the event loop so the message is sent
        await asyncio.sleep(0.01)

    try:
        # 1. Receive configuration from client
        config_data = await websocket.receive_text()
        config = json.loads(config_data)
        
        # 2. Run selected algorithm
        if algorithm == "policy_iteration":
            await run_policy_iteration(config, emit_state)
        elif algorithm == "value_iteration":
            await run_value_iteration(config, emit_state)
        elif algorithm == "monte_carlo":
            await run_monte_carlo(config, emit_state)
        elif algorithm == "sarsa":
            await run_sarsa(config, emit_state)
        elif algorithm == "q_learning":
            await run_q_learning(config, emit_state)
        elif algorithm == "vfa":
            await run_value_function_approximation(config, emit_state)
        elif algorithm == "dqn":
            await run_dqn(config, emit_state)
        else:
            await websocket.send_json({"type": "error", "message": "Algorithm not found"})
            
        await websocket.send_json({"type": "complete"})
            
    except WebSocketDisconnect:
        print(f"Client disconnected from {algorithm}")
    except Exception as e:
        print(f"Error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
