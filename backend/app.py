import os
import json
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.ml.predictor import eta_engine

app = FastAPI(
    title="RailVista API",
    description="Real-Time Railway Dynamic ETA Prediction & Decision Support System (PS 26028)",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    train_number: str = "12002"
    congestion_pct: float = 42.0
    additional_dwell_min: float = 6.0
    speed_restriction_km: float = 18.0

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailVista Real-Time ETA Engine",
        "version": "v3.8",
        "model_loaded": eta_engine.model is not None,
        "schedules_loaded": len(eta_engine.schedules)
    }

@app.get("/api/trains")
def list_trains():
    trains = [
        {
            "number": "12002",
            "name": "Bhopal Shatabdi Express",
            "origin": "New Delhi (NDLS)",
            "destination": "Rani Kamlapati (RKMP)",
            "current_status": "Running",
            "current_delay_min": 8.0,
            "next_station": "Agra Cantt (AGC)",
            "scheduled_arr": "08:34",
            "predicted_eta": "08:37",
            "confidence": "92%"
        },
        {
            "number": "12626",
            "name": "Kerala Express",
            "origin": "New Delhi (NDLS)",
            "destination": "Trivandrum (TVC)",
            "current_status": "Running",
            "current_delay_min": 3.0,
            "next_station": "Agra Cantt (AGC)",
            "scheduled_arr": "08:48",
            "predicted_eta": "08:51",
            "confidence": "96%"
        },
        {
            "number": "12190",
            "name": "Mahakaushal Express",
            "origin": "Hazrat Nizamuddin (NZM)",
            "destination": "Jabalpur (JBP)",
            "current_status": "Delayed",
            "current_delay_min": 19.0,
            "next_station": "Agra Cantt (AGC)",
            "scheduled_arr": "09:05",
            "predicted_eta": "09:24",
            "confidence": "86%"
        },
        {
            "number": "22221",
            "name": "Rajdhani Express",
            "origin": "Mumbai Central (MMCT)",
            "destination": "New Delhi (NDLS)",
            "current_status": "On Time",
            "current_delay_min": 0.0,
            "next_station": "Agra Cantt (AGC)",
            "scheduled_arr": "09:32",
            "predicted_eta": "09:31",
            "confidence": "94%"
        },
        {
            "number": "11808",
            "name": "Intercity Express",
            "origin": "Agra Fort (AF)",
            "destination": "Jhansi (VGLJ)",
            "current_status": "Running",
            "current_delay_min": 6.0,
            "next_station": "Gwalior Jn (GWL)",
            "scheduled_arr": "09:46",
            "predicted_eta": "09:52",
            "confidence": "90%"
        }
    ]
    return {"count": len(trains), "trains": trains}

@app.get("/api/train/{train_id}")
def get_train_details(train_id: str):
    itinerary = eta_engine.predict_full_itinerary(train_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail=f"Train {train_id} not found in schedule database.")
    return itinerary

@app.get("/api/train/{train_id}/status")
def get_train_status(train_id: str):
    itinerary = eta_engine.predict_full_itinerary(train_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail=f"Train {train_id} not found.")

    return {
        "train_number": train_id,
        "train_name": itinerary["train_name"],
        "status": "Running",
        "current_km": 194,
        "current_speed_kmh": 84,
        "current_delay_min": itinerary["current_delay_min"],
        "next_station": itinerary["itinerary"][2]["station_name"] if len(itinerary["itinerary"]) > 2 else "NDLS",
        "next_station_code": itinerary["itinerary"][2]["station_code"] if len(itinerary["itinerary"]) > 2 else "AGC",
        "scheduled_arrival": itinerary["itinerary"][2]["sched_arr"] if len(itinerary["itinerary"]) > 2 else "08:34",
        "predicted_arrival": itinerary["itinerary"][2]["predicted_arr"] if len(itinerary["itinerary"]) > 2 else "08:37",
        "eta_window": itinerary["itinerary"][2]["eta_window"] if len(itinerary["itinerary"]) > 2 else "08:34–08:41",
        "confidence": itinerary["itinerary"][2]["confidence"] if len(itinerary["itinerary"]) > 2 else "92%",
        "data_freshness": "24 seconds ago (GPS healthy)"
    }

@app.get("/api/train/{train_id}/eta")
def get_train_eta(train_id: str):
    itinerary = eta_engine.predict_full_itinerary(train_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail=f"Train {train_id} not found.")

    return {
        "train_number": train_id,
        "destination": itinerary["destination"],
        "destination_eta": itinerary["predicted_destination_eta"],
        "overall_confidence": itinerary["confidence_overall"],
        "station_predictions": itinerary["itinerary"]
    }

