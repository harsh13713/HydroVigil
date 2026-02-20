from fastapi import FastAPI
import numpy as np

# Local ML inference import
from inference import predict

app = FastAPI(title="HydroVigil ML Backend")

@app.get("/")
def home():
    return {"message": "HydroVigil Backend Running"}

@app.post("/predict")
def run_prediction(payload: dict):
    """
    Expected JSON payload:
    {
        "sensor_data": [
            [f1, f2, f3, ...],
            [f1, f2, f3, ...],
            ...
        ]
    }
    """

    # Convert input to numpy array
    sensor_data = np.array(payload["sensor_data"], dtype=float)

    # Run ML inference
    result = predict(sensor_data)

    return result
