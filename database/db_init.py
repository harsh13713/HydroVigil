import sqlite3

# Connect to SQLite database (creates file if not exists)
conn = sqlite3.connect("database/faults.db")
cursor = conn.cursor()

# Create faults table
cursor.execute("""
CREATE TABLE IF NOT EXISTS faults (
    fault_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fault_type TEXT,
    mean_error REAL,
    max_error REAL,
    affected_sensor TEXT,
    severity TEXT,
    detected_at TEXT,
    solution TEXT,
    remarks TEXT
)
""")

conn.commit()
conn.close()

print("✅ Fault database initialized")