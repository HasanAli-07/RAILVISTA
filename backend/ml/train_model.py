import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, median_absolute_error

os.makedirs("backend/model", exist_ok=True)

def train_eta_model():
    data_path = "backend/data/historical_train_runs.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded dataset with {len(df)} historical section runs.")

    feature_cols = [
        "train_priority",
        "current_delay_min",
        "section_length_km",
        "section_max_speed",
        "congestion_density",
        "added_dwell_min",
        "speed_restriction_km",
        "visibility_km",
        "day_of_week"
    ]
    target_col = "actual_delay_change_min"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Gradient Boosting Regressor model...")
    model = GradientBoostingRegressor(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=5,
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_val)

    mae = float(mean_absolute_error(y_val, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_val, y_pred)))
    med_ae = float(median_absolute_error(y_val, y_pred))

    abs_errors = np.abs(y_val - y_pred)
    pct_within_5 = float(np.mean(abs_errors <= 5.0) * 100)
    pct_within_10 = float(np.mean(abs_errors <= 10.0) * 100)
    pct_within_15 = float(np.mean(abs_errors <= 15.0) * 100)

    # Feature Importance for Explainable ETA
    importances = dict(zip(feature_cols, [float(v) for v in model.feature_importances_]))

    metrics = {
        "model_name": "Gradient Boosting Ensemble v3.8",
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "median_absolute_error": round(med_ae, 2),
        "pct_within_5_min": round(pct_within_5, 1),
        "pct_within_10_min": round(pct_within_10, 1),
        "pct_within_15_min": round(pct_within_15, 1),
        "training_samples": len(X_train),
        "validation_samples": len(X_val),
        "feature_importances": importances
    }

    print("\n--- MODEL PERFORMANCE METRICS ---")
    print(f"MAE: {metrics['mae']} min")
    print(f"RMSE: {metrics['rmse']} min")
    print(f"Median Error: {metrics['median_absolute_error']} min")
    print(f"% Within ±5 min: {metrics['pct_within_5_min']}%")
    print(f"% Within ±10 min: {metrics['pct_within_10_min']}%")

    model_save_path = "backend/model/eta_gb_model.joblib"
    joblib.dump(model, model_save_path)

    metrics_save_path = "backend/model/model_metrics.json"
    with open(metrics_save_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nModel saved to {model_save_path}")
    print(f"Metrics saved to {metrics_save_path}")

if __name__ == "__main__":
    train_eta_model()
