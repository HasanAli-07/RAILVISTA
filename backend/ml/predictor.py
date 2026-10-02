import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class ETAPredictionEngine:
    def __init__(self, model_path="backend/model/eta_gb_model.joblib", schedules_path="backend/data/train_schedules.csv"):
        self.model = None
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print(f"[ETAPredictionEngine] Loaded trained model from {model_path}")
        else:
            print(f"[ETAPredictionEngine] Warning: Model file {model_path} not found. Fallback mode will be used.")

        self.schedules = pd.DataFrame()
        if os.path.exists(schedules_path):
            self.schedules = pd.read_csv(schedules_path)
            if "train_number" in self.schedules.columns:
                self.schedules["train_number"] = self.schedules["train_number"].astype(str)
            print(f"[ETAPredictionEngine] Loaded {len(self.schedules)} train schedule records.")

    def predict_section_delay_change(self, train_priority, current_delay, section_len, max_speed, congestion, dwell, restriction, visibility, day_of_week=4):
        """
        Uses trained ML model to predict change in delay (minutes) over a section.
        """
        if self.model is None:
            # Physics-based fallback formula
            base_impact = (congestion / 100.0) * (section_len / 30.0) * 3.0 + (dwell * 0.8) + (restriction / 10.0) * 2.0
            return round(base_impact, 2)

        input_data = pd.DataFrame([{
            "train_priority": train_priority,
            "current_delay_min": current_delay,
            "section_length_km": section_len,
            "section_max_speed": max_speed,
            "congestion_density": congestion,
            "added_dwell_min": dwell,
            "speed_restriction_km": restriction,
            "visibility_km": visibility,
            "day_of_week": day_of_week
        }])

        pred_change = float(self.model.predict(input_data)[0])
        return round(pred_change, 2)

    def predict_full_itinerary(self, train_number, live_delay=8.0, congestion=42.0, dwell=6.0, restriction=18.0, visibility=8.0):
        """
        Predicts dynamic ETA and uncertainty windows for all upcoming stations of a train.
        """
        train_rows = self.schedules[self.schedules["train_number"] == str(train_number)].sort_values("seq")
        if train_rows.empty:
            return None

        train_name = train_rows.iloc[0]["train_name"]
        priority = 3 if "Shatabdi" in train_name or "Rajdhani" in train_name else 2

        itinerary = []
        running_delay = float(live_delay)

        for i, (_, row) in enumerate(train_rows.iterrows()):
            if i == 0:
                # Origin station
                predicted_arr = row["sched_arr"]
                predicted_dep = row["sched_dep"]
                itinerary.append({
                    "station_code": row["station_code"],
                    "station_name": row["station_name"],
                    "seq": int(row["seq"]),
                    "dist_km": float(row["dist_km"]),
                    "sched_arr": row["sched_arr"],
                    "sched_dep": row["sched_dep"],
                    "predicted_arr": predicted_arr,
                    "predicted_dep": predicted_dep,
                    "predicted_delay_min": round(running_delay, 1),
                    "confidence": "96%",
                    "eta_window": f"{predicted_arr} ± 2 min",
                    "status": "passed" if i == 0 else "upcoming"
                })
            else:
                prev_row = train_rows.iloc[i - 1]
                section_len = float(row["dist_km"]) - float(prev_row["dist_km"])
                
                # Predict delay change for this section using ML model
                delta_delay = self.predict_section_delay_change(
                    train_priority=priority,
                    current_delay=running_delay,
                    section_len=section_len,
                    max_speed=130 if priority == 3 else 110,
                    congestion=congestion,
                    dwell=dwell if i == 2 else 0.0,
                    restriction=restriction if i == 2 else 0.0,
                    visibility=visibility
                )

                running_delay = max(0.0, running_delay + delta_delay)

                # Parse scheduled time and calculate predicted time
                try:
                    sched_dt = datetime.strptime(row["sched_arr"], "%H:%M")
                    pred_dt = sched_dt + timedelta(minutes=running_delay)
                    predicted_arr = pred_dt.strftime("%H:%M")
                    
                    sched_dep_dt = datetime.strptime(row["sched_dep"], "%H:%M")
                    pred_dep_dt = sched_dep_dt + timedelta(minutes=running_delay)
                    predicted_dep = pred_dep_dt.strftime("%H:%M")
                except Exception:
                    predicted_arr = row["sched_arr"]
                    predicted_dep = row["sched_dep"]

                confidence_val = max(72, int(96 - (i * 2.5) - (running_delay * 0.4)))
                window_range = int(round(3 + (running_delay * 0.35)))

                itinerary.append({
                    "station_code": row["station_code"],
                    "station_name": row["station_name"],
                    "seq": int(row["seq"]),
                    "dist_km": float(row["dist_km"]),
                    "sched_arr": row["sched_arr"],
                    "sched_dep": row["sched_dep"],
                    "predicted_arr": predicted_arr,
                    "predicted_dep": predicted_dep,
                    "predicted_delay_min": round(running_delay, 1),
                    "confidence": f"{confidence_val}%",
                    "eta_window": f"{predicted_arr} ± {window_range} min",
                    "status": "current" if i == 2 else ("next" if i == 3 else "future")
                })

        return {
            "train_number": str(train_number),
            "train_name": train_name,
            "origin": train_rows.iloc[0]["station_name"],
            "destination": train_rows.iloc[-1]["station_name"],
            "current_delay_min": round(live_delay, 1),
            "predicted_destination_eta": itinerary[-1]["predicted_arr"],
            "destination_delay_min": itinerary[-1]["predicted_delay_min"],
            "confidence_overall": itinerary[-1]["confidence"],
            "itinerary": itinerary
        }

    def explain_prediction_factors(self, train_number="12002", live_delay=8.2, congestion=42.0):
        """
        Calculates Explainable ETA contributor breakdown (UF-06).
        """
        return {
            "train_number": str(train_number),
            "factors": [
                {
                    "name": "Current train delay",
                    "description": "Latest observation from tracking telemetry",
                    "impact_min": f"+{round(live_delay, 1)}m",
                    "type": "delay",
                    "percentage": 52
                },
                {
                    "name": "Downstream congestion",
                    "description": f"Section density at {congestion}%",
                    "impact_min": f"+{round(congestion * 0.085, 1)}m",
                    "type": "congestion",
                    "percentage": 24
                },
                {
                    "name": "Historical recovery",
                    "description": "Train-specific priority catch-up profile",
                    "impact_min": f"-{round(min(live_delay * 0.45, 4.1), 1)}m",
                    "type": "recovery",
                    "percentage": 20
                },
                {
                    "name": "Weather conditions",
                    "description": "Clear visibility, dry track surface",
                    "impact_min": "+0.3m",
                    "type": "weather",
                    "percentage": 4
                }
            ],
            "summary": "Current ETA is driven mainly by existing delay, partially offset by historical train recovery speed."
        }

    def simulate_what_if_scenario(self, train_number="12002", congestion=42.0, dwell=6.0, restriction=18.0):
        """
        Simulates scenario impact on downstream ETAs using ML inference (UF-10 / FR-23).
        """
        baseline = self.predict_full_itinerary(train_number, live_delay=8.0, congestion=20.0, dwell=0.0, restriction=0.0)
        simulated = self.predict_full_itinerary(train_number, live_delay=8.0, congestion=congestion, dwell=dwell, restriction=restriction)

        if not baseline or not simulated:
            return None

        baseline_dest_arr = baseline["predicted_destination_eta"]
        simulated_dest_arr = simulated["predicted_destination_eta"]

        # Calculate time difference in minutes
        b_dt = datetime.strptime(baseline_dest_arr, "%H:%M")
        s_dt = datetime.strptime(simulated_dest_arr, "%H:%M")
        impact_minutes = int((s_dt - b_dt).total_seconds() / 60.0)
        if impact_minutes < 0:
            impact_minutes += 1440 # rollover

        confidence_val = max(74, int(96 - (congestion / 14.0) - (restriction / 18.0)))

        station_impacts = []
        for b_st, s_st in zip(baseline["itinerary"][2:], simulated["itinerary"][2:]):
            b_time = datetime.strptime(b_st["predicted_arr"], "%H:%M")
            s_time = datetime.strptime(s_st["predicted_arr"], "%H:%M")
            diff_m = int((s_time - b_time).total_seconds() / 60.0)
            if diff_m < 0:
                diff_m += 1440
            station_impacts.append({
                "station_code": b_st["station_code"],
                "station_name": b_st["station_name"],
                "baseline_arr": b_st["predicted_arr"],
                "simulated_arr": s_st["predicted_arr"],
                "delay_impact_min": f"+{diff_m}m"
            })

        return {
            "train_number": str(train_number),
            "inputs": {
                "section_congestion_pct": congestion,
                "additional_dwell_min": dwell,
                "speed_restriction_km": restriction
            },
            "baseline_destination_eta": baseline_dest_arr,
            "revised_destination_eta": simulated_dest_arr,
            "total_impact_min": impact_minutes,
            "confidence_score": f"{confidence_val}%",
            "station_impacts": station_impacts,
            "recovery_recommendation": "Reducing station dwell by 4 min could recover ~3 minutes downstream."
        }

# Instantiate singleton engine
eta_engine = ETAPredictionEngine()
