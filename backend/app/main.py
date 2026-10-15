from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.hospital_twin import HospitalDigitalTwin
from app.telemetry_simulator import TelemetrySimulator
from app.models import HospitalState, Patient, Bed

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        text = json.dumps(message)
        dead = []
        for conn in self.active_connections:
            try:
                await conn.send_text(text)
            except Exception:
                dead.append(conn)
        for d in dead:
            self.disconnect(d)

manager = ConnectionManager()
hospital = HospitalDigitalTwin()
simulator = TelemetrySimulator(hospital, manager.broadcast)

@asynccontextmanager
async def lifespan(app: FastAPI):
    simulator.start()
    yield
    simulator.stop()

app = FastAPI(
    title="Smart Hospital Bed & Patient Deterioration Twin API",
    description="Clinical & operations digital twin with transparent NEWS2 risk scoring, trend signals, constraint-based bed optimization, and human-in-the-loop decision support.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DegradationRequest(BaseModel):
    patient_id: str
    slider_value: float
    scenario: Optional[str] = None

class ScenarioReplayRequest(BaseModel):
    scenario_key: str

class TransferExecuteRequest(BaseModel):
    recommendation_id: str

class SimSpeedRequest(BaseModel):
    speed: float

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    initial_state = hospital.get_state().model_dump()
    await websocket.send_text(json.dumps({
        "type": "INITIAL_STATE",
        "data": initial_state
    }))

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                msg_type = msg.get("type")

                if msg_type == "SLIDER_UPDATE":
                    p_id = msg.get("patient_id")
                    val = float(msg.get("slider_value", 0))
                    scen = msg.get("scenario")
                    hospital.apply_degradation_slider(p_id, val, scen)
                    state = hospital.get_state().model_dump()
                    await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})

                elif msg_type == "REPLAY_SCENARIO":
                    key = msg.get("scenario_key")
                    hospital.replay_benchmark_scenario(key)
                    state = hospital.get_state().model_dump()
                    await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})

                elif msg_type == "EXECUTE_TRANSFER":
                    rec_id = msg.get("recommendation_id")
                    result = hospital.execute_bed_transfer(rec_id)
                    state = hospital.get_state().model_dump()
                    await manager.broadcast({"type": "TRANSFER_EXECUTED", "data": result, "hospital_state": state})

                elif msg_type == "TOGGLE_SIM":
                    hospital.simulation_running = not hospital.simulation_running
                    state = hospital.get_state().model_dump()
                    await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})

                elif msg_type == "SET_SIM_SPEED":
                    speed = float(msg.get("speed", 1.0))
                    hospital.simulation_speed = speed
                    state = hospital.get_state().model_dump()
                    await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})

                elif msg_type == "RESET_ALL":
                    hospital.replay_benchmark_scenario("baseline_stable")
                    state = hospital.get_state().model_dump()
                    await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})

            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Error handling WS message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/state", response_model=HospitalState)
def get_hospital_state():
    return hospital.get_state()

@app.get("/api/patients", response_model=List[Patient])
def get_patients():
    return hospital.patients

@app.get("/api/beds", response_model=List[Bed])
def get_beds():
    return hospital.beds

@app.post("/api/degrade")
async def degrade_patient(req: DegradationRequest):
    try:
        updated_patient = hospital.apply_degradation_slider(req.patient_id, req.slider_value, req.scenario)
        state = hospital.get_state().model_dump()
        await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})
        return {"success": True, "patient": updated_patient}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/scenario/replay")
async def replay_scenario(req: ScenarioReplayRequest):
    try:
        hospital.replay_benchmark_scenario(req.scenario_key)
        state = hospital.get_state().model_dump()
        await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})
        return {"success": True, "scenario": req.scenario_key}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/reallocate/execute")
async def execute_transfer(req: TransferExecuteRequest):
    try:
        result = hospital.execute_bed_transfer(req.recommendation_id)
        state = hospital.get_state().model_dump()
        await manager.broadcast({
            "type": "TRANSFER_EXECUTED",
            "data": result,
            "hospital_state": state
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/reset")
async def reset_simulation():
    hospital.replay_benchmark_scenario("baseline_stable")
    state = hospital.get_state().model_dump()
    await manager.broadcast({"type": "TELEMETRY_UPDATE", "data": state})
    return {"success": True}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PulseTwin Simulator 2.0"}

# Mount frontend/dist for unified single-port deployment
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
