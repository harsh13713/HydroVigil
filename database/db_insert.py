import sqlite3
from datetime import datetime

conn = sqlite3.connect("database/faults.db")
cursor = conn.cursor()

cursor.execute("""
INSERT INTO faults
(fault_type, mean_error, max_error, affected_sensor, severity, detected_at, solution, remarks)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", (
    "Pressure Drop",
    0.052,
    0.13,
    "P12",
    "High",
    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "Reduce pressure and replace valve V12",
    "Occurred during peak demand"
))

conn.commit()
conn.close()

print("✅ Sample fault inserted")