@app.get("/api/station/{station_code}/trains")
def get_station_board(station_code: str = "AGC"):
    approaching = [
        {
            "number": "12002",
            "name": "Bhopal Shatabdi",
            "from": "Mathura Jn",
            "scheduled": "08:29",
            "predicted": "08:37",
            "platform": "2",
            "delay": "+8 min",
            "confidence": "92%",
            "state": "warning"
        },
        {
            "number": "12626",
            "name": "Kerala Express",
            "from": "New Delhi",
            "scheduled": "08:48",
            "predicted": "08:51",
            "platform": "1",
            "delay": "+3 min",
            "confidence": "96%",
            "state": "healthy"
        },
        {
            "number": "12190",
            "name": "Mahakaushal Express",
            "from": "Hazrat Nizamuddin",
            "scheduled": "09:05",
            "predicted": "09:24",
            "platform": "4",
            "delay": "+19 min",
            "confidence": "86%",
            "state": "critical"
        },
        {
            "number": "22221",
            "name": "Rajdhani Express",
            "from": "Mumbai Central",
            "scheduled": "09:32",
            "predicted": "09:31",
            "platform": "3",
            "delay": "On time",
            "confidence": "94%",
            "state": "healthy"
        },
        {
            "number": "11808",
            "name": "Intercity Express",
            "from": "Agra Fort",
            "scheduled": "09:46",
            "predicted": "09:52",
            "platform": "5",
            "delay": "+6 min",
            "confidence": "90%",
            "state": "warning"
        }
    ]

    alerts = [
        {
            "id": 1,
            "type": "critical",
            "title": "Platform conflict risk",
            "message": "12190 and 11808 may overlap at Platform 4 near 09:24.",
            "time_ago": "2 min ago"
        },
        {
            "id": 2,
            "type": "warning",
            "title": "Significant ETA change",
            "message": "12190 forecast moved by +7 minutes after an unscheduled halt.",
            "time_ago": "5 min ago"
        },
        {
            "id": 3,
            "type": "info",
            "title": "Visibility advisory",
            "message": "Moderate haze expected after 10:00. No current ETA impact.",
            "time_ago": "12 min ago"
        }
    ]

    return {
        "station_code": station_code,
        "station_name": "Agra Cantt",
        "total_approaching": 18,
        "approaching_trains": approaching,
        "priority_alerts": alerts,
        "hourly_load_projections": [52, 70, 45, 86, 62, 38]
    }

@app.get("/api/dashboard/network")
def get_network_dashboard():
    return {
        "active_trains": 2846,
        "reporting_live_pct": 98.7,
        "delayed_trains": 184,
        "delayed_pct": 6.5,
        "congestion_hotspots_count": 12,
        "model_accuracy_pct": 91.8,
        "nodes": [
            {"code": "DELHI", "name": "Delhi", "active_trains": 482, "status": "normal"},
            {"code": "AGRA", "name": "Agra", "active_trains": 194, "status": "warning"},
            {"code": "KANPUR", "name": "Kanpur", "active_trains": 236, "status": "normal"},
            {"code": "JAIPUR", "name": "Jaipur", "active_trains": 188, "status": "normal"},
            {"code": "BHOPAL", "name": "Bhopal", "active_trains": 214, "status": "normal"},
            {"code": "LUCKNOW", "name": "Lucknow", "active_trains": 156, "status": "critical"},
            {"code": "NAGPUR", "name": "Nagpur", "active_trains": 174, "status": "normal"}
        ],
        "priority_hotspots": [
            {"section": "Lucknow → Kanpur", "severity": "High", "impact_min": "+18 min", "score": 87},
            {"section": "Agra → Gwalior", "severity": "Med", "impact_min": "+9 min", "score": 64},
            {"section": "Jaipur → Bandikui", "severity": "Med", "impact_min": "+7 min", "score": 58}
        ]
    }

@app.post("/api/predict/simulate")
def simulate_scenario(req: SimulationRequest):
    result = eta_engine.simulate_what_if_scenario(
        train_number=req.train_number,
        congestion=req.congestion_pct,
        dwell=req.additional_dwell_min,
        restriction=req.speed_restriction_km
    )
    if not result:
        raise HTTPException(status_code=400, detail="Failed to run scenario simulation.")
    return result

@app.get("/api/predict/explain/{train_id}")
def explain_eta(train_id: str):
    return eta_engine.explain_prediction_factors(train_id)

@app.get("/api/model/metrics")
def get_model_metrics():
    metrics_path = "backend/model/model_metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {"status": "Model metrics file not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
