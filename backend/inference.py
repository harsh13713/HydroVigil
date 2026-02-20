import numpy as np
import joblib

# 🔴 REQUIRED for unpickling the scaler
from sklearn.preprocessing import StandardScaler

# ===============================
# LOAD DEPLOYMENT ASSETS
# ===============================

bundle = joblib.load("model/deployment_bundle.pkl")

scaler = bundle["scaler"]

T1 = bundle["T1"]
T2 = bundle["T2"]

mu = bundle["mahal_mu"]
cov_inv = bundle["mahal_cov_inv"]

# ===============================
# PREDICTION FUNCTION
# ===============================

def predict(sensor_data: np.ndarray):
    """
    sensor_data shape:
    (time_steps, num_features)
    """

    # 1️⃣ Normalize using trained scaler
    X = scaler.transform(sensor_data)

    # 2️⃣ Simple score (placeholder for full Transformer logic)
    score = float(np.mean(np.abs(X)))

    # 3️⃣ Decision logic
    if score < T1:
        decision = "NORMAL"
        confidence = "LOW"
    elif score < T2:
        decision = "SUSPICIOUS"
        confidence = "MEDIUM"
    else:
        decision = "ATTACK"
        confidence = "HIGH"

    # 4️⃣ Return dashboard-friendly output
    return {
        "final_decision": decision,
        "risk_score": int(min(score * 20, 100)),
        "mahal_score": round(score, 4),
        "confidence": confidence
    }