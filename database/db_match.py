import sqlite3

def find_similar_fault(mean_error, max_error, sensor):
    conn = sqlite3.connect("database/faults.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM faults")
    rows = cursor.fetchall()
    conn.close()

    for row in rows:
        _, fault_type, db_mean, db_max, db_sensor, severity, _, solution, _ = row

        if abs(db_mean - mean_error) < 0.01 and \
           abs(db_max - max_error) < 0.02 and \
           db_sensor == sensor:
            return {
                "fault_type": fault_type,
                "severity": severity,
                "solution": solution
            }

    return None


# Test
result = find_similar_fault(0.055, 0.14, "P12")

if result:
    print("✅ Known fault found")
    print("Type:", result["fault_type"])
    print("Solution:", result["solution"])
else:
    print("🆕 New fault – no solution stored")