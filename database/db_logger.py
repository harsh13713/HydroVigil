import sqlite3
from datetime import datetime

DB_PATH = "database/faults.db"

def log_fault(fault_type, mean_error, max_error, sensor, severity):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if similar fault already exists
    cursor.execute("""
    SELECT fault_id FROM faults
    WHERE ABS(mean_error - ?) < 0.01
      AND ABS(max_error - ?) < 0.02
      AND affected_sensor = ?
    """, (mean_error, max_error, sensor))

    existing = cursor.fetchone()

    if existing:
        conn.close()
        return "⚠️ Fault already exists in database"

    # Insert new fault
    cursor.execute("""
    INSERT INTO faults
    (fault_type, mean_error, max_error, affected_sensor, severity, detected_at, solution, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        fault_type,
        mean_error,
        max_error,
        sensor,
        severity,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Pending analysis",
        "Auto-logged by ML system"
    ))

    conn.commit()
    conn.close()

    return "✅ New fault logged automatically"